import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getApiBaseUrl, API_TIMEOUT, getApiHeaders } from '../config/api';
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
      // If photo_data is provided, use FormData for multipart upload
      if (data.photo_data) {
        const formData = new FormData();
        
        // Add text fields
        formData.append('name', data.name);
        formData.append('email', data.email);
        formData.append('phone', data.phone);
        formData.append('purpose', data.purpose);
        
        // Convert base64 data URL to file object
        const photoData = data.photo_data;
        if (photoData.startsWith('data:image/')) {
          // Extract base64 data from data URL
          const base64Data = photoData.split(',')[1];
          const mimeType = photoData.split(':')[1].split(';')[0];
          const extension = mimeType.split('/')[1];
          
          // Create file name
          const photoFileName = `visitor_photo_${Date.now()}.${extension}`;
          
          // Create file object from base64
          const photoFile = {
            uri: photoData,
            type: mimeType,
            name: photoFileName,
          } as any;
          
          formData.append('photo', photoFile);
        } else {
          // If it's already a file URI, use it directly
          const photoFileName = `visitor_photo_${Date.now()}.jpg`;
          formData.append('photo', {
            uri: photoData,
            type: 'image/jpeg',
            name: photoFileName,
          } as any);
        }
        
        console.log('Uploading photo with FormData:', {
          name: data.name,
          hasPhoto: !!data.photo_data,
          photoType: data.photo_data?.startsWith('data:') ? 'base64' : 'file'
        });
        
        const response = await api.post('/visitors/check_in/', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
        return response.data;
      } else {
        // No photo, use regular JSON
        const response = await api.post('/visitors/check_in/', data);
        return response.data;
      }
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

  // Export visit history to CSV
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
      
      // Check if we're in a browser environment
      if (typeof window !== 'undefined' && window.URL && window.URL.createObjectURL) {
        // Create a blob URL and trigger download
        const blob = new Blob([response.data], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        
        // Create a temporary link element and trigger download
        const link = document.createElement('a');
        link.href = url;
        link.download = `visit_history_${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(link);
        link.click();
        
        // Clean up
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
        
        console.log('CSV file downloaded successfully');
      } else {
        throw new Error('Browser download not supported in this environment');
      }
      
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