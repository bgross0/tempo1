import { useState, useCallback } from 'react';
import { addDays, startOfDay, endOfDay, startOfWeek, endOfWeek, format } from 'date-fns';
import { useAppStore } from '@/lib/store';
import { useTasks } from '@/hooks/api/useTasks';
import { generateScheduleForAll, updateTaskSchedule } from '@/lib/scheduling/scheduler';
import { toast } from '@/components/ui/use-toast';
import { ScheduledBlock as DatabaseScheduledBlock } from '@/types/database';

export function useScheduler() {
  const [isGenerating, setIsGenerating] = useState(false);
  const { tasks, events, settings } = useAppStore();
  const { updateTask } = useTasks();
  
  // Parse hours from time strings like "09:00"
  const parseHour = (timeStr: string): number => {
    return parseInt(timeStr.split(':')[0], 10);
  };
  
  // Default working hours from settings
  const workingHoursStart = settings ? parseHour(settings.workingHoursStart) : 9;
  const workingHoursEnd = settings ? parseHour(settings.workingHoursEnd) : 17;
  
  // Convert events to the format expected by the scheduler
  const formatEventsForScheduler = useCallback(() => {
    return events.map(event => ({
      date: event.startDate || event.start_date,
      startTime: event.startTime || event.start_time,
      endTime: event.endTime || event.end_time
    }));
  }, [events]);
  
  // Generate schedule for today
  const generateScheduleForToday = useCallback(async () => {
    try {
      setIsGenerating(true);
      
      const today = new Date();
      const todayStart = startOfDay(today);
      const todayEnd = endOfDay(today);
      
      await generateScheduleForAll(
        tasks,
        todayStart,
        todayEnd,
        workingHoursStart,
        workingHoursEnd,
        formatEventsForScheduler(),
        updateTask
      );
      
      toast({
        title: 'Schedule generated',
        description: 'Today\'s schedule has been created.'
      });
    } catch (error) {
      console.error('Error generating schedule:', error);
      toast({
        title: 'Scheduling error',
        description: 'Could not generate schedule. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setIsGenerating(false);
    }
  }, [tasks, workingHoursStart, workingHoursEnd, formatEventsForScheduler, updateTask]);
  
  // Generate schedule for the week
  const generateScheduleForWeek = useCallback(async () => {
    try {
      setIsGenerating(true);
      
      const today = new Date();
      const weekStart = startOfWeek(today, { weekStartsOn: 1 }); // Start on Monday
      const weekEnd = endOfWeek(today, { weekStartsOn: 1 });
      
      await generateScheduleForAll(
        tasks,
        weekStart,
        weekEnd,
        workingHoursStart,
        workingHoursEnd,
        formatEventsForScheduler(),
        updateTask
      );
      
      toast({
        title: 'Schedule generated',
        description: `Schedule for ${format(weekStart, 'MMM d')} - ${format(weekEnd, 'MMM d')} has been created.`
      });
    } catch (error) {
      console.error('Error generating schedule:', error);
      toast({
        title: 'Scheduling error',
        description: 'Could not generate schedule. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setIsGenerating(false);
    }
  }, [tasks, workingHoursStart, workingHoursEnd, formatEventsForScheduler, updateTask]);
  
  // Generate schedule for custom date range
  const generateScheduleForRange = useCallback(async (startDate: Date, endDate: Date) => {
    try {
      setIsGenerating(true);
      
      await generateScheduleForAll(
        tasks,
        startDate,
        endDate,
        workingHoursStart,
        workingHoursEnd,
        formatEventsForScheduler(),
        updateTask
      );
      
      toast({
        title: 'Schedule generated',
        description: `Schedule for ${format(startDate, 'MMM d')} - ${format(endDate, 'MMM d')} has been created.`
      });
    } catch (error) {
      console.error('Error generating schedule:', error);
      toast({
        title: 'Scheduling error',
        description: 'Could not generate schedule. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setIsGenerating(false);
    }
  }, [tasks, workingHoursStart, workingHoursEnd, formatEventsForScheduler, updateTask]);
  
  // Reschedule a single task
  const rescheduleTask = useCallback(async (
    taskId: string, 
    scheduledBlocks: { date: string; startTime: string; endTime: string; taskId?: string }[]
  ) => {
    try {
      // The updateTaskSchedule function will handle ensuring taskId is present
      await updateTaskSchedule(taskId, scheduledBlocks, updateTask);
      
      toast({
        title: 'Task rescheduled',
        description: 'The task has been successfully rescheduled.'
      });
      
      return true;
    } catch (error) {
      console.error('Error rescheduling task:', error);
      toast({
        title: 'Scheduling error',
        description: 'Could not reschedule task. Please try again.',
        variant: 'destructive'
      });
      
      return false;
    }
  }, [updateTask]);
  
  return {
    isGenerating,
    generateScheduleForToday,
    generateScheduleForWeek,
    generateScheduleForRange,
    rescheduleTask
  };
}
