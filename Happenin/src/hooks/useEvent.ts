import { useEffect, useState } from 'react';
import { getEvents, subscribeToEvents } from '../services/eventServices';
import type { Event } from '../types';

interface UseEventsResult {
  events: Event[];
  loading: boolean;
  error: string | null;
}

export const useEvents = (): UseEventsResult => {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const loadEvents = async (): Promise<void> => {
      try {
        const eventList = await getEvents();
        if (isMounted) {
          setEvents(eventList);
          setError(null);
        }
      } catch (err) {
        if (isMounted) {
          setError(err instanceof Error ? err.message : 'Failed to load events');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    void loadEvents();

    const unsubscribe = subscribeToEvents(() => {
      void loadEvents();
    });

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, []);

  return { events, loading, error };
};
