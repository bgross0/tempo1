'use client';

import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ProductivityScore } from '@/components/analytics/ProductivityScore';
import { TaskCompletionChart } from '@/components/analytics/TaskCompletionChart';
import { TimeAllocationChart } from '@/components/analytics/TimeAllocationChart';
import { useTasksRealtime } from '@/hooks/api/useTasksRealtime';
import { useProjectsRealtime } from '@/hooks/api/useProjectsRealtime';
import { Check, Clock, Calendar } from 'lucide-react';
import { format, startOfWeek, endOfWeek, addDays, addMonths, startOfMonth, endOfMonth } from 'date-fns';

export default function AnalyticsPage() {
  const [period, setPeriod] = useState<'week' | 'month'>('week');
  const { tasks } = useTasksRealtime();
  const { projects } = useProjectsRealtime();
  
  // Calculate date range
  const today = new Date();
  const weekStart = startOfWeek(today, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(today, { weekStartsOn: 1 });
  const monthStart = startOfMonth(today);
  const monthEnd = endOfMonth(today);
  
  // Calculate analytics metrics
  const completedTasksCount = tasks.filter(task => 
    task.completed && 
    new Date(task.completed_at as string) >= (period === 'week' ? weekStart : monthStart)
  ).length;
  
  const totalTimeSpent = tasks
    .filter(task => 
      task.completed && 
      new Date(task.completed_at as string) >= (period === 'week' ? weekStart : monthStart)
    )
    .reduce((total, task) => total + (task.duration || 0), 0);
  
  const overdueTasks = tasks.filter(task => 
    !task.completed && 
    new Date(task.due_date) < today
  ).length;
  
  // Format total time
  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };
  
  return (
    <div className="p-4 md:p-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <h1 className="text-2xl font-bold">Analytics & Insights</h1>
        
        <Tabs
          value={period}
          onValueChange={(v) => setPeriod(v as 'week' | 'month')}
          className="w-full md:w-auto mt-4 md:mt-0"
        >
          <TabsList>
            <TabsTrigger value="week">This Week</TabsTrigger>
            <TabsTrigger value="month">This Month</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>
      
      <div className="text-sm text-gray-500 dark:text-gray-400 mb-6">
        {period === 'week' 
          ? `${format(weekStart, 'MMMM d')} - ${format(weekEnd, 'MMMM d, yyyy')}`
          : `${format(monthStart, 'MMMM d')} - ${format(monthEnd, 'MMMM d, yyyy')}`
        }
      </div>
      
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Tasks Completed
            </CardTitle>
            <Check className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{completedTasksCount}</div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              {period === 'week' ? 'This week' : 'This month'}
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Time Spent
            </CardTitle>
            <Clock className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatTime(totalTimeSpent)}</div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              {period === 'week' ? 'This week' : 'This month'}
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Overdue Tasks
            </CardTitle>
            <Calendar className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{overdueTasks}</div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Currently overdue
            </p>
          </CardContent>
        </Card>
      </div>
      
      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <TaskCompletionChart 
            tasks={tasks} 
            days={period === 'week' ? 7 : 30} 
          />
        </div>
        <div>
          <ProductivityScore 
            tasks={tasks} 
            days={period === 'week' ? 7 : 30} 
          />
        </div>
        <div className="lg:col-span-3">
          <TimeAllocationChart 
            tasks={tasks} 
            projects={projects} 
            period={period} 
          />
        </div>
      </div>
    </div>
  );
}
