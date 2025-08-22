import { API_CONFIG, fetchWithRetry } from '../../app/config/api';

/**
 * Make an API request with proper error handling and retry logic
 */
export const apiRequest = async <T = any>(
  endpoint: string,
  options: RequestInit = {},
  token?: string
): Promise<T> => {
  try {
    // Ensure endpoint starts with a slash
    const normalizedEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
    
    // Get the base URL based on the current environment
    const baseUrl = API_CONFIG.development.base; // In production, this would be API_CONFIG.production.base
    
    // Construct the full URL
    const url = `${baseUrl.replace(/\/$/, '')}${normalizedEndpoint}`;
    
    // Prepare headers
    const headers = {
      ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
      ...(options.headers || {})
    };
    
    // Make the request with retry logic
    const response = await fetchWithRetry(url, {
      ...options,
      headers,
    });
    
    // Handle successful response
    if (response.status === 204) { // No content
      return null as any;
    }
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Request failed');
    }
    
    return data;
  } catch (error) {
    console.error('API Request Error:', error);
    throw error;
  }
};

/**
 * Helper function for GET requests
 */
export const get = <T = any>(endpoint: string, token?: string): Promise<T> => {
  return apiRequest<T>(endpoint, { method: 'GET' }, token);
};

/**
 * Helper function for POST requests
 */
export const post = <T = any>(
  endpoint: string, 
  body: any, 
  token?: string
): Promise<T> => {
  return apiRequest<T>(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  }, token);
};

/**
 * Helper function for PUT requests
 */
export const put = <T = any>(
  endpoint: string, 
  body: any, 
  token?: string
): Promise<T> => {
  return apiRequest<T>(endpoint, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  }, token);
};

/**
 * Helper function for DELETE requests
 */
export const del = <T = any>(
  endpoint: string, 
  token?: string
): Promise<T> => {
  return apiRequest<T>(endpoint, { method: 'DELETE' }, token);
};
