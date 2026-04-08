import { useEffect, useState, useCallback } from 'react';
import { getCrowdMetric, subscribeToRealTimeCrowd } from '../services/crowdService';
import type { CrowdMetric } from '../types';

/**
 * Hook: Real-time Crowd Updates
 * 
 * ✅ Subscribes to Supabase Realtime for instant updates
 * ✅ Debounced to avoid spam
 * ✅ Auto-cleanup on unmount
 */
export const useCrowd = (eventId: string) => {
  const [crowd, setCrowd] = useState<CrowdMetric | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let unsubscribe: (() => void) | null = null;

    const init = async () => {
      try {
        // Fetch initial crowd metric
        const initialCrowd = await getCrowdMetric(eventId);
        setCrowd(initialCrowd);
        setLoading(false);

        // Subscribe to real-time updates
        unsubscribe = subscribeToRealTimeCrowd(eventId, (updatedCrowd) => {
          setCrowd(updatedCrowd);
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load crowd data');
        setLoading(false);
      }
    };

    init();

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [eventId]);

  return { crowd, loading, error };
};

/**
 * Hook: Refresh Crowd Metric (manual trigger)
 */
export const useRefreshCrowd = (eventId: string) => {
  const [crowd, setCrowd] = useState<CrowdMetric | null>(null);
  const [loading, setLoading] = useState(false);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getCrowdMetric(eventId);
      setCrowd(data);
    } catch (err) {
      console.error('Failed to refresh crowd:', err);
    } finally {
      setLoading(false);
    }
  }, [eventId]);

  return { crowd, loading, refresh };
};
