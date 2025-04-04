import React, { useState, useEffect } from 'react';
import { format, addDays, startOfMonth, endOfMonth, getDay, isSameMonth, isToday, parseISO } from 'date-fns';
import { useAppStore } from '@/lib/store';
import TaskCard from '@/components/dashboard/TaskCard';
import { Task as StoreTask, Event as StoreEvent } from '@/types';
import { Task as DatabaseTask, Event as DatabaseEvent } from '@/types/database';
import EventCard from '@/components/events/EventCard';

interface MonthViewProps {
  date: Date;
}

export default function MonthView({ date }: MonthViewProps) {
  const { tasks, events, setSelectedDate } = useAppStore();
  const [calendarDays, setCalendarDays] = useState<Date[]>([]);
  
  useEffect(() => {
    // Generate array of dates for the calendar
    const monthStart = startOfMonth(date);
    const monthEnd = endOfMonth(date);
    const startDate = addDays(monthStart, -getDay(monthStart)); // Previous Sunday
    
    // Create array of 42 days (6 weeks)
    const days: Date[] = [];
    let currentDate = startDate;
    
    for (let i = 0; i < 42; i++) {
      days.push(currentDate);
      currentDate = addDays(currentDate, 1);
    }
    
    setCalendarDays(days);
  }, [date]);
  
  // Group tasks and events by date
  const getItemsByDate = (day: Date) => {
    const dateString = format(day, 'yyyy-MM-dd');
    
    const dayTasks = tasks.filter(task => 
      (task.startDate === dateString) || 
      (task.dueDate === dateString) ||
      (task.scheduledBlocks && task.scheduledBlocks.some(block => block.date === dateString))
    );
    
    // Filter events by date
    const dayEvents = events.filter(event => {
      const startDate = event.startDate;
      const endDate = event.endDate;
      
      // Check if the day falls between start and end dates (inclusive)
      return (startDate <= dateString && endDate >= dateString);
    });
    
    // Convert events to database format that EventCard component expects
    const formattedEvents = dayEvents.map(event => ({
      id: event.id,
      user_id: "00000000-0000-0000-0000-000000000000", // Default user ID for type safety
      name: event.name,
      description: event.description || null,
      start_date: event.startDate,
      start_time: event.startTime,
      end_date: event.endDate,
      end_time: event.endTime,
      location: event.location || null,
      recurring: event.recurring,
      tags: event.tags,
      created_at: event.createdAt,
      updated_at: event.createdAt || new Date().toISOString()
    }));
    
    return { tasks: dayTasks, events: formattedEvents };
  };
  
  // Handle date click
  const handleDateClick = (day: Date) => {
    setSelectedDate(day);
  };
  
  return (
    <div className="bg-white dark:bg-gray-900 rounded-lg shadow overflow-hidden">
      {/* Days of week header */}
      <div className="grid grid-cols-7 border-b dark:border-gray-700">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day, index) => (
          <div key={index} className="p-2 text-center text-gray-500 dark:text-gray-400 text-sm font-medium">
            {day}
          </div>
        ))}
      </div>
      
      {/* Calendar grid */}
      <div className="grid grid-cols-7 auto-rows-fr">
        {calendarDays.map((day, index) => {
          const { tasks: dayTasks, events: dayEvents } = getItemsByDate(day);
          const isCurrentMonth = isSameMonth(day, date);
          const isCurrentDay = isToday(day);
          
          return (
            <div 
              key={index} 
              className={`
                min-h-[100px] border dark:border-gray-700 p-1 relative
                ${!isCurrentMonth ? 'bg-gray-50 dark:bg-gray-800 text-gray-400 dark:text-gray-600' : ''}
                ${isCurrentDay ? 'bg-blue-50 dark:bg-blue-900/20' : ''}
              `}
              onClick={() => handleDateClick(day)}
            >
              {/* Date number */}
              <div className={`
                text-right text-sm mb-1 font-medium
                ${isCurrentDay ? 'text-blue-600 dark:text-blue-400' : ''}
              `}>
                {format(day, 'd')}
              </div>
              
              {/* Tasks and events */}
              <div className="overflow-y-auto max-h-[80px]">
                {dayTasks.map(task => {
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
                  return <TaskCard key={task.id} task={dbTask} compact />;
                })}
                
                {dayEvents.map(event => {
                  // Events are already in the correct format after conversion in getItemsByDate
                  return <EventCard key={event.id} event={event} minimal />;
                })}
                
                {/* Indicator for more items than can be displayed */}
                {(dayTasks.length + dayEvents.length > 3) && (
                  <div className="text-xs text-center text-gray-500 dark:text-gray-400 mt-1">
                    +{dayTasks.length + dayEvents.length - 3} more
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