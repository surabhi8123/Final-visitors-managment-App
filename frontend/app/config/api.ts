import { Platform } from 'react-native';

// Determine if we're running in a web environment
const isWeb = Platform.OS === 'web';

// API Configuration
export const API_CONFIG = {
  // Development settings
  development: {
    // Default to localhost for web and development
    base: isWeb ? 'http://localhost:8000/api' : 'http://192.168.1.33:8000/api',
    // Alternative IPs to try for connection testing
    alternatives: [
      'http://localhost:8000/api',
      'http://127.0.0.1:8000/api',
      'http://192.168.1.33:8000/api', // For mobile device testing
      'http://10.0.2.2:8000/api', // Android emulator
    ],
  },
  // Production settings
  production: {
    base: 'https://your-production-api.com/api',
  },
};

// Get the appropriate API URL based on environment and platform
export const getApiBaseUrl = (): string => {
  if (__DEV__) {
    // In development, use the base URL from config
    return API_CONFIG.development.base;
  }
  // In production, use the production URL
  return API_CONFIG.production.base;
};

// Get localhost URL for simulator/emulator testing
export const getLocalhostUrl = (): string => {
  return API_CONFIG.development.alternatives[0] || 'http://localhost:8000/api';
};

// Get alternative URLs for testing
export const getAlternativeUrls = (): string[] => {
  return API_CONFIG.development.alternatives;
};

// API timeout settings
export const API_TIMEOUT = 10000; // 10 seconds (reduced for mobile)

// API headers
export const getApiHeaders = () => ({
  'Content-Type': 'application/json',
  'Accept': 'application/json',
  'User-Agent': 'VisitorManagement/1.0',
});

// Default export to satisfy Expo Router
const apiConfig = {
  API_CONFIG,
  getApiBaseUrl,
  getLocalhostUrl,
  getAlternativeUrls,
  API_TIMEOUT,
  getApiHeaders,
};

export default apiConfig; 