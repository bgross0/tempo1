'use client';

import { LayoutGrid, List, Table } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAppStore } from '@/lib/store/app-store';

export function ViewSelector() {
  const { viewMode, setViewMode } = useAppStore();
  
  // Ensure viewMode is a valid value, defaulting to kanban if somehow undefined
  const currentViewMode = viewMode === 'kanban' || viewMode === 'list' || viewMode === 'table' 
    ? viewMode 
    : 'kanban';
  
  return (
    <div className="flex border rounded-md p-1 bg-white dark:bg-gray-800">
      <Button
        variant={currentViewMode === 'kanban' ? 'default' : 'ghost'}
        size="sm"
        onClick={() => setViewMode('kanban')}
        className="px-2"
        aria-label="Kanban view"
      >
        <LayoutGrid className="h-4 w-4" />
      </Button>
      <Button
        variant={currentViewMode === 'list' ? 'default' : 'ghost'}
        size="sm"
        onClick={() => setViewMode('list')}
        className="px-2"
        aria-label="List view"
      >
        <List className="h-4 w-4" />
      </Button>
      <Button
        variant={currentViewMode === 'table' ? 'default' : 'ghost'}
        size="sm"
        onClick={() => setViewMode('table')}
        className="px-2"
        aria-label="Table view"
      >
        <Table className="h-4 w-4" />
      </Button>
    </div>
  );
}