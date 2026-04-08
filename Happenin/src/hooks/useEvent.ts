import { useEffect, useState } from 'react';
import { getEvents } from '../services/eventServices';
import type { Event } from '../types';

interface UseEventsResult {
  events: Event[];
  loading: boolean;
  error: Error | null;
}

export const useEvents = (): UseEventsResult => {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let isMounted = true;

    const loadEvents = async (): Promise<void> => {
      try {
        const eventList = await getEvents();
        if (isMounted) {
          setEvents(eventList);
        }
      } catch (err) {
        if (isMounted) {
          setError(err as Error);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    void loadEvents();

    return () => {
      isMounted = false;
    };
  }, []);

  return { events, loading, error };
};
