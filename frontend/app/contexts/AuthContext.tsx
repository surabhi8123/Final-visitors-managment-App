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
  checkAuthState: () => Promise<void>; // Add this line to expose checkAuthState
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
  TOKEN_EXPIRY_HOURS: 24 * 30, // 30 days token expiry
  SESSION_TIMEOUT_MINUTES: 60 * 24 * 30, // 30 days (effectively disables auto-logout)
};

// Helper function to check if token is expired
const isTokenExpired = (expiryTimestamp: string): boolean => {
  const expiry = parseInt(expiryTimestamp, 10);
  const now = Date.now();
  return now > expiry;
};

// Removed account lockout functionality as per user request

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
    console.log('🔍 Checking authentication status...');
    try {
      setIsLoading(true);
      
      // Check for existing authentication
      const [authToken, username, tokenExpiry] = await Promise.all([
        secureRetrieve(STORAGE_KEYS.AUTH_TOKEN),
        secureRetrieve(STORAGE_KEYS.USERNAME),
        secureRetrieve(STORAGE_KEYS.TOKEN_EXPIRY)
      ]);
      
      console.log('🔑 Auth check results:', {
        hasToken: !!authToken,
        hasUsername: !!username,
        hasExpiry: !!tokenExpiry,
        expiry: tokenExpiry ? new Date(parseInt(tokenExpiry)).toISOString() : 'N/A'
      });
      
      // Validate token and expiry
      if (authToken && username && tokenExpiry) {
        const isExpired = isTokenExpired(tokenExpiry);
        console.log(`⏱️ Token is ${isExpired ? 'expired' : 'valid'}`);
        
        if (isExpired) {
          console.log('⌛ Token expired, clearing authentication...');
          await logout();
          return;
        }
        
        console.log('✅ User is authenticated with valid token');
        setIsAuthenticated(true);
        startSessionTimeout(); // Start session timeout for authenticated user
      } else {
        console.log('🔒 User is not authenticated - missing required auth data');
        if (!authToken) console.log('❌ No auth token found');
        if (!username) console.log('❌ No username found');
        if (!tokenExpiry) console.log('❌ No token expiry found');
        
        // Clear any partial auth data
        await Promise.all([
          secureRemove(STORAGE_KEYS.AUTH_TOKEN),
          secureRemove(STORAGE_KEYS.USERNAME),
          secureRemove(STORAGE_KEYS.TOKEN_EXPIRY)
        ]);
        
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
      console.log('🔑 Login attempt started');
      
      // Trim whitespace from username to handle accidental spaces
      const trimmedUsername = username.trim();
      console.log('📝 Username provided (original):', `'${username}'`);
      console.log('📝 Username provided (trimmed):', `'${trimmedUsername}'`);
      console.log('🔒 Password provided (length):', '*'.repeat(password.length));
      
      setError(null);
      setIsLoading(true);
      
      // Log the expected values for debugging
      console.log('🔍 Expected username (case-insensitive):', `'${ADMIN_CREDENTIALS.username.toLowerCase()}'`);
      console.log('🔍 Provided username (case-insensitive):', `'${trimmedUsername.toLowerCase()}'`);
      console.log('🔍 Expected password (first 2 chars):', ADMIN_CREDENTIALS.password.substring(0, 2) + '...');
      console.log('🔍 Provided password length:', password.length);
      
      // Add a small delay to simulate network request and ensure UI updates properly
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Validate credentials (case-insensitive username, case-sensitive password)
      const isUsernameMatch = trimmedUsername.toLowerCase() === ADMIN_CREDENTIALS.username.toLowerCase();
      const isPasswordMatch = password === ADMIN_CREDENTIALS.password;
      
      console.log('✅ Username match:', isUsernameMatch);
      console.log('✅ Password match:', isPasswordMatch);
      
      if (isUsernameMatch && isPasswordMatch) {
        console.log('🎉 Credentials matched - generating token...');
        // Generate a simple token with expiry (in a real app, this would come from the server)
        const authToken = `admin_token_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        const expiryTimestamp = (Date.now() + (SECURITY_CONFIG.TOKEN_EXPIRY_HOURS * 60 * 60 * 1000)).toString();
        
        console.log('💾 Storing auth data...');
        // Store authentication data securely
        await Promise.all([
          secureStore(STORAGE_KEYS.AUTH_TOKEN, authToken),
          secureStore(STORAGE_KEYS.USERNAME, username),
          secureStore(STORAGE_KEYS.TOKEN_EXPIRY, expiryTimestamp)
        ]);
        
        console.log('🔄 Updating authentication state...');
        // Use a callback to ensure we have the latest state
        setIsAuthenticated(true);
        
        // Force a state update to ensure the UI updates
        await new Promise(resolve => setTimeout(resolve, 100));
        
        console.log('🚀 Login successful!');
        return true;
      } else {
        console.log('❌ Invalid credentials provided');
        setError('Invalid username or password');
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
    checkAuthState: checkAuthStatus, // Use the correct function name
  }), [isAuthenticated, isLoading, hasCheckedAuth, login, logout, error, clearError, forceLogout, checkAuthStatus]);

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