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
      const { data, error } = await supabase.from('tasks').insert(newTask).select();
      
      if (error) {
        throw error;
      }
      
      mutate();
      return data[0] as Task;
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
