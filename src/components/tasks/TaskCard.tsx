import React from 'react';
import { Task } from '@/types';
import { useAppStore } from '@/lib/store';
import { Check, Clock, AlertCircle } from 'lucide-react';
import { format, isPast } from 'date-fns';

interface TaskCardProps {
  task: Task;
  minimal?: boolean;
}

export default function TaskCard({ task, minimal = false }: TaskCardProps) {
  const setCurrentEditItem = useAppStore((state) => state.setCurrentEditItem);
  const setContextMenuTaskId = useAppStore((state) => state.setContextMenuTaskId);

  const isPastDue = task.dueDate ? isPast(new Date(`${task.dueDate}T${task.dueTime || '23:59:59'}`)) && !task.completed : false;
  const durationInHours = task.duration / 60;

  const handleClick = () => {
    setCurrentEditItem(task.id, 'task');
  };

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    setContextMenuTaskId(task.id);
  };

  // Get a background color based on status and priority
  const getBgColor = () => {
    if (task.completed) return 'bg-gray-100 dark:bg-gray-800';
    if (isPastDue) return 'bg-red-50 dark:bg-red-950';
    
    if (task.status === 'in-progress') {
      return 'bg-purple-100 dark:bg-purple-900';
    }
    
    switch (task.priority) {
      case 'high':
        return 'bg-red-100 dark:bg-red-900';
      case 'medium':
        return 'bg-amber-100 dark:bg-amber-900';
      case 'low':
        return 'bg-blue-100 dark:bg-blue-900';
      default:
        return 'bg-gray-100 dark:bg-gray-800';
    }
  };

  if (minimal) {
    return (
      <div 
        className={`${getBgColor()} p-1 text-xs rounded cursor-pointer border border-l-4 ${
          task.completed ? 'border-gray-300 dark:border-gray-600 border-l-gray-400' : 
          isPastDue ? 'border-red-200 dark:border-red-800 border-l-red-500' :
          task.priority === 'high' ? 'border-red-200 dark:border-red-800 border-l-red-500' :
          task.priority === 'medium' ? 'border-amber-200 dark:border-amber-800 border-l-amber-500' :
          'border-blue-200 dark:border-blue-800 border-l-blue-500'
        } mb-1 truncate`}
        onClick={handleClick}
        onContextMenu={handleContextMenu}
      >
        {task.completed && <Check className="inline-block w-3 h-3 mr-1" />}
        {task.name}
      </div>
    );
  }

  return (
    <div 
      className={`${getBgColor()} p-2 rounded shadow-sm cursor-pointer border border-l-4 ${
        task.completed ? 'border-gray-300 dark:border-gray-600 border-l-gray-400' : 
        isPastDue ? 'border-red-200 dark:border-red-800 border-l-red-500' :
        task.priority === 'high' ? 'border-red-200 dark:border-red-800 border-l-red-500' :
        task.priority === 'medium' ? 'border-amber-200 dark:border-amber-800 border-l-amber-500' :
        'border-blue-200 dark:border-blue-800 border-l-blue-500'
      } mb-2`}
      onClick={handleClick}
      onContextMenu={handleContextMenu}
    >
      <div className="flex justify-between items-start">
        <h4 className={`font-medium text-sm ${task.completed ? 'line-through text-gray-500' : ''}`}>
          {task.name}
        </h4>
        {task.completed && <Check className="w-4 h-4 text-green-500" />}
        {isPastDue && !task.completed && <AlertCircle className="w-4 h-4 text-red-500" />}
      </div>
      
      {task.description && (
        <p className="text-xs text-gray-600 dark:text-gray-300 mt-1 truncate">
          {task.description}
        </p>
      )}
      
      <div className="flex justify-between items-center mt-2 text-xs text-gray-500 dark:text-gray-400">
        <div className="flex items-center gap-2">
          <div className="flex items-center">
            <Clock className="w-3 h-3 mr-1" />
            {durationInHours < 1 
              ? `${task.duration}m` 
              : `${durationInHours.toFixed(1)}h`}
          </div>
          {!task.completed && (
            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
              task.status === 'in-progress' 
                ? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
                : task.status === 'todo'
                  ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                  : 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
            }`}>
              {task.status === 'in-progress' ? 'In Progress' : task.status === 'todo' ? 'To Do' : 'Completed'}
            </span>
          )}
        </div>
        {task.dueDate && (
          <div>
            {format(new Date(task.dueDate), 'MMM d')}
            {task.dueTime && `, ${task.dueTime.substring(0, 5)}`}
          </div>
        )}
      </div>
    </div>
  );
}
