'use client';

import { Task } from '@/types/database';
import { Checkbox } from '@/components/ui/checkbox';
import { format } from 'date-fns';
import { Clock, AlertCircle, ChevronUp, ChevronDown } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';

interface TableViewProps {
  tasks: Task[];
  onTaskClick: (task: Task) => void;
  onStatusChange: (taskId: string, completed: boolean) => void;
}

type SortField = 'name' | 'priority' | 'status' | 'due_date' | 'duration';
type SortDirection = 'asc' | 'desc';

export function TableView({ tasks, onTaskClick, onStatusChange }: TableViewProps) {
  const [sortField, setSortField] = useState<SortField>('due_date');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  
  const handleToggle = (taskId: string, completed: boolean, e: React.MouseEvent) => {
    e.stopPropagation();
    onStatusChange(taskId, !completed);
  };
  
  const sortedTasks = [...tasks].sort((a, b) => {
    let comparison = 0;
    
    switch (sortField) {
      case 'name':
        comparison = a.name.localeCompare(b.name);
        break;
      case 'priority': {
        const priorityOrder = { high: 0, medium: 1, low: 2 };
        comparison = priorityOrder[a.priority] - priorityOrder[b.priority];
        break;
      }
      case 'status': {
        const statusOrder = { 'in-progress': 0, 'todo': 1, 'completed': 2 };
        comparison = statusOrder[a.status] - statusOrder[b.status];
        break;
      }
      case 'due_date':
        if (a.due_date && b.due_date) {
          comparison = new Date(a.due_date).getTime() - new Date(b.due_date).getTime();
        } else if (a.due_date) {
          comparison = -1;
        } else if (b.due_date) {
          comparison = 1;
        }
        break;
      case 'duration':
        comparison = (a.duration || 0) - (b.duration || 0);
        break;
    }
    
    return sortDirection === 'asc' ? comparison : -comparison;
  });
  
  const toggleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };
  
  const renderSortIcon = (field: SortField) => {
    if (sortField !== field) return null;
    
    return sortDirection === 'asc' ? (
      <ChevronUp className="h-4 w-4 ml-1" />
    ) : (
      <ChevronDown className="h-4 w-4 ml-1" />
    );
  };
  
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
      <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
        <thead className="bg-gray-50 dark:bg-gray-700">
          <tr>
            <th scope="col" className="px-6 py-3 w-12">
              {/* Checkbox column */}
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
              <Button 
                variant="ghost" 
                size="sm"
                className="font-medium text-xs uppercase flex items-center -ml-3 px-2"
                onClick={() => toggleSort('name')}
              >
                Task
                {renderSortIcon('name')}
              </Button>
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
              <Button 
                variant="ghost" 
                size="sm"
                className="font-medium text-xs uppercase flex items-center -ml-3 px-2"
                onClick={() => toggleSort('priority')}
              >
                Priority
                {renderSortIcon('priority')}
              </Button>
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
              <Button 
                variant="ghost" 
                size="sm"
                className="font-medium text-xs uppercase flex items-center -ml-3 px-2"
                onClick={() => toggleSort('status')}
              >
                Status
                {renderSortIcon('status')}
              </Button>
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
              <Button 
                variant="ghost" 
                size="sm"
                className="font-medium text-xs uppercase flex items-center -ml-3 px-2"
                onClick={() => toggleSort('due_date')}
              >
                Due Date
                {renderSortIcon('due_date')}
              </Button>
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
              <Button 
                variant="ghost" 
                size="sm"
                className="font-medium text-xs uppercase flex items-center -ml-3 px-2"
                onClick={() => toggleSort('duration')}
              >
                Duration
                {renderSortIcon('duration')}
              </Button>
            </th>
          </tr>
        </thead>
        <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
          {sortedTasks.map((task) => {
            const isPastDue = task.due_date 
              ? new Date(`${task.due_date}T${task.due_time || '23:59:59'}`) < new Date() && !task.completed 
              : false;
              
            return (
              <tr 
                key={task.id}
                className="hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer"
                onClick={() => onTaskClick(task)}
              >
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center" onClick={(e) => e.stopPropagation()}>
                    <Checkbox 
                      checked={task.completed}
                      onCheckedChange={(checked) => onStatusChange(task.id, !!checked)}
                      aria-label={`Mark ${task.name} as ${task.completed ? 'incomplete' : 'complete'}`}
                    />
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center">
                    <div>
                      <p className={`text-sm font-medium ${task.completed ? 'line-through text-gray-500' : ''}`}>
                        {task.name}
                      </p>
                      {task.description && (
                        <p className="text-xs text-gray-500 dark:text-gray-400 truncate mt-1 max-w-xs">
                          {task.description}
                        </p>
                      )}
                    </div>
                    {isPastDue && !task.completed && (
                      <AlertCircle className="h-4 w-4 text-red-500 ml-2" />
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    task.priority === 'high' 
                      ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:bg-opacity-30 dark:text-red-300' 
                      : task.priority === 'medium' 
                        ? 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:bg-opacity-30 dark:text-amber-300' 
                        : 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:bg-opacity-30 dark:text-blue-300'
                  }`}>
                    {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    task.status === 'in-progress' 
                      ? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:bg-opacity-30 dark:text-purple-300' 
                      : task.status === 'completed' 
                        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:bg-opacity-30 dark:text-green-300' 
                        : 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:bg-opacity-30 dark:text-blue-300'
                  }`}>
                    {task.status === 'in-progress' 
                      ? 'In Progress' 
                      : task.status.charAt(0).toUpperCase() + task.status.slice(1)}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                  {task.due_date && (
                    <span className={isPastDue ? 'text-red-500' : ''}>
                      {format(new Date(task.due_date), 'MMM d, yyyy')}
                      {task.due_time && ` at ${task.due_time.substring(0, 5)}`}
                    </span>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                  {task.duration && (
                    <div className="flex items-center">
                      <Clock className="w-3 h-3 mr-1" />
                      {task.duration < 60 
                        ? `${task.duration}m` 
                        : `${(task.duration / 60).toFixed(1)}h`}
                    </div>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}