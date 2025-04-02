'use client';

import { useState } from 'react';
import { Plus, Filter } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { TaskCard } from './task-card';
import { TaskForm } from '@/components/forms/task-form';
import { TaskFilters } from './task-filters';

import { useTasksRealtime } from '@/hooks/api/useTasksRealtime';
import { Task } from '@/types/database';
import { TaskFormValues } from '@/lib/validations/task';

export function TaskList() {
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    completed: false,
    priority: undefined,
    tags: [],
  });
  
  const {
    tasks,
    isLoading,
    isError,
    createTask,
    updateTask,
    deleteTask,
    mutate,
  } = useTasks({
    completed: filters.completed,
    priority: filters.priority as any,
    tags: filters.tags.length > 0 ? filters.tags : undefined,
  });

  const handleCreate = async (data: TaskFormValues) => {
    // In a real app, you'd get the user_id from auth context
    await createTask({
      ...data,
      user_id: 'temp-user-id', // Replace with real user ID in production
      completed: false,
    });
    setIsCreating(false);
  };

  const handleUpdate = async (data: TaskFormValues) => {
    if (!selectedTask) return;
    
    await updateTask(selectedTask.id, data);
    setSelectedTask(null);
  };

  const handleDelete = async (taskId: string) => {
    // In a real app, add confirmation dialog
    await deleteTask(taskId);
  };

  const handleToggleComplete = async (taskId: string, completed: boolean) => {
    await updateTask(taskId, { completed });
  };

  const handleFilterChange = (newFilters: any) => {
    setFilters(newFilters);
  };

  if (isLoading) {
    return <div className="text-center py-8">Loading tasks...</div>;
  }

  if (isError) {
    return <div className="text-center py-8 text-red-500">Error loading tasks</div>;
  }

  if (isCreating) {
    return (
      <div className="max-w-2xl mx-auto p-4">
        <h2 className="text-2xl font-bold mb-6">Create New Task</h2>
        <TaskForm
          onSubmit={handleCreate}
          onCancel={() => setIsCreating(false)}
        />
      </div>
    );
  }

  if (selectedTask) {
    return (
      <div className="max-w-2xl mx-auto p-4">
        <h2 className="text-2xl font-bold mb-6">Edit Task</h2>
        <TaskForm
          initialData={selectedTask}
          onSubmit={handleUpdate}
          onCancel={() => setSelectedTask(null)}
        />
      </div>
    );
  }

  return (
    <div className="p-4">
      <div className="mb-6 flex justify-between items-center">
        <h1 className="text-2xl font-bold">Tasks</h1>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter className="mr-2 h-4 w-4" />
            Filters
          </Button>
          <Button onClick={() => setIsCreating(true)}>
            <Plus className="mr-2 h-4 w-4" />
            New Task
          </Button>
        </div>
      </div>

      {showFilters && (
        <TaskFilters
          filters={filters}
          onChange={handleFilterChange}
          className="mb-6"
        />
      )}

      {tasks.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <h3 className="text-lg font-medium text-gray-900">No tasks found</h3>
          <p className="mt-2 text-gray-500">
            Get started by creating a new task
          </p>
          <Button
            className="mt-4"
            onClick={() => setIsCreating(true)}
          >
            <Plus className="mr-2 h-4 w-4" />
            New Task
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {tasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              onEdit={setSelectedTask}
              onDelete={handleDelete}
              onToggleComplete={handleToggleComplete}
            />
          ))}
        </div>
      )}
    </div>
  );
}
