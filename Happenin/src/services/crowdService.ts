import { createClient } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import type { CrowdMetric } from '../types';

/**
 * CROWD-O-METER SERVICE
 * 
 * Rules applied:
 * ✅ Real-time updates via Supabase Realtime (WebSocket)
 * ✅ Debounced to avoid spam (batch updates)
 * ✅ Accurate crowd count (only checked-in attendees)
 * ✅ Track capacity for percentage calculation
 */

// ──────────────────────────────────────────────
// Debounce Timer for Crowd Updates
// ──────────────────────────────────────────────
const debounceTimers = new Map<string, ReturnType<typeof setTimeout>>();

export const subscribeToRealTimeCrowd = (
  eventId: string,
  callback: (crowd: CrowdMetric) => void,
  debounceMs: number = 2000 // Wait 2 seconds before updating (avoid spam)
) => {
  // Subscribe to ticket check-ins for this event
  const subscription = supabase
    .channel(`event:${eventId}:check-ins`)
    .on(
      'postgres_changes',
      {
        event: 'UPDATE',
        schema: 'public',
        table: 'tickets',
        filter: `event_id=eq.${eventId}`,
      },
      async (payload) => {
        // Debounce: Only update after 2 seconds of no changes
        if (debounceTimers.has(eventId)) {
          clearTimeout(debounceTimers.get(eventId)!);
        }

        debounceTimers.set(
          eventId,
          setTimeout(async () => {
            try {
              const crowd = await getCrowdMetric(eventId);
              callback(crowd);
            } catch (error) {
              console.error('Failed to fetch crowd metric:', error);
            }
            debounceTimers.delete(eventId);
          }, debounceMs)
        );
      }
    )
    .subscribe();

  // Return unsubscribe function
  return () => {
    subscription.unsubscribe();
    if (debounceTimers.has(eventId)) {
      clearTimeout(debounceTimers.get(eventId)!);
    }
  };
};

// ──────────────────────────────────────────────
// Fetch Current Crowd Metric
// ──────────────────────────────────────────────
export const getCrowdMetric = async (eventId: string): Promise<CrowdMetric> => {
  try {
    // Get event capacity
    const { data: event, error: eventError } = await supabase
      .from('events')
      .select('max_capacity')
      .eq('id', eventId)
      .single();

    if (eventError) throw eventError;

    // Count checked-in attendees
    const { data: checkedInTickets, error: ticketError } = await supabase
      .from('tickets')
      .select('id', { count: 'exact' })
      .eq('event_id', eventId)
      .eq('is_checked_in', true);

    if (ticketError) throw ticketError;

    const currentCount = checkedInTickets?.length || 0;
    const capacity = event?.max_capacity || 1;
    const percentage = Math.round((currentCount / capacity) * 100);

    return {
      id: `crowd:${eventId}`,
      event_id: eventId,
      current_count: currentCount,
      capacity: capacity,
      percentage: Math.min(percentage, 100), // Cap at 100%
      updated_at: new Date().toISOString(),
    };
  } catch (error) {
    console.error('Failed to get crowd metric:', error);
    throw error;
  }
};

// ──────────────────────────────────────────────
// Get Historical Crowd Data (last N updates)
// ──────────────────────────────────────────────
export const getCrowdHistory = async (
  eventId: string,
  limit: number = 10
) => {
  const { data, error } = await supabase
    .from('crowd_metrics')
    .select('*')
    .eq('event_id', eventId)
    .order('updated_at', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('Failed to fetch crowd history:', error);
    return [];
  }

  return data;
};

// ──────────────────────────────────────────────
// Calculate Crowd Level (visual indicator)
// ──────────────────────────────────────────────
export const getCrowdLevel = (
  percentage: number
): 'empty' | 'low' | 'medium' | 'high' | 'full' => {
  if (percentage === 0) return 'empty';
  if (percentage < 25) return 'low';
  if (percentage < 50) return 'medium';
  if (percentage < 85) return 'high';
  return 'full';
};

// ──────────────────────────────────────────────
// Get Crowd Level Color (for UI)
// ──────────────────────────────────────────────
export const getCrowdLevelColor = (
  percentage: number
): string => {
  if (percentage === 0) return '#10b981'; // Green (empty)
  if (percentage < 25) return '#3b82f6'; // Blue (low)
  if (percentage < 50) return '#f59e0b'; // Amber (medium)
  if (percentage < 85) return '#ef4444'; // Red (high)
  return '#991b1b'; // Dark red (full)
};
