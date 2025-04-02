'use client';

import { useState } from 'react';
import { format, differenceInDays } from 'date-fns';
import { CheckCircle, Clock, Edit, Trash, ChevronRight } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

import { Project } from '@/types/database';
import { formatDate, getPriorityColor, calculateCompletionPercentage } from '@/lib/utils';
import Link from 'next/link';

interface ProjectCardProps {
  project: Project;
  taskCount: number;
  completedTaskCount: number;
  onEdit: (project: Project) => void;
  onDelete: (projectId: string) => void;
  onToggleComplete: (projectId: string, completed: boolean) => Promise<void>;
}

export function ProjectCard({
  project,
  taskCount,
  completedTaskCount,
  onEdit,
  onDelete,
  onToggleComplete,
}: ProjectCardProps) {
  const [isUpdating, setIsUpdating] = useState(false);

  const handleToggleComplete = async () => {
    try {
      setIsUpdating(true);
      await onToggleComplete(project.id, !project.completed);
    } catch (error) {
      console.error('Error toggling project completion:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  const completionPercentage = calculateCompletionPercentage(completedTaskCount, taskCount);
  const daysUntilDue = differenceInDays(new Date(project.due_date), new Date());
  
  return (
    <Card className={project.completed ? 'opacity-70' : ''}>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <CardTitle className={`text-lg ${project.completed ? 'line-through' : ''}`}>
            {project.name}
          </CardTitle>
          <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(project.priority)}`}>
            {project.priority.charAt(0).toUpperCase() + project.priority.slice(1)}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {project.description && (
          <p className="text-sm text-gray-600 mb-3">{project.description}</p>
        )}
        
        <div className="mb-3">
          <div className="flex justify-between mb-1 text-sm">
            <span>Progress:</span>
            <span>{completionPercentage}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div
              className="bg-blue-600 h-2.5 rounded-full"
              style={{ width: `${completionPercentage}%` }}
            ></div>
          </div>
        </div>
        
        <div className="flex items-center text-sm text-gray-500 mb-1">
          <Clock className="mr-1 h-4 w-4" />
          <span>
            {daysUntilDue < 0
              ? 'Overdue'
              : daysUntilDue === 0
              ? 'Due today'
              : `${daysUntilDue} days left`}
          </span>
        </div>
        
        <div className="text-sm text-gray-500">
          <span>{formatDate(project.start_date)}</span>
          <span> to </span>
          <span>{formatDate(project.due_date)}</span>
        </div>
        
        <div className="mt-2 text-sm">
          <span>{taskCount} tasks</span>
          {taskCount > 0 && (
            <span> ({completedTaskCount} completed)</span>
          )}
        </div>
        
        {project.tags && project.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {project.tags.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </CardContent>
      <CardFooter className="pt-0 flex justify-between">
        <Button
          variant="outline"
          size="sm"
          onClick={handleToggleComplete}
          disabled={isUpdating}
          className={project.completed ? 'bg-green-50' : ''}
        >
          <CheckCircle className={`mr-1 h-4 w-4 ${project.completed ? 'text-green-500' : ''}`} />
          {project.completed ? 'Completed' : 'Mark Complete'}
        </Button>
        <div className="flex space-x-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onEdit(project)}
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onDelete(project.id)}
          >
            <Trash className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" asChild>
            <Link href={`/projects/${project.id}`}>
              <ChevronRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}
