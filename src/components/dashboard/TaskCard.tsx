'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Task } from '@/types/database';
import { formatDistanceToNow, isAfter, isBefore } from 'date-fns';
import { CheckCircle2, Clock, AlertCircle, ChevronRight, Tag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTasksRealtime } from '@/hooks/api/useTasksRealtime';
import { cn } from '@/lib/utils';

interface TaskCardProps {
  task: Task;
  compact?: boolean;
}

export function TaskCard({ task, compact = false }: TaskCardProps) {
  const { updateTask } = useTasksRealtime();
  const [isUpdating, setIsUpdating] = useState(false);
  
  // Determine task status (overdue, due soon, completed)
  const dueDate = new Date(task.due_date);
  const isOverdue = !task.completed && isBefore(dueDate, new Date());
  const isDueSoon = !isOverdue && !task.completed && 
    isBefore(dueDate, new Date(new Date().setDate(new Date().getDate() + 2)));
  
  // Format the relative due date
  const dueDateDisplay = task.completed 
    ? 'Completed' 
    : formatDistanceToNow(dueDate, { addSuffix: true });
  
  // Get associated project name
  // In a real implementation, this would be fetched from the project data
  const projectName = "Unknown Project";
  
  // Handle task completion toggle
  const handleToggleComplete = async () => {
    try {
      setIsUpdating(true);
      await updateTask(task.id, { 
        completed: !task.completed,
        completed_at: !task.completed ? new Date().toISOString() : null
      });
    } catch (error) {
      console.error('Error updating task:', error);
    } finally {
      setIsUpdating(false);
    }
  };
  
  // Get priority badge styles
  const getPriorityStyles = () => {
    switch (task.priority) {
      case 'high':
        return 'bg-red-100 text-red-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };
  
  // Status icon based on task state
  const StatusIcon = () => {
    if (task.completed) {
      return <CheckCircle2 className="h-4 w-4 text-green-500" />;
    } else if (isOverdue) {
      return <AlertCircle className="h-4 w-4 text-red-500" />;
    } else if (isDueSoon) {
      return <Clock className="h-4 w-4 text-yellow-500" />;
    } else {
      return <Clock className="h-4 w-4 text-blue-500" />;
    }
  };

  // Compact card layout for dashboard
  if (compact) {
    return (
      <div className={cn(
        "p-3 border rounded-lg shadow-sm transition-all hover:shadow-md hover:border-blue-200",
        task.completed ? "bg-gray-50" : "bg-white",
        isOverdue ? "border-red-200" : "border-gray-200"
      )}>
        <div className="flex items-start gap-3">
          <button 
            onClick={handleToggleComplete}
            disabled={isUpdating}
            className="mt-1 flex-shrink-0"
          >
            <StatusIcon />
          </button>
          
          <div className="flex-grow min-w-0">
            <h3 className={cn(
              "font-medium text-sm line-clamp-1",
              task.completed ? "text-gray-500 line-through" : "text-gray-900"
            )}>
              {task.name}
            </h3>
            
            <div className="flex items-center gap-2 mt-1">
              <div className={cn(
                "text-xs px-2 py-0.5 rounded-full",
                getPriorityStyles()
              )}>
                {task.priority}
              </div>
              
              <span className="text-xs text-gray-500 truncate">
                {dueDateDisplay}
              </span>
            </div>
          </div>
          
          <Link href={`/tasks/${task.id}`}>
            <Button variant="ghost" size="icon" className="h-6 w-6">
              <ChevronRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  // Full card layout for task list
  return (
    <div className={cn(
      "p-4 border rounded-lg shadow-sm transition-all hover:shadow-md hover:border-blue-200",
      task.completed ? "bg-gray-50" : "bg-white",
      isOverdue ? "border-red-200" : "border-gray-200"
    )}>
      <div className="flex items-start gap-4">
        <button 
          onClick={handleToggleComplete}
          disabled={isUpdating}
          className="mt-1 flex-shrink-0"
        >
          <StatusIcon />
        </button>
        
        <div className="flex-grow min-w-0">
          <div className="flex items-center justify-between gap-2">
            <h3 className={cn(
              "font-medium line-clamp-1",
              task.completed ? "text-gray-500 line-through" : "text-gray-900"
            )}>
              {task.name}
            </h3>
            
            <div className={cn(
              "text-xs px-2 py-0.5 rounded-full",
              getPriorityStyles()
            )}>
              {task.priority}
            </div>
          </div>
          
          {task.description && (
            <p className="text-sm text-gray-600 mt-1 line-clamp-2">
              {task.description}
            </p>
          )}
          
          <div className="flex flex-wrap items-center gap-3 mt-3">
            <div className="flex items-center text-xs text-gray-500">
              <Clock className="h-3 w-3 mr-1" />
              {dueDateDisplay}
            </div>
            
            {task.project_id && (
              <div className="flex items-center text-xs text-gray-500">
                <Tag className="h-3 w-3 mr-1" />
                {projectName}
              </div>
            )}
            
            {task.tags && task.tags.length > 0 && (
              <div className="flex items-center gap-1 flex-wrap">
                {task.tags.slice(0, 2).map((tag, index) => (
                  <span 
                    key={index}
                    className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded-full text-xs"
                  >
                    {tag}
                  </span>
                ))}
                {task.tags.length > 2 && (
                  <span className="text-xs text-gray-500">
                    +{task.tags.length - 2} more
                  </span>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default TaskCard;
