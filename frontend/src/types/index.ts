// Type definitions for the visitor management system

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
  check_in_time: string;
  check_out_time: string | null;
  duration_minutes: number | null;
  duration_formatted: string;
  is_active: boolean;
  status: string;
  photos: VisitorPhoto[];
  signature_data?: string;
  signature_url?: string;
}

export interface VisitorPhoto {
  id: string;
  image: string;
  image_url?: string;
  created_at: string;
}

export interface CheckInData {
  name: string;
  email: string;
  phone: string;
  purpose: string;
  photo_data?: string;
  signature_data?: string;
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