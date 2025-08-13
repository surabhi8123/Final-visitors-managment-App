import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback, useMemo, useRef } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

// Check if we're in a web environment
const isWeb = Platform.OS === 'web';

// Define the authentication context type
interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  hasCheckedAuth: boolean;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  error: string | null;
  clearError: () => void;
  forceLogout: () => Promise<void>; // Force logout for security
}

// Create the context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Hardcoded admin credentials - In production, these should be stored securely
const ADMIN_CREDENTIALS = {
  username: 'admin',
  password: 'admin123',
};

// Storage keys
const STORAGE_KEYS = {
  AUTH_TOKEN: 'admin_auth_token',
  USERNAME: 'admin_username',
  TOKEN_EXPIRY: 'admin_token_expiry',
  LOGIN_ATTEMPTS: 'login_attempts',
  LAST_LOGIN_ATTEMPT: 'last_login_attempt',
};

// Security settings
const SECURITY_CONFIG = {
  TOKEN_EXPIRY_HOURS: 24,
  MAX_LOGIN_ATTEMPTS: 5,
  LOCKOUT_DURATION_MINUTES: 15,
  SESSION_TIMEOUT_MINUTES: 30, // Auto logout after inactivity
};

// Helper function to check if token is expired
const isTokenExpired = (expiryTimestamp: string): boolean => {
  const expiry = parseInt(expiryTimestamp, 10);
  const now = Date.now();
  return now > expiry;
};

// Helper function to check if account is locked
const isAccountLocked = async (): Promise<boolean> => {
  try {
    const loginAttempts = await secureRetrieve(STORAGE_KEYS.LOGIN_ATTEMPTS);
    const lastAttempt = await secureRetrieve(STORAGE_KEYS.LAST_LOGIN_ATTEMPT);
    
    if (loginAttempts && lastAttempt) {
      const attempts = parseInt(loginAttempts, 10);
      const lastAttemptTime = parseInt(lastAttempt, 10);
      const now = Date.now();
      const lockoutDuration = SECURITY_CONFIG.LOCKOUT_DURATION_MINUTES * 60 * 1000;
      
      if (attempts >= SECURITY_CONFIG.MAX_LOGIN_ATTEMPTS && 
          (now - lastAttemptTime) < lockoutDuration) {
        return true;
      }
    }
    return false;
  } catch (error) {
    console.error('Error checking account lock status:', error);
    return false;
  }
};

// Helper function to increment login attempts
const incrementLoginAttempts = async (): Promise<void> => {
  try {
    const currentAttempts = await secureRetrieve(STORAGE_KEYS.LOGIN_ATTEMPTS);
    const attempts = currentAttempts ? parseInt(currentAttempts, 10) + 1 : 1;
    const now = Date.now();
    
    await secureStore(STORAGE_KEYS.LOGIN_ATTEMPTS, attempts.toString());
    await secureStore(STORAGE_KEYS.LAST_LOGIN_ATTEMPT, now.toString());
  } catch (error) {
    console.error('Error incrementing login attempts:', error);
  }
};

// Helper function to reset login attempts
const resetLoginAttempts = async (): Promise<void> => {
  try {
    await secureRemove(STORAGE_KEYS.LOGIN_ATTEMPTS);
    await secureRemove(STORAGE_KEYS.LAST_LOGIN_ATTEMPT);
  } catch (error) {
    console.error('Error resetting login attempts:', error);
  }
};

// Helper function to store data securely
const secureStore = async (key: string, value: string): Promise<void> => {
  if (isWeb) {
    await AsyncStorage.setItem(key, value);
    return;
  }
  
  try {
    await SecureStore.setItemAsync(key, value);
  } catch (error) {
    console.warn('SecureStore failed, falling back to AsyncStorage:', error);
    await AsyncStorage.setItem(key, value);
  }
};

// Helper function to retrieve data securely
const secureRetrieve = async (key: string): Promise<string | null> => {
  if (isWeb) {
    return await AsyncStorage.getItem(key);
  }
  
  try {
    return await SecureStore.getItemAsync(key);
  } catch (error) {
    console.warn('SecureStore failed, falling back to AsyncStorage:', error);
    return await AsyncStorage.getItem(key);
  }
};

// Helper function to remove data securely
const secureRemove = async (key: string): Promise<void> => {
  if (isWeb) {
    await AsyncStorage.removeItem(key);
    return;
  }
  
  try {
    await SecureStore.deleteItemAsync(key);
  } catch (error) {
    console.warn('SecureStore failed, falling back to AsyncStorage:', error);
    await AsyncStorage.removeItem(key);
  }
};

