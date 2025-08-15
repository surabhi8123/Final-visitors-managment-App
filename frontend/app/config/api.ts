import { Platform } from 'react-native';
import Constants from 'expo-constants';

// Determine the environment
const isWeb = Platform.OS === 'web';
const isAndroid = Platform.OS === 'android';
const isIOS = Platform.OS === 'ios';

// Get the local development server IP from environment or use default
const LOCAL_IP = '192.168.1.29'; // Your computer's local IP address

// Simple URL formatter that ensures proper URL format
const formatUrl = (url: string | undefined): string => {
  if (!url) return '';
  // Convert to string in case it's not
  const urlStr = String(url);
  // Remove any trailing slashes and add exactly one
  return urlStr.replace(/\/+$/, '') + '/';
};

// API Configuration
export const API_CONFIG = {
  // Development settings
  development: {
    // For Android emulator, use 10.0.2.2 to access host machine
    // For iOS simulator, use localhost
    // For physical devices, use the computer's local IP
    base: isAndroid ? 'http://10.0.2.2:8000/api' : `http://${LOCAL_IP}:8000/api`,
    alternatives: [
      'http://10.0.2.2:8000/api',    // Android emulator
      'http://localhost:8000/api',    // iOS simulator and web
      `http://${LOCAL_IP}:8000/api`,  // LAN IP for physical devices
      'http://127.0.0.1:8000/api',    // Alternative localhost
      'http://192.168.1.19:8000/api'  // Additional LAN IP (fixed port number)
    ].filter(Boolean) as string[]
  },
  production: {
    base: formatUrl(process.env.EXPO_PUBLIC_API_URL || 'https://your-production-api.com/api') || '',
  },
};

// Ensure we have at least one valid URL
if (!API_CONFIG.development.base && API_CONFIG.development.alternatives.length > 0) {
  API_CONFIG.development.base = API_CONFIG.development.alternatives[0];
}

// Cache for working URL to avoid repeated connection tests
let cachedWorkingUrl: string | null = null;

/**
 * Test if a URL is reachable
 */
const testUrlReachability = async (url: string): Promise<boolean> => {
  try {
    const testUrl = url.endsWith('/') ? `${url}test-connection/` : `${url}/test-connection/`;
    const response = await fetch(testUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      timeout: 5000, // 5 second timeout
    });
    return response.ok;
  } catch (error) {
    console.warn(`URL ${url} is not reachable:`, error.message);
    return false;
  }
};

// Get the appropriate API URL based on environment and platform
export const getApiBaseUrl = async (): Promise<string> => {
  try {
    // If we have a cached working URL, use it
    if (cachedWorkingUrl) {
      console.log(`Using cached working URL: ${cachedWorkingUrl}`);
      return formatUrl(String(cachedWorkingUrl));
    }

    if (__DEV__) {
      // Ensure all URLs are strings and properly formatted
      const urlsToTest = [
        String(API_CONFIG.development.base || '').replace(/\/$/, ''),
        ...API_CONFIG.development.alternatives.map(url => String(url).replace(/\/$/, '')),
      ].filter(url => url); // Remove any empty strings

      console.log('Testing API endpoints:', urlsToTest);

      if (urlsToTest.length === 0) {
        throw new Error('No valid URLs to test');
      }

      // Try each URL until we find one that works
      for (const url of urlsToTest) {
        if (!url) continue;
        
        console.log(`Testing connection to: ${url}`);
        try {
          const isReachable = await testUrlReachability(url);
          
          if (isReachable) {
            const formattedUrl = formatUrl(url);
            console.log(`✅ Found working URL: ${formattedUrl}`);
            cachedWorkingUrl = formattedUrl;
            return formattedUrl;
          }
          
          console.warn(`❌ Could not connect to: ${url}`);
        } catch (error) {
          console.warn(`❌ Error testing ${url}:`, error.message);
        }
      }

      // If we get here, no URLs worked
      const errorMessage = 'Could not connect to any backend URLs. Please check your network connection and ensure the backend server is running.';
      console.error(errorMessage);
      
      // Fall back to the first URL in the list with a warning
      const fallbackUrl = urlsToTest[0];
      console.warn(`⚠️ Falling back to: ${fallbackUrl}`);
      return fallbackUrl;
    }

    // In production, use the production URL
    return String(API_CONFIG.production.base).replace(/\/$/, '');
  } catch (error) {
    console.error('Error in getApiBaseUrl:', error);
    // Return a default URL if all else fails
    return 'http://localhost:8000/api';
  }
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
export const API_TIMEOUT = 20000; // 20 seconds
const MAX_RETRIES = 3; // Maximum number of retry attempts
const RETRY_DELAY = 1000; // Initial delay between retries in ms

// Log the current environment and API configuration
console.log('API Configuration:', {
  platform: Platform.OS,
  isWeb,
  isAndroid,
  isIOS,
  baseUrl: API_CONFIG.development.base,
  alternatives: API_CONFIG.development.alternatives,
});

// API headers
export const getApiHeaders = (token?: string) => {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  };

  // Add authorization header if token is provided
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  return headers;
};

