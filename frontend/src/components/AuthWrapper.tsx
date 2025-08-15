import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator, StyleSheet, Text } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../contexts/AuthContext';

interface AuthWrapperProps {
  children: React.ReactNode;
  requireAuth?: boolean;
  redirectTo?: string;
}

const AuthWrapper: React.FC<AuthWrapperProps> = ({
  children,
  requireAuth = true,
  redirectTo = '/login',
}) => {
  const { isAuthenticated, isLoading, hasCheckedAuth, checkAuthState } = useAuth();
  const router = useRouter();
  const [initialized, setInitialized] = useState(false);
  const [authState, setAuthState] = useState({
    isAuthenticated: false,
    isLoading: true,
    hasCheckedAuth: false
  });

  // Log changes to auth state
  useEffect(() => {
    console.log('🔄 AuthWrapper - Auth state changed:', {
      isAuthenticated,
      isLoading,
      hasCheckedAuth,
      requireAuth,
      redirectTo
    });
    
    setAuthState({ isAuthenticated, isLoading, hasCheckedAuth });
  }, [isAuthenticated, isLoading, hasCheckedAuth]);

  // Initialize auth state check
  useEffect(() => {
    console.log('🔐 AuthWrapper - Initializing auth check...');
    const initAuth = async () => {
      try {
        await checkAuthState();
      } catch (error) {
        console.error('AuthWrapper - Error initializing auth:', error);
      } finally {
        setInitialized(true);
      }
    };
    
    initAuth();
  }, []);

  // Handle authentication redirects
  useEffect(() => {
    if (!initialized || isLoading || !hasCheckedAuth) {
      console.log('⏳ AuthWrapper - Waiting for auth check to complete...');
      return;
    }

    console.log('🔄 AuthWrapper - Processing auth state...');
    
    if (requireAuth && !isAuthenticated) {
      console.log('🔒 Auth required but not authenticated - redirecting to:', redirectTo);
      router.replace(redirectTo);
    } else if (!requireAuth && isAuthenticated) {
      console.log('🚀 Already authenticated - redirecting to:', redirectTo || '/');
      router.replace(redirectTo || '/');
    } else {
      console.log('✅ Auth state is valid for this route');
    }
  }, [isAuthenticated, isLoading, hasCheckedAuth, requireAuth, redirectTo, initialized]);

  // Show loading indicator while checking auth state
  if (isLoading || !initialized || !hasCheckedAuth) {
    console.log('⏳ AuthWrapper - Showing loading state...');
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2563eb" />
        <Text style={styles.loadingText}>Checking authentication...</Text>
        <Text style={styles.debugText}>
          isAuthenticated: {String(isAuthenticated)}\n
          hasCheckedAuth: {String(hasCheckedAuth)}\n
          requireAuth: {String(requireAuth)}
        </Text>
      </View>
    );
  }

  // If authentication is not required or user is authenticated, render children
  if (!requireAuth || isAuthenticated) {
    console.log('✅ AuthWrapper - Rendering children');
    return <>{children}</>;
  }

  // If we get here, it means we're redirecting due to auth requirements
  console.log('🔄 AuthWrapper - Preparing redirect...');
  return (
    <View style={styles.loadingContainer}>
      <ActivityIndicator size="large" color="#2563eb" />
      <Text style={styles.loadingText}>Redirecting...</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 20,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#4b5563',
    textAlign: 'center',
  },
  debugText: {
    marginTop: 24,
    fontSize: 12,
    color: '#6b7280',
    textAlign: 'center',
    backgroundColor: '#f3f4f6',
    padding: 12,
    borderRadius: 6,
    fontFamily: 'monospace',
  },
});

export default AuthWrapper;
