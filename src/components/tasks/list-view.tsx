'use client';

import { Task } from '@/types/database';
import { Checkbox } from '@/components/ui/checkbox';
import { format } from 'date-fns';
import { Clock, AlertCircle } from 'lucide-react';

interface ListViewProps {
  tasks: Task[];
  onTaskClick: (task: Task) => void;
  onStatusChange: (taskId: string, completed: boolean) => void;
}

export function ListView({ tasks, onTaskClick, onStatusChange }: ListViewProps) {
  const handleToggle = (taskId: string, completed: boolean) => {
    onStatusChange(taskId, !completed);
  };
  
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg overflow-hidden">
      <div className="flex flex-col">
        {tasks.length === 0 ? (
          <div className="p-6 text-center">
            <p className="text-gray-500">No tasks found</p>
          </div>
        ) : (
          <div>
            <div className="border-b dark:border-gray-700">
              <div className="grid grid-cols-14 gap-4 px-4 py-3 text-sm font-medium text-gray-500">
                <div className="col-span-1"></div>
                <div className="col-span-5">Task</div>
                <div className="col-span-2">Priority</div>
                <div className="col-span-2">Status</div>
                <div className="col-span-2">Due Date</div>
                <div className="col-span-2">Duration</div>
              </div>
            </div>
            
            <div className="divide-y dark:divide-gray-700">
              {tasks.map((task) => {
                const isPastDue = task.due_date 
                  ? new Date(`${task.due_date}T${task.due_time || '23:59:59'}`) < new Date() && !task.completed 
                  : false;
                  
                return (
                  <div 
                    key={task.id}
                    className="grid grid-cols-14 gap-4 px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer"
                    onClick={() => onTaskClick(task)}
                  >
                    <div className="col-span-1 flex items-center" onClick={(e) => e.stopPropagation()}>
                      <Checkbox 
                        checked={task.completed}
                        onCheckedChange={() => handleToggle(task.id, task.completed)}
                        aria-label={`Mark ${task.name} as ${task.completed ? 'incomplete' : 'complete'}`}
                      />
                    </div>
                    <div className="col-span-5 flex items-center">
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
                    <div className="col-span-2 flex items-center">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        task.priority === 'high' 
                          ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:bg-opacity-30 dark:text-red-300' 
                          : task.priority === 'medium' 
                            ? 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:bg-opacity-30 dark:text-amber-300' 
                            : 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:bg-opacity-30 dark:text-blue-300'
                      }`}>
                        {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
                      </span>
                    </div>
                    <div className="col-span-2 flex items-center">
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
                    </div>
                    <div className="col-span-2 flex items-center text-sm">
                      {task.due_date && (
                        <span className={isPastDue ? 'text-red-500' : ''}>
                          {format(new Date(task.due_date), 'MMM d')}
                          {task.due_time && `, ${task.due_time.substring(0, 5)}`}
                        </span>
                      )}
                    </div>
                    <div className="col-span-2 flex items-center text-sm text-gray-500">
                      {task.duration && (
                        <div className="flex items-center">
                          <Clock className="w-3 h-3 mr-1" />
                          {task.duration < 60 
                            ? `${task.duration}m` 
                            : `${(task.duration / 60).toFixed(1)}h`}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}