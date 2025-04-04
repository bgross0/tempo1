'use client';

import { useState, useEffect } from 'react';

import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';

interface ProjectFiltersProps {
  filters: {
    completed: boolean;
    priority?: 'high' | 'medium' | 'low';
    tags: string[];
  };
  onChange: (filters: any) => void;
  className?: string;
}

export function ProjectFilters({
  filters,
  onChange,
  className = '',
}: ProjectFiltersProps) {
  const [showCompleted, setShowCompleted] = useState(filters.completed);
  const [priority, setPriority] = useState<string | undefined>(
    filters.priority
  );

  // Apply filters when they change
  useEffect(() => {
    onChange({
      ...filters,
      completed: showCompleted,
      priority: priority,
    });
  }, [showCompleted, priority, filters, onChange]);

  const resetFilters = () => {
    setShowCompleted(false);
    setPriority(undefined);
  };

  return (
    <Card className={className}>
      <CardContent className="pt-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Status
            </label>
            <Select
              value={showCompleted ? 'completed' : 'active'}
              onValueChange={(value) => setShowCompleted(value === 'completed')}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Priority
            </label>
            <Select
              value={priority || ''}
              onValueChange={(value) => setPriority(value || undefined)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Any priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Any priority</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="low">Low</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-end">
            <Button variant="outline" onClick={resetFilters}>
              Reset Filters
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
