import { useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { get, post, put, del, apiRequest } from '../utils/api';

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE';

interface UseAuthApiOptions<T> {
  onSuccess?: (data: T) => void;
  onError?: (error: Error) => void;
  showError?: boolean;
  requireAuth?: boolean;
}

/**
 * Hook for making authenticated API requests
 */
export const useAuthApi = <T = any>() => {
  const { token, isAuthenticated } = useAuth();

  const request = useCallback(
    async (
      method: HttpMethod,
      endpoint: string,
      body?: any,
      options: UseAuthApiOptions<T> = {}
    ): Promise<T | null> => {
      const { requireAuth = true } = options;
      
      if (requireAuth && !isAuthenticated) {
        throw new Error('Authentication required');
      }

      const authToken = requireAuth ? token : undefined;

      try {
        let response: T;
        
        switch (method) {
          case 'GET':
            response = await get<T>(endpoint, authToken);
            break;
          case 'POST':
            response = await post<T>(endpoint, body, authToken);
            break;
          case 'PUT':
            response = await put<T>(endpoint, body, authToken);
            break;
          case 'DELETE':
            response = await del<T>(endpoint, authToken);
            break;
          default:
            throw new Error(`Unsupported HTTP method: ${method}`);
        }

        options.onSuccess?.(response);
        return response;
      } catch (error) {
        const err = error instanceof Error ? error : new Error('An unknown error occurred');
        options.onError?.(err);
        
        if (options.showError !== false) {
          // You can replace this with your preferred error handling (e.g., toast notification)
          console.error('API Error:', err);
        }
        
        throw err;
      }
    },
    [token, isAuthenticated]
  );

  // Helper methods for common HTTP methods
  const getData = useCallback(
    <T = any>(endpoint: string, options?: UseAuthApiOptions<T>) =>
      request('GET', endpoint, undefined, options),
    [request]
  );

  const postData = useCallback(
    <T = any>(endpoint: string, body: any, options?: UseAuthApiOptions<T>) =>
      request('POST', endpoint, body, options),
    [request]
  );

  const putData = useCallback(
    <T = any>(endpoint: string, body: any, options?: UseAuthApiOptions<T>) =>
      request('PUT', endpoint, body, options),
    [request]
  );

  const deleteData = useCallback(
    <T = any>(endpoint: string, options?: UseAuthApiOptions<T>) =>
      request('DELETE', endpoint, undefined, options),
    [request]
  );

  return {
    get: getData,
    post: postData,
    put: putData,
    delete: deleteData,
    isAuthenticated,
    token,
  };
};

export default useAuthApi;
