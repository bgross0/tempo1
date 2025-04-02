'use client';

import { useMemo } from 'react';
import { format, isToday, isThisWeek, isAfter, isBefore, addDays } from 'date-fns';
import { Task } from '@/types/database';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { CheckCircle2, Clock, AlertCircle } from 'lucide-react';

interface TaskTimelineProps {
  tasks: Task[];
}

export function TaskTimeline({ tasks }: TaskTimelineProps) {
  // Group tasks by time period
  const groupedTasks = useMemo(() => {
    const today = new Date();
    const tomorrow = addDays(today, 1);
    const nextWeek = addDays(today, 7);
    
    // Filter to only include non-completed tasks
    const activeTasks = tasks.filter(task => !task.completed);
    
    // Group tasks by time period
    const overdue = activeTasks.filter(task => 
      isBefore(new Date(task.due_date), today)
    );
    
    const todayTasks = activeTasks.filter(task => 
      isToday(new Date(task.due_date))
    );
    
    const tomorrowTasks = activeTasks.filter(task => {
      const dueDate = new Date(task.due_date);
      return isAfter(dueDate, today) && isBefore(dueDate, addDays(tomorrow, 1));
    });
    
    const thisWeekTasks = activeTasks.filter(task => {
      const dueDate = new Date(task.due_date);
      return isThisWeek(dueDate) && 
             !isToday(dueDate) && 
             !(isAfter(dueDate, today) && isBefore(dueDate, addDays(tomorrow, 1)));
    });
    
    const laterTasks = activeTasks.filter(task => 
      isAfter(new Date(task.due_date), nextWeek)
    );
    
    return {
      overdue,
      today: todayTasks,
      tomorrow: tomorrowTasks,
      thisWeek: thisWeekTasks,
      later: laterTasks
    };
  }, [tasks]);

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-semibold">Upcoming Tasks</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Overdue Tasks */}
        {groupedTasks.overdue.length > 0 && (
          <TimelineSection 
            title="Overdue" 
            tasks={groupedTasks.overdue} 
            icon={<AlertCircle className="h-4 w-4 text-red-500" />}
            badgeColor="red"
          />
        )}
        
        {/* Today's Tasks */}
        {groupedTasks.today.length > 0 && (
          <TimelineSection 
            title="Today" 
            tasks={groupedTasks.today}
            icon={<Clock className="h-4 w-4 text-blue-500" />}
            badgeColor="blue"
          />
        )}
        
        {/* Tomorrow's Tasks */}
        {groupedTasks.tomorrow.length > 0 && (
          <TimelineSection 
            title="Tomorrow" 
            tasks={groupedTasks.tomorrow}
            icon={<Clock className="h-4 w-4 text-green-500" />}
            badgeColor="green"
          />
        )}
        
        {/* This Week's Tasks */}
        {groupedTasks.thisWeek.length > 0 && (
          <TimelineSection 
            title="This Week" 
            tasks={groupedTasks.thisWeek}
            icon={<Clock className="h-4 w-4 text-yellow-500" />}
            badgeColor="yellow"
          />
        )}
        
        {/* Later Tasks */}
        {groupedTasks.later.length > 0 && (
          <TimelineSection 
            title="Later" 
            tasks={groupedTasks.later}
            icon={<Clock className="h-4 w-4 text-gray-500" />}
            badgeColor="gray"
          />
        )}
        
        {/* No tasks message */}
        {Object.values(groupedTasks).every(group => group.length === 0) && (
          <div className="text-center py-4">
            <CheckCircle2 className="h-8 w-8 text-green-500 mx-auto mb-2" />
            <p className="text-gray-600">All caught up! No upcoming tasks.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

interface TimelineSectionProps {
  title: string;
  tasks: Task[];
  icon: React.ReactNode;
  badgeColor: 'red' | 'yellow' | 'green' | 'blue' | 'gray';
}

function TimelineSection({ title, tasks, icon, badgeColor }: TimelineSectionProps) {
  // Sort tasks by priority and due date
  const sortedTasks = [...tasks].sort((a, b) => {
    // First sort by priority
    const priorityOrder = { high: 0, medium: 1, low: 2 };
    const priorityDiff = priorityOrder[a.priority] - priorityOrder[b.priority];
    
    if (priorityDiff !== 0) return priorityDiff;
    
    // Then sort by due date
    return new Date(a.due_date).getTime() - new Date(b.due_date).getTime();
  });
  
  // Get badge color classes
  const getBadgeColorClass = () => {
    switch (badgeColor) {
      case 'red': return 'bg-red-100 text-red-800 hover:bg-red-200';
      case 'yellow': return 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200';
      case 'green': return 'bg-green-100 text-green-800 hover:bg-green-200';
      case 'blue': return 'bg-blue-100 text-blue-800 hover:bg-blue-200';
      case 'gray': return 'bg-gray-100 text-gray-800 hover:bg-gray-200';
      default: return 'bg-gray-100 text-gray-800 hover:bg-gray-200';
    }
  };

  return (
    <div>
      <div className="flex items-center gap-2 mb-2">
        {icon}
        <h3 className="font-medium text-sm">{title}</h3>
        <Badge variant="outline" className={cn("ml-auto", getBadgeColorClass())}>
          {tasks.length}
        </Badge>
      </div>
      
      <div className="space-y-2 pl-5 border-l-2 border-gray-100">
        {sortedTasks.map(task => (
          <div 
            key={task.id}
            className="relative pl-4 py-1 -ml-px border-l-2 border-transparent hover:border-blue-500 transition-colors"
          >
            {/* Task dot marker */}
            <div className="absolute left-[-5px] top-[calc(50%-4px)] w-2 h-2 rounded-full bg-gray-300" />
            
            <div className="flex items-center justify-between">
              <p className={cn(
                "text-sm truncate",
                task.priority === 'high' ? 'font-medium' : ''
              )}>
                {task.name}
              </p>
              
              <div className="flex items-center gap-2">
                {/* Priority indicator */}
                <Badge 
                  variant="outline" 
                  className={cn(
                    "text-xs",
                    task.priority === 'high' ? 'bg-red-100 text-red-800' :
                    task.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-green-100 text-green-800'
                  )}
                >
                  {task.priority}
                </Badge>
                
                {/* Due time if available */}
                {task.due_time && (
                  <span className="text-xs text-gray-500">
                    {task.due_time}
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default TaskTimeline;
