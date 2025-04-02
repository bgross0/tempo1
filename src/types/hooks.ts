import { Task, Project, Event, Settings, User, AppState } from './index';
import { ApiResponse } from './api';

// Interface for useAuth hook
export interface UseAuthReturn {
  user: User | null;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, displayName?: string) => Promise<void>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updateProfile: (data: Partial<User>) => Promise<void>;
}

// Interface for useTasks hook
export interface UseTasksReturn {
  tasks: Task[];
  loading: boolean;
  error: string | null;
  addTask: (task: Omit<Task, 'id' | 'createdAt' | 'scheduledBlocks'>) => Promise<Task | null>;
  updateTask: (id: string, updates: Partial<Task>) => Promise<Task | null>;
  deleteTask: (id: string) => Promise<boolean>;
  completeTask: (id: string, completed?: boolean) => Promise<Task | null>;
  getTasks: () => Promise<Task[]>;
  getTaskById: (id: string) => Promise<Task | null>;
}

// Interface for useProjects hook
export interface UseProjectsReturn {
  projects: Project[];
  loading: boolean;
  error: string | null;
  addProject: (project: Omit<Project, 'id' | 'createdAt'>) => Promise<Project | null>;
  updateProject: (id: string, updates: Partial<Project>) => Promise<Project | null>;
  deleteProject: (id: string) => Promise<boolean>;
  completeProject: (id: string, completed?: boolean) => Promise<Project | null>;
  getProjects: () => Promise<Project[]>;
  getProjectById: (id: string) => Promise<Project | null>;
}

// Interface for useEvents hook
export interface UseEventsReturn {
  events: Event[];
  loading: boolean;
  error: string | null;
  addEvent: (event: Omit<Event, 'id' | 'createdAt'>) => Promise<Event | null>;
  updateEvent: (id: string, updates: Partial<Event>) => Promise<Event | null>;
  deleteEvent: (id: string) => Promise<boolean>;
  getEvents: () => Promise<Event[]>;
  getEventById: (id: string) => Promise<Event | null>;
}

// Interface for useSettings hook
export interface UseSettingsReturn {
  settings: Settings | null;
  loading: boolean;
  error: string | null;
  updateSettings: (updates: Partial<Settings>) => Promise<Settings | null>;
  getSettings: () => Promise<Settings | null>;
}

// Interface for useScheduler hook
export interface UseSchedulerReturn {
  scheduleAllTasks: (tasks?: Task[], settings?: Partial<Settings>) => Promise<Task[]>;
  loading: boolean;
  error: string | null;
}

// Interface for useAppState hook
export interface UseAppStateReturn {
  state: AppState;
  setState: (state: Partial<AppState>) => void;
  resetState: () => void;
}

// Interface for useAnalytics hook
export interface UseAnalyticsReturn {
  calculateTaskCompletionRate: (startDate: Date, endDate: Date) => { rate: number; completed: number; total: number };
  calculateProductivityScore: (startDate: Date, endDate: Date) => number;
  calculateProjectProgress: () => { id: string; name: string; progress: number; completedTasks: number; totalTasks: number; daysLeft: number; status: string }[];
  calculateTasksPerDay: (startDate: Date, endDate: Date) => { date: string; count: number; label: string }[];
  calculateTimeAllocation: () => { category: string; hours: number }[];
}

// Interface for API error handling hook
export interface UseApiReturn {
  loading: boolean;
  error: string | null;
  execute: <T>(promise: Promise<ApiResponse<T>>) => Promise<T | null>;
  clearError: () => void;
}