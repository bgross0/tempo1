// Task Priority Type
export type TaskPriority = 'high' | 'medium' | 'low';

// Recurring Event Type
export type RecurringType = 'none' | 'daily' | 'weekly' | 'monthly';

// Task Scheduling Strategy
export type SchedulingStrategy = 'balanced' | 'deadline-first' | 'priority-first';

// App View Type
export type AppView = 'calendar' | 'tasks' | 'projects' | 'analytics' | 'settings';

// Calendar View Type
export type CalendarView = 'day' | 'week' | 'month';

// Theme Type
export type ThemeType = 'light' | 'dark';

// Scheduled Block Interface
export interface ScheduledBlock {
  date: string;
  startMinute: number;
  duration: number;
  startTime: string;
  endTime: string;
}

// Task Status Type
export type TaskStatus = 'todo' | 'in-progress' | 'completed';

// Task Interface
export interface Task {
  id: string;
  name: string;
  description?: string;
  startDate: string | null;
  startTime: string | null;
  dueDate: string;
  dueTime: string | null;
  priority: TaskPriority;
  projectId: string | null;
  duration: number; // in minutes
  chunkSize: number | null; // in minutes
  hardDeadline: boolean;
  tags: string[];
  completed: boolean;
  status: TaskStatus;
  createdAt: string;
  scheduledBlocks: ScheduledBlock[];
}

// Project Interface
export interface Project {
  id: string;
  name: string;
  description?: string;
  startDate: string;
  dueDate: string;
  priority: TaskPriority;
  tags: string[];
  completed: boolean;
  createdAt: string;
}

// Event Interface
export interface Event {
  id: string;
  name: string;
  description?: string;
  startDate: string;
  startTime: string;
  endDate: string;
  endTime: string;
  location?: string;
  recurring: RecurringType;
  tags: string[];
  createdAt: string;
}

// User Interface
export interface User {
  id: string;
  email: string;
  displayName?: string;
  createdAt?: string;
}

// App Settings Interface
export interface Settings {
  workingHoursStart: string; // Format: "HH:MM"
  workingHoursEnd: string; // Format: "HH:MM"
  defaultTaskDuration: number; // in minutes
  defaultChunkDuration: number; // in minutes
  taskSchedulingStrategy: SchedulingStrategy;
  defaultView: AppView;
  defaultCalendarView: CalendarView;
  primaryColor: string; // Hex color code
  theme: ThemeType;
  notifications: 'enabled' | 'disabled';
  notificationTime: string; // Duration in minutes
}

// Task List State Interface
export interface TaskListState {
  filter: 'all' | 'today' | 'upcoming' | 'completed' | 'overdue';
  sort: 'dueDate' | 'priority' | 'name' | 'createdAt';
  sortDirection: 'asc' | 'desc';
  search: string;
  selectedTasks: string[]; // Array of task IDs
  currentPage: number;
  tasksPerPage: number;
}

// App State Interface
export interface AppState {
  currentUser: User | null;
  tasks: Task[];
  projects: Project[];
  events: Event[];
  settings: Settings;
  currentView: AppView;
  calendarView: CalendarView;
  currentDate: Date;
  selectedDate: Date;
  miniCalendarDate: Date;
  contextMenuTaskId: string | null;
  contextMenuProjectId: string | null;
  contextMenuEventId: string | null;
  currentEditItemId: string | null;
  currentEditItemType: 'task' | 'project' | 'event' | null;
  isGuestMode: boolean;
  taskList?: TaskListState;
  analyticsPeriod?: 'week' | 'month' | 'quarter';
}

// Progress Status for Projects
export type ProjectStatus = 'on-track' | 'ahead' | 'behind' | 'completed' | 'overdue';

// Project Progress Interface (for analytics)
export interface ProjectProgress {
  id: string;
  name: string;
  progress: number;
  completedTasks: number;
  totalTasks: number;
  daysLeft: number;
  status: ProjectStatus;
}

// Time Allocation Interface (for analytics)
export interface TimeAllocation {
  category: string;
  hours: number;
}

// Task Completion Rate Interface (for analytics)
export interface TaskCompletionRate {
  rate: number;
  completed: number;
  total: number;
}

// Analytics Data Interface
export interface AnalyticsData {
  taskCompletionRate: TaskCompletionRate;
  productivityScore: number;
  projectProgress: ProjectProgress[];
  tasksPerDay: { date: string; count: number; label: string }[];
  timeAllocation: TimeAllocation[];
  avgTasksPerDay: number;
  activeProjects: number;
}