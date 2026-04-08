export interface Event {
  id: string;
  title: string;
  description: string | null;
  location: string;
  latitude: number;
  longitude: number;
  max_capacity: number;
  image_url: string | null;
  created_at: string | null;
}

export interface CreateEventInput {
  title: string;
  description?: string | null;
  location: string;
  latitude: number;
  longitude: number;
  max_capacity: number;
  image_url?: string | null;
}

export interface Ticket {
  id: string;
  event_id: string;
  user_id: string;
  is_checked_in: boolean | null;
  qr_code: string; // Signed JWT token
  qr_code_expires_at: string;
  ticket_number: string;
  purchase_date: string | null;
  updated_at: string | null;
}

export interface CrowdMetric {
  id: string;
  event_id: string;
  current_count: number;
  capacity: number;
  percentage: number; // 0-100
  updated_at: string | null;
}

export interface TicketPurchaseRequest {
  event_id: string;
  user_id: string;
  quantity: number;
  price: number;
}