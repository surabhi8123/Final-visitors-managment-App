import React from 'react';
import { Stack } from 'expo-router';
import { PaperProvider, MD3LightTheme } from 'react-native-paper';
import { StatusBar } from 'expo-status-bar';
import { Dimensions } from 'react-native';

const { width } = Dimensions.get('window');
const isTablet = width > 768;
const isMobile = width < 768;

const theme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: '#1976d2',
    secondary: '#424242',
    background: '#f5f5f5',
  },
};

export default function RootLayout() {
  return (
    <PaperProvider theme={theme}>
      <StatusBar style="auto" />
      <Stack
        screenOptions={{
          headerStyle: {
            backgroundColor: theme.colors.primary,
          },
          headerTintColor: '#fff',
          headerTitleStyle: {
            fontWeight: 'bold',
            fontSize: isMobile ? 18 : 20,
          },
          headerLargeTitle: isTablet,
          headerLargeTitleStyle: {
            fontSize: isTablet ? 32 : 24,
          },
          headerLargeTitleShadowVisible: false,
          headerShadowVisible: false,
          contentStyle: {
            backgroundColor: '#f5f5f5',
          },
        }}
      >
        <Stack.Screen
          name="index"
          options={{
            title: 'Visitor Management',
            headerLargeTitle: isTablet,
            headerLargeTitleStyle: {
              fontSize: isTablet ? 32 : 24,
            },
          }}
        />
        <Stack.Screen
          name="check-in"
          options={{
            title: 'Check In Visitor',
            presentation: 'modal',
            headerTitleStyle: {
              fontWeight: 'bold',
              fontSize: isMobile ? 16 : 18,
            },
          }}
        />
        <Stack.Screen
          name="active-visitors"
          options={{
            title: 'Active Visitors',
            headerTitleStyle: {
              fontWeight: 'bold',
              fontSize: isMobile ? 16 : 18,
            },
          }}
        />
        <Stack.Screen
          name="history"
          options={{
            title: 'Visit History',
            headerTitleStyle: {
              fontWeight: 'bold',
              fontSize: isMobile ? 16 : 18,
            },
          }}
        />
      </Stack>
    </PaperProvider>
  );
} 