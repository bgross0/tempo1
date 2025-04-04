'use client';

import { useState, useEffect, useRef } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTasksRealtime } from '@/hooks/api/useTasksRealtime';
import { useEventsRealtime } from '@/hooks/api/useEventsRealtime';
import { useAppStore } from '@/lib/store';
import { Event as CalendarEvent, Task } from '@/types';
import { CalendarView } from '@/features/calendar/calendar-view';
import MiniCalendar from '@/components/calendar/MiniCalendar';

export default function CalendarPage() {
  const { 
    setTasks, 
    setEvents, 
    calendarView, 
    currentDate 
  } = useAppStore();
  
  // Fetch tasks and events
  const { tasks } = useTasksRealtime();
  const { events } = useEventsRealtime();
  
  // Update global state with fetched data
  // Use refs to store previous values to avoid unnecessary updates
  const prevTasksRef = useRef(tasks);
  const prevConvertedTasksRef = useRef<Task[]>([]);
  
  useEffect(() => {
    // Skip processing if tasks are null or haven't changed
    if (!tasks || tasks === prevTasksRef.current) {
      return;
    }
    
    console.log("DEBUG - tasks data changed:", tasks.length, "tasks");
    prevTasksRef.current = tasks;
    
    try {
      // Convert database tasks to the format used in our store
      const convertedTasks = tasks.map(task => {
        // Safely handle scheduled_blocks which might be null or a JSON string
        let scheduledBlocks = [];
        if (task.scheduled_blocks) {
          try {
            // If it's already an array, use it; if it's a string, parse it
            scheduledBlocks = typeof task.scheduled_blocks === 'string'
              ? JSON.parse(task.scheduled_blocks)
              : (Array.isArray(task.scheduled_blocks) ? task.scheduled_blocks : []);
          } catch (e) {
            console.error("Error parsing scheduled_blocks:", e);
            scheduledBlocks = [];
          }
        }
        
        return {
          id: task.id,
          name: task.name,
          description: task.description || undefined,
          startDate: task.start_date ? task.start_date : null,
          startTime: task.start_time ? task.start_time : null,
          dueDate: task.due_date,
          dueTime: task.due_time || null,
          priority: task.priority,
          projectId: task.project_id || null,
          duration: task.duration || 0,
          chunkSize: task.chunk_size || null,
          hardDeadline: task.hard_deadline,
          tags: task.tags || [],
          completed: task.completed,
          status: task.status || 'todo', // Add the status field with a default value
          createdAt: task.created_at,
          // Use our safely parsed scheduledBlocks
          scheduledBlocks: scheduledBlocks
        };
      });
      
      // Deep compare to avoid unnecessary updates
      const tasksChanged = JSON.stringify(convertedTasks) !== JSON.stringify(prevConvertedTasksRef.current);
      
      if (tasksChanged) {
        console.log("DEBUG - Converted tasks changed, updating store");
        prevConvertedTasksRef.current = convertedTasks;
        setTasks(convertedTasks);
      } else {
        console.log("DEBUG - Converted tasks unchanged, skipping update");
      }
    } catch (error) {
      console.error("Error converting tasks:", error);
    }
  }, [tasks, setTasks]); // Include setTasks to avoid lint warnings
  
  // Use a ref to store the previous events array to avoid unnecessary updates
  const prevEventsRef = useRef(events);
  const prevConvertedEventsRef = useRef<CalendarEvent[]>([]);
  
  // Process events once when they change
  useEffect(() => {
    // Skip processing if events are null or haven't changed
    if (!events || events === prevEventsRef.current) {
      return;
    }
    
    console.log("DEBUG - events data changed:", events.length, "events");
    prevEventsRef.current = events;
    
    try {
      // Convert database events to the format used in our store
      const convertedEvents = events.map(event => ({
        id: event.id,
        name: event.name,
        description: event.description || undefined,
        startDate: event.start_date,
        startTime: event.start_time,
        endDate: event.end_date,
        endTime: event.end_time,
        location: event.location || undefined,
        recurring: event.recurring,
        tags: event.tags || [],
        createdAt: event.created_at
      }));
      
      // Deep compare the converted events to see if anything has actually changed
      const eventsChanged = JSON.stringify(convertedEvents) !== JSON.stringify(prevConvertedEventsRef.current);
      
      if (eventsChanged) {
        console.log("DEBUG - Converted events changed, updating store");
        prevConvertedEventsRef.current = convertedEvents;
        setEvents(convertedEvents);
      } else {
        console.log("DEBUG - Converted events unchanged, skipping update");
      }
    } catch (error) {
      console.error("Error converting events:", error);
    }
  }, [events, setEvents]); // Include setEvents to avoid lint warnings

  return (
    <div className="flex h-full gap-4">
      {/* Sidebar */}
      <div className="w-64 space-y-4">
        <Button className="w-full" onClick={() => console.log('Create event')}>
          <Plus className="h-4 w-4 mr-1" />
          Add Event
        </Button>
        
        <MiniCalendar />
      </div>
      
      {/* Main calendar */}
      <div className="flex-1">
        <CalendarView />
      </div>
    </div>
  );
}