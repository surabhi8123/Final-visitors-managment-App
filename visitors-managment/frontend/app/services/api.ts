import { Platform } from 'react-native';
import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getApiBaseUrl } from '../config/api';
import { 
  CheckInData,
  CheckInResponse,
  CheckOutData,
  CheckOutResponse,
  ActiveVisitorsResponse,
  VisitHistoryResponse,
  Visitor // Import the Visitor type
} from '../../src/types';

// Constants
const API_TIMEOUT = 30000; // 30 seconds

// Helper function to get API headers
const getApiHeaders = () => ({
  'Content-Type': 'application/json',
  'Accept': 'application/json',
  'X-Platform': Platform.OS,
});

// Define the VisitHistoryFilters type
export interface VisitHistoryFilters {
  startDate?: string;
  endDate?: string;
  visitorName?: string;
  hostName?: string;
  [key: string]: any; // Allow for additional properties
}

// Factory function to create an Axios instance with the resolved baseURL
const createApiInstance = async (): Promise<AxiosInstance> => {
  try {
    const baseURL = await getApiBaseUrl();
    if (!baseURL) {
      throw new Error('Base URL is not defined');
    }
    
    // Ensure baseURL is a string and properly formatted
    const formattedBaseUrl = String(baseURL).replace(/\/+$/, '');
    const token = await AsyncStorage.getItem('auth_token');
    
    // Create headers object with proper typing
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'X-Platform': Platform.OS,
      ...(token ? { 'Authorization': `Bearer ${token}` } : {})
    };
    
    const instance = axios.create({
      baseURL: formattedBaseUrl,
      headers,
      timeout: API_TIMEOUT,
    });

    // Request interceptor for logging
    instance.interceptors.request.use(
      (config) => {
        console.log('🌐 API Request:', config.method?.toUpperCase(), config.url);
        console.log('📍 API Base URL:', formattedBaseUrl);
        return config;
      },
      (error) => {
        console.error('❌ API Request Error:', error);
        return Promise.reject(error);
      }
    );

    // Response interceptor for error handling
    instance.interceptors.response.use(
      (response) => {
        console.log('✅ API Response:', response.status, response.config.url);
        return response;
      },
      async (error) => {
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
          const baseUrl = (await getApiBaseUrl()).replace('/api', '');
          return Promise.reject(new Error(`Network error. Please check your internet connection and ensure the backend server is running on ${baseUrl}`));
        }
        
        if (error.response) {
          console.error('🔴 API Error:', error.response.status, error.response.data);
          return Promise.reject(
            new Error(error.response.data?.message || `Server error: ${error.response.status}`)
          );
        }
        
        return Promise.reject(error);
      }
    );

    return instance; // Ensure we return the instance here
  } catch (error) {
    console.error('❌ Failed to create API instance:', error);
    throw error;
  }
};

// Get the base URL for API requests
export const getAPI_BASE_URL = async (): Promise<string> => {
  const baseUrl = await getApiBaseUrl();
  return typeof baseUrl === 'string' ? baseUrl : String(baseUrl);
};

// Export the getApiUrl function for backward compatibility
export const getApiUrl = getAPI_BASE_URL;

// Define the SearchVisitorResponse interface
export interface SearchVisitorResponse {
  visitors: Visitor[];
  total: number;
  page: number;
  perPage: number;
}

// Get alternative URLs for connection testing
const getAlternativeUrls = (baseUrl: string): string[] => {
  const urls = [baseUrl];
  // Add alternative URLs if needed (e.g., different ports, localhost vs IP)
  if (baseUrl.includes('localhost')) {
    urls.push(baseUrl.replace('localhost', '127.0.0.1'));
  } else if (baseUrl.includes('127.0.0.1')) {
    urls.push(baseUrl.replace('127.0.0.1', 'localhost'));
  }
  return urls;
};

// Enhanced connection test with multiple URL attempts
export const testApiConnection = async (): Promise<{ success: boolean; workingUrl?: string; error?: string }> => {
  const urls = [await getApiBaseUrl(), ...getAlternativeUrls(await getApiBaseUrl())];
  
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
    const baseUrl = getApiBaseUrl().replace('/api', '');
    console.log('❌ Backend connection failed!');
    console.log('💡 Troubleshooting tips:');
    console.log('   1. Make sure backend is running: python manage.py runserver');
    console.log(`   2. Check if backend is accessible at: ${baseUrl}`);
    console.log('   3. Verify mobile device is on same WiFi network');
    console.log('   4. Check firewall settings on your computer');
    console.log('   5. Try using your computer\'s actual IP address');
  }
};

