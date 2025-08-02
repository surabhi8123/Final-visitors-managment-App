import React from 'react';
import { Stack } from 'expo-router';
import { PaperProvider, MD3LightTheme } from 'react-native-paper';
import { StatusBar } from 'expo-status-bar';

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
          },
          headerLargeTitle: true,
        }}
      >
        <Stack.Screen
          name="index"
          options={{
            title: 'Visitor Management',
            headerLargeTitle: true,
          }}
        />
        <Stack.Screen
          name="check-in"
          options={{
            title: 'Check In Visitor',
            presentation: 'modal',
          }}
        />
        <Stack.Screen
          name="active-visitors"
          options={{
            title: 'Active Visitors',
          }}
        />
        <Stack.Screen
          name="history"
          options={{
            title: 'Visit History',
          }}
        />
      </Stack>
    </PaperProvider>
  );
} 