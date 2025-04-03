'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { 
  Plus, 
  Filter, 
  ArrowUpDown, 
  Calendar, 
  ListFilter,
  GridIcon,
  Clock
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { TaskForm } from '@/components/forms/task-form';
import TaskDialog from '@/components/tasks/TaskDialog';
import { TaskFormValues } from '@/lib/validations/task';
import { useTasksRealtime } from '@/hooks/api/useTasksRealtime';
import { Task } from '@/types/database';
import { toast } from '@/components/ui/use-toast';

// We'll need this component to extend the task card functionality
const TaskItem = ({ 
  task, 
  onToggleComplete, 
  onEdit, 
  onDelete,
  setDialogOpen 
}: { 
  task: Task; 
  onToggleComplete: (id: string, completed: boolean) => void;
  onEdit: (task: Task) => void;
  onDelete: (id: string) => void;
  setDialogOpen: (open: boolean) => void;
}) => {
  // Format due date
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return new Intl.DateTimeFormat('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    }).format(date);
  };

  // Determine if task is overdue
  const isOverdue = () => {
    if (task.completed) return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const dueDate = new Date(task.due_date);
    dueDate.setHours(0, 0, 0, 0);
    return dueDate < today;
  };

  return (
    <Card className={`${isOverdue() ? 'border-red-300' : ''}`}>
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 pt-1">
            <input 
              type="checkbox" 
              checked={task.completed}
              onChange={() => onToggleComplete(task.id, !task.completed)}
              className="h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
          </div>
          <div className="flex-grow min-w-0">
            <h3 className={`font-medium truncate ${task.completed ? 'line-through text-gray-500' : ''}`}>
              {task.name}
            </h3>
            {task.description && (
              <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                {task.description}
              </p>
            )}
            <div className="flex flex-wrap gap-2 mt-2">
              {task.project_id && (
                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                  Project
                </span>
              )}
              <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${getPriorityBadgeClass(task.priority)}`}>
                {task.priority}
              </span>
              {task.tags && task.tags.length > 0 && task.tags.map((tag, i) => (
                <span key={i} className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
                  {tag}
                </span>
              ))}
            </div>
            <div className="flex items-center mt-3 text-xs text-gray-500">
              <Clock className="h-3 w-3 mr-1" />
              <span className={isOverdue() ? 'text-red-600 font-medium' : ''}>
                Due {formatDate(task.due_date)}
              </span>
            </div>
          </div>
        </div>
      </CardContent>
      <CardFooter className="p-2 pt-0 border-t">
        <div className="flex justify-end gap-2 w-full">
          <Button variant="ghost" size="sm" onClick={() => {
              onEdit(task);
              setDialogOpen(true);
            }}>
            Edit
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            className="text-red-600 hover:text-red-800"
            onClick={() => onDelete(task.id)}
          >
            Delete
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
};

// The main Tasks Page component
export default function TasksPage() {
  const searchParams = useSearchParams();
  const createParam = searchParams.get('create');
  const filterParam = searchParams.get('filter');
  const { user } = useAuth();

  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showFilters, setShowFilters] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  
  // Initial filter state based on URL params
  const [filters, setFilters] = useState({
    completed: filterParam === 'completed',
    priority: filterParam === 'high' || filterParam === 'medium' || filterParam === 'low' 
      ? filterParam 
      : undefined,
    tags: [],
    overdue: filterParam === 'overdue'
  });

  // Initialize creating state from URL if present
  useEffect(() => {
    if (createParam === 'true') {
      setIsCreating(true);
      setDialogOpen(true);
    }
  }, [createParam]);

  // Set dialog open state based on isCreating flag
  useEffect(() => {
    if (isCreating) {
      setDialogOpen(true);
    }
  }, [isCreating]);
  
  // Handle dialog close
  const handleDialogOpenChange = (open: boolean) => {
    setDialogOpen(open);
    if (!open) {
      setIsCreating(false);
      setSelectedTask(null);
    }
  };

  // Fetch tasks using our realtime hook
  const {
    tasks,
    isLoading,
    isError,
    createTask,
    updateTask,
    deleteTask,
  } = useTasksRealtime({
    completed: filters.completed,
    priority: filters.priority as any,
    tags: filters.tags.length > 0 ? filters.tags : undefined,
  });

  // Filter for overdue tasks if needed
  const filteredTasks = filters.overdue
    ? tasks.filter(task => {
        if (task.completed) return false;
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const dueDate = new Date(task.due_date);
        dueDate.setHours(0, 0, 0, 0);
        return dueDate < today;
      })
    : tasks;

  // Task handlers
  const handleCreate = async (data: TaskFormValues) => {
    try {
      console.log('Creating task with form values:', JSON.stringify(data, null, 2));
      
      // Check for user authentication first
      if (!user) {
        console.error('No user found for task creation');
        toast({
          title: "Authentication Error",
          description: "You must be logged in to create a task",
          variant: "destructive"
        });
        
        // Redirect to login page after a delay
        setTimeout(() => {
          window.location.href = `/login?reason=auth_required&t=${Date.now()}`;
        }, 1500);
        return;
      }
      
      // Create task with user ID
      const createdTask = await createTask({
        ...data,
        user_id: user.id,
        completed: false,
      });
      
      console.log('Task created successfully:', createdTask);
      
      // Close create form and show success toast
      setIsCreating(false);
      toast({
        title: "Task created",
        description: "Your task has been successfully created"
      });
    } catch (error) {
      console.error('Failed to create task:', error);
      
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      
      // Check for auth errors specifically
      if (errorMessage.includes('auth') || errorMessage.includes('401')) {
        toast({
          title: "Authentication Error",
          description: "Your session has expired. Please log in again.",
          variant: "destructive"
        });
        
        // Redirect to login after a delay
        setTimeout(() => {
          window.location.href = `/login?reason=session_expired&t=${Date.now()}`;
        }, 1500);
      } else {
        // Generic error handling
        toast({
          variant: "destructive",
          title: "Failed to create task",
          description: `Error: ${errorMessage}`
        });
      }
    }
  };

  const handleUpdate = async (data: TaskFormValues) => {
    if (!selectedTask) return;
    
    try {
      await updateTask(selectedTask.id, data);
      setSelectedTask(null);
      toast({
        title: "Task updated",
        description: "Your task has been successfully updated"
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Failed to update task",
        description: "An error occurred while updating the task"
      });
    }
  };

  const handleDelete = async (taskId: string) => {
    // In a real app, add confirmation dialog
    try {
      await deleteTask(taskId);
      toast({
        title: "Task deleted",
        description: "Your task has been successfully deleted"
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Failed to delete task",
        description: "An error occurred while deleting the task"
      });
    }
  };

  const handleToggleComplete = async (taskId: string, completed: boolean) => {
    try {
      await updateTask(taskId, { completed });
      toast({
        title: completed ? "Task completed" : "Task reopened",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Failed to update task",
        description: "An error occurred while updating the task"
      });
    }
  };

  const handleFilterChange = (newFilters: any) => {
    setFilters(newFilters);
  };

  const handleSort = (sortBy: string) => {
    // Implement sorting logic
    console.log('Sort by:', sortBy);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="text-center py-8 text-red-500">
        <p className="text-lg font-medium">Error loading tasks</p>
        <p className="mt-2">Please try refreshing the page</p>
      </div>
    );
  }

  return (
    <div>
      {/* Add TaskDialog component */}
      <TaskDialog 
        task={selectedTask || undefined}
        open={dialogOpen}
        onOpenChange={handleDialogOpenChange}
      />
      
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl font-bold">Tasks</h1>
        <div className="flex gap-2 flex-wrap">
          <div className="flex border rounded-md p-1 bg-white">
            <Button
              variant={viewMode === 'grid' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('grid')}
              className="px-2"
            >
              <GridIcon className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('list')}
              className="px-2"
            >
              <ListFilter className="h-4 w-4" />
            </Button>
          </div>
          
          <Button
            variant="outline"
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-1"
          >
            <Filter className="h-4 w-4" />
            Filters
          </Button>
          
          <Button
            variant="outline"
            onClick={() => handleSort('dueDate')}
            className="flex items-center gap-1"
          >
            <ArrowUpDown className="h-4 w-4" />
            Sort
          </Button>
          
          <Button
            onClick={() => {
              setIsCreating(true);
              setDialogOpen(true);
            }}
            className="flex items-center gap-1"
          >
            <Plus className="h-4 w-4" />
            New Task
          </Button>
        </div>
      </div>

      {showFilters && (
        <div className="mb-6 p-4 bg-white border rounded-lg">
          <h3 className="font-medium mb-3">Filter Tasks</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <select 
                className="w-full rounded-md border-gray-300 shadow-sm"
                value={filters.completed ? "completed" : filters.overdue ? "overdue" : "active"}
                onChange={(e) => {
                  const value = e.target.value;
                  handleFilterChange({
                    ...filters,
                    completed: value === "completed",
                    overdue: value === "overdue",
                  });
                }}
              >
                <option value="active">Active</option>
                <option value="completed">Completed</option>
                <option value="overdue">Overdue</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Priority
              </label>
              <select 
                className="w-full rounded-md border-gray-300 shadow-sm"
                value={filters.priority || "all"}
                onChange={(e) => {
                  const value = e.target.value;
                  handleFilterChange({
                    ...filters,
                    priority: value === "all" ? undefined : value,
                  });
                }}
              >
                <option value="all">All Priorities</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>
            
            <div className="flex items-end">
              <Button variant="outline" className="w-full" onClick={() => {
                handleFilterChange({
                  completed: false,
                  priority: undefined,
                  tags: [],
                  overdue: false
                });
              }}>
                Reset Filters
              </Button>
            </div>
          </div>
        </div>
      )}

      {filteredTasks.length === 0 ? (
        <div className="text-center py-16 bg-gray-50 rounded-lg">
          <h3 className="text-lg font-medium text-gray-900">No tasks found</h3>
          <p className="mt-2 text-gray-500">
            {filters.completed ? 
              "You haven't completed any tasks yet" :
              filters.overdue ?
              "No overdue tasks. Great job staying on top of things!" :
              "Get started by creating a new task"}
          </p>
          {!filters.completed && !filters.overdue && (
            <Button
              className="mt-4"
              onClick={() => {
                setIsCreating(true);
                setDialogOpen(true);
              }}
            >
              <Plus className="mr-2 h-4 w-4" />
              New Task
            </Button>
          )}
        </div>
      ) : (
        <div className={viewMode === 'grid' 
          ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4" 
          : "space-y-4"
        }>
          {filteredTasks.map((task) => (
            <TaskItem
              key={task.id}
              task={task}
              onEdit={setSelectedTask}
              onDelete={handleDelete}
              onToggleComplete={handleToggleComplete}
              setDialogOpen={setDialogOpen}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// Helper function to get badge classes based on priority
function getPriorityBadgeClass(priority: string) {
  switch (priority) {
    case 'high':
      return 'bg-red-100 text-red-800';
    case 'medium':
      return 'bg-yellow-100 text-yellow-800';
    case 'low':
      return 'bg-green-100 text-green-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
}