'use client';

import { useState } from 'react';
import { 
  MoreHorizontal, 
  MapPin, 
  Clock, 
  Calendar, 
  Edit2, 
  Trash2,
  Repeat
} from 'lucide-react';
import { format } from 'date-fns';
import { Event } from '@/types/database';
import { supabase } from '@/lib/supabase';
import { useAppStore } from '@/lib/store';
import EventDialog from './EventDialog';
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

interface EventCardProps {
  event: Event;
  minimal?: boolean;
}

export default function EventCard({ event: dbEvent, minimal = false }: EventCardProps) {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const { deleteEvent } = useAppStore();
  
  // Convert from database format (snake_case) to app format (camelCase) if needed
  const event = 'start_date' in dbEvent ? {
    id: dbEvent.id,
    name: dbEvent.name,
    description: dbEvent.description,
    startDate: dbEvent.start_date,
    startTime: dbEvent.start_time,
    endDate: dbEvent.end_date,
    endTime: dbEvent.end_time,
    location: dbEvent.location,
    recurring: dbEvent.recurring,
    tags: dbEvent.tags,
    createdAt: dbEvent.created_at,
  } : dbEvent;
  
  const handleDelete = async () => {
    try {
      const { error } = await supabase
        .from('events')
        .delete()
        .eq('id', event.id);
        
      if (error) throw error;
      
      // Update local state
      deleteEvent(event.id);
      
      toast({
        title: "Event deleted",
        description: "The event has been successfully deleted."
      });
    } catch (error) {
      console.error('Error deleting event:', error);
      toast({
        title: "Error",
        description: "There was an error deleting the event.",
        variant: "destructive"
      });
    } finally {
      setDeleteDialogOpen(false);
    }
  };
  
  // Format start and end times/dates
  const formatTime = (date: string, time: string) => {
    const dateObj = new Date(`${date}T${time}`);
    return format(dateObj, 'h:mm a');
  };
  
  const formatDate = (date: string) => {
    return format(new Date(date), 'MMM d, yyyy');
  };
  
  // Determine if this is a multi-day event
  const isMultiDay = event.startDate !== event.endDate;
  
  // Get recurrence text
  const getRecurrenceText = () => {
    switch(event.recurring) {
      case 'daily': return 'Repeats daily';
      case 'weekly': return 'Repeats weekly';
      case 'monthly': return 'Repeats monthly';
      default: return null;
    }
  };
  
  // For minimal display (used in calendar all-day section)
  if (minimal) {
    return (
      <div className="p-2 mb-1 rounded bg-blue-100 dark:bg-blue-900/30 border-l-4 border-blue-500 dark:border-blue-400">
        <div className="font-medium text-sm">{event.name}</div>
      </div>
    );
  }
  
  return (
    <>
      <div className="p-3 mb-2 rounded bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-500 dark:border-blue-400">
        <div className="flex justify-between items-start">
          <h4 className="font-medium">{event.name}</h4>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="p-1 rounded-md hover:bg-blue-100 dark:hover:bg-blue-900/30">
                <MoreHorizontal className="h-4 w-4 text-gray-500 dark:text-gray-400" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setEditDialogOpen(true)}>
                <Edit2 className="mr-2 h-4 w-4" />
                Edit
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
        
        <div className="text-sm text-gray-600 dark:text-gray-300 mt-1">
          <div className="flex items-center gap-2">
            <Clock className="h-3.5 w-3.5" />
            {isMultiDay ? (
              <span>
                {formatDate(event.startDate)} {formatTime(event.startDate, event.startTime)} -
                {formatDate(event.endDate)} {formatTime(event.endDate, event.endTime)}
              </span>
            ) : (
              <span>
                {formatTime(event.startDate, event.startTime)} -
                {formatTime(event.endDate, event.endTime)}
              </span>
            )}
          </div>
          
          {event.location && (
            <div className="flex items-center gap-2 mt-1">
              <MapPin className="h-3.5 w-3.5" />
              <span>{event.location}</span>
            </div>
          )}
          
          {event.recurring !== 'none' && (
            <div className="flex items-center gap-2 mt-1 text-blue-600 dark:text-blue-400">
              <Repeat className="h-3.5 w-3.5" />
              <span>{getRecurrenceText()}</span>
            </div>
          )}
        </div>
      </div>
      
      {/* Edit Dialog */}
      <EventDialog 
        event={event} 
        open={editDialogOpen} 
        onOpenChange={setEditDialogOpen} 
      />
      
      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the event &quot;{event.name}&quot;.
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
