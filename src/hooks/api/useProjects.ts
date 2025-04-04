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
    try {
      // Get authenticated client for API calls
      const { getAuthenticatedClient } = await import('@/lib/supabase');
      console.log('Getting authenticated client for projects...');
      const authedClient = await getAuthenticatedClient();
      console.log('Successfully created authenticated client for projects');
      
      let query = authedClient.from('projects').select('*');

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
        console.error('Error fetching projects:', error);
        throw error;
      }

      return data as Project[];
    } catch (error) {
      console.error('Exception during fetching projects:', error);
      return []; // Return empty array to avoid breaking the UI
    }
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
      try {
        // Get authenticated client for API calls
        const { getAuthenticatedClient } = await import('@/lib/supabase');
        console.log('Getting authenticated client for project creation...');
        const authedClient = await getAuthenticatedClient();
        console.log('Successfully created authenticated client for project creation');
        
        // First, make sure we have a user_id
        if (!newProject.user_id || newProject.user_id === 'current-user') {
          // Get current session to extract user ID
          const { data: sessionData } = await supabase.auth.getSession();
          if (!sessionData.session || !sessionData.session.user) {
            throw new Error('User not authenticated - Cannot create project without a user ID');
          }
          
          newProject = {
            ...newProject,
            user_id: sessionData.session.user.id
          };
        }
        
        const { data, error } = await authedClient.from('projects').insert(newProject).select();
        
        if (error) {
          console.error('Error creating project:', error);
          throw error;
        }
        
        mutate();
        return data[0] as Project;
      } catch (error) {
        console.error('Exception during project creation:', error);
        throw error;
      }
    },
    [mutate]
  );

  const updateProject = useCallback(
    async (id: string, updates: Partial<Omit<Project, 'id' | 'created_at' | 'updated_at'>>) => {
      try {
        // Get authenticated client for API calls
        const { getAuthenticatedClient } = await import('@/lib/supabase');
        console.log('Getting authenticated client for project update...');
        const authedClient = await getAuthenticatedClient();
        console.log('Successfully created authenticated client for project update');
        
        const { data, error } = await authedClient
          .from('projects')
          .update(updates)
          .eq('id', id)
          .select();
        
        if (error) {
          console.error('Error updating project:', error);
          throw error;
        }
        
        mutate();
        return data[0] as Project;
      } catch (error) {
        console.error('Exception during project update:', error);
        throw error;
      }
    },
    [mutate]
  );

  const deleteProject = useCallback(
    async (id: string) => {
      try {
        // Get authenticated client for API calls
        const { getAuthenticatedClient } = await import('@/lib/supabase');
        console.log('Getting authenticated client for project deletion...');
        const authedClient = await getAuthenticatedClient();
        console.log('Successfully created authenticated client for project deletion');
        
        const { error } = await authedClient.from('projects').delete().eq('id', id);
        
        if (error) {
          console.error('Error deleting project:', error);
          throw error;
        }
        
        mutate();
      } catch (error) {
        console.error('Exception during project deletion:', error);
        throw error;
      }
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
