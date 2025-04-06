'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { differenceInCalendarDays, format, subDays } from 'date-fns';
import { Task } from '@/types/database';

interface ProductivityScoreProps {
  tasks: Task[];
  days?: number;
}

export function ProductivityScore({ tasks, days = 7 }: ProductivityScoreProps) {
  // Filter tasks based on completion date
  const filteredTasks = tasks.filter(task => {
    if (!task.completed) return false;
    
    // Get creation date from created_at
    const createdDate = new Date(task.created_at);
    const startDate = subDays(new Date(), days);
    return createdDate >= startDate;
  });
  
  // Calculate weighted score
  let totalScore = 0;
  filteredTasks.forEach(task => {
    // Base points for completion
    let points = 10;
    
    // Priority multiplier
    const priorityMultiplier = task.priority === 'high' 
      ? 1.5 
      : task.priority === 'medium' 
        ? 1.2 
        : 1;
    
    points *= priorityMultiplier;
    
    // Add to total
    totalScore += points;
  });
  
  // Normalize score (0-100)
  const normalizedScore = Math.min(100, Math.round(totalScore / 5));
  
  // Get description based on score
  const getScoreDescription = (score: number) => {
    if (score >= 80) return 'Excellent';
    if (score >= 60) return 'Good';
    if (score >= 40) return 'Average';
    if (score >= 20) return 'Needs Improvement';
    return 'Low Activity';
  };
  
  // Format period text
  const periodText = days === 7 
    ? 'Past Week' 
    : days === 30 
      ? 'Past Month' 
      : `Past ${days} Days`;

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-medium">Productivity Score</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-center">
          <div className="relative h-28 w-28 flex items-center justify-center">
            <svg viewBox="0 0 100 100" className="h-full w-full">
              {/* Background circle */}
              <circle
                cx="50"
                cy="50"
                r="45"
                fill="none"
                stroke="#e2e8f0"
                strokeWidth="10"
              />
              {/* Progress circle - stroke-dasharray is circumference, stroke-dashoffset is circumference - (circumference * progress) */}
              <circle
                cx="50"
                cy="50"
                r="45"
                fill="none"
                stroke={
                  normalizedScore >= 80 
                    ? '#10b981' 
                    : normalizedScore >= 60 
                      ? '#6366f1' 
                      : normalizedScore >= 40 
                        ? '#f59e0b' 
                        : '#ef4444'
                }
                strokeWidth="10"
                strokeDasharray="282.7"
                strokeDashoffset={282.7 * (1 - normalizedScore / 100)}
                strokeLinecap="round"
                transform="rotate(-90 50 50)"
              />
            </svg>
            <div className="absolute flex flex-col items-center justify-center">
              <span className="text-3xl font-bold">{normalizedScore}</span>
              <span className="text-xs text-gray-500">/100</span>
            </div>
          </div>
        </div>
        
        <div className="mt-3 text-center">
          <p className="text-sm font-semibold">
            {getScoreDescription(normalizedScore)}
          </p>
          <p className="text-xs text-gray-500 mt-1">
            Based on {filteredTasks.length} completed tasks in the {periodText}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
