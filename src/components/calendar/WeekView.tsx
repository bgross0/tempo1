// src/components/calendar/WeekView.tsx
import { useState, useEffect } from 'react';
import { format, addDays, startOfWeek } from 'date-fns';
import { useAppStore } from '@/lib/store';
import TaskCard from '@/components/dashboard/TaskCard';
import { Task as StoreTask, Event as StoreEvent } from '@/types';
import { Task as DatabaseTask, Event as DatabaseEvent } from '@/types/database';
import EventCard from '@/components/events/EventCard';

interface WeekViewProps {
  date: Date;
}

export default function WeekView({ date }: WeekViewProps) {
  const { tasks, events } = useAppStore();
  const [weekDates, setWeekDates] = useState<Date[]>([]);
  
  useEffect(() => {
    // Get the dates for the current week (Monday to Sunday)
    const start = startOfWeek(date, { weekStartsOn: 1 });
    const dates = Array.from({ length: 7 }, (_, i) => addDays(start, i));
    setWeekDates(dates);
  }, [date]);
  
  // Working hours
  const workingHours = Array.from({ length: 9 }, (_, i) => i + 9); // 9 AM to 5 PM
  
  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="grid grid-cols-8 border-b">
        {/* Time column header */}
        <div className="p-2 text-center text-gray-500 text-sm font-medium border-r">Time</div>
        
        {/* Day headers */}
        {weekDates.map((day, index) => (
          <div
            key={index}
            className={`p-2 text-center font-medium ${
              day.toDateString() === new Date().toDateString() ? 'bg-primary-light text-primary' : ''
            }`}
          >
            <div>{format(day, 'EEE')}</div>
            <div>{format(day, 'd MMM')}</div>
          </div>
        ))}
      </div>
      
      {/* Time slots */}
      <div className="relative">
        {workingHours.map((hour) => (
          <div key={hour} className="grid grid-cols-8 border-b">
            {/* Time label */}
            <div className="p-2 text-center text-gray-500 text-sm border-r">
              {hour}:00
            </div>
            
            {/* Hour slots for each day */}
            {weekDates.map((day, dayIndex) => {
              const dateString = format(day, 'yyyy-MM-dd');
              
              // Find tasks scheduled for this hour on this day
              const scheduledTasks = tasks.filter(task => {
                if (!task.scheduledBlocks) return false;
                
                return task.scheduledBlocks.some(block => {
                  if (block.date !== dateString) return false;
                  
                  const [blockHour] = block.startTime.split(':').map(Number);
                  return blockHour === hour;
                });
              });
              
              // Find events scheduled for this hour on this day
              const scheduledEvents = events.filter(event => {
                if (event.startDate !== dateString) return false;
                
                const [eventHour] = event.startTime.split(':').map(Number);
                return eventHour === hour;
              });
              
              return (
                <div 
                  key={dayIndex} 
                  className="p-1 min-h-[60px] border-r relative"
                  data-date={dateString}
                  data-hour={hour}
                >
                  {scheduledTasks.map(task => {
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
                  
                  {scheduledEvents.map(event => {
                    // Convert from store event type to database event type
                    const dbEvent: DatabaseEvent = {
                      id: event.id,
                      user_id: "",
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
                      updated_at: event.createdAt
                    };
                    return <EventCard key={event.id} event={dbEvent} />;
                  })}
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}