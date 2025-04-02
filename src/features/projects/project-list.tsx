'use client';

import { useState } from 'react';
import { Plus, Filter } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { ProjectCard } from './project-card';
import { ProjectForm } from '@/components/forms/project-form';
import { ProjectFilters } from './project-filters';

import { useProjectsRealtime } from '@/hooks/api/useProjectsRealtime';
import { useTasksRealtime } from '@/hooks/api/useTasksRealtime';
import { Project } from '@/types/database';
import { ProjectFormValues } from '@/lib/validations/project';

export function ProjectList() {
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    completed: false,
    priority: undefined,
    tags: [],
  });
  
  const {
    projects,
    isLoading,
    isError,
    createProject,
    updateProject,
    deleteProject,
    mutate,
  } = useProjects({
    completed: filters.completed,
    priority: filters.priority as any,
    tags: filters.tags.length > 0 ? filters.tags : undefined,
  });

  // This is to get task counts for each project
  const { tasks } = useTasks({});

  const getProjectTaskCounts = (projectId: string) => {
    const projectTasks = tasks.filter(task => task.project_id === projectId);
    const completedTasks = projectTasks.filter(task => task.completed);
    
    return {
      total: projectTasks.length,
      completed: completedTasks.length
    };
  };

  const handleCreate = async (data: ProjectFormValues) => {
    // In a real app, you'd get the user_id from auth context
    await createProject({
      ...data,
      user_id: 'temp-user-id', // Replace with real user ID in production
      completed: false,
    });
    setIsCreating(false);
  };

  const handleUpdate = async (data: ProjectFormValues) => {
    if (!selectedProject) return;
    
    await updateProject(selectedProject.id, data);
    setSelectedProject(null);
  };

  const handleDelete = async (projectId: string) => {
    // In a real app, add confirmation dialog
    await deleteProject(projectId);
  };

  const handleToggleComplete = async (projectId: string, completed: boolean) => {
    await updateProject(projectId, { completed });
  };

  const handleFilterChange = (newFilters: any) => {
    setFilters(newFilters);
  };

  if (isLoading) {
    return <div className="text-center py-8">Loading projects...</div>;
  }

  if (isError) {
    return <div className="text-center py-8 text-red-500">Error loading projects</div>;
  }

  if (isCreating) {
    return (
      <div className="max-w-2xl mx-auto p-4">
        <h2 className="text-2xl font-bold mb-6">Create New Project</h2>
        <ProjectForm
          onSubmit={handleCreate}
          onCancel={() => setIsCreating(false)}
        />
      </div>
    );
  }

  if (selectedProject) {
    return (
      <div className="max-w-2xl mx-auto p-4">
        <h2 className="text-2xl font-bold mb-6">Edit Project</h2>
        <ProjectForm
          initialData={selectedProject}
          onSubmit={handleUpdate}
          onCancel={() => setSelectedProject(null)}
        />
      </div>
    );
  }

  return (
    <div className="p-4">
      <div className="mb-6 flex justify-between items-center">
        <h1 className="text-2xl font-bold">Projects</h1>
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
            New Project
          </Button>
        </div>
      </div>

      {showFilters && (
        <ProjectFilters
          filters={filters}
          onChange={handleFilterChange}
          className="mb-6"
        />
      )}

      {projects.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <h3 className="text-lg font-medium text-gray-900">No projects found</h3>
          <p className="mt-2 text-gray-500">
            Get started by creating a new project
          </p>
          <Button
            className="mt-4"
            onClick={() => setIsCreating(true)}
          >
            <Plus className="mr-2 h-4 w-4" />
            New Project
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {projects.map((project) => {
            const { total, completed } = getProjectTaskCounts(project.id);
            return (
              <ProjectCard
                key={project.id}
                project={project}
                taskCount={total}
                completedTaskCount={completed}
                onEdit={setSelectedProject}
                onDelete={handleDelete}
                onToggleComplete={handleToggleComplete}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}
