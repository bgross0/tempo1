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
import { EventForm } from '@/components/forms/event-form';
import { EventFormValues } from '@/lib/validations/event';
import { Event as DatabaseEvent } from '@/types/database';
import { Event, RecurringType } from '@/types';
import { toast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/supabase';
import { useAppStore } from '@/lib/store';

interface EventDialogProps {
  event?: DatabaseEvent;
  trigger?: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export default function EventDialog({ 
  event, 
  trigger, 
  open: controlledOpen, 
  onOpenChange: setControlledOpen 
}: EventDialogProps) {
  const [open, setOpen] = useState(false);
  const { addEvent, updateEvent } = useAppStore();
  
  const isControlled = controlledOpen !== undefined && setControlledOpen !== undefined;
  const isOpen = isControlled ? controlledOpen : open;
  const setIsOpen = isControlled ? setControlledOpen : setOpen;

  const handleSubmit = async (data: EventFormValues) => {
    try {
      if (event) {
        // Update existing event
        const { data: updatedEvent, error } = await supabase
          .from('events')
          .update({
            name: data.name,
            description: data.description,
            start_date: data.start_date,
            start_time: data.start_time,
            end_date: data.end_date,
            end_time: data.end_time,
            location: data.location,
            recurring: data.recurring,
            tags: data.tags,
            updated_at: new Date().toISOString()
          })
          .eq('id', event.id)
          .select()
          .single();
          
        if (error) throw error;
        
        // Convert from database format (snake_case) to app format (camelCase)
        const adaptedEvent: Event = {
          id: updatedEvent.id,
          name: updatedEvent.name,
          description: updatedEvent.description || undefined,
          startDate: updatedEvent.start_date,
          startTime: updatedEvent.start_time,
          endDate: updatedEvent.end_date,
          endTime: updatedEvent.end_time,
          location: updatedEvent.location || undefined,
          recurring: updatedEvent.recurring as RecurringType,
          tags: updatedEvent.tags || [],
          createdAt: updatedEvent.created_at,
        };
        
        // Update local state
        updateEvent(adaptedEvent);
        
        toast({
          title: "Event updated",
          description: "Your event has been successfully updated."
        });
      } else {
        // Create new event
        const { data: newEvent, error } = await supabase
          .from('events')
          .insert({
            user_id: 'current-user', // This should be dynamic in a real app
            name: data.name,
            description: data.description,
            start_date: data.start_date,
            start_time: data.start_time,
            end_date: data.end_date,
            end_time: data.end_time,
            location: data.location,
            recurring: data.recurring,
            tags: data.tags,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
          .select()
          .single();
          
        if (error) throw error;
        
        // Convert from database format (snake_case) to app format (camelCase)
        const adaptedEvent: Event = {
          id: newEvent.id,
          name: newEvent.name,
          description: newEvent.description || undefined,
          startDate: newEvent.start_date,
          startTime: newEvent.start_time,
          endDate: newEvent.end_date,
          endTime: newEvent.end_time,
          location: newEvent.location || undefined,
          recurring: newEvent.recurring as RecurringType,
          tags: newEvent.tags || [],
          createdAt: newEvent.created_at,
        };
        
        // Update local state
        addEvent(adaptedEvent);
        
        toast({
          title: "Event created",
          description: "Your event has been successfully created."
        });
      }
      
      setIsOpen(false);
    } catch (error) {
      console.error('Error handling event:', error);
      toast({
        title: "Error",
        description: "There was an error processing your event.",
        variant: "destructive"
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
      <DialogContent className="max-w-md md:max-w-xl">
        <DialogHeader>
          <DialogTitle>{event ? 'Edit Event' : 'Create Event'}</DialogTitle>
          <Button
            onClick={() => setIsOpen(false)}
            variant="ghost"
            size="icon"
            className="absolute top-4 right-4"
          >
            <X className="h-4 w-4" />
          </Button>
        </DialogHeader>
        <EventForm
          initialData={event}
          onSubmit={handleSubmit}
          onCancel={() => setIsOpen(false)}
        />
      </DialogContent>
    </Dialog>
  );
}
