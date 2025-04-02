// Types for the database schema
import { Json } from './supabase';

export interface Task {
  id: string;
  user_id: string;
  project_id: string | null;
  name: string;
  description: string | null;
  start_date: string | null; // ISO format YYYY-MM-DD
  start_time: string | null; // 24h format HH:MM
  due_date: string; // ISO format YYYY-MM-DD
  due_time: string | null; // 24h format HH:MM
  priority: 'high' | 'medium' | 'low';
  duration: number | null; // minutes
  chunk_size: number | null; // minutes
  hard_deadline: boolean;
  completed: boolean;
  completed_at: string | null; // ISO datetime
  tags: string[];
  created_at: string; // ISO datetime
  updated_at: string; // ISO datetime
  scheduled_blocks: Json | null; // Match with Supabase schema (JSONB field)
}

export interface ScheduledBlock {
  date: string; // ISO format YYYY-MM-DD
  startTime: string; // 24h format HH:MM
  endTime: string; // 24h format HH:MM
  taskId: string;
}

export interface Project {
  id: string;
  user_id: string;
  name: string;
  description: string | null;
  start_date: string; // ISO format YYYY-MM-DD
  due_date: string; // ISO format YYYY-MM-DD
  priority: 'high' | 'medium' | 'low';
  completed: boolean;
  completed_at: string | null; // ISO datetime
  tags: string[];
  created_at: string; // ISO datetime
  updated_at: string; // ISO datetime
}

export interface Event {
  id: string;
  user_id: string;
  name: string;
  description: string | null;
  start_date: string; // ISO format YYYY-MM-DD
  start_time: string; // 24h format HH:MM
  end_date: string; // ISO format YYYY-MM-DD
  end_time: string; // 24h format HH:MM
  location: string | null;
  recurring: 'none' | 'daily' | 'weekly' | 'monthly';
  tags: string[];
  created_at: string; // ISO datetime
  updated_at: string; // ISO datetime
}

export interface User {
  id: string;
  email: string;
  name: string | null;
  avatar_url: string | null;
  created_at: string; // ISO datetime
  settings: UserSettings | null;
}

export interface UserSettings {
  theme: 'light' | 'dark' | 'system';
  working_hours_start: number; // 0-23
  working_hours_end: number; // 0-23
  working_days: number[]; // 0-6 (Sunday to Saturday)
  default_view: 'day' | 'week' | 'month';
  show_weekends: boolean;
}
