'use client';

import { useState, useEffect } from 'react';
import { Task } from '@/types/database';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { format, subDays, eachDayOfInterval, isAfter, isBefore, differenceInDays } from 'date-fns';
import { ChevronDown, ChevronUp, Lightbulb, Sparkles } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface ProductivityInsightsProps {
  tasks: Task[];
  period?: 'week' | 'month';
}

export function ProductivityInsights({ tasks, period = 'week' }: ProductivityInsightsProps) {
  const [insights, setInsights] = useState<string[]>([]);
  const [mostProductiveDay, setMostProductiveDay] = useState<string | null>(null);
  const [tasksOverTime, setTasksOverTime] = useState<any[]>([]);
  const [showAllInsights, setShowAllInsights] = useState(false);

  useEffect(() => {
    // Calculate days to look back based on period
    const daysToLookBack = period === 'week' ? 7 : 30;
    
    // Generate date range for analysis
    const today = new Date();
    const startDate = subDays(today, daysToLookBack - 1);
    
    const dateRange = eachDayOfInterval({
      start: startDate,
      end: today
    });
    
    // Generate tasks over time data
    const taskData = dateRange.map(date => {
      const dateStr = format(date, 'yyyy-MM-dd');
      
      // Count completed tasks for this date
      const completedCount = tasks.filter(task => {
        if (!task.completed || !task.completed_at) return false;
        return format(new Date(task.completed_at), 'yyyy-MM-dd') === dateStr;
      }).length;
      
      // Count created tasks for this date
      const createdCount = tasks.filter(task => {
        const createdDate = new Date(task.created_at);
        return format(createdDate, 'yyyy-MM-dd') === dateStr;
      }).length;
      
      return {
        date: dateStr,
        day: format(date, 'EEE'),
        completed: completedCount,
        created: createdCount
      };
    });
    
    setTasksOverTime(taskData);
    
    // Find most productive day
    const mostProductiveIndex = taskData.reduce((maxIndex, current, index, array) => {
      return current.completed > array[maxIndex].completed ? index : maxIndex;
    }, 0);
    
    if (taskData[mostProductiveIndex].completed > 0) {
      const mostProductiveDate = dateRange[mostProductiveIndex];
      setMostProductiveDay(format(mostProductiveDate, 'EEEE'));
    } else {
      setMostProductiveDay(null);
    }
    
    // Generate productivity insights
    const newInsights: string[] = [];
    
    // 1. Completion rate
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(task => task.completed).length;
    const completionRate = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;
    newInsights.push(`Your overall task completion rate is ${completionRate.toFixed(0)}%.`);
    
    // 2. Priority distribution insights
    const highPriorityCompleted = tasks.filter(task => task.completed && task.priority === 'high').length;
    const highPriorityTotal = tasks.filter(task => task.priority === 'high').length;
    const highPriorityRate = highPriorityTotal > 0 ? (highPriorityCompleted / highPriorityTotal) * 100 : 0;
    
    if (highPriorityRate > 70) {
      newInsights.push(`Great job! You've completed ${highPriorityRate.toFixed(0)}% of your high priority tasks.`);
    } else if (highPriorityRate < 30 && highPriorityTotal > 0) {
      newInsights.push(`Try to focus more on high priority tasks. You've only completed ${highPriorityRate.toFixed(0)}% of them.`);
    }
    
    // 3. Recent productivity trend
    const recentDays = taskData.slice(-3);
    const recentCompletedTotal = recentDays.reduce((sum, day) => sum + day.completed, 0);
    const previousDays = taskData.slice(-6, -3);
    const previousCompletedTotal = previousDays.reduce((sum, day) => sum + day.completed, 0);
    
    if (recentCompletedTotal > previousCompletedTotal * 1.5) {
      newInsights.push('Your productivity has increased significantly in the last few days. Keep up the good work!');
    } else if (recentCompletedTotal < previousCompletedTotal * 0.5 && previousCompletedTotal > 0) {
      newInsights.push('Your productivity has dropped recently. Consider reviewing your task management approach.');
    }
    
    // 4. On-time completion
    const overdueTasks = tasks.filter(task => {
      if (!task.completed) return false;
      const dueDate = new Date(task.due_date);
      const completedDate = new Date(task.completed_at as string);
      return isAfter(completedDate, dueDate);
    }).length;
    
    const onTimeCompletionRate = completedTasks > 0 ? ((completedTasks - overdueTasks) / completedTasks) * 100 : 0;
    if (onTimeCompletionRate > 80) {
      newInsights.push(`Excellent time management! You complete ${onTimeCompletionRate.toFixed(0)}% of your tasks on time.`);
    } else if (onTimeCompletionRate < 50 && completedTasks > 5) {
      newInsights.push(`You might benefit from better time estimation. Only ${onTimeCompletionRate.toFixed(0)}% of your tasks are completed before their due dates.`);
    }
    
    // 5. Most productive time of day (if time data is available)
    const morningTasks = tasks.filter(task => task.completed && task.completed_at && new Date(task.completed_at).getHours() < 12).length;
    const afternoonTasks = tasks.filter(task => task.completed && task.completed_at && new Date(task.completed_at).getHours() >= 12 && new Date(task.completed_at).getHours() < 17).length;
    const eveningTasks = tasks.filter(task => task.completed && task.completed_at && new Date(task.completed_at).getHours() >= 17).length;
    
    if (morningTasks > afternoonTasks && morningTasks > eveningTasks) {
      newInsights.push('You tend to be most productive in the morning. Consider scheduling important tasks during this time.');
    } else if (afternoonTasks > morningTasks && afternoonTasks > eveningTasks) {
      newInsights.push('You tend to be most productive in the afternoon. Consider scheduling important tasks during this time.');
    } else if (eveningTasks > morningTasks && eveningTasks > afternoonTasks) {
      newInsights.push('You tend to be most productive in the evening. Consider scheduling important tasks during this time.');
    }
    
    setInsights(newInsights);
  }, [tasks, period]);

  if (tasks.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6 text-center">
          <Lightbulb className="w-10 h-10 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium">No task data available</h3>
          <p className="text-sm text-muted-foreground mt-2">
            Complete some tasks to see productivity insights
          </p>
        </CardContent>
      </Card>
    );
  }

  // Custom tooltip for the chart
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-gray-800 p-2 border rounded shadow-sm">
          <p className="text-sm font-medium">{format(new Date(label), 'MMM d, EEE')}</p>
          <p className="text-xs text-green-600">
            Completed: {payload[0].value}
          </p>
          <p className="text-xs text-blue-600">
            Created: {payload[1].value}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Productivity Insights</CardTitle>
            <CardDescription className="mt-1">
              Analysis based on your task completion patterns
            </CardDescription>
          </div>
          <Sparkles className="h-5 w-5 text-primary" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Productivity chart */}
          <div className="h-60">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={tasksOverTime}
                margin={{ top: 20, right: 10, left: -20, bottom: 5 }}
              >
                <XAxis 
                  dataKey="day" 
                  tick={{ fontSize: 12 }} 
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis 
                  allowDecimals={false}
                  tick={{ fontSize: 12 }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Bar 
                  dataKey="completed" 
                  name="Completed"
                  fill="#22c55e" 
                  radius={[4, 4, 0, 0]}
                  maxBarSize={40}
                />
                <Bar 
                  dataKey="created" 
                  name="Created"
                  fill="#3b82f6" 
                  radius={[4, 4, 0, 0]}
                  maxBarSize={40}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
          
          {/* Key metrics */}
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="bg-muted/30 p-3 rounded-md">
              <div className="text-sm text-muted-foreground">Most Productive Day</div>
              <div className="font-medium mt-1">
                {mostProductiveDay || 'Insufficient data'}
              </div>
            </div>
            <div className="bg-muted/30 p-3 rounded-md">
              <div className="text-sm text-muted-foreground">Avg. Tasks/Day</div>
              <div className="font-medium mt-1">
                {(tasksOverTime.reduce((sum, day) => sum + day.completed, 0) / tasksOverTime.length).toFixed(1)}
              </div>
            </div>
          </div>
          
          {/* Insights */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Lightbulb className="h-4 w-4 text-amber-500" />
              <h3 className="text-sm font-medium">Smart Insights</h3>
            </div>
            <ul className="space-y-2 text-sm">
              {insights.slice(0, showAllInsights ? insights.length : 3).map((insight, index) => (
                <li key={index} className="flex gap-2 items-start">
                  <Badge variant="outline" className="mt-0.5 h-5 w-5 rounded-full p-0 flex items-center justify-center">
                    {index + 1}
                  </Badge>
                  <span className="text-muted-foreground">{insight}</span>
                </li>
              ))}
            </ul>
            
            {insights.length > 3 && (
              <button
                onClick={() => setShowAllInsights(!showAllInsights)}
                className="text-xs text-primary flex items-center mt-2"
              >
                {showAllInsights ? (
                  <>Show less <ChevronUp className="h-3 w-3 ml-1" /></>
                ) : (
                  <>Show more <ChevronDown className="h-3 w-3 ml-1" /></>
                )}
              </button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}