// Auth provider component
interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [hasCheckedAuth, setHasCheckedAuth] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Use ref to track if we've already initialized to prevent multiple calls
  const isInitialized = useRef(false);
  const sessionTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Check if user is already logged in on app start - only run once
  useEffect(() => {
    if (!isInitialized.current) {
      isInitialized.current = true;
      checkAuthStatus();
    }
  }, []);

  // Session timeout handler
  const startSessionTimeout = useCallback(() => {
    if (sessionTimeoutRef.current) {
      clearTimeout(sessionTimeoutRef.current);
    }
    
    sessionTimeoutRef.current = setTimeout(() => {
      console.log('Session timeout - auto logout');
      forceLogout();
    }, SECURITY_CONFIG.SESSION_TIMEOUT_MINUTES * 60 * 1000);
  }, []);

  // Clear session timeout
  const clearSessionTimeout = useCallback(() => {
    if (sessionTimeoutRef.current) {
      clearTimeout(sessionTimeoutRef.current);
      sessionTimeoutRef.current = null;
    }
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      clearSessionTimeout();
    };
  }, [clearSessionTimeout]);

  const checkAuthStatus = useCallback(async () => {
    try {
      setIsLoading(true);
      
      // Check for existing authentication
      const authToken = await secureRetrieve(STORAGE_KEYS.AUTH_TOKEN);
      const username = await secureRetrieve(STORAGE_KEYS.USERNAME);
      const tokenExpiry = await secureRetrieve(STORAGE_KEYS.TOKEN_EXPIRY);
      
      console.log('Auth check - Token:', authToken ? 'exists' : 'null', 'Username:', username, 'Expiry:', tokenExpiry);
      
      // Validate token and expiry
      if (authToken && username && tokenExpiry) {
        if (isTokenExpired(tokenExpiry)) {
          console.log('Token expired, clearing authentication');
          await logout();
          return;
        }
        
        console.log('User is authenticated with valid token');
        setIsAuthenticated(true);
        startSessionTimeout(); // Start session timeout for authenticated user
      } else {
        console.log('User is not authenticated');
        setIsAuthenticated(false);
      }
      
    } catch (error) {
      console.error('Error checking auth status:', error);
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
      setHasCheckedAuth(true);
    }
  }, [startSessionTimeout]);

  const login = useCallback(async (username: string, password: string): Promise<boolean> => {
    try {
      setError(null);
      setIsLoading(true);
      
      // Check if account is locked
      const locked = await isAccountLocked();
      if (locked) {
        const remainingTime = Math.ceil(SECURITY_CONFIG.LOCKOUT_DURATION_MINUTES / 2);
        setError(`Account temporarily locked. Please try again in ${remainingTime} minutes.`);
        return false;
      }
      
      // Validate credentials
      if (username === ADMIN_CREDENTIALS.username && password === ADMIN_CREDENTIALS.password) {
        // Reset login attempts on successful login
        await resetLoginAttempts();
        
        // Generate a simple token with expiry (in a real app, this would come from the server)
        const authToken = `admin_token_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        const expiryTimestamp = (Date.now() + (SECURITY_CONFIG.TOKEN_EXPIRY_HOURS * 60 * 60 * 1000)).toString();
        
        // Store authentication data securely
        await secureStore(STORAGE_KEYS.AUTH_TOKEN, authToken);
        await secureStore(STORAGE_KEYS.USERNAME, username);
        await secureStore(STORAGE_KEYS.TOKEN_EXPIRY, expiryTimestamp);
        
        setIsAuthenticated(true);
        startSessionTimeout(); // Start session timeout
        return true;
      } else {
        // Increment failed login attempts
        await incrementLoginAttempts();
        
        const currentAttempts = await secureRetrieve(STORAGE_KEYS.LOGIN_ATTEMPTS);
        const attempts = currentAttempts ? parseInt(currentAttempts, 10) : 1;
        const remainingAttempts = SECURITY_CONFIG.MAX_LOGIN_ATTEMPTS - attempts;
        
        if (remainingAttempts <= 0) {
          setError(`Account locked due to too many failed attempts. Please try again in ${SECURITY_CONFIG.LOCKOUT_DURATION_MINUTES} minutes.`);
        } else {
          setError(`Invalid username or password. ${remainingAttempts} attempts remaining.`);
        }
        return false;
      }
    } catch (error) {
      console.error('Login error:', error);
      setError('Login failed. Please try again.');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [startSessionTimeout]);

  const logout = useCallback(async (): Promise<void> => {
    try {
      setIsLoading(true);
      
      // Clear stored authentication data
      await secureRemove(STORAGE_KEYS.AUTH_TOKEN);
      await secureRemove(STORAGE_KEYS.USERNAME);
      await secureRemove(STORAGE_KEYS.TOKEN_EXPIRY);
      
      setIsAuthenticated(false);
      setError(null);
      clearSessionTimeout(); // Clear session timeout
      
      console.log('Logout completed - AuthWrapper will handle navigation');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setIsLoading(false);
    }
  }, [clearSessionTimeout]);

  const forceLogout = useCallback(async (): Promise<void> => {
    console.log('Force logout triggered');
    await logout();
  }, [logout]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Memoize the context value to prevent unnecessary re-renders
  const value = useMemo<AuthContextType>(() => ({
    isAuthenticated,
    isLoading,
    hasCheckedAuth,
    login,
    logout,
    error,
    clearError,
    forceLogout,
  }), [isAuthenticated, isLoading, hasCheckedAuth, login, logout, error, clearError, forceLogout]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use the auth context
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Default export for the context
export default AuthContext; 