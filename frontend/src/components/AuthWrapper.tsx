import React, { useEffect } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
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
  const { isAuthenticated, isLoading, checkAuthState } = useAuth();
  const router = useRouter();

  useEffect(() => {
    checkAuthState();
  }, []);

  useEffect(() => {
    if (!isLoading) {
      if (requireAuth && !isAuthenticated) {
        router.replace(redirectTo);
      } else if (!requireAuth && isAuthenticated) {
        router.replace(redirectTo || '/');
      }
    }
  }, [isAuthenticated, isLoading, requireAuth, redirectTo]);

  // Show loading indicator while checking auth state
  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  // If authentication is not required or user is authenticated, render children
  if (!requireAuth || isAuthenticated) {
    return <>{children}</>;
  }

  // If we get here, it means we're redirecting due to auth requirements
  // The loading state will handle the redirect
  return (
    <View style={styles.loadingContainer}>
      <ActivityIndicator size="large" color="#0000ff" />
    </View>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
});

export default AuthWrapper;
