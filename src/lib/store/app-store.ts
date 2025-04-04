import { create } from 'zustand';
import { Task, Project, Event, User } from '@/types';

// Define UI state types first
type UIState = {
  sidebarCollapsed: boolean;
  viewMode: 'kanban' | 'list' | 'table';
  commandPaletteOpen: boolean;
  currentView: string;
  calendarView: 'day' | 'week' | 'month';
  currentDate: Date;
  selectedDate: Date;
  miniCalendarDate: Date;
  contextMenuTaskId: string | null;
  contextMenuProjectId: string | null;
  contextMenuEventId: string | null;
  currentEditItemId: string | null;
  currentEditItemType: 'task' | 'project' | 'event' | null;
};

// Define data state types
type DataState = {
  currentUser: User | null;
  tasks: Task[];
  projects: Project[];
  events: Event[];
  isGuestMode: boolean;
  settings: {
    workingHoursStart: string; // Format as HH:MM string
    workingHoursEnd: string;
    defaultTaskDuration: number;
    defaultChunkDuration: number;
    taskSchedulingStrategy: 'balanced' | 'deadline-first' | 'priority-first';
    defaultView: 'calendar' | 'tasks' | 'projects' | 'analytics' | 'settings';
    defaultCalendarView: 'day' | 'week' | 'month';
    primaryColor: string;
    notifications: 'enabled' | 'disabled';
    notificationTime: string;
  };
};

// Define UI actions
type UIActions = {
  setSidebarCollapsed: (collapsed: boolean) => void;
  setViewMode: (mode: 'kanban' | 'list' | 'table') => void;
  setCommandPaletteOpen: (open: boolean) => void;
  setCurrentView: (view: string) => void;
  setCalendarView: (view: 'day' | 'week' | 'month') => void;
  setCurrentDate: (date: Date) => void;
  setSelectedDate: (date: Date) => void;
  setMiniCalendarDate: (date: Date) => void;
  setContextMenuTaskId: (taskId: string | null) => void;
  setContextMenuProjectId: (projectId: string | null) => void;
  setContextMenuEventId: (eventId: string | null) => void;
  setCurrentEditItem: (id: string | null, type: 'task' | 'project' | 'event' | null) => void;
};

// Define data actions
type DataActions = {
  setUser: (user: User | null) => void;
  setTasks: (tasks: Task[]) => void;
  addTask: (task: Task) => void;
  updateTask: (task: Task) => void;
  deleteTask: (taskId: string) => void;
  setProjects: (projects: Project[]) => void;
  addProject: (project: Project) => void;
  updateProject: (project: Project) => void;
  deleteProject: (projectId: string) => void;
  setEvents: (events: Event[]) => void;
  addEvent: (event: Event) => void;
  updateEvent: (event: Event) => void;
  deleteEvent: (eventId: string) => void;
};

// Combine all types for the store
type AppStore = UIState & DataState & UIActions & DataActions;

export const useAppStore = create<AppStore>((set) => ({
  // UI state
  sidebarCollapsed: false,
  viewMode: 'list',
  commandPaletteOpen: false,
  currentView: 'dashboard',
  calendarView: 'week',
  currentDate: new Date(),
  selectedDate: new Date(),
  miniCalendarDate: new Date(),
  contextMenuTaskId: null,
  contextMenuProjectId: null,
  contextMenuEventId: null,
  currentEditItemId: null,
  currentEditItemType: null,
  
  // Data state
  currentUser: null,
  tasks: [],
  projects: [],
  events: [],
  isGuestMode: false,
  settings: {
    workingHoursStart: "09:00",
    workingHoursEnd: "17:00",
    defaultTaskDuration: 60,
    defaultChunkDuration: 30,
    taskSchedulingStrategy: 'balanced',
    defaultView: 'calendar',
    defaultCalendarView: 'week',
    primaryColor: '#4f46e5',
    notifications: 'enabled',
    notificationTime: '15'
  },
  
  // UI actions
  setSidebarCollapsed: (collapsed) => set({ sidebarCollapsed: collapsed }),
  setViewMode: (mode) => set({ viewMode: mode }),
  setCommandPaletteOpen: (open) => set({ commandPaletteOpen: open }),
  setCurrentView: (currentView) => set({ currentView }),
  setCalendarView: (calendarView) => set({ calendarView }),
  setCurrentDate: (currentDate) => set({ currentDate }),
  setSelectedDate: (selectedDate) => set({ selectedDate }),
  setMiniCalendarDate: (miniCalendarDate) => set({ miniCalendarDate }),
  setContextMenuTaskId: (contextMenuTaskId) => set({ contextMenuTaskId }),
  setContextMenuProjectId: (contextMenuProjectId) => set({ contextMenuProjectId }),
  setContextMenuEventId: (contextMenuEventId) => set({ contextMenuEventId }),
  setCurrentEditItem: (id, type) => set({ currentEditItemId: id, currentEditItemType: type }),
  
  // Data actions
  setUser: (user) => set({ currentUser: user }),
  setTasks: (tasks) => set({ tasks }),
  addTask: (task) => set((state) => ({ tasks: [...state.tasks, task] })),
  updateTask: (task) => set((state) => ({
    tasks: state.tasks.map(t => t.id === task.id ? task : t)
  })),
  deleteTask: (taskId) => set((state) => ({
    tasks: state.tasks.filter(t => t.id !== taskId)
  })),
  setProjects: (projects) => set({ projects }),
  addProject: (project) => set((state) => ({ projects: [...state.projects, project] })),
  updateProject: (project) => set((state) => ({
    projects: state.projects.map(p => p.id === project.id ? project : p)
  })),
  deleteProject: (projectId) => set((state) => ({
    projects: state.projects.filter(p => p.id !== projectId),
    tasks: state.tasks.map(t => t.projectId === projectId ? { ...t, projectId: null } : t)
  })),
  setEvents: (events) => set({ events }),
  addEvent: (event) => set((state) => ({ events: [...state.events, event] })),
  updateEvent: (event) => set((state) => ({
    events: state.events.map(e => e.id === event.id ? event : e)
  })),
  deleteEvent: (eventId) => set((state) => ({
    events: state.events.filter(e => e.id !== eventId)
  })),
}));
