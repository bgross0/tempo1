import { useEffect, useCallback, useRef } from 'react';
import useSWR from 'swr';
import { supabase } from '@/lib/supabase';
import type { Event } from '@/types/database';
import { useAuth } from '@/contexts/AuthContext';
import { RealtimeChannel } from '@supabase/supabase-js';

type EventFilters = {
  recurring?: 'none' | 'daily' | 'weekly' | 'monthly';
  tags?: string[];
  date_start?: string;
  date_end?: string;
};

export function useEventsRealtime(filters: EventFilters = {}) {
  const { user } = useAuth();
  const channelRef = useRef<RealtimeChannel | null>(null);
  
  const fetcher = useCallback(async () => {
    if (!user) return [];
    
    console.log("DEBUG - useEventsRealtime fetcher called");
    let query = supabase.from('events').select('*').eq('user_id', user.id);

    if (filters.recurring) {
      query = query.eq('recurring', filters.recurring);
    }

    if (filters.tags && filters.tags.length > 0) {
      query = query.contains('tags', filters.tags);
    }

    if (filters.date_start) {
      // Date range filtering: Include events that start on or after date_start
      // OR events that end on or after date_start
      query = query.or(`start_date.gte.${filters.date_start},end_date.gte.${filters.date_start}`);
    }

    if (filters.date_end) {
      // Include events that start on or before date_end
      query = query.lte('start_date', filters.date_end);
    }

    // Order by start date and start time
    query = query.order('start_date', { ascending: true }).order('start_time', { ascending: true });

    const { data, error } = await query;

    if (error) {
      throw error;
    }

    return data as Event[];
  }, [
    user,
    filters.recurring,
    filters.tags,
    filters.date_start,
    filters.date_end,
  ]);

  const { data, error, mutate } = useSWR(
    user ? ['events', user.id, JSON.stringify(filters)] : null,
    fetcher
  );
  
  // Log when the data from SWR changes
  useEffect(() => {
    if (data) {
      console.log("DEBUG - useEventsRealtime SWR data updated:", data.length, "events");
    }
  }, [data]);

  // Set up real-time subscription
  useEffect(() => {
    if (!user) return;
    
    // Clean up previous subscription if it exists
    if (channelRef.current) {
      channelRef.current.unsubscribe();
    }
    
    // Create a new subscription
    channelRef.current = supabase
      .channel('events-changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'events',
        filter: `user_id=eq.${user.id}`,
      }, () => {
        // Refresh data when changes occur
        console.log("DEBUG - useEventsRealtime: Supabase realtime change detected");
        mutate();
        console.log("DEBUG - useEventsRealtime: mutate called");
      })
      .subscribe();
      
      console.log("DEBUG - useEventsRealtime: Subscription created");
    
    // Clean up subscription on unmount
    return () => {
      if (channelRef.current) {
        channelRef.current.unsubscribe();
        channelRef.current = null;
      }
    };
  }, [user, mutate]);

  const createEvent = useCallback(
    async (newEvent: Omit<Event, 'id' | 'created_at' | 'updated_at'>) => {
      if (!user) throw new Error('User not authenticated');
      
      const eventWithUserId = {
        ...newEvent,
        user_id: user.id,
      };
      
      const { data, error } = await supabase.from('events').insert(eventWithUserId).select();
      
      if (error) {
        throw error;
      }
      
      return data[0] as Event;
    },
    [user]
  );

  const updateEvent = useCallback(
    async (id: string, updates: Partial<Omit<Event, 'id' | 'created_at' | 'updated_at'>>) => {
      if (!user) throw new Error('User not authenticated');
      
      const { data, error } = await supabase
        .from('events')
        .update(updates)
        .eq('id', id)
        .eq('user_id', user.id)
        .select();
      
      if (error) {
        throw error;
      }
      
      return data[0] as Event;
    },
    [user]
  );

  const deleteEvent = useCallback(
    async (id: string) => {
      if (!user) throw new Error('User not authenticated');
      
      const { error } = await supabase
        .from('events')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);
      
      if (error) {
        throw error;
      }
    },
    [user]
  );

  return {
    events: data || [],
    isLoading: !error && !data && !!user,
    isError: error,
    mutate,
    createEvent,
    updateEvent,
    deleteEvent,
  };
}
