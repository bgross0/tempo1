'use client';

import { useState, useEffect } from 'react';
import { X, PaperclipIcon, MessageSquare } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogDescription,
  DialogTrigger
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Textarea } from '@/components/ui/textarea';
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
  const [commentText, setCommentText] = useState('');
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
        
        // Prepare task data, ensuring the user_id is included and all required fields have appropriate types
        const taskData = {
          user_id: user.id,
          name: data.name,
          description: data.description || null,
          start_date: data.start_date || null,
          start_time: data.start_time || null,
          due_date: data.due_date,
          due_time: data.due_time || null,
          priority: data.priority,
          duration: data.duration || 30, // Default to 30 minutes as duration is required in the database
          chunk_size: data.chunk_size || null,
          hard_deadline: data.hard_deadline || false,
          tags: data.tags || [],
          completed: false,
          completed_at: null,
          scheduled_blocks: null,
          status: data.status || 'todo',
          project_id: data.project_id || null
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
      <DialogContent className="max-w-md md:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{task ? 'Edit Task' : 'Create Task'}</DialogTitle>
          <DialogDescription>
            {task ? 'Update your task details below' : 'Enter details for your new task'}
          </DialogDescription>
          <Button
            onClick={() => setIsOpen(false)}
            variant="ghost"
            size="icon"
            className="absolute top-4 right-4"
          >
            <X className="h-4 w-4" />
          </Button>
        </DialogHeader>
        
        <Tabs defaultValue="details" className="w-full">
          <TabsList className="mb-4 w-full justify-start">
            <TabsTrigger value="details">Details</TabsTrigger>
            <TabsTrigger value="comments">Comments</TabsTrigger>
            <TabsTrigger value="attachments">Attachments</TabsTrigger>
          </TabsList>
          
          <TabsContent value="details">
            <TaskForm
              initialData={task}
              onSubmit={handleSubmit}
              onCancel={() => setIsOpen(false)}
            />
          </TabsContent>
          
          <TabsContent value="comments">
            <div className="space-y-4">
              <h3 className="text-sm font-medium">Comments</h3>
              <div className="space-y-4">
                {/* Comment list - would come from API in real implementation */}
                <div className="text-center text-gray-500 dark:text-gray-400 text-sm py-4">
                  <MessageSquare className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  No comments yet
                </div>
                
                {/* Comment input */}
                <div className="flex items-start gap-2 mt-4">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback>{user?.email?.charAt(0).toUpperCase() || 'U'}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <Textarea 
                      placeholder="Add a comment..." 
                      className="resize-none"
                      value={commentText}
                      onChange={(e) => setCommentText(e.target.value)}
                    />
                    <Button 
                      size="sm" 
                      className="mt-2"
                      disabled={!commentText.trim()}
                    >
                      Add Comment
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="attachments">
            <div className="space-y-4">
              <h3 className="text-sm font-medium">Attachments</h3>
              <div className="border-2 border-dashed rounded-lg p-8 text-center">
                <PaperclipIcon className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                <p className="text-gray-500 dark:text-gray-400 mb-2">Drag files here or click to upload</p>
                <Button variant="outline" size="sm">Upload File</Button>
              </div>
              <div className="text-center text-gray-500 dark:text-gray-400 text-sm pt-2">
                No attachments yet
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
