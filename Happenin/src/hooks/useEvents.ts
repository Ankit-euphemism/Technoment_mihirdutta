import { useState, useEffect } from 'react';
import { fetchEvents } from '../services/eventService';
import type { Event } from '../types';

export function useEvents() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function load() {
      setLoading(true);
      setError(null);
      const data = await fetchEvents();
      if (isMounted) {
        if (data.length === 0) {
          setError('No events found. Add some events in your Supabase database!');
        }
        setEvents(data);
        setLoading(false);
      }
    }

    load();

    return () => { isMounted = false; };
  }, []);

  return { events, loading, error };
}
