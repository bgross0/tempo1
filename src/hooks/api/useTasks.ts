import { useCallback } from 'react';
import useSWR from 'swr';
import { supabase } from '@/lib/supabase';
import type { Task } from '@/types/database';

type TaskFilters = {
  completed?: boolean;
  priority?: 'high' | 'medium' | 'low';
  project_id?: string | null;
  tags?: string[];
  due_date_start?: string;
  due_date_end?: string;
};

export function useTasks(filters: TaskFilters = {}) {
  const fetcher = useCallback(async () => {
    try {
      // Import the getAuthenticatedClient function
      const { getAuthenticatedClient } = await import('@/lib/supabase');
      
      try {
        // Get a fresh authenticated client with proper token
        console.log('Getting authenticated client for fetching tasks...');
        const authedClient = await getAuthenticatedClient();
        console.log('Successfully created authenticated client for fetching');
        
        // Start building query with authenticated client
        let query = authedClient.from('tasks').select('*');
    
        if (filters.completed !== undefined) {
          query = query.eq('completed', filters.completed);
        }
    
        if (filters.priority) {
          query = query.eq('priority', filters.priority);
        }
    
        // Fix: Handle null project_id properly
        if (filters.project_id !== undefined) {
          if (filters.project_id === null) {
            // Use 'is' for null comparisons in Supabase
            query = query.is('project_id', null);
          } else {
            query = query.eq('project_id', filters.project_id);
          }
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
          console.error('Error fetching tasks:', error);
          throw error;
        }
    
        return data as Task[];
      } catch (authError) {
        // Handle authentication errors gracefully
        console.error('Authentication error during task fetching:', authError);
        return []; // Return empty array for auth errors
      }
    } catch (error) {
      console.error('Exception during fetching tasks:', error);
      return []; // Return empty array to avoid breaking the UI
    }
  }, [
    filters.completed,
    filters.priority,
    filters.project_id,
    filters.tags,
    filters.due_date_start,
    filters.due_date_end,
  ]);

  const { data, error, mutate } = useSWR(
    ['tasks', JSON.stringify(filters)],
    fetcher
  );

  const createTask = useCallback(
    async (newTask: Omit<Task, 'id' | 'created_at' | 'updated_at'>) => {
      console.log('Creating task with data:', JSON.stringify(newTask, null, 2));
      
      try {
        // First, make sure we have a user_id
        if (!newTask.user_id) {
          console.error('ERROR: Missing user_id in task creation data');
          // Get current session to extract user ID
          const { data: sessionData } = await supabase.auth.getSession();
          if (!sessionData.session || !sessionData.session.user) {
            throw new Error('User not authenticated - Cannot create task without a user ID');
          }
          
          console.log('Extracted user ID from session:', sessionData.session.user.id);
          newTask = {
            ...newTask,
            user_id: sessionData.session.user.id
          };
        }
        
        // Get fresh authenticated client first
        const { getAuthenticatedClient } = await import('@/lib/supabase');
        
        console.log('Getting authenticated client for task creation...');
        const authedClient = await getAuthenticatedClient();
        console.log('Successfully created authenticated client for task creation');
        
        // Create a task object with proper type handling
        const taskData = {
          user_id: String(newTask.user_id),
          name: String(newTask.name).trim(),
          description: newTask.description,
          due_date: String(newTask.due_date),
          due_time: newTask.due_time,
          start_date: newTask.start_date,
          // Convert null to undefined for time fields to avoid type errors
          start_time: newTask.start_time || undefined,
          priority: (newTask.priority === 'high' || newTask.priority === 'medium' || newTask.priority === 'low') 
            ? newTask.priority 
            : 'medium',
          status: newTask.status || 'todo',
          duration: newTask.duration,
          chunk_size: newTask.chunk_size,
          hard_deadline: Boolean(newTask.hard_deadline),
          completed: Boolean(newTask.completed),
          tags: Array.isArray(newTask.tags) ? newTask.tags : []
        };
        
        console.log('Sending task data to Supabase:', JSON.stringify(taskData, null, 2));
        
        // Use the authenticated client for task creation
        const { data, error } = await authedClient
          .from('tasks')
          .insert(taskData)
          .select();
        
        if (error) {
          console.error('Error creating task:', error);
          throw error;
        }
        
        if (!data || data.length === 0) {
          console.error('No data returned from task creation');
          throw new Error('Failed to create task: No data returned');
        }
        
        console.log('Task created successfully, received data:', data);
        
        // Update the local cache with the new data
        mutate();
        
        // Return the created task
        return data[0] as Task;
      } catch (error) {
        console.error('Exception during task creation:', error);
        throw error;
      }
    },
    [mutate]
  );

  const updateTask = useCallback(
    async (id: string, updates: Partial<Omit<Task, 'id' | 'created_at' | 'updated_at'>>) => {
      try {
        console.log('Updating task:', id, 'with data:', updates);
        
        // Import the getAuthenticatedClient function
        const { getAuthenticatedClient } = await import('@/lib/supabase');
        
        // Get a fresh authenticated client with proper token
        console.log('Getting authenticated client for task update...');
        const authedClient = await getAuthenticatedClient();
        console.log('Successfully created authenticated client for update');
        
        // Update the task using the authenticated client
        const { data, error } = await authedClient
          .from('tasks')
          .update(updates)
          .eq('id', id)
          .select();
        
        if (error) {
          console.error('Error updating task:', error);
          throw error;
        }
        
        console.log('Task updated successfully');
        mutate();
        return data[0] as Task;
      } catch (error) {
        console.error('Exception during task update:', error);
        throw error;
      }
    },
    [mutate]
  );

  const deleteTask = useCallback(
    async (id: string) => {
      try {
        console.log('Deleting task:', id);
        
        // Import the getAuthenticatedClient function
        const { getAuthenticatedClient } = await import('@/lib/supabase');
        
        // Get a fresh authenticated client with proper token
        console.log('Getting authenticated client for task deletion...');
        const authedClient = await getAuthenticatedClient();
        console.log('Successfully created authenticated client for deletion');
        
        // Delete the task using the authenticated client
        const { error } = await authedClient
          .from('tasks')
          .delete()
          .eq('id', id);
        
        if (error) {
          console.error('Error deleting task:', error);
          throw error;
        }
        
        console.log('Task deleted successfully');
        mutate();
      } catch (error) {
        console.error('Exception during task deletion:', error);
        throw error;
      }
    },
    [mutate]
  );

  return {
    tasks: data || [],
    isLoading: !error && !data,
    isError: error,
    mutate,
    createTask,
    updateTask,
    deleteTask,
  };
}
