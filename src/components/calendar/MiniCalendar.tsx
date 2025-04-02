import React, { useState, useEffect } from 'react';
import { format, addMonths, subMonths, startOfMonth, endOfMonth, isSameMonth, isToday, parseISO, isSameDay } from 'date-fns';
import { getDay, addDays } from 'date-fns';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useAppStore } from '@/lib/store';

export default function MiniCalendar() {
  const { 
    miniCalendarDate, 
    setMiniCalendarDate, 
    selectedDate,
    setSelectedDate,
    tasks,
    events
  } = useAppStore();
  
  const [currentMonth, setCurrentMonth] = useState(miniCalendarDate);
  const [calendarDays, setCalendarDays] = useState<Date[]>([]);
  
  // Update days when month changes
  useEffect(() => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(monthStart);
    const startDate = addDays(monthStart, -getDay(monthStart)); // Start from Sunday
    
    const days: Date[] = [];
    let day = startDate;
    
    // Create array for calendar (6 weeks)
    for (let i = 0; i < 42; i++) {
      days.push(day);
      day = addDays(day, 1);
    }
    
    setCalendarDays(days);
    setMiniCalendarDate(currentMonth);
  }, [currentMonth, setMiniCalendarDate]);
  
  // Handle navigation
  const prevMonth = () => {
    setCurrentMonth(subMonths(currentMonth, 1));
  };
  
  const nextMonth = () => {
    setCurrentMonth(addMonths(currentMonth, 1));
  };
  
  // Handle date selection
  const onDateClick = (day: Date) => {
    setSelectedDate(day);
  };
  
  // Check if a date has events or tasks
  const hasItems = (day: Date) => {
    const dateString = format(day, 'yyyy-MM-dd');
    
    const hasTasks = tasks.some(task => 
      task.startDate === dateString || 
      task.dueDate === dateString ||
      (task.scheduledBlocks && task.scheduledBlocks.some(block => block.date === dateString))
    );
    
    const hasEvents = events.some(event => {
      const startDate = event.startDate;
      const endDate = event.endDate;
      return (startDate <= dateString && endDate >= dateString);
    });
    
    return hasTasks || hasEvents;
  };
  
  return (
    <div className="bg-white dark:bg-gray-900 rounded-lg shadow p-3">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
          {format(currentMonth, 'MMMM yyyy')}
        </h2>
        <div className="flex space-x-1">
          <button
            onClick={prevMonth}
            className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={nextMonth}
            className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
      
      <div className="grid grid-cols-7 gap-1 mb-1">
        {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, i) => (
          <div
            key={i}
            className="text-[10px] font-medium text-center text-gray-500 dark:text-gray-400"
          >
            {day}
          </div>
        ))}
      </div>
      
      <div className="grid grid-cols-7 gap-1">
        {calendarDays.map((day, i) => {
          const isCurrentMonth = isSameMonth(day, currentMonth);
          const isSelectedDay = isSameDay(day, selectedDate);
          const isCurrentDay = isToday(day);
          const dayHasItems = hasItems(day);
          
          return (
            <button
              key={i}
              className={`
                w-7 h-7 text-xs rounded-full flex items-center justify-center
                ${!isCurrentMonth ? 'text-gray-400 dark:text-gray-600' : 'text-gray-900 dark:text-gray-300'}
                ${isCurrentDay ? 'bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400' : ''}
                ${isSelectedDay ? 'bg-blue-500 text-white' : 'hover:bg-gray-200 dark:hover:bg-gray-700'}
                ${dayHasItems && !isSelectedDay && !isCurrentDay ? 'font-bold' : ''}
              `}
              onClick={() => onDateClick(day)}
            >
              {format(day, 'd')}
              {dayHasItems && !isSelectedDay && (
                <span className="absolute bottom-0 w-1 h-1 rounded-full bg-blue-500"></span>
              )}
            </button>
          );
        })}
      </div>
      
      <div className="mt-3 pt-3 border-t dark:border-gray-700">
        <button
          onClick={() => setSelectedDate(new Date())}
          className="w-full py-1 text-xs text-center text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded"
        >
          Today
        </button>
      </div>
    </div>
  );
}