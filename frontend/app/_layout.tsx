import React, { useEffect, useState } from 'react';
import { Stack, Slot, router } from 'expo-router';
import { PaperProvider } from 'react-native-paper';
import { StatusBar } from 'expo-status-bar';
import { Dimensions, Alert } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { paperTheme, colors, spacing } from '../src/utils/theme';

const { width } = Dimensions.get('window');
const isTablet = width > 768;
const isMobile = width < 768;

// Loading component while checking authentication
function LoadingScreen() {
  return (
    <View style={styles.loadingContainer}>
      <ActivityIndicator size="large" color={colors.primary} />
    </View>
  );
}

// Logout button component for the header
function LogoutButton() {
  const { logout } = useAuth();

  const handleLogout = async () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            try {
              await logout();
              // The AuthContext will handle the navigation back to login
            } catch (error) {
              console.error('Logout error:', error);
              Alert.alert('Error', 'Failed to logout. Please try again.');
            }
          },
        },
      ]
    );
  };

  return (
    <View style={styles.logoutButton}>
      {/* Logout button will be handled in the app layout */}
    </View>
  );
}

// Root Stack - defines all available screens
function RootStack() {
  const { isAuthenticated, isLoading, hasCheckedAuth } = useAuth();
  
  console.log('RootStack rendering - isAuthenticated:', isAuthenticated, 'isLoading:', isLoading, 'hasCheckedAuth:', hasCheckedAuth);

  // Show loading screen while checking authentication status
  if (isLoading || !hasCheckedAuth) {
    return <LoadingScreen />;
  }

  return (
    <Stack
      screenOptions={{
        headerStyle: {
          backgroundColor: colors.primary,
        },
        headerTintColor: colors.onPrimary,
        headerTitleStyle: {
          fontWeight: '600',
          fontSize: isMobile ? 18 : 20,
        },
        headerLargeTitle: isTablet,
        headerLargeTitleStyle: {
          fontSize: isTablet ? 32 : 24,
          fontWeight: '700',
        },
        headerLargeTitleShadowVisible: false,
        headerShadowVisible: false,
        contentStyle: {
          backgroundColor: colors.background,
        },
      }}
    >
      {/* Login screen - always available */}
      <Stack.Screen
        name="login"
        options={{
          title: 'Admin Login',
          headerShown: false, // Hide header for login screen
        }}
      />
      
      {/* App group - contains all authenticated screens */}
      <Stack.Screen
        name="(app)"
        options={{
          headerShown: false, // Hide header for the group
        }}
      />
    </Stack>
  );
}

// Authentication wrapper component
function AuthWrapper() {
  const { isAuthenticated, isLoading, hasCheckedAuth } = useAuth();
  const [lastAuthState, setLastAuthState] = useState<boolean | null>(null);

  console.log('AuthWrapper - isAuthenticated:', isAuthenticated, 'isLoading:', isLoading, 'hasCheckedAuth:', hasCheckedAuth, 'lastAuthState:', lastAuthState);

  // Handle authentication redirects
  useEffect(() => {
    // Only redirect after auth check is complete and not loading
    if (hasCheckedAuth && !isLoading) {
      // Check if authentication state has changed
      if (lastAuthState !== isAuthenticated) {
        const targetRoute = isAuthenticated ? '/(app)' : '/login';
        
        console.log('🔄 Auth state changed from', lastAuthState, 'to', isAuthenticated);
        console.log('📍 Redirecting to:', targetRoute);
        setLastAuthState(isAuthenticated);
        router.replace(targetRoute);
      } else {
        console.log('✅ Auth state unchanged, no redirect needed');
      }
    } else {
      console.log('⏳ Waiting for auth check to complete or loading...');
    }
  }, [isAuthenticated, isLoading, hasCheckedAuth, lastAuthState]);

  return <RootStack />;
}

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <AuthProvider>
        <PaperProvider theme={paperTheme}>
          <StatusBar style="auto" />
          <AuthWrapper />
        </PaperProvider>
      </AuthProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  logoutButton: {
    marginRight: spacing.sm,
  },
}); 