'use client';

import { useMemo } from 'react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';
import { format, eachDayOfInterval, startOfWeek, endOfWeek, isWithinInterval, parseISO, startOfMonth, endOfMonth, subMonths } from 'date-fns';
import { Task } from '@/types/database';

type TimeRange = 'week' | 'month' | 'quarter' | 'year';

interface ProductivityChartProps {
  tasks: Task[];
  timeRange: TimeRange;
}

export const ProductivityChart = ({ tasks, timeRange }: ProductivityChartProps) => {
  const chartData = useMemo(() => {
    let startDate;
    let endDate = new Date();
    let dateFormat: string;
    
    // Determine date range based on the selected timeRange
    switch (timeRange) {
      case 'week':
        startDate = startOfWeek(new Date());
        dateFormat = 'EEE'; // Mon, Tue, etc.
        break;
      case 'month':
        startDate = startOfMonth(new Date());
        dateFormat = 'd MMM'; // 1 Jan, 2 Jan, etc.
        break;
      case 'quarter':
        startDate = subMonths(new Date(), 3);
        dateFormat = 'd MMM'; // 1 Jan, 2 Jan, etc.
        break;
      case 'year':
        startDate = subMonths(new Date(), 12);
        dateFormat = 'MMM yyyy'; // Jan 2023, Feb 2023, etc.
        break;
      default:
        startDate = startOfMonth(new Date());
        dateFormat = 'd MMM';
    }
    
    // Generate dates within the date range
    const dates = eachDayOfInterval({ start: startDate, end: endDate });
    
    // For 'year' timeRange, get only the first day of each month
    const dataPoints = timeRange === 'year' 
      ? dates.filter(date => date.getDate() === 1) 
      : dates;

    return dataPoints.map(date => {
      // Filter tasks created or completed on this date
      const tasksCreated = tasks.filter(task => {
        const createdDate = task.created_at ? parseISO(task.created_at) : null;
        return createdDate && isWithinInterval(createdDate, { 
          start: new Date(date.setHours(0, 0, 0, 0)), 
          end: new Date(date.setHours(23, 59, 59, 999)) 
        });
      }).length;
      
      const tasksCompleted = tasks.filter(task => {
        const completedDate = task.completed_at ? parseISO(task.completed_at) : null;
        return completedDate && isWithinInterval(completedDate, { 
          start: new Date(date.setHours(0, 0, 0, 0)), 
          end: new Date(date.setHours(23, 59, 59, 999)) 
        });
      }).length;
      
      return {
        date: format(date, dateFormat),
        created: tasksCreated,
        completed: tasksCompleted,
        productivity: tasksCompleted > 0 ? tasksCompleted * 10 : 0
      };
    });
  }, [tasks, timeRange]);

  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart
        data={chartData}
        margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
      >
        <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
        <XAxis 
          dataKey="date" 
          tick={{ fontSize: 12, fill: '#6B7280' }}
          tickLine={false}
          axisLine={{ stroke: '#E5E7EB' }}
        />
        <YAxis 
          tick={{ fontSize: 12, fill: '#6B7280' }}
          tickLine={false}
          axisLine={{ stroke: '#E5E7EB' }}
          width={35}
        />
        <Tooltip 
          contentStyle={{ 
            backgroundColor: '#fff', 
            borderRadius: '8px', 
            border: '1px solid #E5E7EB',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
          }}
          itemStyle={{ padding: '2px 0' }}
        />
        <defs>
          <linearGradient id="colorCreated" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.2}/>
            <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
          </linearGradient>
          <linearGradient id="colorCompleted" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#10B981" stopOpacity={0.2}/>
            <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
          </linearGradient>
        </defs>
        <Area
          type="monotone"
          dataKey="created"
          name="Tasks Created"
          stroke="#3B82F6"
          strokeWidth={2}
          fillOpacity={1}
          fill="url(#colorCreated)"
        />
        <Area
          type="monotone"
          dataKey="completed"
          name="Tasks Completed"
          stroke="#10B981"
          strokeWidth={2}
          fillOpacity={1}
          fill="url(#colorCompleted)"
        />
      </AreaChart>
    </ResponsiveContainer>
  );
};

export default ProductivityChart;
