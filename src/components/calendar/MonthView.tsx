'use client';

import { useAppStore } from '@/lib/store';
import TaskCard from '@/components/dashboard/TaskCard';
import { Task as StoreTask, Event as StoreEvent } from '@/lib/store/app-store';
import { Task as DatabaseTask, Event as DatabaseEvent } from '@/types/database';
import EventCard from '@/components/events/EventCard';
import { useCallback, useMemo } from 'react';
import { 
  format, 
  startOfMonth, 
  endOfMonth, 
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  isToday,
  addDays,
  subDays,
  startOfWeek,
  endOfWeek
} from 'date-fns';

interface MonthViewProps {
  currentDate: Date;
  tasks: (StoreTask | DatabaseTask)[];
  events: (StoreEvent | DatabaseEvent)[];
  onTaskClick?: (task: DatabaseTask) => void;
  onEventClick?: (event: DatabaseEvent) => void;
  onDateClick?: (date: Date) => void;
}

export function MonthView({ 
  currentDate,
  tasks,
  events,
  onTaskClick,
  onEventClick,
  onDateClick
}: MonthViewProps) {
  // Generate all days to display in the month view (including days from prev/next months)
  const days = useMemo(() => {
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(currentDate);
    const calendarStart = startOfWeek(monthStart, { weekStartsOn: 0 }); // 0 = Sunday
    const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 0 });
    
    return eachDayOfInterval({ start: calendarStart, end: calendarEnd });
  }, [currentDate]);

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

  // Calculate total items to limit display
  const getItemLimit = useCallback((items: { tasks: any[], events: any[] }) => {
    const totalItems = items.tasks.length + items.events.length;
    
    if (totalItems <= 3) return { taskLimit: items.tasks.length, eventLimit: items.events.length };
    
    // If more than 3 items, show at most 3 with preference to events
    const eventLimit = Math.min(items.events.length, 2);
    const taskLimit = Math.min(items.tasks.length, 3 - eventLimit);
    
    return { taskLimit, eventLimit };
  }, []);

  return (
    <div className="h-full flex flex-col bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
      <header className="p-4 border-b border-gray-200 dark:border-gray-700">
        <h2 className="text-lg font-medium">
          {format(currentDate, 'MMMM yyyy')}
        </h2>
      </header>
      
      <div className="grid grid-cols-7 border-b border-gray-200 dark:border-gray-700">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
          <div key={day} className="p-2 text-center text-sm font-medium">
            {day}
          </div>
        ))}
      </div>
      
      <div className="flex-grow grid grid-cols-7 grid-rows-6 auto-rows-fr divide-x divide-y divide-gray-200 dark:divide-gray-700">
        {days.map((day) => {
          const { tasks: dayTasks, events: dayEvents } = getItemsForDay(day);
          const { taskLimit, eventLimit } = getItemLimit({ tasks: dayTasks, events: dayEvents });
          const hasMoreItems = dayTasks.length + dayEvents.length > taskLimit + eventLimit;
          
          return (
            <div 
              key={day.toString()} 
              className={`p-1 overflow-hidden ${
                !isSameMonth(day, currentDate) ? 'bg-gray-50 dark:bg-gray-900/20 text-gray-400' : 
                isToday(day) ? 'bg-blue-50 dark:bg-blue-900/20' : ''
              }`}
              onClick={() => onDateClick?.(day)}
            >
              <div className="text-right p-1">
                <span className={`text-sm font-medium ${
                  isToday(day) ? 'bg-blue-600 text-white rounded-full w-6 h-6 inline-block text-center leading-6' : ''
                }`}>
                  {format(day, 'd')}
                </span>
              </div>
              
              <div className="space-y-1">
                {dayEvents.slice(0, eventLimit).map((event) => (
                  <div 
                    key={event.id} 
                    className="cursor-pointer"
                    onClick={(e) => {
                      e.stopPropagation();
                      onEventClick?.(normalizeEvent(event));
                    }}
                  >
                    <EventCard event={normalizeEvent(event)} minimal={true} />
                  </div>
                ))}
                
                {dayTasks.slice(0, taskLimit).map((task) => (
                  <div 
                    key={task.id} 
                    className="cursor-pointer"
                    onClick={(e) => {
                      e.stopPropagation();
                      onTaskClick?.(normalizeTask(task));
                    }}
                  >
                    <div className={`p-1 text-xs truncate rounded ${
                      task.completed || (task as any).completed 
                        ? 'bg-gray-100 text-gray-500 line-through' 
                        : 'bg-blue-50 text-blue-700'
                    }`}>
                      {task.name}
                    </div>
                  </div>
                ))}
                
                {hasMoreItems && (
                  <div className="text-xs text-gray-500 px-1">
                    +{dayTasks.length + dayEvents.length - taskLimit - eventLimit} more
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
