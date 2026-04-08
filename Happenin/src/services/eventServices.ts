import type { CreateEventInput, Event } from '../types';
import { supabase } from '../lib/supabase';

const createChannelName = (prefix: string): string => {
  const randomPart = Math.random().toString(36).slice(2, 10);
  return `${prefix}:${Date.now()}:${randomPart}`;
};

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

export const getEventById = async (eventId: string): Promise<Event | null> => {
  const { data, error } = await supabase
    .from('events')
    .select('*')
    .eq('id', eventId)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return (data ?? null) as Event | null;
};

export const createEvent = async (payload: CreateEventInput): Promise<Event> => {
  const cleanPayload = {
    ...payload,
    description: payload.description?.trim() || null,
    image_url: payload.image_url?.trim() || null,
  };

  const { data, error } = await supabase
    .from('events')
    .insert(cleanPayload)
    .select('*')
    .single();

  if (error) {
    throw error;
  }

  return data as Event;
};

export const subscribeToEvents = (onEventsChanged: () => void): (() => void) => {
  const channelName = createChannelName('events:realtime');
  const channel = supabase
    .channel(channelName)
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'events' },
      () => onEventsChanged()
    )
    .subscribe();

  return () => {
    void channel.unsubscribe();
    void supabase.removeChannel(channel);
  };
};
