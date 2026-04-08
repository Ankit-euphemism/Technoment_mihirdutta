import { supabase } from '../lib/supabase';
import type { CrowdMetric } from '../types';

const createChannelName = (prefix: string, eventId: string): string => {
  const randomPart = Math.random().toString(36).slice(2, 10);
  return `${prefix}:${eventId}:${Date.now()}:${randomPart}`;
};

/**
 * CROWD-O-METER SERVICE
 *
 * Client-side behavior:
 * - Reads crowd metrics from Supabase.
 * - Subscribes to realtime updates on crowd_metrics.
 * - Does not write crowd metrics from the client.
 */

const normalizeCrowdMetric = (metric: CrowdMetric): CrowdMetric => {
  const safeCapacity = Math.max(metric.capacity, 1);
  const safeCount = Math.max(metric.current_count, 0);
  const computedPercentage = Math.min(100, Math.round((safeCount / safeCapacity) * 100));

  return {
    ...metric,
    capacity: safeCapacity,
    current_count: safeCount,
    percentage: Number.isFinite(metric.percentage) ? Math.min(100, Math.max(0, metric.percentage)) : computedPercentage,
  };
};

const getEventCapacity = async (eventId: string): Promise<number> => {
  const { data: event, error: eventError } = await supabase
    .from('events')
    .select('max_capacity')
    .eq('id', eventId)
    .single();

  if (eventError) throw eventError;

  return Math.max(event?.max_capacity ?? 1, 1);
};

export const subscribeToRealTimeCrowd = (
  eventId: string,
  callback: (crowd: CrowdMetric) => void
) => {
  const metricsChannelName = createChannelName('event:crowd-metrics', eventId);

  const metricsChannel = supabase
    .channel(metricsChannelName)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'crowd_metrics',
        filter: `event_id=eq.${eventId}`,
      },
      (payload) => {
        const row = payload.new as CrowdMetric | undefined;
        if (row) {
          callback(normalizeCrowdMetric(row));
        }
      }
    )
    .subscribe();

  return () => {
    void metricsChannel.unsubscribe();
    void supabase.removeChannel(metricsChannel);
  };
};

// ──────────────────────────────────────────────
// Fetch Current Crowd Metric
// ──────────────────────────────────────────────
export const getCrowdMetric = async (eventId: string): Promise<CrowdMetric> => {
  try {
    const { data, error } = await supabase
      .from('crowd_metrics')
      .select('*')
      .eq('event_id', eventId)
      .maybeSingle();

    if (error) throw error;

    if (data) {
      return normalizeCrowdMetric(data as CrowdMetric);
    }

    const capacity = await getEventCapacity(eventId);
    return normalizeCrowdMetric({
      id: `crowd:${eventId}`,
      event_id: eventId,
      current_count: 0,
      capacity,
      percentage: 0,
      updated_at: null,
    });
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
) : Promise<CrowdMetric[]> => {
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

  return (data ?? []).map((row) => normalizeCrowdMetric(row as CrowdMetric));
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
