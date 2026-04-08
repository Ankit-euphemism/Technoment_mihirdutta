import { supabase } from '../lib/supabase';
import type { Ticket, TicketPurchaseRequest } from '../types';

interface CheckInResponse {
  success: boolean;
  message: string;
  checked_in_at: string;
}

/**
 * ⚠️ TICKET VALIDATION MUST HAPPEN ON BACKEND
 * Frontend only handles display & QR scanning
 */

// ──────────────────────────────────────────────
// Purchase Ticket - Calls Supabase Edge Function
// ──────────────────────────────────────────────
export const purchaseTicket = async (request: TicketPurchaseRequest): Promise<Ticket[]> => {
  try {
    // 🔐 Call backend Edge Function - this validates EVERYTHING
    // - Stock availability
    // - Payment processing
    // - QR code generation (signed & time-bound)
    // - Rate limiting
    const { data, error } = await supabase.functions.invoke('purchase-ticket', {
      body: request,
    });

    if (error) {
      throw new Error(error.message);
    }

    return data as Ticket[];
  } catch (err) {
    console.error('Ticket purchase failed:', err);
    throw err;
  }
};

// ──────────────────────────────────────────────
// Get User's Tickets
// ──────────────────────────────────────────────
export const getUserTickets = async (userId: string): Promise<Ticket[]> => {
  const { data, error } = await supabase
    .from('tickets')
    .select('*')
    .eq('user_id', userId)
    .order('purchase_date', { ascending: false });

  if (error) throw error;
  return data as Ticket[];
};

// ──────────────────────────────────────────────
// Check In Ticket (Frontend scans QR, sends to backend)
// ──────────────────────────────────────────────
export const checkInTicket = async (ticketId: string, qrCode: string): Promise<CheckInResponse> => {
  try {
    // 🔐 Backend validates QR signature + expiration
    const { data, error } = await supabase.functions.invoke('check-in-ticket', {
      body: {
        ticket_id: ticketId,
        qr_code: qrCode,
      },
    });

    if (error) {
      throw new Error(error.message);
    }

    return data as CheckInResponse;
  } catch (err) {
    console.error('Check-in failed:', err);
    throw err;
  }
};
