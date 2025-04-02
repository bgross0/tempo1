// src/components/calendar/WeekView.tsx
import { useState, useEffect } from 'react';
import { format, addDays, startOfWeek } from 'date-fns';
import { useAppStore } from '@/lib/store';
import TaskCard from '@/components/tasks/TaskCard';
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
                  {scheduledTasks.map(task => (
                    <TaskCard key={task.id} task={task} />
                  ))}
                  
                  {scheduledEvents.map(event => (
                    <EventCard key={event.id} event={event} />
                  ))}
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}