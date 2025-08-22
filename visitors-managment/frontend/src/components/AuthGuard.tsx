import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { useAuth } from '../../app/contexts/AuthContext';
import { LoadingView } from './LoadingView';
import { colors } from '../theme';

interface AuthGuardProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

/**
 * Authentication Guard Component
 * 
 * This component ensures that protected routes cannot be accessed without proper authentication.
 * It provides an additional layer of security beyond the navigation-level protection.
 * 
 * Usage:
 * <AuthGuard>
 *   <ProtectedComponent />
 * </AuthGuard>
 */
export const AuthGuard: React.FC<AuthGuardProps> = ({ 
  children, 
  fallback 
}) => {
  const { isAuthenticated, isLoading, hasCheckedAuth } = useAuth();

  // Log authentication state for debugging
  useEffect(() => {
    console.log('🔒 AuthGuard - Auth State:', {
      isAuthenticated,
      isLoading,
      hasCheckedAuth,
    });
  }, [isAuthenticated, isLoading, hasCheckedAuth]);

  // Show loading while checking authentication
  if (isLoading || !hasCheckedAuth) {
    return <LoadingView message="Verifying authentication..." />;
  }

  // If not authenticated, show fallback or loading
  if (!isAuthenticated) {
    console.warn('🚫 AuthGuard: Unauthorized access attempt detected');
    
    if (fallback) {
      return <>{fallback}</>;
    }
    
    return (
      <View style={styles.unauthorizedContainer}>
        <LoadingView message="Authentication required..." />
      </View>
    );
  }

  // User is authenticated, render children
  console.log('✅ AuthGuard: User authenticated, rendering protected content');
  return <>{children}</>;
};

const styles = StyleSheet.create({
  unauthorizedContainer: {
    flex: 1,
    backgroundColor: colors.background,
  },
});

export default AuthGuard; 