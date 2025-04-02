'use client';

import { useState } from 'react';
import { format, startOfWeek, endOfWeek, eachDayOfInterval, isSameDay, isToday } from 'date-fns';
import { ChevronLeft, ChevronRight } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

import { useTasks } from '@/hooks/api/useTasks';
import type { Task } from '@/types/database';

export function CalendarView() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState<'day' | 'week'>('week');
  
  const { tasks, isLoading, isError } = useTasks({});

  const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 }); // Start on Monday
  const weekEnd = endOfWeek(currentDate, { weekStartsOn: 1 });
  const daysOfWeek = eachDayOfInterval({ start: weekStart, end: weekEnd });

  const getTasksForDay = (date: Date): Task[] => {
    return tasks.filter(task => {
      const taskDate = new Date(task.due_date);
      return isSameDay(taskDate, date);
    });
  };

  const handlePrevious = () => {
    if (view === 'day') {
      const prevDay = new Date(currentDate);
      prevDay.setDate(prevDay.getDate() - 1);
      setCurrentDate(prevDay);
    } else {
      const prevWeek = new Date(currentDate);
      prevWeek.setDate(prevWeek.getDate() - 7);
      setCurrentDate(prevWeek);
    }
  };

  const handleNext = () => {
    if (view === 'day') {
      const nextDay = new Date(currentDate);
      nextDay.setDate(nextDay.getDate() + 1);
      setCurrentDate(nextDay);
    } else {
      const nextWeek = new Date(currentDate);
      nextWeek.setDate(nextWeek.getDate() + 7);
      setCurrentDate(nextWeek);
    }
  };

  const handleToday = () => {
    setCurrentDate(new Date());
  };

  if (isLoading) {
    return <div className="text-center py-8">Loading calendar...</div>;
  }

  if (isError) {
    return <div className="text-center py-8 text-red-500">Error loading calendar data</div>;
  }

  return (
    <div className="p-4">
      <div className="mb-6 flex justify-between items-center">
        <h1 className="text-2xl font-bold">Calendar</h1>
        <div className="flex gap-2">
          <div className="flex gap-2 mr-4">
            <Button
              variant={view === 'day' ? 'default' : 'outline'}
              onClick={() => setView('day')}
            >
              Day
            </Button>
            <Button
              variant={view === 'week' ? 'default' : 'outline'}
              onClick={() => setView('week')}
            >
              Week
            </Button>
          </div>
          <Button variant="outline" onClick={handlePrevious}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="outline" onClick={handleToday}>
            Today
          </Button>
          <Button variant="outline" onClick={handleNext}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {view === 'day' ? (
        <DayView 
          date={currentDate} 
          tasks={getTasksForDay(currentDate)} 
        />
      ) : (
        <WeekView 
          days={daysOfWeek} 
          tasks={tasks} 
          currentDate={currentDate} 
        />
      )}
    </div>
  );
}

interface DayViewProps {
  date: Date;
  tasks: Task[];
}

function DayView({ date, tasks }: DayViewProps) {
  const hours = Array.from({ length: 24 }, (_, i) => i);
  
  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-4 border-b">
        <h2 className="text-xl font-semibold">
          {format(date, 'EEEE, MMMM d, yyyy')}
        </h2>
      </div>
      <div className="divide-y">
        {hours.map((hour) => (
          <div key={hour} className="flex p-2 min-h-[80px]">
            <div className="w-20 text-right pr-4 text-sm text-gray-500">
              {format(new Date().setHours(hour, 0, 0, 0), 'h:mm a')}
            </div>
            <div className="flex-1 min-w-0">
              {tasks
                .filter(task => {
                  if (!task.due_time) return false;
                  const [taskHour] = task.due_time.split(':').map(Number);
                  return taskHour === hour;
                })
                .map(task => (
                  <div 
                    key={task.id}
                    className="p-2 mb-1 rounded bg-blue-100 border-l-4 border-blue-500"
                  >
                    <div className="font-medium">{task.name}</div>
                    {task.due_time && (
                      <div className="text-xs text-gray-500">
                        {task.due_time.substring(0, 5)}
                      </div>
                    )}
                  </div>
                ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

interface WeekViewProps {
  days: Date[];
  tasks: Task[];
  currentDate: Date;
}

function WeekView({ days, tasks, currentDate }: WeekViewProps) {
  return (
    <div className="grid grid-cols-7 gap-4">
      {days.map((day) => {
        const dayTasks = tasks.filter(task => {
          const taskDate = new Date(task.due_date);
          return isSameDay(taskDate, day);
        });
        
        const isCurrentDay = isToday(day);
        const isSelected = isSameDay(day, currentDate);
        
        return (
          <Card 
            key={day.toString()}
            className={`
              ${isCurrentDay ? 'border-blue-500 border-2' : ''}
              ${isSelected ? 'bg-blue-50' : ''}
            `}
          >
            <div className="p-2 text-center border-b font-medium">
              <div className="text-sm text-gray-500">
                {format(day, 'EEE')}
              </div>
              <div className={`text-xl ${isCurrentDay ? 'text-blue-600' : ''}`}>
                {format(day, 'd')}
              </div>
            </div>
            <CardContent className="p-2 max-h-[400px] overflow-y-auto">
              {dayTasks.length === 0 ? (
                <p className="text-center text-sm text-gray-500 py-2">No tasks</p>
              ) : (
                dayTasks.map(task => (
                  <div 
                    key={task.id}
                    className="p-2 mb-2 rounded bg-blue-100 border-l-2 border-blue-500 text-sm"
                  >
                    <div className="font-medium">{task.name}</div>
                    {task.due_time && (
                      <div className="text-xs text-gray-500">
                        {task.due_time.substring(0, 5)}
                      </div>
                    )}
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
