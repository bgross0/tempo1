'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Task } from '@/types/database';

interface CalendarWidgetProps {
  tasks: Task[];
}

export default function CalendarWidget({ tasks }: CalendarWidgetProps) {
  const [currentMonth, setCurrentMonth] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });

  // Calculate the month and year
  const monthYearString = currentMonth.toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  });

  // Previous month
  const goToPreviousMonth = () => {
    setCurrentMonth(prev => {
      const prevMonth = new Date(prev);
      prevMonth.setMonth(prevMonth.getMonth() - 1);
      return prevMonth;
    });
  };

  // Next month
  const goToNextMonth = () => {
    setCurrentMonth(prev => {
      const nextMonth = new Date(prev);
      nextMonth.setMonth(nextMonth.getMonth() + 1);
      return nextMonth;
    });
  };

  // Calculate days for the current month view
  const calendarDays = useMemo(() => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    
    // First day of the month
    const firstDay = new Date(year, month, 1);
    // Last day of the month
    const lastDay = new Date(year, month + 1, 0);
    
    // Day of week for the first day (0 = Sunday, 6 = Saturday)
    const firstDayOfWeek = firstDay.getDay();
    
    // Total days in the month
    const daysInMonth = lastDay.getDate();
    
    // Create calendar grid including padding days
    const days = [];
    
    // Add padding for days from previous month
    for (let i = 0; i < firstDayOfWeek; i++) {
      days.push({ day: null, isCurrentMonth: false });
    }
    
    // Add days of current month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      
      // Check if there are tasks due on this day
      const dayTasks = tasks.filter(task => {
        const taskDate = new Date(task.due_date);
        return (
          taskDate.getFullYear() === date.getFullYear() &&
          taskDate.getMonth() === date.getMonth() &&
          taskDate.getDate() === date.getDate()
        );
      });
      
      days.push({
        day,
        isCurrentMonth: true,
        date,
        tasks: dayTasks,
        hasCompletedTasks: dayTasks.some(task => task.completed),
        hasIncompleteTasks: dayTasks.some(task => !task.completed)
      });
    }
    
    // Fill remaining grid cells with days from next month
    const totalCells = Math.ceil(days.length / 7) * 7;
    for (let i = days.length; i < totalCells; i++) {
      days.push({ day: null, isCurrentMonth: false });
    }
    
    return days;
  }, [currentMonth, tasks]);
  
  // Get today's date for highlighting
  const today = new Date();
  const isToday = (date?: Date) => {
    if (!date) return false;
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  };

  return (
    <Card className="h-full">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-md font-medium flex items-center">
          <CalendarIcon className="h-4 w-4 mr-2" />
          Calendar
        </CardTitle>
        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="sm"
            className="h-7 w-7 p-0"
            onClick={goToPreviousMonth}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-sm font-medium">{monthYearString}</span>
          <Button
            variant="ghost"
            size="sm"
            className="h-7 w-7 p-0"
            onClick={goToNextMonth}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-7 gap-1 text-center">
          {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, index) => (
            <div key={index} className="text-xs text-gray-500 font-medium">
              {day}
            </div>
          ))}
          
          {calendarDays.map((dayData, index) => (
            <div key={index} className="aspect-square relative">
              {dayData.isCurrentMonth ? (
                <Link href={`/calendar?date=${dayData.date?.toISOString().split('T')[0]}`}>
                  <div
                    className={`
                      h-full w-full flex flex-col items-center justify-center text-xs rounded-md
                      ${isToday(dayData.date) ? 'bg-blue-100 text-blue-900' : 'hover:bg-gray-50'}
                      ${dayData.hasIncompleteTasks ? 'font-bold' : ''}
                    `}
                  >
                    {dayData.day}
                    {dayData.tasks && dayData.tasks.length > 0 && (
                      <div className="mt-1 flex space-x-0.5">
                        {dayData.hasIncompleteTasks && (
                          <div className="h-1 w-1 rounded-full bg-red-500"></div>
                        )}
                        {dayData.hasCompletedTasks && (
                          <div className="h-1 w-1 rounded-full bg-green-500"></div>
                        )}
                      </div>
                    )}
                  </div>
                </Link>
              ) : (
                <div className="h-full w-full flex items-center justify-center text-xs text-gray-300">
                  {dayData.day}
                </div>
              )}
            </div>
          ))}
        </div>
        
        <div className="flex justify-center mt-3">
          <Button asChild variant="outline" size="sm" className="text-xs">
            <Link href="/calendar">
              View Full Calendar
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}