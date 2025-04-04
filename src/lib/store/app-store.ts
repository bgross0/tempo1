import { create } from 'zustand';

type AppState = {
  // Existing properties
  sidebarCollapsed: boolean;
  currentView: string;
  darkMode: boolean;
  
  // New properties for UI enhancements
  viewMode: 'kanban' | 'list' | 'table';
  commandPaletteOpen: boolean;
  
  // Existing functions
  setSidebarCollapsed: (collapsed: boolean) => void;
  setCurrentView: (view: string) => void;
  toggleDarkMode: () => void;
  
  // New functions
  setViewMode: (mode: 'kanban' | 'list' | 'table') => void;
  setCommandPaletteOpen: (open: boolean) => void;
};

export const useAppStore = create<AppState>((set) => ({
  // Existing state
  sidebarCollapsed: false,
  currentView: 'dashboard',
  darkMode: false,
  
  // New state
  viewMode: 'list',
  commandPaletteOpen: false,
  
  // Existing functions
  setSidebarCollapsed: (collapsed) => set({ sidebarCollapsed: collapsed }),
  setCurrentView: (view) => set({ currentView: view }),
  toggleDarkMode: () => set((state) => ({ darkMode: !state.darkMode })),
  
  // New functions
  setViewMode: (mode) => set({ viewMode: mode }),
  setCommandPaletteOpen: (open) => set({ commandPaletteOpen: open })
}));
