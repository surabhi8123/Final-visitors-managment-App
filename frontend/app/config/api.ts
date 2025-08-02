import { Platform } from 'react-native';

// API Configuration
export const API_CONFIG = {
  // Development settings
  development: {
    // Always use LAN IP for better compatibility
    base: 'http://192.168.1.38:8000/api',
  },
  // Production settings
  production: {
    base: 'https://your-production-api.com/api',
  },
};

// Get the appropriate API URL based on environment
export const getApiBaseUrl = (): string => {
  if (__DEV__) {
    return API_CONFIG.development.base;
  }
  return API_CONFIG.production.base;
};

// API timeout settings
export const API_TIMEOUT = 15000; // 15 seconds

// API headers
export const getApiHeaders = () => ({
  'Content-Type': 'application/json',
  'Accept': 'application/json',
});

// Default export to satisfy Expo Router
const apiConfig = {
  API_CONFIG,
  getApiBaseUrl,
  API_TIMEOUT,
  getApiHeaders,
};

export default apiConfig; 