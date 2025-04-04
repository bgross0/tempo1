'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Plus, FileText, CheckSquare, Calendar, Settings, Folder, BarChart3 } from 'lucide-react';
import { 
  CommandDialog, 
  CommandInput, 
  CommandList, 
  CommandEmpty, 
  CommandGroup, 
  CommandItem, 
  CommandSeparator 
} from '@/components/ui/command';
import { useAppStore } from '@/lib/store/app-store';

export function CommandPalette() {
  const { commandPaletteOpen, setCommandPaletteOpen } = useAppStore();
  const router = useRouter();
  
  // Register keyboard shortcut
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setCommandPaletteOpen(true);
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [setCommandPaletteOpen]);
  
  const navigateAndClose = (href: string) => {
    router.push(href);
    setCommandPaletteOpen(false);
  };
  
  return (
    <CommandDialog 
      open={commandPaletteOpen} 
      onOpenChange={setCommandPaletteOpen}
      // Add accessible title and description to fix accessibility warnings
      aria-label="Command Menu"
      aria-description="Search for commands and navigate the application"
    >
      <CommandInput placeholder="Type a command or search..." />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        <CommandGroup heading="Navigation">
          <CommandItem onSelect={() => navigateAndClose('/dashboard')}>
            <FileText className="mr-2 h-4 w-4" />
            <span>Dashboard</span>
          </CommandItem>
          <CommandItem onSelect={() => navigateAndClose('/tasks')}>
            <CheckSquare className="mr-2 h-4 w-4" />
            <span>Tasks</span>
          </CommandItem>
          <CommandItem onSelect={() => navigateAndClose('/projects')}>
            <Folder className="mr-2 h-4 w-4" />
            <span>Projects</span>
          </CommandItem>
          <CommandItem onSelect={() => navigateAndClose('/calendar')}>
            <Calendar className="mr-2 h-4 w-4" />
            <span>Calendar</span>
          </CommandItem>
          <CommandItem onSelect={() => navigateAndClose('/analytics')}>
            <BarChart3 className="mr-2 h-4 w-4" />
            <span>Analytics</span>
          </CommandItem>
          <CommandItem onSelect={() => navigateAndClose('/settings')}>
            <Settings className="mr-2 h-4 w-4" />
            <span>Settings</span>
          </CommandItem>
        </CommandGroup>
        <CommandSeparator />
        <CommandGroup heading="Actions">
          <CommandItem onSelect={() => navigateAndClose('/tasks?create=true')}>
            <Plus className="mr-2 h-4 w-4" />
            Create Task
          </CommandItem>
          <CommandItem onSelect={() => navigateAndClose('/projects?create=true')}>
            <Plus className="mr-2 h-4 w-4" />
            Create Project
          </CommandItem>
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}