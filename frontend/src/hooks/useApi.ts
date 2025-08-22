import { useState, useCallback } from 'react';
import { Alert } from 'react-native';
import { get, post, put, del, apiRequest } from '../utils/api';

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE';

interface UseApiOptions<T> {
  onSuccess?: (data: T) => void;
  onError?: (error: Error) => void;
  showError?: boolean;
}

export const useApi = <T = any>() => {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const request = useCallback(
    async (
      method: HttpMethod,
      endpoint: string,
      body?: any,
      token?: string,
      options: UseApiOptions<T> = {}
    ): Promise<T | null> => {
      const { onSuccess, onError, showError = true } = options;
      
      setLoading(true);
      setError(null);

      try {
        let response: T;
        
        switch (method) {
          case 'GET':
            response = await get<T>(endpoint, token);
            break;
          case 'POST':
            response = await post<T>(endpoint, body, token);
            break;
          case 'PUT':
            response = await put<T>(endpoint, body, token);
            break;
          case 'DELETE':
            response = await del<T>(endpoint, token);
            break;
          default:
            throw new Error(`Unsupported HTTP method: ${method}`);
        }

        setData(response);
        onSuccess?.(response);
        return response;
      } catch (err) {
        const error = err instanceof Error ? err : new Error('An unknown error occurred');
        setError(error);
        onError?.(error);
        
        if (showError) {
          Alert.alert(
            'Error',
            error.message || 'An error occurred while processing your request',
            [{ text: 'OK' }]
          );
        }
        
        return null;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  // Helper methods for common HTTP methods
  const getData = useCallback(
    (endpoint: string, token?: string, options?: UseApiOptions<T>) =>
      request('GET', endpoint, undefined, token, options),
    [request]
  );

  const postData = useCallback(
    (endpoint: string, body: any, token?: string, options?: UseApiOptions<T>) =>
      request('POST', endpoint, body, token, options),
    [request]
  );

  const putData = useCallback(
    (endpoint: string, body: any, token?: string, options?: UseApiOptions<T>) =>
      request('PUT', endpoint, body, token, options),
    [request]
  );

  const deleteData = useCallback(
    (endpoint: string, token?: string, options?: UseApiOptions<T>) =>
      request('DELETE', endpoint, undefined, token, options),
    [request]
  );

  // Raw request for more complex scenarios
  const fetchData = useCallback(
    async <T = any>(
      endpoint: string,
      options: RequestInit = {},
      token?: string
    ): Promise<T | null> => {
      setLoading(true);
      setError(null);

      try {
        const data = await apiRequest<T>(endpoint, options, token);
        setData(data as any);
        return data;
      } catch (err) {
        const error = err instanceof Error ? err : new Error('An unknown error occurred');
        setError(error);
        Alert.alert('Error', error.message || 'An error occurred while fetching data');
        return null;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  return {
    data,
    error,
    loading,
    get: getData,
    post: postData,
    put: putData,
    delete: deleteData,
    request: fetchData,
    reset: () => {
      setData(null);
      setError(null);
    },
  };
};

export default useApi;
