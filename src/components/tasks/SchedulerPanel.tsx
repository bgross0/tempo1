'use client';

import { useState } from 'react';
import { Calendar, Clock, Wand2 } from 'lucide-react';
import { format, startOfWeek, endOfWeek, addDays, startOfDay, endOfDay } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useScheduler } from '@/hooks/useScheduler';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Task } from '@/types/database';
import { useAppStore } from '@/lib/store/app-store';
import { useToast } from '@/components/ui/use-toast';

interface SchedulerPanelProps {
  tasks: Task[];
  onViewSchedule?: () => void;
}

export function SchedulerPanel({ tasks, onViewSchedule }: SchedulerPanelProps) {
  const [period, setPeriod] = useState<'today' | 'week'>('today');
  const { isGenerating, generateScheduleForToday, generateScheduleForWeek } = useScheduler();
  const { toast } = useToast();
  const settings = useAppStore(state => state.settings);
  
  // Get counts of schedulable tasks (not completed, with duration)
  const schedulableTasks = tasks.filter(task => !task.completed && task.duration);
  const highPriorityCount = schedulableTasks.filter(task => task.priority === 'high').length;
  const mediumPriorityCount = schedulableTasks.filter(task => task.priority === 'medium').length;
  const lowPriorityCount = schedulableTasks.filter(task => task.priority === 'low').length;
  
  // Handle generate schedule button
  const handleGenerateSchedule = async () => {
    if (schedulableTasks.length === 0) {
      toast({
        title: "No tasks to schedule",
        description: "Add tasks with duration to generate a schedule",
        variant: "destructive"
      });
      return;
    }
    
    try {
      if (period === 'today') {
        await generateScheduleForToday();
      } else {
        await generateScheduleForWeek();
      }
      
      if (onViewSchedule) {
        onViewSchedule();
      }
    } catch (error) {
      console.error('Error generating schedule:', error);
      toast({
        title: "Scheduling error",
        description: "Failed to generate schedule. Please try again.",
        variant: "destructive"
      });
    }
  };
  
  // Generate date range text
  const getDateRangeText = () => {
    const today = new Date();
    if (period === 'today') {
      return format(today, 'EEEE, MMMM d, yyyy');
    } else {
      const weekStart = startOfWeek(today, { weekStartsOn: 1 }); // Start on Monday
      const weekEnd = endOfWeek(today, { weekStartsOn: 1 });
      return `${format(weekStart, 'MMM d')} - ${format(weekEnd, 'MMM d, yyyy')}`;
    }
  };
  
  // Format working hours
  const formatWorkingHours = () => {
    // Parse hours from time strings like "09:00"
    const parseHour = (timeStr: string): number => {
      return parseInt(timeStr.split(':')[0], 10);
    };
    
    const start = settings ? parseHour(settings.workingHoursStart) : 9;
    const end = settings ? parseHour(settings.workingHoursEnd) : 17;
    
    // Convert to 12-hour format with AM/PM
    const formatHour = (hour: number) => {
      const isPM = hour >= 12;
      const hour12 = hour % 12 || 12;
      return `${hour12}${isPM ? 'PM' : 'AM'}`;
    };
    
    return `${formatHour(start)} - ${formatHour(end)}`;
  };
  
  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Task Scheduler</CardTitle>
            <CardDescription className="mt-1">
              Generate optimized schedule for your tasks
            </CardDescription>
          </div>
          <Wand2 className="h-5 w-5 text-primary" />
        </div>
      </CardHeader>
      <CardContent>
        <Tabs value={period} onValueChange={(v) => setPeriod(v as 'today' | 'week')} className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="today">Today</TabsTrigger>
            <TabsTrigger value="week">This Week</TabsTrigger>
          </TabsList>
        </Tabs>
        
        <div className="text-sm text-muted-foreground mb-4">
          {getDateRangeText()}
        </div>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between bg-muted/50 p-3 rounded-md">
            <div className="flex items-center">
              <Clock className="h-4 w-4 mr-2" />
              <span className="text-sm font-medium">Working Hours</span>
            </div>
            <span className="text-sm">{formatWorkingHours()}</span>
          </div>
          
          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="bg-muted/50 p-2 rounded-md">
              <div className="text-xs text-muted-foreground">High Priority</div>
              <div className="font-medium mt-1">{highPriorityCount}</div>
            </div>
            <div className="bg-muted/50 p-2 rounded-md">
              <div className="text-xs text-muted-foreground">Medium Priority</div>
              <div className="font-medium mt-1">{mediumPriorityCount}</div>
            </div>
            <div className="bg-muted/50 p-2 rounded-md">
              <div className="text-xs text-muted-foreground">Low Priority</div>
              <div className="font-medium mt-1">{lowPriorityCount}</div>
            </div>
          </div>
          
          <div className="text-xs text-muted-foreground">
            {schedulableTasks.length === 0 ? (
              <div className="text-center p-2">
                No tasks available for scheduling. Add tasks with duration to get started.
              </div>
            ) : (
              <div className="text-center p-2">
                {schedulableTasks.length} tasks ready to be scheduled
              </div>
            )}
          </div>
        </div>
      </CardContent>
      <CardFooter className="pt-0">
        <Button 
          onClick={handleGenerateSchedule} 
          className="w-full"
          disabled={isGenerating || schedulableTasks.length === 0}
        >
          {isGenerating ? 'Generating...' : 'Generate Schedule'}
        </Button>
      </CardFooter>
    </Card>
  );
}