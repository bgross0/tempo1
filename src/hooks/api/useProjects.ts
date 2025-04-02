import { useCallback } from 'react';
import useSWR from 'swr';
import { supabase } from '@/lib/supabase';
import type { Project } from '@/types/database';

type ProjectFilters = {
  completed?: boolean;
  priority?: 'high' | 'medium' | 'low';
  tags?: string[];
};

export function useProjects(filters: ProjectFilters = {}) {
  const fetcher = useCallback(async () => {
    let query = supabase.from('projects').select('*');

    if (filters.completed !== undefined) {
      query = query.eq('completed', filters.completed);
    }

    if (filters.priority) {
      query = query.eq('priority', filters.priority);
    }

    if (filters.tags && filters.tags.length > 0) {
      query = query.contains('tags', filters.tags);
    }

    // Order by due date
    query = query.order('due_date', { ascending: true });

    const { data, error } = await query;

    if (error) {
      throw error;
    }

    return data as Project[];
  }, [
    filters.completed,
    filters.priority,
    filters.tags,
  ]);

  const { data, error, mutate } = useSWR(
    ['projects', JSON.stringify(filters)],
    fetcher
  );

  const createProject = useCallback(
    async (newProject: Omit<Project, 'id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase.from('projects').insert(newProject).select();
      
      if (error) {
        throw error;
      }
      
      mutate();
      return data[0] as Project;
    },
    [mutate]
  );

  const updateProject = useCallback(
    async (id: string, updates: Partial<Omit<Project, 'id' | 'created_at' | 'updated_at'>>) => {
      const { data, error } = await supabase
        .from('projects')
        .update(updates)
        .eq('id', id)
        .select();
      
      if (error) {
        throw error;
      }
      
      mutate();
      return data[0] as Project;
    },
    [mutate]
  );

  const deleteProject = useCallback(
    async (id: string) => {
      const { error } = await supabase.from('projects').delete().eq('id', id);
      
      if (error) {
        throw error;
      }
      
      mutate();
    },
    [mutate]
  );

  return {
    projects: data || [],
    isLoading: !error && !data,
    isError: error,
    mutate,
    createProject,
    updateProject,
    deleteProject,
  };
}
