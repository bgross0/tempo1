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
    let query = supabase.from('tasks').select('*');

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
      console.log('Creating task - DATA BEFORE VALIDATION:', JSON.stringify(newTask, null, 2));
      
      // MANUAL VALIDATION: Ensure all required fields exist with proper types
      if (!newTask.name) {
        throw new Error('Task name is required');
      }
      
      if (!newTask.due_date) {
        throw new Error('Due date is required');
      }

      if (!newTask.user_id) {
        throw new Error('User ID is required');
      }
      
      // ENSURE PROPER TYPES: Explicit type checking for all fields
      const validatedTask = {
        name: String(newTask.name),
        user_id: String(newTask.user_id),
        due_date: String(newTask.due_date),
        priority: newTask.priority || 'medium',
        description: newTask.description === undefined ? null : String(newTask.description),
        start_date: newTask.start_date === undefined ? null : String(newTask.start_date),
        start_time: newTask.start_time === undefined ? null : String(newTask.start_time),
        due_time: newTask.due_time === undefined ? null : String(newTask.due_time),
        duration: newTask.duration === undefined ? null : Number(newTask.duration),
        chunk_size: newTask.chunk_size === undefined ? null : Number(newTask.chunk_size),
        hard_deadline: Boolean(newTask.hard_deadline),
        completed: Boolean(newTask.completed),
        completed_at: newTask.completed_at === undefined ? null : String(newTask.completed_at),
        project_id: newTask.project_id === undefined ? null : String(newTask.project_id),
        tags: Array.isArray(newTask.tags) ? newTask.tags : [],
        scheduled_blocks: null // Always set to null for new tasks
      };
      
      console.log('Creating task - VALIDATED DATA:', JSON.stringify(validatedTask, null, 2));
      
      try {
        // Add apikey explicitly to this request
        const apiKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
        
        const { data, error } = await supabase
          .from('tasks')
          .insert(validatedTask)
          .select();
        
        if (error) {
          console.error('SUPABASE ERROR creating task:', error);
          console.error('ERROR DETAILS:', error.details, error.hint, error.message);
          throw error;
        }
        
        console.log('Task created successfully:', data);
        mutate();
        return data[0] as Task;
      } catch (error) {
        console.error('EXCEPTION creating task:', error);
        throw error;
      }
    },
    [mutate]
  );

  const updateTask = useCallback(
    async (id: string, updates: Partial<Omit<Task, 'id' | 'created_at' | 'updated_at'>>) => {
      const { data, error } = await supabase
        .from('tasks')
        .update(updates)
        .eq('id', id)
        .select();
      
      if (error) {
        console.error('Error updating task:', error);
        throw error;
      }
      
      mutate();
      return data[0] as Task;
    },
    [mutate]
  );

  const deleteTask = useCallback(
    async (id: string) => {
      const { error } = await supabase.from('tasks').delete().eq('id', id);
      
      if (error) {
        console.error('Error deleting task:', error);
        throw error;
      }
      
      mutate();
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
