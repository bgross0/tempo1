'use client';

import { useState, useEffect } from 'react';
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
import { supabase } from '@/lib/supabase';

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
  
  // Debug 
  useEffect(() => {
    console.log('TaskDialog rendered with:', { 
      task: task?.id || 'none',
      isControlled,
      isOpen,
      hasUser: !!user
    });
  }, [task, isControlled, isOpen, user]);

  const handleSubmit = async (data: TaskFormValues) => {
    try {
      // Check if the user is authenticated
      if (!user) {
        toast({
          title: "Authentication Error",
          description: "You must be logged in to create or update a task.",
          variant: "destructive"
        });
        
        // Redirect to login
        window.location.href = `/login?reason=auth_required&t=${Date.now()}`;
        return;
      }

      console.log('Submitting task form with data:', JSON.stringify(data, null, 2));
      console.log('Current authenticated user ID:', user.id);
      
      // Fresh session check with simple retry logic
      console.log('Validating session before task operation...');
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError) {
        console.error('Session validation error:', sessionError);
        throw new Error('Authentication failed: ' + sessionError.message);
      }
      
      if (!sessionData.session) {
        console.log('No session found, attempting to refresh...');
        const { data: refreshData, error: refreshError } = await supabase.auth.refreshSession();
        
        if (refreshError || !refreshData.session) {
          console.error('Session refresh failed:', refreshError);
          toast({
            title: "Authentication Error",
            description: "Your session has expired. Please log in again.",
            variant: "destructive"
          });
          
          // Redirect to login
          window.location.href = `/login?reason=expired_session&t=${Date.now()}`;
          return;
        }
        
        console.log('Session refreshed successfully');
      } else {
        console.log('Active session found for user:', sessionData.session.user.email);
      }
      
      if (task) {
        // Update existing task
        console.log('Updating existing task:', task.id);
        await updateTask(task.id, data);
        
        toast({
          title: "Task updated",
          description: "Your task has been successfully updated."
        });
      } else {
        // Create new task with properly formatted data
        console.log('Creating new task for user ID:', user.id);
        
        // Prepare task data, ensuring the user_id is included
        const taskData = {
          ...data,
          user_id: user.id,
          completed: false
        };
        
        console.log('Sending task creation request with data:', JSON.stringify(taskData, null, 2));
        const createdTask = await createTask(taskData);
        
        console.log('Task created successfully with ID:', createdTask.id);
        toast({
          title: "Task created",
          description: "Your task has been successfully created."
        });
      }
      
      // Close the dialog
      setIsOpen(false);
    } catch (error) {
      console.error('Error handling task submission:', error);
      
      // Determine the error type and show appropriate message
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      
      if (errorMessage.includes('401') || errorMessage.includes('auth')) {
        toast({
          title: "Authentication Error",
          description: "Your session has expired. Please log in again.",
          variant: "destructive"
        });
        
        // Redirect to login after a small delay
        setTimeout(() => {
          window.location.href = `/login?reason=auth_error&t=${Date.now()}`;
        }, 1000);
      } else {
        toast({
          title: "Error",
          description: "There was an error processing your task: " + errorMessage,
          variant: "destructive"
        });
      }
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
