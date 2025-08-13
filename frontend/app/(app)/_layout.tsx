import React from 'react';
import { Stack } from 'expo-router';
import { IconButton } from 'react-native-paper';
import { Dimensions, Alert } from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import { AuthGuard } from '../../src/components';
import { colors, spacing } from '../../src/theme';

const { width } = Dimensions.get('window');
const isTablet = width > 768;
const isMobile = width < 768;

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
    <IconButton
      icon="logout"
      iconColor={colors.white}
      size={24}
      onPress={handleLogout}
      style={{ marginRight: spacing.sm }}
    />
  );
}

export default function AppLayout() {
  console.log('AppLayout rendering for authenticated screens');

  return (
    <AuthGuard>
      <Stack
      screenOptions={{
        headerStyle: {
          backgroundColor: colors.primary,
        },
        headerTintColor: colors.white,
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
      {/* Main app screens - only accessible when authenticated */}
      <Stack.Screen
        name="index"
        options={{
          title: 'ThorSignia Visitor Management',
          headerLargeTitle: isTablet,
          headerLargeTitleStyle: {
            fontSize: isTablet ? 32 : 24,
            fontWeight: '700',
          },
          headerRight: () => <LogoutButton />,
        }}
      />
      
      <Stack.Screen
        name="check-in"
        options={{
          title: 'Check In Visitor',
          presentation: 'modal',
          headerTitleStyle: {
            fontWeight: '600',
            fontSize: isMobile ? 16 : 18,
          },
        }}
      />
      
      <Stack.Screen
        name="active-visitors"
        options={{
          title: 'Active Visitors',
          headerTitleStyle: {
            fontWeight: '600',
            fontSize: isMobile ? 16 : 18,
          },
        }}
      />
      
      <Stack.Screen
        name="history"
        options={{
          title: 'Visit History',
          headerTitleStyle: {
            fontWeight: '600',
            fontSize: isMobile ? 16 : 18,
          },
        }}
      />
      
      <Stack.Screen
        name="visitor-detail"
        options={{
          headerShown: false,
        }}
      />
      </Stack>
    </AuthGuard>
  );
} 