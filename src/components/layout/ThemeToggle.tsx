'use client';

import { User } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function ThemeToggle() {
  // Simple button replacing the theme toggle but keeping same look
  return (
    <Button variant="ghost" size="icon" aria-label="User settings">
      <User className="h-5 w-5" />
    </Button>
  );
}