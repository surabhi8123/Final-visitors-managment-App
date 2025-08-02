import React from 'react';
import { View, Text } from 'react-native';

export interface Visitor {
  id: string;
  name: string;
  email: string;
  phone: string;
  created_at: string;
  updated_at: string;
  total_visits: number;
  last_visit: string | null;
  active_visit: Visit | null;
}

export interface Visit {
  id: string;
  visitor: string;
  visitor_name: string;
  visitor_email: string;
  visitor_phone: string;
  purpose: string;
  host_name: string;
  check_in_time: string;
  check_out_time: string | null;
  duration_minutes: number | null;
  duration_formatted: string;
  is_active: boolean;
  status: string;
  photos: VisitorPhoto[];
}

export interface VisitorPhoto {
  id: string;
  image: string;
  created_at: string;
}

export interface CheckInData {
  name: string;
  email: string;
  phone: string;
  purpose: string;
  host_name?: string;
  photo_data?: string;
}

export interface CheckOutData {
  visit_id: string;
}

export interface CheckInResponse {
  message: string;
  visit: Visit;
  is_returning_visitor: boolean;
}

export interface CheckOutResponse {
  message: string;
  visit: Visit;
}

export interface ActiveVisitorsResponse {
  active_visitors: Visit[];
  count: number;
}

export interface VisitHistoryResponse {
  visits: Visit[];
  count: number;
}

export interface SearchVisitorResponse {
  found: boolean;
  visitor?: Visitor;
  message?: string;
}

export interface VisitHistoryFilters {
  name?: string;
  phone?: string;
  email?: string;
  date_from?: string;
  date_to?: string;
}

// Default export to satisfy Expo Router - this is a placeholder component
export default function TypesPlaceholder() {
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text>Types module - not meant to be rendered</Text>
    </View>
  );
} 