// src/lib/tasks.ts
import { supabase } from './supabase';
import { Task } from '@/types';

export async function getTasks(userId: string) {
  const { data, error } = await supabase
    .from('tasks')
    .select('*')
    .eq('user_id', userId)
    .order('due_date', { ascending: true });
    
  if (error) throw error;
  
  return data.map(task => ({
    id: task.id,
    userId: task.user_id,
    name: task.name,
    description: task.description,
    startDate: task.start_date,
    startTime: task.start_time,
    dueDate: task.due_date,
    dueTime: task.due_time,
    priority: task.priority,
    projectId: task.project_id,
    duration: task.duration,
    chunkSize: task.chunk_size,
    hardDeadline: task.hard_deadline,
    tags: task.tags,
    completed: task.completed,
    status: task.status || 'todo',
    scheduledBlocks: task.scheduled_blocks,
    createdAt: task.created_at,
    updatedAt: task.updated_at
  })) as Task[];
}

export async function createTask(task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) {
  const { data, error } = await supabase
    .from('tasks')
    .insert({
      user_id: task.userId,
      name: task.name,
      description: task.description,
      start_date: task.startDate,
      start_time: task.startTime,
      due_date: task.dueDate,
      due_time: task.dueTime,
      priority: task.priority,
      project_id: task.projectId,
      duration: task.duration,
      chunk_size: task.chunkSize,
      hard_deadline: task.hardDeadline,
      tags: task.tags,
      completed: task.completed,
      status: task.status || 'todo',
      scheduled_blocks: task.scheduledBlocks
    })
    .select()
    .single();
    
  if (error) throw error;
  return data;
}

export async function updateTask(task: Task) {
  const { data, error } = await supabase
    .from('tasks')
    .update({
      name: task.name,
      description: task.description,
      start_date: task.startDate,
      start_time: task.startTime,
      due_date: task.dueDate,
      due_time: task.dueTime,
      priority: task.priority,
      project_id: task.projectId,
      duration: task.duration,
      chunk_size: task.chunkSize,
      hard_deadline: task.hardDeadline,
      tags: task.tags,
      completed: task.completed,
      status: task.status,
      scheduled_blocks: task.scheduledBlocks,
      updated_at: new Date().toISOString()
    })
    .eq('id', task.id)
    .eq('user_id', task.userId)
    .select()
    .single();
    
  if (error) throw error;
  return data;
}

export async function deleteTask(userId: string, taskId: string) {
  const { error } = await supabase
    .from('tasks')
    .delete()
    .eq('id', taskId)
    .eq('user_id', userId);
    
  if (error) throw error;
  return true;
}