import type { Event } from '../types';
import { supabase } from '../lib/supabase';

export const getEvents = async (): Promise<Event[]> => {
  const { data, error } = await supabase
    .from('events')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    throw error;
  }

  return (data ?? []) as Event[];
};

export const subscribeToEvents = (onEventsChanged: () => void): (() => void) => {
  const channel = supabase
    .channel('events:realtime')
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'events' },
      () => onEventsChanged()
    )
    .subscribe();

  return () => {
    channel.unsubscribe();
  };
};
