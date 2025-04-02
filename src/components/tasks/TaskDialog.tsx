'use client';

import { useState } from 'react';
import { X } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { TaskForm } from '@/components/forms/task-form';
import { useTasks } from '@/hooks/api/useTasks';
import { TaskFormValues } from '@/lib/validations/task';
import { Task } from '@/types/database';
import { toast } from '@/components/ui/use-toast';

interface TaskDialogProps {
  task?: Task;
  trigger?: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export default function TaskDialog({ 
  task, 
  trigger, 
  open: controlledOpen, 
  onOpenChange: setControlledOpen 
}: TaskDialogProps) {
  const [open, setOpen] = useState(false);
  const { createTask, updateTask } = useTasks();
  const { user } = useAuth();
  
  const isControlled = controlledOpen !== undefined && setControlledOpen !== undefined;
  const isOpen = isControlled ? controlledOpen : open;
  const setIsOpen = isControlled ? setControlledOpen : setOpen;

  const handleSubmit = async (data: TaskFormValues) => {
    try {
      if (!user) {
        toast({
          title: "Error",
          description: "You must be logged in to create or update a task.",
          variant: "destructive"
        });
        return;
      }

      console.log('Task submission with form data:', data);
      
      if (task) {
        // Update existing task
        await updateTask(task.id, {
          ...data,
        });
        
        toast({
          title: "Task updated",
          description: "Your task has been successfully updated."
        });
      } else {
        // Create new task
        await createTask({
          user_id: user.id,
          name: data.name,
          description: data.description || null,
          start_date: data.start_date || null,
          start_time: data.start_time || null,
          due_date: data.due_date,
          due_time: data.due_time || null,
          priority: data.priority || 'medium',
          duration: data.duration || null,
          chunk_size: data.chunk_size || null,
          hard_deadline: data.hard_deadline || false,
          completed: false,
          completed_at: null,
          project_id: data.project_id || null,
          tags: data.tags || [],
          scheduled_blocks: null // Set to null for new tasks
        });
        
        toast({
          title: "Task created",
          description: "Your task has been successfully created."
        });
      }
      
      setIsOpen(false);
    } catch (error) {
      console.error('Error handling task submission:', error);
      
      toast({
        title: "Error",
        description: "There was an error processing your task.",
        variant: "destructive"
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
      <DialogContent className="max-w-md md:max-w-xl">
        <DialogHeader>
          <DialogTitle>{task ? 'Edit Task' : 'Create Task'}</DialogTitle>
          <Button
            onClick={() => setIsOpen(false)}
            variant="ghost"
            size="icon"
            className="absolute top-4 right-4"
          >
            <X className="h-4 w-4" />
          </Button>
        </DialogHeader>
        <TaskForm
          initialData={task}
          onSubmit={handleSubmit}
          onCancel={() => setIsOpen(false)}
        />
      </DialogContent>
    </Dialog>
  );
}
