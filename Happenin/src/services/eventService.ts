import { supabase } from '../lib/supabase';
import type { Event, CrowdMetric, Ticket } from '../types';

// ─── Events ───────────────────────────────────────────────

/** Fetch all events ordered by newest first */
export async function fetchEvents(): Promise<Event[]> {
  const { data, error } = await supabase
    .from('events')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('fetchEvents error:', error.message);
    return [];
  }
  return data as Event[];
}

/** Fetch a single event by id */
export async function fetchEventById(id: string): Promise<Event | null> {
  const { data, error } = await supabase
    .from('events')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    console.error('fetchEventById error:', error.message);
    return null;
  }
  return data as Event;
}

// ─── Crowd Metrics ────────────────────────────────────────

/** Fetch live crowd metrics for a given event */
export async function fetchCrowdMetric(eventId: string): Promise<CrowdMetric | null> {
  const { data, error } = await supabase
    .from('crowd_metrics')
    .select('*')
    .eq('event_id', eventId)
    .single();

  if (error) {
    console.error('fetchCrowdMetric error:', error.message);
    return null;
  }
  return data as CrowdMetric;
}

// ─── Tickets (user-specific) ──────────────────────────────

/** Fetch all tickets for the currently logged-in user */
export async function fetchUserTickets(userId: string): Promise<Ticket[]> {
  const { data, error } = await supabase
    .from('tickets')
    .select('*, events(title, location, event_date, image_url)')
    .eq('user_id', userId)
    .order('purchase_date', { ascending: false });

  if (error) {
    console.error('fetchUserTickets error:', error.message);
    return [];
  }
  return data as Ticket[];
}
