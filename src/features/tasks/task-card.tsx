'use client';

import { useState } from 'react';
import { format } from 'date-fns';
import { CheckCircle, Clock, Edit, Trash } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

import { Task } from '@/types/database';
import { formatDate, formatTime, getPriorityColor } from '@/lib/utils';

interface TaskCardProps {
  task: Task;
  onEdit: (task: Task) => void;
  onDelete: (taskId: string) => void;
  onToggleComplete: (taskId: string, completed: boolean) => Promise<void>;
}

export function TaskCard({
  task,
  onEdit,
  onDelete,
  onToggleComplete,
}: TaskCardProps) {
  const [isUpdating, setIsUpdating] = useState(false);

  const handleToggleComplete = async () => {
    try {
      setIsUpdating(true);
      await onToggleComplete(task.id, !task.completed);
    } catch (error) {
      console.error('Error toggling task completion:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <Card className={task.completed ? 'opacity-70' : ''}>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <CardTitle className={`text-lg ${task.completed ? 'line-through' : ''}`}>
            {task.name}
          </CardTitle>
          <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(task.priority)}`}>
            {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {task.description && (
          <p className="text-sm text-gray-600 mb-2">{task.description}</p>
        )}
        <div className="flex items-center text-sm text-gray-500 mb-1">
          <Clock className="mr-1 h-4 w-4" />
          <span>
            Due: {formatDate(task.due_date)}
            {task.due_time && ` at ${formatTime(task.due_time)}`}
          </span>
        </div>
        {task.duration && (
          <div className="text-sm text-gray-500">
            Duration: {task.duration} minutes
          </div>
        )}
        {task.tags && task.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {task.tags.map((tag) => (
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
          className={task.completed ? 'bg-green-50' : ''}
        >
          <CheckCircle className={`mr-1 h-4 w-4 ${task.completed ? 'text-green-500' : ''}`} />
          {task.completed ? 'Completed' : 'Mark Complete'}
        </Button>
        <div className="flex space-x-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onEdit(task)}
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onDelete(task.id)}
          >
            <Trash className="h-4 w-4" />
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}
