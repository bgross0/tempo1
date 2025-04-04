'use client';

import { useState, useEffect } from 'react';
import { format, parse, parseISO, isSameDay } from 'date-fns';
import { Calendar, Clock, ArrowRight, ExternalLink } from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Task } from '@/types/database';
import Link from 'next/link';
import { useToast } from '@/components/ui/use-toast';

// Types for the scheduled blocks
interface ScheduledBlock {
  date: string;
  startTime: string;
  endTime: string;
  taskId: string;
  taskName?: string;
  priority?: 'high' | 'medium' | 'low';
}

interface ScheduleViewProps {
  tasks: Task[];
  startDate?: Date;
  endDate?: Date;
}

export function ScheduleView({ tasks, startDate = new Date(), endDate }: ScheduleViewProps) {
  const [scheduledBlocks, setScheduledBlocks] = useState<ScheduledBlock[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<Date>(startDate);
  const { toast } = useToast();

  // Extract scheduled blocks from tasks
  useEffect(() => {
    // Aggregate all scheduled blocks from tasks
    const blocks: ScheduledBlock[] = [];
    
    tasks.forEach(task => {
      if (task.scheduled_blocks && Array.isArray(task.scheduled_blocks)) {
        task.scheduled_blocks.forEach((block: any) => {
          blocks.push({
            ...block,
            taskName: task.name,
            priority: task.priority
          });
        });
      }
    });
    
    // Sort blocks by date and time
    const sortedBlocks = blocks.sort((a, b) => {
      // First compare dates
      const dateComparison = a.date.localeCompare(b.date);
      if (dateComparison !== 0) return dateComparison;
      
      // Then compare start times
      return a.startTime.localeCompare(b.startTime);
    });
    
    setScheduledBlocks(sortedBlocks);
    setIsLoading(false);
  }, [tasks]);
  
  // Filter blocks for the selected date
  const blocksForSelectedDate = scheduledBlocks.filter(block => {
    const blockDate = parseISO(block.date);
    return isSameDay(blockDate, selectedDate);
  });
  
  // Get unique dates from scheduled blocks
  const uniqueDates = [...new Set(scheduledBlocks.map(block => block.date))].map(dateStr => parseISO(dateStr));
  
  // Format time (convert 24h to 12h)
  const formatTime = (timeStr: string) => {
    if (!timeStr) return '';
    const [hours, minutes] = timeStr.split(':').map(Number);
    const period = hours >= 12 ? 'PM' : 'AM';
    const hours12 = hours % 12 || 12;
    return `${hours12}:${minutes.toString().padStart(2, '0')} ${period}`;
  };
  
  // Get color based on priority
  const getPriorityColor = (priority: string | undefined) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      case 'medium': return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };
  
  // Calculate duration in minutes between two time strings
  const calculateDuration = (startTime: string, endTime: string) => {
    const [startHours, startMinutes] = startTime.split(':').map(Number);
    const [endHours, endMinutes] = endTime.split(':').map(Number);
    
    const startTotalMinutes = startHours * 60 + startMinutes;
    const endTotalMinutes = endHours * 60 + endMinutes;
    
    return endTotalMinutes - startTotalMinutes;
  };
  
  // Format duration as Xh Ym
  const formatDuration = (minutes: number) => {
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
  };
  
  // Navigate between dates
  const goToNextDate = () => {
    const nextAvailableDate = uniqueDates.find(date => date > selectedDate);
    if (nextAvailableDate) {
      setSelectedDate(nextAvailableDate);
    } else {
      toast({
        title: "No more scheduled days",
        description: "You've reached the end of your schedule"
      });
    }
  };
  
  const goToPrevDate = () => {
    const prevAvailableDate = [...uniqueDates].reverse().find(date => date < selectedDate);
    if (prevAvailableDate) {
      setSelectedDate(prevAvailableDate);
    } else {
      toast({
        title: "No previous scheduled days",
        description: "You're at the beginning of your schedule"
      });
    }
  };
  
  if (isLoading) {
    return <div className="flex justify-center py-8">Loading schedule...</div>;
  }
  
  if (scheduledBlocks.length === 0) {
    return (
      <Card className="border-dashed">
        <CardContent className="pt-6 text-center">
          <Calendar className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium">No scheduled tasks</h3>
          <p className="text-sm text-muted-foreground mt-2 mb-4">
            Generate a schedule for your tasks using the scheduler
          </p>
          <Button asChild>
            <Link href="/calendar">
              View Calendar
            </Link>
          </Button>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Schedule</CardTitle>
            <CardDescription>
              {format(selectedDate, 'EEEE, MMMM d, yyyy')}
            </CardDescription>
          </div>
          <div className="flex space-x-2">
            <Button variant="outline" size="icon" onClick={goToPrevDate}>
              <ArrowRight className="h-4 w-4 rotate-180" />
            </Button>
            <Button variant="outline" size="icon" onClick={goToNextDate}>
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {blocksForSelectedDate.length === 0 ? (
          <div className="text-center py-6 text-muted-foreground">
            No tasks scheduled for this day
          </div>
        ) : (
          <div className="space-y-3">
            {blocksForSelectedDate.map((block, index) => {
              const duration = calculateDuration(block.startTime, block.endTime);
              
              return (
                <div 
                  key={`${block.taskId}-${index}`} 
                  className={`border rounded-md p-3 ${getPriorityColor(block.priority)}`}
                >
                  <div className="flex justify-between items-start">
                    <div className="font-medium">{block.taskName}</div>
                    <Badge variant="outline">{block.priority}</Badge>
                  </div>
                  <div className="flex items-center text-sm mt-2">
                    <Clock className="h-3.5 w-3.5 mr-1 inline" />
                    <span>
                      {formatTime(block.startTime)} - {formatTime(block.endTime)} 
                      <span className="text-muted-foreground ml-1">
                        ({formatDuration(duration)})
                      </span>
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-between">
        <div className="text-xs text-muted-foreground">
          {scheduledBlocks.length} time blocks scheduled
        </div>
        <Button variant="outline" size="sm" asChild>
          <Link href="/calendar">
            <ExternalLink className="h-3.5 w-3.5 mr-1" />
            Calendar View
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}