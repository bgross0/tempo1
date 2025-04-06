'use client';

import { useAppStore } from '@/lib/store';
import TaskCard from '@/components/dashboard/TaskCard';
import { Task as StoreTask } from '@/lib/store/app-store';
import { Task as DatabaseTask } from '@/types/database';
import EventCard from '@/components/events/EventCard';
import { Event as StoreEvent } from '@/lib/store/app-store';
import { Event as DatabaseEvent } from '@/types/database';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useCallback, useMemo } from 'react';
import { format, addHours, startOfDay, eachHourOfInterval } from 'date-fns';

interface DayViewProps {
  currentDate: Date;
  tasks: (StoreTask | DatabaseTask)[];
  events: (StoreEvent | DatabaseEvent)[];
  onTaskClick?: (task: DatabaseTask) => void;
  onEventClick?: (event: DatabaseEvent) => void;
}

export function DayView({ 
  currentDate,
  tasks,
  events,
  onTaskClick,
  onEventClick
}: DayViewProps) {
  // Generate hours of the day
  const hours = useMemo(() => {
    return eachHourOfInterval({
      start: startOfDay(currentDate),
      end: addHours(startOfDay(currentDate), 23)
    });
  }, [currentDate]);

  // Format time (e.g., "9:00 AM")
  const formatTime = useCallback((hour: Date) => {
    return format(hour, 'h:mm a');
  }, []);

  // Filter tasks and events for the current day
  const tasksForDay = useMemo(() => {
    const currentDateStr = format(currentDate, 'yyyy-MM-dd');
    
    return tasks.filter(task => {
      // If it has a start date, use that, otherwise use due date
      const taskDate = task.start_date || task.startDate || task.due_date || task.dueDate;
      return format(new Date(taskDate), 'yyyy-MM-dd') === currentDateStr;
    });
  }, [tasks, currentDate]);

  const eventsForDay = useMemo(() => {
    const currentDateStr = format(currentDate, 'yyyy-MM-dd');
    
    return events.filter(event => {
      const eventStartDate = event.start_date || event.startDate;
      const eventEndDate = event.end_date || event.endDate;
      
      // If event is on a single day
      if (eventStartDate === eventEndDate) {
        return format(new Date(eventStartDate), 'yyyy-MM-dd') === currentDateStr;
      }
      
      // For multi-day events, check if current date is within range
      const startDate = new Date(eventStartDate);
      const endDate = new Date(eventEndDate);
      const currentDateObj = new Date(currentDateStr);
      
      return currentDateObj >= startDate && currentDateObj <= endDate;
    });
  }, [events, currentDate]);

  // Group tasks and events by hour
  const getItemsForHour = useCallback((hour: Date) => {
    const hourStr = format(hour, 'HH:mm');
    
    const tasksForHour = tasksForDay.filter(task => {
      const taskTime = task.start_time || task.startTime || '09:00';
      return taskTime.substring(0, 5) === hourStr; // Compare HH:MM part
    });
    
    const eventsForHour = eventsForDay.filter(event => {
      const eventTime = event.start_time || event.startTime || '09:00';
      return eventTime.substring(0, 5) === hourStr; // Compare HH:MM part
    });
    
    return { tasks: tasksForHour, events: eventsForHour };
  }, [tasksForDay, eventsForDay]);

  // Function to normalize task data format
  const normalizeTask = (task: StoreTask | DatabaseTask): DatabaseTask => {
    // If it's already a database task, return it
    if ('due_date' in task) return task as DatabaseTask;
    
    // Convert from store format to database format
    return {
      id: task.id,
      user_id: task.userId || '',
      name: task.name,
      description: task.description || null,
      due_date: task.dueDate,
      due_time: task.dueTime || null,
      start_date: task.startDate || null,
      start_time: task.startTime || null,
      priority: task.priority,
      project_id: task.projectId || null,
      duration: task.duration || null,
      chunk_size: task.chunkSize || null,
      hard_deadline: task.hardDeadline || false,
      completed: task.completed || false,
      tags: task.tags || [],
      created_at: task.createdAt,
      updated_at: task.createdAt,
      status: task.status
    };
  };

  // Function to normalize event data format
  const normalizeEvent = (event: StoreEvent | DatabaseEvent): DatabaseEvent => {
    // If it's already a database event, return it
    if ('start_date' in event) return event as DatabaseEvent;
    
    // Convert from store format to database format
    return {
      id: event.id,
      user_id: '',
      name: event.name,
      description: event.description || null,
      start_date: event.startDate,
      start_time: event.startTime,
      end_date: event.endDate,
      end_time: event.endTime,
      location: event.location || null,
      recurring: event.recurring || 'none',
      tags: event.tags || [],
      created_at: event.createdAt,
      updated_at: event.createdAt
    };
  };

  return (
    <div className="h-full flex flex-col bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
      <header className="p-4 border-b border-gray-200 dark:border-gray-700">
        <h2 className="text-lg font-medium">
          {format(currentDate, 'EEEE, MMMM d, yyyy')}
        </h2>
      </header>
      
      <ScrollArea className="flex-grow">
        <div className="p-2 md:p-4">
          {hours.map((hour) => {
            const { tasks: hourTasks, events: hourEvents } = getItemsForHour(hour);
            const hasItems = hourTasks.length > 0 || hourEvents.length > 0;
            
            return (
              <div 
                key={hour.toString()} 
                className={`mb-2 p-2 rounded ${hasItems ? 'bg-gray-50 dark:bg-gray-700' : ''}`}
              >
                <div className="flex items-start gap-4">
                  <div className="w-16 flex-shrink-0 text-sm font-medium text-gray-500 dark:text-gray-400 mt-0.5">
                    {formatTime(hour)}
                  </div>
                  
                  <div className="flex-grow space-y-2">
                    {hourTasks.map((task) => (
                      <div key={task.id} onClick={() => onTaskClick?.(normalizeTask(task))}>
                        <TaskCard task={normalizeTask(task)} compact={true} />
                      </div>
                    ))}
                    
                    {hourEvents.map((event) => (
                      <div key={event.id} onClick={() => onEventClick?.(normalizeEvent(event))}>
                        <EventCard event={normalizeEvent(event)} />
                      </div>
                    ))}
                    
                    {!hasItems && (
                      <div className="h-8 border border-dashed border-gray-200 dark:border-gray-600 rounded">
                        {/* Empty time slot */}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </ScrollArea>
    </div>
  );
}
