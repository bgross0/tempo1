'use client';

import { useMemo } from 'react';
import { 
  ArrowUp, 
  ArrowDown, 
  Check, 
  Clock, 
  BarChart2, 
  Calendar, 
  AlertTriangle 
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { Task, Project } from '@/types/database';
import { isAfter, isBefore, isToday, isThisWeek, differenceInDays } from 'date-fns';

interface DashboardStatsProps {
  tasks: Task[];
  projects: Project[];
}

export function DashboardStats({ tasks, projects }: DashboardStatsProps) {
  // Calculate task stats
  const stats = useMemo(() => {
    const now = new Date();
    
    // Tasks due today
    const todayTasks = tasks.filter(task => 
      !task.completed && isToday(new Date(task.due_date))
    );
    
    // Tasks due this week
    const weekTasks = tasks.filter(task => 
      !task.completed && isThisWeek(new Date(task.due_date))
    );
    
    // Overdue tasks
    const overdueTasks = tasks.filter(task => 
      !task.completed && isBefore(new Date(task.due_date), now)
    );
    
    // Recently completed tasks (last 7 days)
    const recentlyCompletedTasks = tasks.filter(task => 
      task.completed && 
      task.completed_at && 
      differenceInDays(now, new Date(task.completed_at)) <= 7
    );
    
    // Active projects
    const activeProjects = projects.filter(project => !project.completed);
    
    // Completion rate for this week
    const thisWeekTasks = tasks.filter(task => 
      isThisWeek(new Date(task.due_date)) || 
      (task.completed && task.completed_at && isThisWeek(new Date(task.completed_at)))
    );
    
    const completionRate = thisWeekTasks.length > 0
      ? Math.round((thisWeekTasks.filter(t => t.completed).length / thisWeekTasks.length) * 100)
      : 0;
    
    // Random trending stat for demo purposes
    const trending = Math.random() > 0.5 ? 'up' : 'down';
    const trendingValue = Math.floor(Math.random() * 20) + 5;
    
    return {
      todayTasks: todayTasks.length,
      weekTasks: weekTasks.length,
      overdueTasks: overdueTasks.length,
      recentlyCompletedTasks: recentlyCompletedTasks.length,
      activeProjects: activeProjects.length,
      completionRate,
      trending,
      trendingValue
    };
  }, [tasks, projects]);

  return (
    <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
      {/* Today's Tasks */}
      <StatsCard
        title="Today's Tasks"
        value={stats.todayTasks.toString()}
        icon={<Calendar className="h-5 w-5 text-blue-600" />}
        description={stats.todayTasks === 0 ? "All clear for today" : "Tasks to complete today"}
        color="blue"
      />
      
      {/* Completion Rate */}
      <StatsCard
        title="Completion Rate"
        value={`${stats.completionRate}%`}
        icon={<Check className="h-5 w-5 text-green-600" />}
        description={
          <div className="flex items-center gap-1">
            {stats.trending === 'up' ? (
              <>
                <ArrowUp className="h-3 w-3 text-green-600" />
                <span className="text-green-600">{stats.trendingValue}% increase</span>
              </>
            ) : (
              <>
                <ArrowDown className="h-3 w-3 text-red-600" />
                <span className="text-red-600">{stats.trendingValue}% decrease</span>
              </>
            )}
          </div>
        }
        color="green"
      />
      
      {/* Overdue Tasks */}
      <StatsCard
        title="Overdue Tasks"
        value={stats.overdueTasks.toString()}
        icon={<AlertTriangle className="h-5 w-5 text-red-600" />}
        description={
          stats.overdueTasks === 0 
            ? "No overdue tasks" 
            : `${stats.overdueTasks} task${stats.overdueTasks > 1 ? 's' : ''} past due date`
        }
        color="red"
        highlight={stats.overdueTasks > 0}
      />
      
      {/* Active Projects */}
      <StatsCard
        title="Active Projects"
        value={stats.activeProjects.toString()}
        icon={<BarChart2 className="h-5 w-5 text-purple-600" />}
        description={`${stats.recentlyCompletedTasks} tasks completed this week`}
        color="purple"
      />
    </div>
  );
}

interface StatsCardProps {
  title: string;
  value: string;
  icon: React.ReactNode;
  description: React.ReactNode;
  color: 'blue' | 'green' | 'red' | 'yellow' | 'purple';
  highlight?: boolean;
}

function StatsCard({ title, value, icon, description, color, highlight = false }: StatsCardProps) {
  // Get color classes based on the color prop
  const getColorClasses = () => {
    switch (color) {
      case 'blue':
        return 'bg-blue-50 border-blue-100';
      case 'green':
        return 'bg-green-50 border-green-100';
      case 'red':
        return 'bg-red-50 border-red-100';
      case 'yellow':
        return 'bg-yellow-50 border-yellow-100';
      case 'purple':
        return 'bg-purple-50 border-purple-100';
      default:
        return 'bg-gray-50 border-gray-100';
    }
  };

  return (
    <Card className={cn(
      "border transition-all",
      highlight ? 'animate-pulse' : '',
      getColorClasses()
    )}>
      <CardContent className="pt-6 px-6 pb-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-medium text-gray-700">{title}</h3>
          {icon}
        </div>
        <div className="text-2xl font-bold">{value}</div>
        <div className="text-xs text-gray-500 mt-1">{description}</div>
      </CardContent>
    </Card>
  );
}

export default DashboardStats;
