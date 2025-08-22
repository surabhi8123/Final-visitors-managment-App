import { get } from '../utils/api';

export interface Visitor {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  purpose: string;
  checkInTime: string;
  checkOutTime?: string;
  status: 'active' | 'completed';
  hostId: string;
  hostName: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ApiResponse<T> {
  data: T;
  message?: string;
  success: boolean;
}

/**
 * Get all active visitors
 */
export const getActiveVisitors = async (token?: string): Promise<Visitor[]> => {
  try {
    const response = await get<ApiResponse<Visitor[]>>('/visitors/active/', token);
    return response.data || [];
  } catch (error) {
    console.error('Error fetching active visitors:', error);
    throw error;
  }
};

/**
 * Get visitor by ID
 */
export const getVisitorById = async (id: string, token?: string): Promise<Visitor | null> => {
  try {
    const response = await get<ApiResponse<Visitor>>(`/visitors/${id}`, token);
    return response.data || null;
  } catch (error) {
    console.error(`Error fetching visitor ${id}:`, error);
    throw error;
  }
};

/**
 * Check out a visitor
 */
export const checkOutVisitor = async (id: string, token?: string): Promise<boolean> => {
  try {
    const response = await get<ApiResponse<{ success: boolean }>>(`/visitors/${id}/checkout`, token);
    return response.success;
  } catch (error) {
    console.error(`Error checking out visitor ${id}:`, error);
    throw error;
  }
};

/**
 * Get visitor statistics
 */
export interface VisitorStats {
  totalVisitors: number;
  activeVisitors: number;
  visitorsToday: number;
  averageVisitDuration: number;
}

export const getVisitorStats = async (token?: string): Promise<VisitorStats> => {
  try {
    const response = await get<ApiResponse<VisitorStats>>('/visitors/stats', token);
    return response.data || {
      totalVisitors: 0,
      activeVisitors: 0,
      visitorsToday: 0,
      averageVisitDuration: 0,
    };
  } catch (error) {
    console.error('Error fetching visitor stats:', error);
    return {
      totalVisitors: 0,
      activeVisitors: 0,
      visitorsToday: 0,
      averageVisitDuration: 0,
    };
  }
};
