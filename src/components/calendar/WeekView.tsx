'use client';

import { useAppStore } from '@/lib/store';
import TaskCard from '@/components/dashboard/TaskCard';
import { Task as StoreTask, Event as StoreEvent } from '@/lib/store/app-store';
import { Task as DatabaseTask, Event as DatabaseEvent } from '@/types/database';
import EventCard from '@/components/events/EventCard';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useCallback, useMemo } from 'react';
import { format, addDays, startOfWeek, eachDayOfInterval, isSameDay } from 'date-fns';

interface WeekViewProps {
  currentDate: Date;
  tasks: (StoreTask | DatabaseTask)[];
  events: (StoreEvent | DatabaseEvent)[];
  onTaskClick?: (task: DatabaseTask) => void;
  onEventClick?: (event: DatabaseEvent) => void;
}

export function WeekView({ 
  currentDate,
  tasks,
  events,
  onTaskClick,
  onEventClick
}: WeekViewProps) {
  // Generate days of the week
  const days = useMemo(() => {
    return eachDayOfInterval({
      start: startOfWeek(currentDate, { weekStartsOn: 0 }), // 0 = Sunday
      end: addDays(startOfWeek(currentDate, { weekStartsOn: 0 }), 6)
    });
  }, [currentDate]);

  // Format day (e.g., "Mon 15")
  const formatDay = useCallback((day: Date) => {
    return format(day, 'EEE d');
  }, []);

  // Check if a day is today
  const isToday = useCallback((day: Date) => {
    return isSameDay(day, new Date());
  }, []);

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

  // Get items for a specific day
  const getItemsForDay = useCallback((day: Date) => {
    const dayStr = format(day, 'yyyy-MM-dd');
    
    const tasksForDay = tasks.filter(task => {
      // If it has a start date, use that, otherwise use due date
      const taskDate = task.start_date || task.startDate || task.due_date || task.dueDate;
      return format(new Date(taskDate), 'yyyy-MM-dd') === dayStr;
    });
    
    const eventsForDay = events.filter(event => {
      const eventStartDate = event.start_date || event.startDate;
      const eventEndDate = event.end_date || event.endDate;
      
      // If event is on a single day
      if (eventStartDate === eventEndDate) {
        return format(new Date(eventStartDate), 'yyyy-MM-dd') === dayStr;
      }
      
      // For multi-day events, check if day is within range
      const startDate = new Date(eventStartDate);
      const endDate = new Date(eventEndDate);
      const dayObj = new Date(dayStr);
      
      return dayObj >= startDate && dayObj <= endDate;
    });
    
    return { tasks: tasksForDay, events: eventsForDay };
  }, [tasks, events]);

  return (
    <div className="h-full flex flex-col bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
      <header className="p-4 border-b border-gray-200 dark:border-gray-700">
        <h2 className="text-lg font-medium">
          {format(days[0], 'MMMM d')} - {format(days[6], 'MMMM d, yyyy')}
        </h2>
      </header>
      
      <div className="grid grid-cols-7 border-b border-gray-200 dark:border-gray-700">
        {days.map((day) => (
          <div 
            key={day.toString()} 
            className={`p-2 text-center text-sm font-medium ${
              isToday(day) ? 'bg-blue-50 text-blue-700 dark:bg-blue-900 dark:text-blue-100' : ''
            }`}
          >
            {formatDay(day)}
          </div>
        ))}
      </div>
      
      <ScrollArea className="flex-grow">
        <div className="grid grid-cols-7 divide-x divide-gray-200 dark:divide-gray-700 h-full">
          {days.map((day) => {
            const { tasks: dayTasks, events: dayEvents } = getItemsForDay(day);
            
            return (
              <div 
                key={day.toString()} 
                className={`p-1 min-h-[300px] ${
                  isToday(day) ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                }`}
              >
                <div className="space-y-1">
                  {dayTasks.map((task) => (
                    <div 
                      key={task.id} 
                      className="cursor-pointer"
                      onClick={() => onTaskClick?.(normalizeTask(task))}
                    >
                      <TaskCard task={normalizeTask(task)} compact={true} />
                    </div>
                  ))}
                  
                  {dayEvents.map((event) => (
                    <div 
                      key={event.id} 
                      className="cursor-pointer"
                      onClick={() => onEventClick?.(normalizeEvent(event))}
                    >
                      <EventCard event={normalizeEvent(event)} />
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </ScrollArea>
    </div>
  );
}