// Helper function to create and use API instance with proper error handling
const withApi = async <T>(
  fn: (api: AxiosInstance) => Promise<T>,
  errorMessage = 'An error occurred while making the request'
): Promise<T> => {
  try {
    const api = await createApiInstance();
    return await fn(api);
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error(`API Error: ${error.message}`, error);
    } else {
      console.error('Unknown API Error:', error);
    }
    throw error;
  }
};

// VisitHistoryFilters interface is already defined at the top of the file

export const visitorAPI = {
  // Check in a new visitor
  checkIn: async (data: CheckInData): Promise<CheckInResponse> => {
    return withApi(async (api) => {
      try {
        // If photo_data or signature_data is provided, use FormData for multipart upload
        if (data.photo_data || data.signature_data) {
          const formData = new FormData();
          
          // Add text fields
          formData.append('name', data.name);
          formData.append('email', data.email);
          formData.append('phone', data.phone);
          formData.append('purpose', data.purpose);
          
          // Handle photo data if provided
          if (data.photo_data) {
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
          }

          // Handle signature data if provided
          if (data.signature_data) {
            const signatureData = data.signature_data;
            console.log('Processing signature data:', signatureData.substring(0, 50) + '...');
            
            try {
              // Check if it's vector data (starts with { or [)
              if ((signatureData.startsWith('{') || signatureData.startsWith('[')) && 
                  (signatureData.includes('paths') || signatureData.includes('lineColor'))) {
                console.log('Processing vector signature data');
                formData.append('signature_data', signatureData);
                
                // Add a flag to indicate this is vector data
                formData.append('is_vector_signature', 'true');
              } 
              // Handle image data URLs
              else if (signatureData.startsWith('data:image/')) {
                console.log('Processing image signature data');
                formData.append('signature_data', signatureData);
                
                const mimeType = signatureData.split(':')[1].split(';')[0];
                const extension = mimeType.split('/')[1] || 'png';
                const signatureFileName = `signature_${Date.now()}.${extension}`;
                
                // For React Native, we'll use the base64 data directly
                formData.append('signature_image', {
                  uri: signatureData,
                  type: mimeType,
                  name: signatureFileName,
                } as any);
                
                console.log('Signature image prepared for upload:', signatureFileName);
              }
              // Handle file URIs
              else if (signatureData.startsWith('file://')) {
                console.log('Processing file URI signature');
                const signatureFileName = `visitor_signature_${Date.now()}.png`;
                formData.append('signature_image', {
                  uri: signatureData,
                  type: 'image/png',
                  name: signatureFileName,
                } as any);
              }
              // Fallback for any other data format
              else {
                console.log('Using raw signature data as fallback');
                formData.append('signature_data', signatureData);
              }
            } catch (error) {
              console.error('Error processing signature data:', error);
              // Always include the raw data as a last resort
              formData.append('signature_data', signatureData);
            }
          }
          
          console.log('📸 Uploading form data:', {
            name: data.name,
            hasPhoto: !!data.photo_data,
            hasSignature: !!data.signature_data,
            photoType: data.photo_data?.startsWith('data:') ? 'base64' : 'file',
            signatureType: data.signature_data?.startsWith('data:') ? 'base64' : 'file'
          });
          
          const response = await api.post('/visitors/check_in/', formData, {
            headers: {
              'Content-Type': 'multipart/form-data',
            },
          });
          return response.data;
        } else {
          // No files to upload, use regular JSON
          const response = await api.post('/visitors/check_in/', data);
          return response.data;
        }
      } catch (error) {
        console.error('❌ Failed to create API instance:', error);
        throw error;
      }
    });
  },

  // Check out a visitor
  checkOut: async (data: CheckOutData): Promise<CheckOutResponse> => {
    return withApi(async (api) => {
      try {
        const response = await api.post('/visitors/check_out/', data);
        return response.data;
      } catch (error) {
        console.error('❌ Check-out error:', error);
        throw error;
      }
    });
  },

  // Get active visitors
  getActiveVisitors: async (): Promise<ActiveVisitorsResponse> => {
    return withApi(async (api) => {
      try {
        const response = await api.get('/visitors/active/');
        return response.data;
      } catch (error) {
        console.error('❌ Get active visitors error:', error);
        throw error;
      }
    });
  },

  // Get visit history with filters
  getVisitHistory: async (filters?: VisitHistoryFilters): Promise<VisitHistoryResponse> => {
    return withApi(async (api) => {
      try {
        const params = new URLSearchParams();
        if (filters) {
          if (filters.startDate) params.append('start_date', filters.startDate);
          if (filters.endDate) params.append('end_date', filters.endDate);
          if (filters.visitorName) params.append('visitor_name', filters.visitorName);
          if (filters.hostName) params.append('host_name', filters.hostName);
        }
        
        const response = await api.get(`/visitors/history/?${params.toString()}`);
        return response.data;
      } catch (error) {
        console.error('❌ Get visit history error:', error);
        throw error;
      }
    });
  },

  // Export visit history to Word document with real data
  exportVisitHistory: async (filters?: VisitHistoryFilters): Promise<{ message: string; filename: string; data: string; count: number }> => {
    return withApi(async (api) => {
      try {
        // First, fetch the visit history data
        const historyResponse = await visitorAPI.getVisitHistory(filters);
        const visits = historyResponse?.visits || [];
        
        // Check if we have data to export
        if (visits.length === 0) {
          throw new Error('No visit history data available for the selected filters');
        }
        
        // Create a simple HTML table with the visit data
        const tableRows = visits.map(visit => {
          return `
            <tr>
              <td>${visit.visitor_name || 'N/A'}</td>
              <td>${visit.company || 'N/A'}</td>
              <td>${visit.purpose || 'N/A'}</td>
              <td>${visit.check_in ? new Date(visit.check_in).toLocaleString() : 'N/A'}</td>
              <td>${visit.check_out ? new Date(visit.check_out).toLocaleString() : 'In Progress'}</td>
              <td>${visit.status || 'Unknown'}</td>
            </tr>
          `;
        }).join('');
        
        // Create a simple HTML document with the table
        const htmlContent = `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="UTF-8">
            <title>Visit History Export</title>
            <style>
              body { font-family: Arial, sans-serif; margin: 20px; }
              h1 { color: #2c3e50; }
              table { width: 100%; border-collapse: collapse; margin-top: 20px; }
              th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
              th { background-color: #f2f2f2; font-weight: bold; }
              tr:nth-child(even) { background-color: #f9f9f9; }
            </style>
          </head>
          <body>
            <h1>Visit History</h1>
            <p>Generated on: ${new Date().toLocaleString()}</p>
            <p>Total Records: ${visits.length}</p>
            
            <table>
              <thead>
                <tr>
                  <th>Visitor Name</th>
                  <th>Company</th>
                  <th>Purpose</th>
                  <th>Check-In</th>
                  <th>Check-Out</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                ${tableRows}
              </tbody>
            </table>
          </body>
          </html>
        `;
        
        // Prepare query parameters for the export
        const params = new URLSearchParams();
        
        // Add filter parameters if they exist
        if (filters) {
          if (filters.startDate) params.append('start_date', filters.startDate);
          if (filters.endDate) params.append('end_date', filters.endDate);
          if (filters.visitorName) params.append('name', filters.visitorName);
          if (filters.hostName) params.append('host_name', filters.hostName);
        }
        
        // Add the HTML content as a parameter
        params.append('html', htmlContent);
        
        // Make GET request to export endpoint
        const response = await api.get('/visitors/export/', {
          params,
          responseType: 'blob',
        });
        
        // Generate a filename with date
        const dateStr = new Date().toISOString().split('T')[0];
        const filename = `visit_history_${dateStr}.docx`;
        
        // Convert the blob to base64 for the share function
        const base64Data = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => {
            const base64String = (reader.result as string).split(',')[1];
            resolve(base64String);
          };
          reader.onerror = reject;
          reader.readAsDataURL(new Blob([response.data]));
        });
        
        return {
          message: 'Export successful',
          filename,
          data: base64Data,
          count: visits.length,
        };
      } catch (error) {
        console.error('❌ Export visit history error:', error);
        throw error;
      }
    });
  },

      // Search for existing visitors
  searchVisitor: async (email?: string, phone?: string): Promise<SearchVisitorResponse> => {
    return withApi(async (api) => {
      try {
        const params = new URLSearchParams();
        if (email) params.append('email', email);
        if (phone) params.append('phone', phone);
        
        const response = await api.get(`/visitors/search/?${params.toString()}`);
        return response.data;
      } catch (error: unknown) {
        console.error('❌ Search visitor error:', error);
        throw error;
      }
    });
  },
};

// Export a function that returns a new API instance for direct usage if needed
export const getApiClient = async () => {
  return await createApiInstance();
};

// For backward compatibility
export default {
  ...visitorAPI,
  testApiConnection,
  getApiUrl,
}; 