import { getApiBaseUrl } from '../../app/config/api';

export interface NetworkStatus {
  isConnected: boolean;
  isInternetReachable: boolean | null;
  type: string | null;
}

/**
 * Check current network connectivity
 */
export const checkNetworkConnectivity = async (): Promise<NetworkStatus> => {
  // Simplified network check without NetInfo
  return {
    isConnected: true,
    isInternetReachable: true,
    type: 'wifi',
  };
};

/**
 * Test API connectivity by making a simple request
 */
export const testApiConnectivity = async (): Promise<boolean> => {
  try {
    const response = await fetch(`${getApiBaseUrl()}/visitors/active/`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    return response.ok;
  } catch (error) {
    console.error('API connectivity test failed:', error);
    return false;
  }
};

/**
 * Get a user-friendly error message based on network status
 */
export const getNetworkErrorMessage = (error: any): string => {
  if (error.code === 'ECONNABORTED') {
    return 'Request timeout. Please check your connection and try again.';
  }
  
  if (error.code === 'ERR_NETWORK') {
    return 'Network error. Please check your internet connection and ensure the backend server is running.';
  }
  
  if (error.message?.includes('Network request failed')) {
    return 'Unable to connect to the server. Please check your internet connection.';
  }
  
  if (error.response?.status === 404) {
    return 'API endpoint not found. Please check the server configuration.';
  }
  
  if (error.response?.status === 500) {
    return 'Server error. Please try again later.';
  }
  
  return error.message || 'An unexpected error occurred.';
};

/**
 * Check if the device is on the same network as the development server
 */
export const isOnSameNetwork = async (): Promise<boolean> => {
  // For development, we assume the device is on the same network
  return true;
};

// Network utility functions for the visitor management system 