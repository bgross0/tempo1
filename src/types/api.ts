import { Task, Project, Event, Settings, User } from './index';

// Common API Response Interface
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

// Task API Interfaces
export interface CreateTaskRequest {
  name: string;
  description?: string;
  startDate?: string | null;
  startTime?: string | null;
  dueDate: string;
  dueTime?: string | null;
  priority: string;
  projectId?: string | null;
  duration: number;
  chunkSize?: number | null;
  hardDeadline?: boolean;
  tags?: string[];
}

export interface UpdateTaskRequest extends Partial<CreateTaskRequest> {
  id: string;
  completed?: boolean;
}

export type TaskResponse = ApiResponse<Task>;
export type TasksResponse = ApiResponse<Task[]>;

// Project API Interfaces
export interface CreateProjectRequest {
  name: string;
  description?: string;
  startDate: string;
  dueDate: string;
  priority: string;
  tags?: string[];
}

export interface UpdateProjectRequest extends Partial<CreateProjectRequest> {
  id: string;
  completed?: boolean;
}

export type ProjectResponse = ApiResponse<Project>;
export type ProjectsResponse = ApiResponse<Project[]>;

// Event API Interfaces
export interface CreateEventRequest {
  name: string;
  description?: string;
  startDate: string;
  startTime: string;
  endDate: string;
  endTime: string;
  location?: string;
  recurring?: string;
  tags?: string[];
}

export interface UpdateEventRequest extends Partial<CreateEventRequest> {
  id: string;
}

export type EventResponse = ApiResponse<Event>;
export type EventsResponse = ApiResponse<Event[]>;

// Settings API Interfaces
export interface UpdateSettingsRequest {
  workingHoursStart?: string;
  workingHoursEnd?: string;
  defaultTaskDuration?: number;
  defaultChunkDuration?: number;
  taskSchedulingStrategy?: string;
  defaultView?: string;
  defaultCalendarView?: string;
  primaryColor?: string;
  theme?: string;
  notifications?: 'enabled' | 'disabled';
  notificationTime?: string;
}

export type SettingsResponse = ApiResponse<Settings>;

// Authentication Interfaces
export interface LoginRequest {
  email: string;
  password: string;
}

export interface SignupRequest {
  email: string;
  password: string;
  displayName?: string;
}

export interface AuthResponse extends ApiResponse<{
  user: User;
  token: string;
}> {}

// Scheduling API Interfaces
export interface ScheduleTasksRequest {
  tasks: Task[];
  startDate?: string;
  endDate?: string;
  settings?: Partial<Settings>;
}

export interface ScheduleTasksResponse extends ApiResponse<Task[]> {}