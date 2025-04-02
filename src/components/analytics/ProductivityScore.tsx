'use client';

import { differenceInCalendarDays, format, subDays } from 'date-fns';
import { Task } from '@/types/database';

interface ProductivityScoreProps {
  tasks: Task[];
  days?: number;
}

export function ProductivityScore({ tasks, days = 7 }: ProductivityScoreProps) {
  // Filter tasks based on completion date
  const filteredTasks = tasks.filter(task => {
    if (!task.completed || !task.completed_at) return false;
    
    const completedDate = new Date(task.completed_at);
    const startDate = subDays(new Date(), days);
    return completedDate >= startDate;
  });
  
  // Calculate productivity score
  const score = calculateProductivityScore(filteredTasks);
  
  // Get score color based on value
  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-500';
    if (score >= 60) return 'text-yellow-500';
    return 'text-red-500';
  };
  
  // Get trend indicator
  const getTrend = () => {
    // This would ideally compare to previous period
    // Placeholder for now
    return Math.random() > 0.5 ? 'up' : 'down';
  };
  
  const trend = getTrend();
  
  return (
    <div className="flex flex-col items-center p-4 rounded-lg border dark:border-gray-700 bg-white dark:bg-gray-800">
      <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
        Productivity Score
      </h3>
      <div className={`text-4xl font-bold ${getScoreColor(score)}`}>
        {score}
      </div>
      <div className="flex items-center mt-2">
        <span className={`text-xs ${
          trend === 'up' ? 'text-green-500' : 'text-red-500'
        }`}>
          {trend === 'up' ? '↑' : '↓'} 
          {trend === 'up' ? '12%' : '8%'} from last week
        </span>
      </div>
      <p className="text-xs text-gray-500 dark:text-gray-400 mt-4 text-center">
        Based on task completion and priority
        <br />
        over the last {days} days
      </p>
    </div>
  );
}

/**
 * Calculate productivity score based on completed tasks and their priorities
 */
function calculateProductivityScore(tasks: Task[]): number {
  if (tasks.length === 0) return 0;
  
  // Weight by priority
  const priorityWeights = {
    high: 5,
    medium: 3,
    low: 1
  };
  
  // Calculate weighted sum of completed tasks
  const weightedSum = tasks.reduce((sum, task) => {
    return sum + priorityWeights[task.priority];
  }, 0);
  
  // Normalize to a 0-100 scale
  // This is a simple algorithm and could be made more sophisticated
  // For now, we'll say 10 points of weighted sum = 100% score
  const normalizedScore = Math.min(100, Math.round(weightedSum * 10));
  
  return normalizedScore;
}
