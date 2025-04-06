'use client';

import { useState, useEffect } from 'react';
import { Task } from '@/types/database';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { format, isAfter, isBefore, addDays, setHours, subDays, parseISO } from 'date-fns';

interface ProductivityInsightsProps {
  tasks: Task[];
  days?: number;
}

export function ProductivityInsights({ tasks, days = 30 }: ProductivityInsightsProps) {
  const [insights, setInsights] = useState<string[]>([]);
  
  useEffect(() => {
    // Generate insights based on task data
    const newInsights = generateInsights(tasks, days);
    setInsights(newInsights);
  }, [tasks, days]);
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base font-medium">Productivity Insights</CardTitle>
        <CardDescription>Based on your activity from the past {days} days</CardDescription>
      </CardHeader>
      <CardContent>
        <ul className="space-y-2">
          {insights.map((insight, index) => (
            <li key={index} className="flex items-start gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1.5 flex-shrink-0" />
              <span className="text-sm">{insight}</span>
            </li>
          ))}
          {insights.length === 0 && (
            <li className="text-sm text-gray-500">
              Complete more tasks to generate productivity insights.
            </li>
          )}
        </ul>
      </CardContent>
    </Card>
  );
}

/**
 * Generate insights based on task data
 */
function generateInsights(tasks: Task[], days: number): string[] {
  const insights: string[] = [];
  const today = new Date();
  const startDate = subDays(today, days);
  
  // Filter tasks to only those relevant for the time period
  const filteredTasks = tasks.filter(task => {
    const dueDate = new Date(task.due_date);
    // Include tasks that were due or completed in the period
    return (dueDate >= startDate && dueDate <= today) || 
           (task.completed && task.updated_at && new Date(task.updated_at) >= startDate);
  });
  
  if (filteredTasks.length === 0) {
    return insights; // Not enough data
  }
  
  // 1. Most productive day of week
  const dayCompletions: Record<number, number> = {0: 0, 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0};
  
  filteredTasks.forEach(task => {
    if (task.completed && task.updated_at) {
      const date = new Date(task.updated_at);
      const day = date.getDay();
      dayCompletions[day]++;
    }
  });
  
  const mostProductiveDay = Object.entries(dayCompletions)
    .sort((a, b) => b[1] - a[1])[0];
  
  if (parseInt(mostProductiveDay[0]) >= 0 && mostProductiveDay[1] > 0) {
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    insights.push(`Your most productive day is ${dayNames[parseInt(mostProductiveDay[0])]}.`);
  }
  
  // 2. Tasks completed in the period
  const totalCompleted = filteredTasks.filter(task => task.completed).length;
  if (totalCompleted > 0) {
    insights.push(`You completed ${totalCompleted} tasks in the past ${days} days.`);
    
    // 3. Calculate task completion rate
    const completionRate = Math.round((totalCompleted / filteredTasks.length) * 100);
    if (completionRate > 75) {
      insights.push(`Great job! You completed ${completionRate}% of your tasks.`);
    } else if (completionRate > 50) {
      insights.push(`You completed ${completionRate}% of your tasks. Keep up the momentum!`);
    } else if (completionRate > 0) {
      insights.push(`You completed ${completionRate}% of your tasks. Try breaking tasks into smaller chunks.`);
    }
    
    // 4. Count tasks completed on time vs. after due date
    const overdueTasks = filteredTasks.filter(task => {
      if (!task.completed) return false;
      const dueDate = new Date(task.due_date);
      const completedDate = new Date(task.updated_at);
      return isAfter(completedDate, dueDate);
    }).length;
    
    if (totalCompleted > 0) {
      const overduePercentage = Math.round((overdueTasks / totalCompleted) * 100);
      if (overduePercentage <= 20) {
        insights.push(`Excellent! You completed ${100 - overduePercentage}% of your tasks on time.`);
      } else if (overduePercentage <= 50) {
        insights.push(`You completed ${100 - overduePercentage}% of your tasks on time. Try scheduling more buffer time.`);
      } else {
        insights.push(`${overduePercentage}% of your tasks were completed after their due dates. Consider setting more realistic deadlines.`);
      }
    }
  }
  
  return insights;
}
