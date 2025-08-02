import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getApiBaseUrl, API_TIMEOUT, getApiHeaders, NETWORK_CONFIG } from '../config/api';
import {
  CheckInData,
  CheckOutData,
  CheckInResponse,
  CheckOutResponse,
  ActiveVisitorsResponse,
  VisitHistoryResponse,
  SearchVisitorResponse,
  VisitHistoryFilters,
} from '../../src/types';

// Create axios instance with better error handling
const api = axios.create({
  baseURL: getApiBaseUrl(),
  headers: getApiHeaders(),
  timeout: API_TIMEOUT,
});

// Request interceptor to add auth token if available
api.interceptors.request.use(
  async (config: any) => {
    console.log('API Request:', config.method?.toUpperCase(), config.url);
    console.log('API Base URL:', getApiBaseUrl());
    
    const token = await AsyncStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error: any) => {
    console.error('API Request Error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response: any) => {
    console.log('API Response:', response.status, response.config.url);
    return response;
  },
  async (error: any) => {
    console.error('API Response Error:', {
      message: error.message,
      code: error.code,
      status: error.response?.status,
      url: error.config?.url,
    });

    if (error.code === 'ECONNABORTED') {
      console.error('API Timeout Error:', error.message);
      return Promise.reject(new Error('Request timeout. Please check your connection and try again.'));
    }
    
    if (error.code === 'ERR_NETWORK') {
      console.error('Network Error:', error.message);
      return Promise.reject(new Error('Network error. Please check your internet connection and ensure the backend server is running.'));
    }
    
    if (error.response) {
      // Server responded with error status
      console.error('API Error:', error.response.status, error.response.data);
      return Promise.reject(new Error(error.response.data?.message || `Server error: ${error.response.status}`));
    }
    
    console.error('API Error:', error.message);
    return Promise.reject(error);
  }
);

// Utility function to get the correct API URL
export const getApiUrl = () => getApiBaseUrl();

// Utility function to test API connectivity
export const testApiConnection = async (): Promise<boolean> => {
  try {
    console.log('Testing API connection to:', getApiBaseUrl());
    const response = await api.get('/visitors/active/', { timeout: 5000 });
    console.log('API connection test successful:', response.status);
    return true;
  } catch (error) {
    console.error('API connection test failed:', error);
    return false;
  }
};

export const visitorAPI = {
  // Check in a new visitor
  checkIn: async (data: CheckInData): Promise<CheckInResponse> => {
    try {
      const response = await api.post('/visitors/check_in/', data);
      return response.data;
    } catch (error) {
      console.error('Check-in error:', error);
      throw error;
    }
  },

  // Check out a visitor
  checkOut: async (data: CheckOutData): Promise<CheckOutResponse> => {
    try {
      const response = await api.post('/visitors/check_out/', data);
      return response.data;
    } catch (error) {
      console.error('Check-out error:', error);
      throw error;
    }
  },

  // Get active visitors
  getActiveVisitors: async (): Promise<ActiveVisitorsResponse> => {
    try {
      const response = await api.get('/visitors/active/');
      return response.data;
    } catch (error) {
      console.error('Get active visitors error:', error);
      throw error;
    }
  },

  // Get visit history with filters
  getVisitHistory: async (filters?: VisitHistoryFilters): Promise<VisitHistoryResponse> => {
    try {
      const params = new URLSearchParams();
      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          if (value) params.append(key, value);
        });
      }
      
      const response = await api.get(`/visitors/history/?${params.toString()}`);
      return response.data;
    } catch (error) {
      console.error('Get visit history error:', error);
      throw error;
    }
  },

  // Export visit history
  exportVisitHistory: async (filters?: VisitHistoryFilters): Promise<void> => {
    try {
      const params = new URLSearchParams();
      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          if (value) params.append(key, value);
        });
      }
      
      const response = await api.get(`/visitors/export/?${params.toString()}`, {
        responseType: 'blob',
      });
      
      // Handle file download (you might want to use expo-file-system for this)
      console.log('Export successful:', response.data);
    } catch (error) {
      console.error('Export visit history error:', error);
      throw error;
    }
  },

  // Search for existing visitors
  searchVisitor: async (email?: string, phone?: string): Promise<SearchVisitorResponse> => {
    try {
      const params = new URLSearchParams();
      if (email) params.append('email', email);
      if (phone) params.append('phone', phone);
      
      const response = await api.get(`/visitors/search/?${params.toString()}`);
      return response.data;
    } catch (error) {
      console.error('Search visitor error:', error);
      throw error;
    }
  },
};

export default api; 