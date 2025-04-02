'use client';

import { useState } from 'react';
import { X } from 'lucide-react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ProjectForm } from '@/components/forms/project-form';
import { useProjects } from '@/hooks/api/useProjects';
import { ProjectFormValues } from '@/lib/validations/project';
import { Project } from '@/types/database';
import { toast } from '@/components/ui/use-toast';

interface ProjectDialogProps {
  project?: Project;
  trigger?: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export default function ProjectDialog({ 
  project, 
  trigger, 
  open: controlledOpen, 
  onOpenChange: setControlledOpen 
}: ProjectDialogProps) {
  const [open, setOpen] = useState(false);
  const { createProject, updateProject } = useProjects();
  
  const isControlled = controlledOpen !== undefined && setControlledOpen !== undefined;
  const isOpen = isControlled ? controlledOpen : open;
  const setIsOpen = isControlled ? setControlledOpen : setOpen;

  const handleSubmit = async (data: ProjectFormValues) => {
    try {
      if (project) {
        await updateProject(project.id, data);
        toast({
          title: "Project updated",
          description: "Your project has been successfully updated."
        });
      } else {
        await createProject({
          user_id: 'current-user', // This should be dynamic in a real app
          ...data,
          completed: false
        });
        toast({
          title: "Project created",
          description: "Your project has been successfully created."
        });
      }
      setIsOpen(false);
    } catch (error) {
      console.error('Error handling project:', error);
      toast({
        title: "Error",
        description: "There was an error processing your project.",
        variant: "destructive"
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
      <DialogContent className="max-w-md md:max-w-xl">
        <DialogHeader>
          <DialogTitle>{project ? 'Edit Project' : 'Create Project'}</DialogTitle>
          <Button
            onClick={() => setIsOpen(false)}
            variant="ghost"
            size="icon"
            className="absolute top-4 right-4"
          >
            <X className="h-4 w-4" />
          </Button>
        </DialogHeader>
        <ProjectForm
          initialData={project}
          onSubmit={handleSubmit}
          onCancel={() => setIsOpen(false)}
        />
      </DialogContent>
    </Dialog>
  );
}
