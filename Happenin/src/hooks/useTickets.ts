import { useEffect, useState } from 'react';
import { getUserTickets } from '../services/ticketService';
import type { Ticket } from '../types';

export const useUserTickets = (userId: string | null) => {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) {
      setTickets([]);
      setError(null);
      setLoading(false);
      return;
    }

    const loadTickets = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await getUserTickets(userId);
        setTickets(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load tickets');
      } finally {
        setLoading(false);
      }
    };

    void loadTickets();
  }, [userId]);

  return { tickets, loading, error };
};
