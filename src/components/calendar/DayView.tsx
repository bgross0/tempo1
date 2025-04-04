import React from 'react';
import { format, addHours, startOfDay } from 'date-fns';
import { useAppStore } from '@/lib/store';
import TaskCard from '@/components/dashboard/TaskCard';
import { Task as StoreTask } from '@/types';
import { Task as DatabaseTask } from '@/types/database';
import EventCard from '@/components/events/EventCard';
import { Event as DatabaseEvent } from '@/types/database';

interface DayViewProps {
  date: Date;
}

export default function DayView({ date }: DayViewProps) {
  const { tasks, events } = useAppStore();
  
  // Working hours
  const workingHours = Array.from({ length: 15 }, (_, i) => i + 7); // 7 AM to 9 PM
  
  const dateString = format(date, 'yyyy-MM-dd');
  
  // Filter tasks for this day
  const dayTasks = tasks.filter(task => {
    if (!task.scheduledBlocks) return false;
    return task.scheduledBlocks.some(block => block.date === dateString);
  });
  
  // Filter events for this day
  const dayEvents = events.filter(event => {
    return event.startDate <= dateString && event.endDate >= dateString;
  });
  
  // Find tasks and events for a specific hour
  const getItemsForHour = (hour: number) => {
    const scheduledTasks = dayTasks.filter(task => {
      return task.scheduledBlocks.some(block => {
        if (block.date !== dateString) return false;
        
        const [blockHour] = block.startTime.split(':').map(Number);
        return blockHour === hour;
      });
    });
    
    const scheduledEvents = dayEvents.filter(event => {
      const [eventStartHour] = event.startTime.split(':').map(Number);
      const [eventEndHour] = event.endTime.split(':').map(Number);
      
      return (
        (event.startDate === dateString && eventStartHour === hour) ||
        (event.startDate < dateString && event.endDate > dateString) ||
        (event.startDate === dateString && event.endDate === dateString &&
         eventStartHour <= hour && eventEndHour > hour)
      );
    });
    
    return { tasks: scheduledTasks, events: scheduledEvents };
  };
  
  return (
    <div className="bg-white dark:bg-gray-900 rounded-lg shadow overflow-hidden h-full">
      {/* Day header */}
      <div className="p-4 border-b dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
        <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200">
          {format(date, 'EEEE, MMMM d, yyyy')}
        </h2>
      </div>
      
      {/* All-day events */}
      <div className="border-b dark:border-gray-700 p-2">
        <div className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">ALL DAY</div>
        <div>
          {dayEvents
            .filter(event => {
              // Consider an event as "all day" if:
              // 1. It spans multiple days, or
              // 2. It lasts 8+ hours on a single day
              const isMultiDay = event.startDate !== event.endDate;
              
              if (!isMultiDay && event.startDate === dateString) {
                const [startHour, startMinute] = event.startTime.split(':').map(Number);
                const [endHour, endMinute] = event.endTime.split(':').map(Number);
                const durationHours = endHour - startHour + (endMinute - startMinute) / 60;
                return durationHours >= 8;
              }
              
              return isMultiDay;
            })
            .map(event => (
              <EventCard key={event.id} event={event as unknown as DatabaseEvent} minimal />
            ))}
        </div>
      </div>
      
      {/* Time slots */}
      <div className="overflow-y-auto h-[calc(100%-120px)]">
        {workingHours.map((hour) => {
          const { tasks: hourTasks, events: hourEvents } = getItemsForHour(hour);
          const hourLabel = format(addHours(startOfDay(date), hour), 'h a');
          
          return (
            <div key={hour} className="flex border-b dark:border-gray-700 min-h-[80px]">
              {/* Time label */}
              <div className="w-20 p-2 text-right text-xs text-gray-500 dark:text-gray-400 font-medium border-r dark:border-gray-700">
                {hourLabel}
              </div>
              
              {/* Hour content */}
              <div className="flex-1 p-2">
                {hourTasks.map(task => {
                  // Convert from store task type to database task type
                  const dbTask: DatabaseTask = {
                    id: task.id,
                    user_id: "",
                    project_id: task.projectId,
                    name: task.name,
                    description: task.description || null,
                    start_date: task.startDate,
                    start_time: task.startTime,
                    due_date: task.dueDate,
                    due_time: task.dueTime,
                    priority: task.priority,
                    duration: task.duration,
                    chunk_size: task.chunkSize,
                    hard_deadline: task.hardDeadline,
                    completed: task.completed,
                    completed_at: null,
                    tags: task.tags,
                    created_at: task.createdAt,
                    updated_at: task.createdAt,
                    scheduled_blocks: task.scheduledBlocks as any,
                    status: task.status
                  };
                  return <TaskCard key={task.id} task={dbTask} />;
                })}
                
                {hourEvents
                  .filter(event => {
                    // Filter out all-day events (already shown at the top)
                    const isMultiDay = event.startDate !== event.endDate;
                    
                    if (!isMultiDay && event.startDate === dateString) {
                      const [startHour, startMinute] = event.startTime.split(':').map(Number);
                      const [endHour, endMinute] = event.endTime.split(':').map(Number);
                      const durationHours = endHour - startHour + (endMinute - startMinute) / 60;
                      return durationHours < 8;
                    }
                    
                    return !isMultiDay;
                  })
                  .map(event => (
                    <EventCard key={event.id} event={event as unknown as DatabaseEvent} />
                  ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}