/**
 * Wrapper for fetch with retry logic and better error handling
 */
export const fetchWithRetry = async (
  url: string,
  options: RequestInit = {},
  retries = MAX_RETRIES,
  delay = RETRY_DELAY,
  attempt = 1
): Promise<Response> => {
  const isAbsoluteUrl = url.startsWith('http');
  
  try {
    // Get the base URL (this is now async) and ensure it's a string
    let baseUrl = '';
    if (!isAbsoluteUrl) {
      const baseUrlResult = await getApiBaseUrl();
      // Ensure baseUrl is a string and properly formatted
      baseUrl = String(baseUrlResult || '').replace(/\/$/, '');
    }
    
    // Construct the full URL
    const fullUrl = isAbsoluteUrl 
      ? url 
      : `${baseUrl}${url.startsWith('/') ? '' : '/'}${url}`;
    
    console.log(`🌐 API Request [Attempt ${attempt}]: ${options.method || 'GET'} ${fullUrl}`);
    
    // Ensure we have a valid URL
    if (!fullUrl || typeof fullUrl !== 'string') {
      throw new Error('Invalid URL format');
    }
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), API_TIMEOUT);
    
    const response = await fetch(fullUrl, {
      ...options,
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        ...(options.headers || {}),
      },
    });
    
    clearTimeout(timeoutId);

    // Log response status
    console.log(`📡 API Response [${response.status}]: ${options.method || 'GET'} ${fullUrl}`);

    // If the response is successful, return it
    if (response.ok) {
      return response;
    }

    // If we have retries left and the error is retryable
    if (retries > 0 && shouldRetry(response.status)) {
      console.warn(`⚠️ Retrying (${retries} attempts left) - Status: ${response.status}`);
      // Wait for the delay before retrying
      await new Promise(resolve => setTimeout(resolve, delay));
      // Exponential backoff for subsequent retries
      return fetchWithRetry(url, options, retries - 1, delay * 2, attempt + 1);
    }

    // If we're out of retries or the error is not retryable, throw an error
    const errorData = await parseErrorResponse(response);
    const errorMessage = errorData.message || `API request failed with status ${response.status}`;
    console.error(`❌ API Error [${response.status}]: ${errorMessage}`);
    throw new Error(errorMessage);
    
  } catch (error) {
    if (error.name === 'AbortError') {
      const errorMsg = `Request timeout after ${API_TIMEOUT}ms`;
      console.error(`⏱️ ${errorMsg}`);
      throw new Error(errorMsg);
    }
    
    if (error.message.includes('Network request failed') || error.message.includes('Network Error')) {
      const errorMsg = `Network error. Please check your internet connection and ensure the backend server is running.`;
      console.error(`🌐 ${errorMsg}`, error);
      throw new Error(errorMsg);
    }
    
    console.error(`⚠️ API Request Error:`, error);
    throw error;
  }
};

/**
 * Check if a failed request should be retried based on status code
 */
const shouldRetry = (status: number): boolean => {
  // Retry on server errors (5xx) and too many requests (429)
  return (status >= 500 && status < 600) || status === 429;
};

/**
 * Parse error response from API
 */
const parseErrorResponse = async (response: Response): Promise<{ message: string }> => {
  try {
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      return await response.json();
    }
    return { message: await response.text() || 'Unknown error occurred' };
  } catch (error) {
    return { message: `Error: ${response.status} ${response.statusText}` };
  }
};

/**
 * Test connection to the backend using a list of URLs
 * @returns Promise that resolves with the first working URL or rejects if none work
 */
export const testConnection = async (): Promise<{ url: string, response: any }> => {
  const testUrls = [
    API_CONFIG.development.base,
    ...API_CONFIG.development.alternatives,
  ];

  // Try each URL in sequence
  for (const url of testUrls) {
    try {
      console.log(`🔍 Testing connection to: ${url}`);
      const testUrl = url.endsWith('/') ? `${url}test-connection/` : `${url}/test-connection/`;
      const response = await fetch(testUrl, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        console.log(`✅ Successfully connected to: ${url}`);
        return { url, response: data };
      }
    } catch (error: any) {
      console.warn(`⚠️ Failed to connect to ${url}:`, error?.message || 'Unknown error');
      // Continue to the next URL
    }
  }

  throw new Error('Could not connect to any of the backend URLs. Please check your network connection and ensure the backend server is running.');
};

// Default export to satisfy Expo Router
const apiConfig = {
  API_CONFIG,
  getApiBaseUrl,
  getLocalhostUrl,
  getAlternativeUrls,
  API_TIMEOUT,
  getApiHeaders,
  fetchWithRetry,
  shouldRetry,
  parseErrorResponse,
  testConnection,
};

export default apiConfig;