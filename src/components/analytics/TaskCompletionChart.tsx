'use client';

import { useState } from 'react';
import { format, subDays, eachDayOfInterval } from 'date-fns';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { Task } from '@/types/database';

interface TaskCompletionChartProps {
  tasks: Task[];
  days?: number;
}

export function TaskCompletionChart({ tasks, days = 7 }: TaskCompletionChartProps) {
  const [hoveredBar, setHoveredBar] = useState<number | null>(null);
  
  // Generate data for chart
  const data = generateChartData(tasks, days);
  
  // Custom tooltip
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-gray-800 p-2 border dark:border-gray-700 shadow-md rounded">
          <p className="text-sm font-medium">{label}</p>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {`Tasks completed: ${payload[0].value}`}
          </p>
        </div>
      );
    }
    
    return null;
  };
  
  return (
    <div className="w-full h-72 p-4 rounded-lg border dark:border-gray-700 bg-white dark:bg-gray-800">
      <h3 className="text-base font-medium mb-4">Task Completion</h3>
      <ResponsiveContainer width="100%" height="90%">
        <BarChart
          data={data}
          margin={{ top: 10, right: 10, left: -25, bottom: 5 }}
          onMouseMove={(e: any) => {
            if (e.activeTooltipIndex !== hoveredBar) {
              setHoveredBar(e.activeTooltipIndex);
            }
          }}
          onMouseLeave={() => setHoveredBar(null)}
        >
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <XAxis 
            dataKey="day" 
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 12 }}
          />
          <YAxis 
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 12 }}
            allowDecimals={false}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(0, 0, 0, 0.05)' }} />
          <Bar 
            dataKey="completed" 
            fill="#3B82F6" 
            radius={[4, 4, 0, 0]}
            animationDuration={1000}
            maxBarSize={50}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

/**
 * Generate data for the chart
 */
function generateChartData(tasks: Task[], days: number) {
  const today = new Date();
  const startDate = subDays(today, days - 1);
  
  // Generate array of dates
  const dateRange = eachDayOfInterval({
    start: startDate,
    end: today
  });
  
  // Map dates to chart data format
  return dateRange.map(date => {
    const dateStr = format(date, 'yyyy-MM-dd');
    
    // Count completed tasks for this date
    const completedCount = tasks.filter(task => {
      if (!task.completed || !task.completed_at) return false;
      return format(new Date(task.completed_at), 'yyyy-MM-dd') === dateStr;
    }).length;
    
    return {
      date: dateStr,
      day: format(date, 'EEE'),
      completed: completedCount
    };
  });
}
