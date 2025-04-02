import { create } from 'zustand';

type AppState = {
  sidebarCollapsed: boolean;
  currentView: string;
  darkMode: boolean;
  setSidebarCollapsed: (collapsed: boolean) => void;
  setCurrentView: (view: string) => void;
  toggleDarkMode: () => void;
};

export const useAppStore = create<AppState>((set) => ({
  sidebarCollapsed: false,
  currentView: 'dashboard',
  darkMode: false,
  setSidebarCollapsed: (collapsed) => set({ sidebarCollapsed: collapsed }),
  setCurrentView: (view) => set({ currentView: view }),
  toggleDarkMode: () => set((state) => ({ darkMode: !state.darkMode })),
}));
