export interface Event {
  id: string;
  title: string;
  description: string;
  location: string;
  latitude: number;
  longitude: number;
  max_capacity: number;
  image_url: string;
  created_at: string;
}

export interface Ticket {
  id: string;
  event_id: string;
  user_id: string;
  is_checked_in: boolean;
  qr_code: string; // Signed JWT token
  qr_code_expires_at: string;
  ticket_number: string;
  purchase_date: string;
  updated_at: string;
}

export interface CrowdMetric {
  id: string;
  event_id: string;
  current_count: number;
  capacity: number;
  percentage: number; // 0-100
  updated_at: string;
}

export interface TicketPurchaseRequest {
  event_id: string;
  user_id: string;
  quantity: number;
  price: number;
}