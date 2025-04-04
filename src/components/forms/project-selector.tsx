'use client';

import { useState, useEffect } from 'react';
import { useProjects } from '@/hooks/api/useProjects';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface ProjectSelectorProps {
  value: string | null;
  onChange: (value: string | null) => void;
}

export function ProjectSelector({ value, onChange }: ProjectSelectorProps) {
  // Get list of active projects
  const { projects, isLoading } = useProjects({ completed: false });
  
  // Handle selection
  const handleValueChange = (newValue: string) => {
    onChange(newValue === 'none' ? null : newValue);
  };
  
  // Convert null value to 'none' for the select
  const selectValue = value || 'none';
  
  // Sort projects by name for better UX
  const sortedProjects = [...projects].sort((a, b) => 
    a.name.localeCompare(b.name)
  );
  
  return (
    <Select 
      value={selectValue} 
      onValueChange={handleValueChange}
      disabled={isLoading}
    >
      <SelectTrigger>
        <SelectValue placeholder="No project">
          {isLoading ? 'Loading projects...' : null}
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="none">No project</SelectItem>
        {sortedProjects.map((project) => (
          <SelectItem key={project.id} value={project.id}>
            {project.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

export default ProjectSelector;