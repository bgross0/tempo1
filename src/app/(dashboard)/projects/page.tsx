'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { 
  Plus, 
  Filter, 
  ArrowUpDown, 
  GridIcon,
  ListFilter,
  Calendar,
  CheckCircle
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { ProjectForm } from '@/components/forms/project-form';
import { ProjectFormValues } from '@/lib/validations/project';
import { useProjectsRealtime } from '@/hooks/api/useProjectsRealtime';
import { useTasksRealtime } from '@/hooks/api/useTasksRealtime';
import { Project } from '@/types/database';
import { toast } from '@/components/ui/use-toast';

// Project Card Component
const ProjectCard = ({ 
  project, 
  taskCount, 
  completedTaskCount, 
  onEdit, 
  onDelete, 
  onToggleComplete 
}: { 
  project: Project; 
  taskCount: number; 
  completedTaskCount: number;
  onEdit: (project: Project) => void;
  onDelete: (id: string) => void;
  onToggleComplete: (id: string, completed: boolean) => void;
}) => {
  // Format dates
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return new Intl.DateTimeFormat('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    }).format(date);
  };

  // Calculate progress
  const progress = taskCount > 0 
    ? Math.round((completedTaskCount / taskCount) * 100) 
    : 0;

  // Determine if project is overdue
  const isOverdue = () => {
    if (project.completed) return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const dueDate = new Date(project.due_date);
    dueDate.setHours(0, 0, 0, 0);
    return dueDate < today;
  };

  return (
    <Card className={`${isOverdue() ? 'border-red-300' : ''}`}>
      <CardContent className="p-4">
        <div className="flex justify-between items-start">
          <div>
            <h3 className={`font-medium text-lg ${project.completed ? 'line-through text-gray-500' : ''}`}>
              {project.name}
            </h3>
            {project.description && (
              <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                {project.description}
              </p>
            )}
          </div>
          <div className={`px-2 py-1 text-xs rounded-full ${getPriorityBadgeClass(project.priority)}`}>
            {project.priority}
          </div>
        </div>
        
        <div className="mt-4">
          <div className="flex justify-between items-center mb-1 text-xs text-gray-500">
            <span>Progress</span>
            <span>{progress}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full" 
              style={{ width: `${progress}%` }}
            ></div>
          </div>
          <div className="flex justify-between mt-2 text-xs text-gray-500">
            <span>
              {completedTaskCount} / {taskCount} tasks completed
            </span>
          </div>
        </div>
        
        <div className="flex flex-wrap gap-2 mt-4">
          {project.tags && project.tags.length > 0 && project.tags.map((tag, i) => (
            <span key={i} className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
              {tag}
            </span>
          ))}
        </div>
        
        <div className="flex items-center justify-between mt-3 text-xs text-gray-500">
          <span className={isOverdue() ? 'text-red-600 font-medium' : ''}>
            Due {formatDate(project.due_date)}
          </span>
          <div className="flex items-center">
            <CheckCircle className={`h-4 w-4 mr-1 ${project.completed ? 'text-green-500' : 'text-gray-300'}`} />
            <span>{project.completed ? 'Completed' : 'In Progress'}</span>
          </div>
        </div>
      </CardContent>
      <CardFooter className="p-2 pt-0 border-t">
        <div className="flex justify-between w-full">
          <div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onToggleComplete(project.id, !project.completed)}
            >
              {project.completed ? 'Reopen' : 'Complete'}
            </Button>
          </div>
          <div className="flex gap-2">
            <Button variant="ghost" size="sm" onClick={() => onEdit(project)}>
              Edit
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-red-600 hover:text-red-800"
              onClick={() => onDelete(project.id)}
            >
              Delete
            </Button>
          </div>
        </div>
      </CardFooter>
    </Card>
  );
};

