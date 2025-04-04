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
  status?: 'todo' | 'in-progress' | 'completed';
};

export function useTasksRealtime(filters: TaskFilters = {}) {
  const { user } = useAuth();
  const channelRef = useRef<RealtimeChannel | null>(null);
  
  const fetcher = useCallback(async () => {
    if (!user) {
      console.log('No user available in fetcher, returning empty array');
      return [];
    }
    
    try {
      console.log('Fetching tasks with user ID:', user.id);
      
      // Get authenticated client for API calls
      const { getAuthenticatedClient } = await import('@/lib/supabase');
      const client = await getAuthenticatedClient();
      
      let query = client.from('tasks').select('*').eq('user_id', user.id);

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
      
      if (filters.status) {
        query = query.eq('status', filters.status);
      }

      // Always order by due date
      query = query.order('due_date', { ascending: true });

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching tasks:', error);
        return [];
      }

      return data as Task[];
    } catch (error) {
      console.error('Exception fetching tasks:', error);
      return [];
    }
  }, [user, filters.completed, filters.priority, filters.project_id, 
      filters.tags, filters.due_date_start, filters.due_date_end, filters.status]);

  // Use the user ID as part of the cache key
  const cacheKey = user ? ['tasks', user.id, JSON.stringify(filters)] : null;
  
  const { data, error, mutate } = useSWR(cacheKey, fetcher);

  // Set up real-time subscription when user is available
  useEffect(() => {
    if (!user) return;
    
    // Clean up previous subscription
    if (channelRef.current) {
      channelRef.current.unsubscribe();
    }
    
    // Create subscription ID based on filters to prevent multiple similar subscriptions
    const filtersHash = JSON.stringify(filters);
    const channelId = `tasks-changes-${user.id}-${filtersHash.substring(0, 20)}`;
    
    // Create new subscription with more specific filters to reduce unnecessary updates
    channelRef.current = supabase
      .channel(channelId)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'tasks',
        filter: `user_id=eq.${user.id}`,
      }, (payload) => {
        // Check if the change is relevant to our current filters before mutating
        let shouldUpdate = true;
        
        // Only update if the changed task matches our filters
        if (payload.new && filters) {
          if (filters.completed !== undefined && payload.new.completed !== filters.completed) {
            shouldUpdate = false;
          }
          if (filters.priority && payload.new.priority !== filters.priority) {
            shouldUpdate = false;
          }
          if (filters.project_id !== undefined && payload.new.project_id !== filters.project_id) {
            shouldUpdate = false;
          }
          if (filters.status && payload.new.status !== filters.status) {
            shouldUpdate = false;
          }
        }
        
        if (shouldUpdate) {
          console.log('Task change detected that matches filters, updating...');
          mutate();
        } else {
          console.log('Task change detected but does not match filters, ignoring...');
        }
      })
      .subscribe();
    
    // Clean up on unmount
    return () => {
      if (channelRef.current) {
        channelRef.current.unsubscribe();
        channelRef.current = null;
      }
    };
  }, [user, mutate, filters]);

  // Create a new task
  const createTask = useCallback(async (newTask: Omit<Task, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      console.log('Creating task with data:', JSON.stringify(newTask, null, 2));
      
      // Get session to ensure we have a valid token and user ID
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData.session) {
        throw new Error('No active session - please log in');
      }
      
      const userId = sessionData.session.user.id;
      
      // Get authenticated client
      const { getAuthenticatedClient } = await import('@/lib/supabase');
      const client = await getAuthenticatedClient();
      
      // Ensure task has user_id
      const taskData = {
        ...newTask,
        user_id: userId
      };
      
      // Create the task
      const { data, error } = await client
        .from('tasks')
        .insert(taskData)
        .select();
      
      if (error) {
        console.error('Error creating task:', error);
        throw error;
      }
      
      // Update cache
      mutate();
      
      return data[0] as Task;
    } catch (error) {
      console.error('Exception creating task:', error);
      throw error;
    }
  }, [mutate]);

  // Update a task
  const updateTask = useCallback(async (
    id: string, 
    updates: Partial<Omit<Task, 'id' | 'created_at' | 'updated_at'>>
  ) => {
    try {
      // Get authenticated client
      const { getAuthenticatedClient } = await import('@/lib/supabase');
      const client = await getAuthenticatedClient();
      
      // Get session for user ID
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData.session) {
        throw new Error('No active session - please log in');
      }
      
      const userId = sessionData.session.user.id;
      
      // Update the task
      const { data, error } = await client
        .from('tasks')
        .update(updates)
        .eq('id', id)
        .eq('user_id', userId)
        .select();
      
      if (error) {
        console.error('Error updating task:', error);
        throw error;
      }
      
      // Update cache
      mutate();
      
      return data[0] as Task;
    } catch (error) {
      console.error('Exception updating task:', error);
      throw error;
    }
  }, [mutate]);

  // Delete a task
  const deleteTask = useCallback(async (id: string) => {
    try {
      // Get authenticated client
      const { getAuthenticatedClient } = await import('@/lib/supabase');
      const client = await getAuthenticatedClient();
      
      // Get session for user ID
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData.session) {
        throw new Error('No active session - please log in');
      }
      
      const userId = sessionData.session.user.id;
      
      // Delete the task
      const { error } = await client
        .from('tasks')
        .delete()
        .eq('id', id)
        .eq('user_id', userId);
      
      if (error) {
        console.error('Error deleting task:', error);
        throw error;
      }
      
      // Update cache
      mutate();
    } catch (error) {
      console.error('Exception deleting task:', error);
      throw error;
    }
  }, [mutate]);

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