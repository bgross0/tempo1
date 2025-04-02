import { useEffect, useCallback, useRef } from 'react';
import useSWR from 'swr';
import { supabase } from '@/lib/supabase';
import type { Task } from '@/types/database';
import { useAuth } from '@/contexts/AuthContext';
import { RealtimeChannel } from '@supabase/supabase-js';

type TaskFilters = {
  completed?: boolean;
  priority?: 'high' | 'medium' | 'low';
  project_id?: string | null;
  tags?: string[];
  due_date_start?: string;
  due_date_end?: string;
};

export function useTasksRealtime(filters: TaskFilters = {}) {
  const { user } = useAuth();
  const channelRef = useRef<RealtimeChannel | null>(null);
  
  const fetcher = useCallback(async () => {
    if (!user) return [];
    
    let query = supabase.from('tasks').select('*').eq('user_id', user.id);

    if (filters.completed !== undefined) {
      query = query.eq('completed', filters.completed);
    }

    if (filters.priority) {
      query = query.eq('priority', filters.priority);
    }

    if (filters.project_id !== undefined) {
      query = query.eq('project_id', filters.project_id);
    }

    if (filters.tags && filters.tags.length > 0) {
      query = query.contains('tags', filters.tags);
    }

    if (filters.due_date_start) {
      query = query.gte('due_date', filters.due_date_start);
    }

    if (filters.due_date_end) {
      query = query.lte('due_date', filters.due_date_end);
    }

    // Always order by due date
    query = query.order('due_date', { ascending: true });

    const { data, error } = await query;

    if (error) {
      throw error;
    }

    return data as Task[];
  }, [
    user,
    filters.completed,
    filters.priority,
    filters.project_id,
    filters.tags,
    filters.due_date_start,
    filters.due_date_end,
  ]);

  const { data, error, mutate } = useSWR(
    user ? ['tasks', user.id, JSON.stringify(filters)] : null,
    fetcher
  );

  // Set up real-time subscription
  useEffect(() => {
    if (!user) return;
    
    // Clean up previous subscription if it exists
    if (channelRef.current) {
      channelRef.current.unsubscribe();
    }
    
    // Create a new subscription
    channelRef.current = supabase
      .channel('tasks-changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'tasks',
        filter: `user_id=eq.${user.id}`,
      }, () => {
        // Refresh data when changes occur
        mutate();
      })
      .subscribe();
    
    // Clean up subscription on unmount
    return () => {
      if (channelRef.current) {
        channelRef.current.unsubscribe();
        channelRef.current = null;
      }
    };
  }, [user, mutate]);

  const createTask = useCallback(
    async (newTask: Omit<Task, 'id' | 'created_at' | 'updated_at'>) => {
      if (!user) throw new Error('User not authenticated');
      
      const taskWithUserId = {
        ...newTask,
        user_id: user.id,
      };
      
      const { data, error } = await supabase.from('tasks').insert(taskWithUserId).select();
      
      if (error) {
        throw error;
      }
      
      return data[0] as Task;
    },
    [user]
  );

  const updateTask = useCallback(
    async (id: string, updates: Partial<Omit<Task, 'id' | 'created_at' | 'updated_at'>>) => {
      if (!user) throw new Error('User not authenticated');
      
      const { data, error } = await supabase
        .from('tasks')
        .update(updates)
        .eq('id', id)
        .eq('user_id', user.id)
        .select();
      
      if (error) {
        throw error;
      }
      
      return data[0] as Task;
    },
    [user]
  );

  const deleteTask = useCallback(
    async (id: string) => {
      if (!user) throw new Error('User not authenticated');
      
      const { error } = await supabase
        .from('tasks')
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
    tasks: data || [],
    isLoading: !error && !data && !!user,
    isError: error,
    mutate,
    createTask,
    updateTask,
    deleteTask,
  };
}
