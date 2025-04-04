'use client';

import { Moon, Sun, Monitor } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useDarkMode } from '@/hooks/useDarkMode';

export function ThemeToggle() {
  // Temporarily disabled theme toggle
  return (
    <Button variant="ghost" size="icon">
      <Sun className="h-5 w-5" />
      <span className="sr-only">Theme (disabled)</span>
    </Button>
  );
}
