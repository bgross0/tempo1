import { KeyboardEvent as ReactKeyboardEvent } from 'react';
import { useAppStore } from '@/lib/store/app-store';
import { useRouter } from 'next/navigation';

export interface ShortcutAction {
  description: string;
  requiresMeta: boolean;
  requiresShift: boolean;
  key: string;
  action: () => void;
}

export function useKeyboardShortcuts() {
  const { 
    sidebarCollapsed, 
    setSidebarCollapsed, 
    setCommandPaletteOpen,
    viewMode,
    setViewMode
  } = useAppStore();
  
  const router = useRouter();
  
  const shortcuts: ShortcutAction[] = [
    {
      description: 'Toggle sidebar',
      requiresMeta: true,
      requiresShift: false,
      key: 'b',
      action: () => setSidebarCollapsed(!sidebarCollapsed)
    },
    {
      description: 'Open command palette',
      requiresMeta: true,
      requiresShift: false,
      key: 'k',
      action: () => setCommandPaletteOpen(true)
    },
    {
      description: 'Create new task',
      requiresMeta: true,
      requiresShift: false,
      key: 'n',
      action: () => router.push('/tasks?create=true')
    },
    {
      description: 'Go to dashboard',
      requiresMeta: true,
      requiresShift: false,
      key: 'd',
      action: () => router.push('/dashboard')
    },
    {
      description: 'Go to tasks',
      requiresMeta: true,
      requiresShift: false,
      key: 't',
      action: () => router.push('/tasks')
    },
    {
      description: 'View as Kanban',
      requiresMeta: true,
      requiresShift: true,
      key: '1',
      action: () => setViewMode('kanban')
    },
    {
      description: 'View as List',
      requiresMeta: true,
      requiresShift: true,
      key: '2',
      action: () => setViewMode('list')
    },
    {
      description: 'View as Table',
      requiresMeta: true,
      requiresShift: true,
      key: '3',
      action: () => setViewMode('table')
    }
  ];
  
  const handleKeyDown = (e: ReactKeyboardEvent | globalThis.KeyboardEvent) => {
    // Don't trigger shortcuts when typing in inputs
    if (e.target instanceof HTMLInputElement || 
        e.target instanceof HTMLTextAreaElement) {
      return;
    }
    
    for (const shortcut of shortcuts) {
      if (shortcut.key === e.key &&
          (shortcut.requiresMeta === (e.metaKey || e.ctrlKey)) &&
          (shortcut.requiresShift === e.shiftKey)) {
        e.preventDefault();
        shortcut.action();
        break;
      }
    }
  };
  
  return {
    shortcuts,
    handleKeyDown
  };
}