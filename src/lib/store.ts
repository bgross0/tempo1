// src/lib/store.ts
import { create } from 'zustand';
import { AppState, Task, Project, Event, User } from '@/types';

interface AppStore extends AppState {
  // Auth actions
  setUser: (user: User | null) => void;
  
  // Data actions
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
  
  // UI actions
  setCurrentView: (view: AppState['currentView']) => void;
  setCalendarView: (view: AppState['calendarView']) => void;
  setCurrentDate: (date: Date) => void;
  setSelectedDate: (date: Date) => void;
  setMiniCalendarDate: (date: Date) => void;
  setContextMenuTaskId: (taskId: string | null) => void;
  setContextMenuProjectId: (projectId: string | null) => void;
  setContextMenuEventId: (eventId: string | null) => void;
  setCurrentEditItem: (id: string | null, type: 'task' | 'project' | 'event' | null) => void;
}

export const useAppStore = create<AppStore>((set) => ({
  // Initial state
  currentUser: null,
  tasks: [],
  projects: [],
  events: [],
  currentView: 'calendar',
  calendarView: 'week',
  currentDate: new Date(),
  selectedDate: new Date(),
  miniCalendarDate: new Date(),
  contextMenuTaskId: null,
  contextMenuProjectId: null,
  contextMenuEventId: null,
  currentEditItemId: null,
  currentEditItemType: null,
  
  // Auth actions
  setUser: (user) => set({ currentUser: user }),
  
  // Data actions
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
    // Also update any tasks associated with this project
    tasks: state.tasks.map(t => t.projectId === projectId ? { ...t, projectId: undefined } : t)
  })),
  
  setEvents: (events) => set({ events }),
  addEvent: (event) => set((state) => ({ events: [...state.events, event] })),
  updateEvent: (event) => set((state) => ({
    events: state.events.map(e => e.id === event.id ? event : e)
  })),
  deleteEvent: (eventId) => set((state) => ({
    events: state.events.filter(e => e.id !== eventId)
  })),
  
  // UI actions
  setCurrentView: (currentView) => set({ currentView }),
  setCalendarView: (calendarView) => set({ calendarView }),
  setCurrentDate: (currentDate) => set({ currentDate }),
  setSelectedDate: (selectedDate) => set({ selectedDate }),
  setMiniCalendarDate: (miniCalendarDate) => set({ miniCalendarDate }),
  setContextMenuTaskId: (contextMenuTaskId) => set({ contextMenuTaskId }),
  setContextMenuProjectId: (contextMenuProjectId) => set({ contextMenuProjectId }),
  setContextMenuEventId: (contextMenuEventId) => set({ contextMenuEventId }),
  setCurrentEditItem: (id, type) => set({ currentEditItemId: id, currentEditItemType: type })
}));