'use client';

import { useState } from 'react';
import { 
  MoreHorizontal, 
  Calendar, 
  Edit2, 
  Trash2, 
  CheckCircle, 
  XCircle 
} from 'lucide-react';
import { format, isPast } from 'date-fns';
import { Project } from '@/types/database';
import { useProjects } from '@/hooks/api/useProjects';
import ProjectDialog from './ProjectDialog';
import { toast } from '@/components/ui/use-toast';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';

interface ProjectCardProps {
  project: Project;
}

export default function ProjectCard({ project }: ProjectCardProps) {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const { updateProject, deleteProject } = useProjects();
  
  // Function to calculate project progress (placeholder - would need task data)
  const getProgressPercentage = () => {
    // This is a placeholder - in a real app, would calculate based on completed tasks
    return project.completed ? 100 : 25;
  };
  
  const handleToggleComplete = async () => {
    try {
      await updateProject(project.id, {
        completed: !project.completed,
        completed_at: !project.completed ? new Date().toISOString() : null
      });
      toast({
        title: project.completed ? "Project marked as incomplete" : "Project marked as complete",
        description: "The project status has been updated."
      });
    } catch (error) {
      console.error('Error updating project:', error);
      toast({
        title: "Error",
        description: "There was an error updating the project status.",
        variant: "destructive"
      });
    }
  };
  
  const handleDelete = async () => {
    try {
      await deleteProject(project.id);
      toast({
        title: "Project deleted",
        description: "The project has been successfully deleted."
      });
    } catch (error) {
      console.error('Error deleting project:', error);
      toast({
        title: "Error",
        description: "There was an error deleting the project.",
        variant: "destructive"
      });
    } finally {
      setDeleteDialogOpen(false);
    }
  };
  
  const getPriorityColor = () => {
    switch (project.priority) {
      case 'high': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      case 'medium': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
      case 'low': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300';
    }
  };
  
  const isOverdue = !project.completed && isPast(new Date(project.due_date));
  
  return (
    <>
      <div className={`rounded-lg border p-4 shadow-sm transition-all ${project.completed ? 'bg-gray-50 dark:bg-gray-900' : 'bg-white dark:bg-gray-800'}`}>
        <div className="flex justify-between items-start mb-2">
          <h3 className={`font-semibold text-lg ${project.completed ? 'text-gray-500 dark:text-gray-400 line-through' : 'text-gray-900 dark:text-gray-100'}`}>
            {project.name}
          </h3>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="p-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700">
                <MoreHorizontal className="h-5 w-5 text-gray-500" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setEditDialogOpen(true)}>
                <Edit2 className="mr-2 h-4 w-4" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleToggleComplete}>
                {project.completed ? (
                  <>
                    <XCircle className="mr-2 h-4 w-4" />
                    Mark as Incomplete
                  </>
                ) : (
                  <>
                    <CheckCircle className="mr-2 h-4 w-4" />
                    Mark as Complete
                  </>
                )}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                onClick={() => setDeleteDialogOpen(true)}
                className="text-red-600 dark:text-red-400"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        
        {project.description && (
          <p className={`text-sm mb-3 ${project.completed ? 'text-gray-500 dark:text-gray-400' : 'text-gray-600 dark:text-gray-300'}`}>
            {project.description}
          </p>
        )}
        
        <div className="flex justify-between items-center mb-3">
          <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
            <Calendar className="h-4 w-4 mr-1" />
            <span className={isOverdue ? 'text-red-500 dark:text-red-400' : ''}>
              Due {format(new Date(project.due_date), 'MMM d, yyyy')}
            </span>
          </div>
          <Badge className={`${getPriorityColor()} capitalize`}>
            {project.priority}
          </Badge>
        </div>
        
        <div className="space-y-1">
          <div className="flex justify-between items-center text-xs">
            <span className="text-gray-500 dark:text-gray-400">Progress</span>
            <span className="font-medium">{getProgressPercentage()}%</span>
          </div>
          <Progress value={getProgressPercentage()} className="h-2" />
        </div>
      </div>
      
      {/* Edit Dialog */}
      <ProjectDialog 
        project={project} 
        open={editDialogOpen} 
        onOpenChange={setEditDialogOpen} 
      />
      
      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the project &quot;{project.name}&quot; and all of its tasks.
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
