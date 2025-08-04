import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getApiBaseUrl, API_TIMEOUT, getApiHeaders, getAlternativeUrls } from '../config/api';
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
    console.log('🌐 API Request:', config.method?.toUpperCase(), config.url);
    console.log('📍 API Base URL:', getApiBaseUrl());
    
    const token = await AsyncStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error: any) => {
    console.error('❌ API Request Error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response: any) => {
    console.log('✅ API Response:', response.status, response.config.url);
    return response;
  },
  async (error: any) => {
    console.error('❌ API Response Error:', {
      message: error.message,
      code: error.code,
      status: error.response?.status,
      url: error.config?.url,
    });

    if (error.code === 'ECONNABORTED') {
      console.error('⏰ API Timeout Error:', error.message);
      return Promise.reject(new Error('Request timeout. Please check your connection and try again.'));
    }
    
    if (error.code === 'ERR_NETWORK') {
      console.error('🌐 Network Error:', error.message);
      return Promise.reject(new Error('Network error. Please check your internet connection and ensure the backend server is running on http://192.168.1.19:8000'));
    }
    
    if (error.response) {
      // Server responded with error status
      console.error('🔴 API Error:', error.response.status, error.response.data);
      return Promise.reject(new Error(error.response.data?.message || `Server error: ${error.response.status}`));
    }
    
    console.error('❓ API Error:', error.message);
    return Promise.reject(error);
  }
);

// Utility function to get the correct API URL
export const getApiUrl = () => getApiBaseUrl();

// Enhanced connection test with multiple URL attempts
export const testApiConnection = async (): Promise<{ success: boolean; workingUrl?: string; error?: string }> => {
  const urls = [getApiBaseUrl(), ...getAlternativeUrls()];
  
  for (const url of urls) {
    try {
      console.log('🔍 Testing API connection to:', url);
      
      const testApi = axios.create({
        baseURL: url,
        headers: getApiHeaders(),
        timeout: 5000,
      });
      
      const response = await testApi.get('/visitors/active/');
      console.log('✅ API connection successful:', url, response.status);
      
      return { success: true, workingUrl: url };
    } catch (error: any) {
      console.log('❌ Failed to connect to:', url, error.message);
      continue;
    }
  }
  
  const errorMsg = 'Failed to connect to any API endpoint. Please check:\n1. Backend server is running\n2. Mobile device is on same WiFi\n3. Firewall allows connections to port 8000';
  console.error('❌ All API connection attempts failed');
  return { success: false, error: errorMsg };
};

// Test connection and log detailed info
export const debugApiConnection = async (): Promise<void> => {
  console.log('🔍 Debugging API connection...');
  console.log('📍 Current API Base URL:', getApiBaseUrl());
  console.log('🔧 API Headers:', getApiHeaders());
  console.log('⏱️ API Timeout:', API_TIMEOUT);
  
  const result = await testApiConnection();
  
  if (result.success) {
    console.log('🎉 Backend connection is working!');
    console.log('✅ Working URL:', result.workingUrl);
  } else {
    console.log('❌ Backend connection failed!');
    console.log('💡 Troubleshooting tips:');
    console.log('   1. Make sure backend is running: python start_server.py');
    console.log('   2. Check if backend is accessible at: http://192.168.1.19:8000');
    console.log('   3. Verify mobile device is on same WiFi network');
    console.log('   4. Check firewall settings on your computer');
    console.log('   5. Try using your computer\'s actual IP address');
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
        
        console.log('📸 Uploading photo with FormData:', {
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
      console.error('❌ Check-in error:', error);
      throw error;
    }
  },

  // Check out a visitor
  checkOut: async (data: CheckOutData): Promise<CheckOutResponse> => {
    try {
      const response = await api.post('/visitors/check_out/', data);
      return response.data;
    } catch (error) {
      console.error('❌ Check-out error:', error);
      throw error;
    }
  },

  // Get active visitors
  getActiveVisitors: async (): Promise<ActiveVisitorsResponse> => {
    try {
      const response = await api.get('/visitors/active/');
      return response.data;
    } catch (error) {
      console.error('❌ Get active visitors error:', error);
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
      console.error('❌ Get visit history error:', error);
      throw error;
    }
  },

  // Export visit history to Excel
  exportVisitHistory: async (filters?: VisitHistoryFilters): Promise<{ message: string; filename: string; data: string; count: number }> => {
    try {
      const params = new URLSearchParams();
      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          if (value) params.append(key, value);
        });
      }
      
      const response = await api.get(`/visitors/export/?${params.toString()}`);
      
      // Return the response data which contains Excel data
      return response.data;
      
    } catch (error) {
      console.error('❌ Export visit history error:', error);
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
      console.error('❌ Search visitor error:', error);
      throw error;
    }
  },
};

export default api; 