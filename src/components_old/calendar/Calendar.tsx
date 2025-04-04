import React from 'react';
import { useAppStore } from '@/lib/store';
import DayView from '@/components/calendar/DayView';
import WeekView from '@/components/calendar/WeekView';
import MonthView from '@/components/calendar/MonthView';
import { addDays, addMonths, addWeeks, format, subDays, subMonths, subWeeks } from 'date-fns';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, MoreHorizontal } from 'lucide-react';

export default function Calendar() {
  const { 
    calendarView, 
    currentDate, 
    setCalendarView, 
    setCurrentDate
  } = useAppStore();

  // Handle navigation
  const handlePrevious = () => {
    switch (calendarView) {
      case 'day':
        setCurrentDate(subDays(currentDate, 1));
        break;
      case 'week':
        setCurrentDate(subWeeks(currentDate, 1));
        break;
      case 'month':
        setCurrentDate(subMonths(currentDate, 1));
        break;
    }
  };

  const handleNext = () => {
    switch (calendarView) {
      case 'day':
        setCurrentDate(addDays(currentDate, 1));
        break;
      case 'week':
        setCurrentDate(addWeeks(currentDate, 1));
        break;
      case 'month':
        setCurrentDate(addMonths(currentDate, 1));
        break;
    }
  };

  const handleToday = () => {
    setCurrentDate(new Date());
  };

  // Format title based on current view
  const getHeaderTitle = () => {
    switch (calendarView) {
      case 'day':
        return format(currentDate, 'MMMM d, yyyy');
      case 'week':
        return `Week of ${format(currentDate, 'MMMM d, yyyy')}`;
      case 'month':
        return format(currentDate, 'MMMM yyyy');
      default:
        return '';
    }
  };

  return (
    <div className="flex flex-col h-full bg-white dark:bg-gray-900 rounded-lg shadow overflow-hidden">
      {/* Calendar header */}
      <div className="flex justify-between items-center p-4 border-b dark:border-gray-700">
        <div className="flex items-center space-x-4">
          <button 
            onClick={handleToday}
            className="px-4 py-2 text-sm bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 rounded-md hover:bg-blue-200 dark:hover:bg-blue-800 transition"
          >
            Today
          </button>
          
          <div className="flex items-center space-x-2">
            <button 
              onClick={handlePrevious}
              className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button 
              onClick={handleNext}
              className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
          
          <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200">
            {getHeaderTitle()}
          </h2>
        </div>
        
        <div className="flex items-center space-x-2">
          <div className="inline-flex rounded-md shadow-sm">
            <button
              onClick={() => setCalendarView('day')}
              className={`px-4 py-2 text-sm font-medium border border-gray-300 dark:border-gray-600 rounded-l-md ${
                calendarView === 'day' 
                  ? 'bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300' 
                  : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              Day
            </button>
            <button
              onClick={() => setCalendarView('week')}
              className={`px-4 py-2 text-sm font-medium border-t border-b border-gray-300 dark:border-gray-600 ${
                calendarView === 'week' 
                  ? 'bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300' 
                  : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              Week
            </button>
            <button
              onClick={() => setCalendarView('month')}
              className={`px-4 py-2 text-sm font-medium border border-gray-300 dark:border-gray-600 rounded-r-md ${
                calendarView === 'month' 
                  ? 'bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300' 
                  : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              Month
            </button>
          </div>
          
          <button className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700">
            <MoreHorizontal className="w-5 h-5" />
          </button>
        </div>
      </div>
      
      {/* Calendar content */}
      <div className="flex-1 overflow-auto">
        {calendarView === 'day' && <DayView date={currentDate} />}
        {calendarView === 'week' && <WeekView date={currentDate} />}
        {calendarView === 'month' && <MonthView date={currentDate} />}
      </div>
    </div>
  );
}