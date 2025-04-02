'use client';

import { useState } from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  Plus, 
  Calendar as CalendarIcon,
  Clock
} from 'lucide-react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths } from 'date-fns';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useTasksRealtime } from '@/hooks/api/useTasksRealtime';
import { Task } from '@/types/database';

export default function CalendarPage() {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [viewMode, setViewMode] = useState<'month' | 'week' | 'day'>('month');
  
  const { tasks } = useTasksRealtime();

  // Calendar navigation
  const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
  const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));
  const goToToday = () => setCurrentMonth(new Date());

  // Get days of the month
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

  // Get tasks for a specific day
  const getTasksForDay = (day: Date): Task[] => {
    return tasks.filter(task => {
      const taskDate = new Date(task.due_date);
      return isSameDay(taskDate, day);
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Calendar</h1>
          <p className="text-gray-500">
            {format(currentMonth, 'MMMM yyyy')}
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <div className="bg-white border rounded-md p-1 flex">
            <Button 
              variant={viewMode === 'month' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('month')}
              className="text-xs px-2"
            >
              Month
            </Button>
            <Button 
              variant={viewMode === 'week' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('week')}
              className="text-xs px-2"
            >
              Week
            </Button>
            <Button 
              variant={viewMode === 'day' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('day')}
              className="text-xs px-2"
            >
              Day
            </Button>
          </div>
          
          <div className="flex gap-1">
            <Button variant="outline" size="icon" onClick={prevMonth}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={goToToday}>
              Today
            </Button>
            <Button variant="outline" size="icon" onClick={nextMonth}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
          
          <Button onClick={() => console.log('Create event')}>
            <Plus className="h-4 w-4 mr-1" />
            Add Event
          </Button>
        </div>
      </div>
      
      {viewMode === 'month' && (
        <Card>
          <CardContent className="p-4">
            {/* Month view header - Days of week */}
            <div className="grid grid-cols-7 gap-px bg-gray-200">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                <div key={day} className="bg-white p-2 text-center text-sm font-medium">
                  {day}
                </div>
              ))}
            </div>
            
            {/* Month view grid */}
            <div className="grid grid-cols-7 gap-px bg-gray-200">
              {/* Fill in leading empty cells for days of previous month */}
              {Array.from({ length: new Date(monthStart).getDay() }).map((_, i) => (
                <div key={`empty-start-${i}`} className="bg-gray-50 min-h-24 p-2" />
              ))}
              
              {/* Days of the current month */}
              {daysInMonth.map((day) => {
                const dayTasks = getTasksForDay(day);
                const isToday = isSameDay(day, new Date());
                
                return (
                  <div 
                    key={day.toISOString()} 
                    className={`bg-white min-h-24 p-2 ${isToday ? 'ring-2 ring-blue-500 ring-inset' : ''}`}
                  >
                    <div className="flex justify-between items-center">
                      <span className={`text-sm font-medium ${isToday ? 'text-blue-600' : ''}`}>
                        {format(day, 'd')}
                      </span>
                      {dayTasks.length > 0 && (
                        <span className="text-xs bg-blue-100 text-blue-800 px-1.5 py-0.5 rounded-full">
                          {dayTasks.length}
                        </span>
                      )}
                    </div>
                    
                    <div className="mt-1 space-y-1 max-h-20 overflow-y-auto">
                      {dayTasks.slice(0, 3).map((task) => (
                        <div 
                          key={task.id} 
                          className={`text-xs px-2 py-1 rounded truncate ${
                            task.priority === 'high' 
                              ? 'bg-red-100 text-red-800' 
                              : task.priority === 'medium'
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-green-100 text-green-800'
                          }`}
                        >
                          {task.name}
                        </div>
                      ))}
                      {dayTasks.length > 3 && (
                        <div className="text-xs text-gray-500 px-2">
                          +{dayTasks.length - 3} more
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
              
              {/* Fill in trailing empty cells for days of next month */}
              {Array.from({ 
                length: 7 - ((daysInMonth.length + new Date(monthStart).getDay()) % 7 || 7)
              }).map((_, i) => (
                <div key={`empty-end-${i}`} className="bg-gray-50 min-h-24 p-2" />
              ))}
            </div>
          </CardContent>
        </Card>
      )}
      
      {viewMode === 'week' && (
        <Card>
          <CardContent className="p-4">
            <p className="text-center py-12">Week view to be implemented</p>
          </CardContent>
        </Card>
      )}
      
      {viewMode === 'day' && (
        <Card>
          <CardContent className="p-4">
            <p className="text-center py-12">Day view to be implemented</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
