import { useEffect, useCallback, useRef } from 'react';
import useSWR from 'swr';
import { supabase } from '@/lib/supabase';
import type { Project } from '@/types/database';
import { useAuth } from '@/contexts/AuthContext';
import { RealtimeChannel } from '@supabase/supabase-js';

type ProjectFilters = {
  completed?: boolean;
  priority?: 'high' | 'medium' | 'low';
  tags?: string[];
};

export function useProjectsRealtime(filters: ProjectFilters = {}) {
  const { user } = useAuth();
  const channelRef = useRef<RealtimeChannel | null>(null);
  
  const fetcher = useCallback(async () => {
    if (!user) return [];
    
    let query = supabase.from('projects').select('*').eq('user_id', user.id);

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
    user,
    filters.completed,
    filters.priority,
    filters.tags,
  ]);

  const { data, error, mutate } = useSWR(
    user ? ['projects', user.id, JSON.stringify(filters)] : null,
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
      .channel('projects-changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'projects',
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

  const createProject = useCallback(
    async (newProject: Omit<Project, 'id' | 'created_at' | 'updated_at'>) => {
      if (!user) throw new Error('User not authenticated');
      
      const projectWithUserId = {
        ...newProject,
        user_id: user.id,
      };
      
      const { data, error } = await supabase.from('projects').insert(projectWithUserId).select();
      
      if (error) {
        throw error;
      }
      
      return data[0] as Project;
    },
    [user]
  );

  const updateProject = useCallback(
    async (id: string, updates: Partial<Omit<Project, 'id' | 'created_at' | 'updated_at'>>) => {
      if (!user) throw new Error('User not authenticated');
      
      const { data, error } = await supabase
        .from('projects')
        .update(updates)
        .eq('id', id)
        .eq('user_id', user.id)
        .select();
      
      if (error) {
        throw error;
      }
      
      return data[0] as Project;
    },
    [user]
  );

  const deleteProject = useCallback(
    async (id: string) => {
      if (!user) throw new Error('User not authenticated');
      
      const { error } = await supabase
        .from('projects')
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
    projects: data || [],
    isLoading: !error && !data && !!user,
    isError: error,
    mutate,
    createProject,
    updateProject,
    deleteProject,
  };
}
