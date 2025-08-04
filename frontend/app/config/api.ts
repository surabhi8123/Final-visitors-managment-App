import { Platform } from 'react-native';

// API Configuration
export const API_CONFIG = {
  // Development settings
  development: {
    // Use computer's IP address for mobile device connectivity
    base: 'http://192.168.1.19:8000/api',
    // Fallback for simulator/emulator testing
    localhost: 'http://127.0.0.1:8000/api',
    // Alternative IPs to try
    alternatives: [
      'http://192.168.1.19:8000/api',
      'http://10.0.2.2:8000/api', // Android emulator
      'http://localhost:8000/api', // iOS simulator
    ],
  },
  // Production settings
  production: {
    base: 'https://your-production-api.com/api',
  },
};

// Get the appropriate API URL based on environment
export const getApiBaseUrl = (): string => {
  if (__DEV__) {
    // For development, use the IP address for mobile device connectivity
    return API_CONFIG.development.base;
  }
  return API_CONFIG.production.base;
};

// Get localhost URL for simulator/emulator testing
export const getLocalhostUrl = (): string => {
  return API_CONFIG.development.localhost;
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