// Main Projects Page
export default function ProjectsPage() {
  const searchParams = useSearchParams();
  const createParam = searchParams.get('create');
  const filterParam = searchParams.get('filter');

  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showFilters, setShowFilters] = useState(false);
  
  // Initial filter state
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
    }
  }, [createParam]);

  // Fetch projects and tasks using our realtime hooks
  const {
    projects,
    isLoading: isLoadingProjects,
    isError: isProjectsError,
    createProject,
    updateProject,
    deleteProject,
  } = useProjectsRealtime({
    completed: filters.completed,
    priority: filters.priority as any,
    tags: filters.tags.length > 0 ? filters.tags : undefined,
  });

  const { tasks } = useTasksRealtime();

  // Filter for overdue projects if needed
  const filteredProjects = filters.overdue
    ? projects.filter(project => {
        if (project.completed) return false;
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const dueDate = new Date(project.due_date);
        dueDate.setHours(0, 0, 0, 0);
        return dueDate < today;
      })
    : projects;

  // Get task counts for each project
  const getProjectTaskCounts = (projectId: string) => {
    const projectTasks = tasks.filter(task => task.project_id === projectId);
    const completedTasks = projectTasks.filter(task => task.completed);
    
    return {
      total: projectTasks.length,
      completed: completedTasks.length
    };
  };

  // Project handlers
  const handleCreate = async (data: ProjectFormValues) => {
    try {
      await createProject({
        ...data,
        completed: false,
      });
      setIsCreating(false);
      toast({
        title: "Project created",
        description: "Your project has been successfully created"
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Failed to create project",
        description: "An error occurred while creating the project"
      });
    }
  };

  const handleUpdate = async (data: ProjectFormValues) => {
    if (!selectedProject) return;
    
    try {
      await updateProject(selectedProject.id, data);
      setSelectedProject(null);
      toast({
        title: "Project updated",
        description: "Your project has been successfully updated"
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Failed to update project",
        description: "An error occurred while updating the project"
      });
    }
  };

  const handleDelete = async (projectId: string) => {
    // In a real app, add confirmation dialog
    try {
      await deleteProject(projectId);
      toast({
        title: "Project deleted",
        description: "Your project has been successfully deleted"
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Failed to delete project",
        description: "An error occurred while deleting the project"
      });
    }
  };

  const handleToggleComplete = async (projectId: string, completed: boolean) => {
    try {
      await updateProject(projectId, { completed });
      toast({
        title: completed ? "Project completed" : "Project reopened",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Failed to update project",
        description: "An error occurred while updating the project"
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

  if (isLoadingProjects) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (isProjectsError) {
    return (
      <div className="text-center py-8 text-red-500">
        <p className="text-lg font-medium">Error loading projects</p>
        <p className="mt-2">Please try refreshing the page</p>
      </div>
    );
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
    <div>
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl font-bold">Projects</h1>
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
            onClick={() => setIsCreating(true)}
            className="flex items-center gap-1"
          >
            <Plus className="h-4 w-4" />
            New Project
          </Button>
        </div>
      </div>

      {showFilters && (
        <div className="mb-6 p-4 bg-white border rounded-lg">
          <h3 className="font-medium mb-3">Filter Projects</h3>
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

      {filteredProjects.length === 0 ? (
        <div className="text-center py-16 bg-gray-50 rounded-lg">
          <h3 className="text-lg font-medium text-gray-900">No projects found</h3>
          <p className="mt-2 text-gray-500">
            {filters.completed ? 
              "You haven't completed any projects yet" :
              filters.overdue ?
              "No overdue projects. Great job staying on schedule!" :
              "Get started by creating a new project"}
          </p>
          {!filters.completed && !filters.overdue && (
            <Button
              className="mt-4"
              onClick={() => setIsCreating(true)}
            >
              <Plus className="mr-2 h-4 w-4" />
              New Project
            </Button>
          )}
        </div>
      ) : (
        <div className={viewMode === 'grid' 
          ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4" 
          : "space-y-4"
        }>
          {filteredProjects.map((project) => {
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
