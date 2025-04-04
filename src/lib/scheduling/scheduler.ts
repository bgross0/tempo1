import { addDays, addMinutes, format, parseISO, setHours, setMinutes } from 'date-fns';
import { Task } from '@/types/database';

interface ScheduledBlock {
  date: string; // ISO format YYYY-MM-DD
  startTime: string; // 24h format HH:MM
  endTime: string; // 24h format HH:MM
  taskId: string;
}

interface SchedulingParams {
  tasks: Task[];
  startDate: Date;
  endDate: Date;
  workingHoursStart: number; // 0-23
  workingHoursEnd: number; // 0-23
  existingEvents: {
    date: string;
    startTime: string;
    endTime: string;
  }[];
}

/**
 * Smart scheduling algorithm that assigns time blocks to tasks based on
 * priority, deadlines, and working hours.
 */
export function scheduleTasksForPeriod({
  tasks,
  startDate,
  endDate,
  workingHoursStart,
  workingHoursEnd,
  existingEvents
}: SchedulingParams): Record<string, ScheduledBlock[]> {
  // 1. Create a schedule structure to track available time slots
  const schedule: Record<string, ScheduledBlock[]> = {};
  
  // 2. Prepare tasks for scheduling
  const tasksToSchedule = [...tasks]
    .filter(task => !task.completed && task.duration)
    .sort((a, b) => {
      // Sort by priority (high → medium → low)
      const priorityOrder = { high: 0, medium: 1, low: 2 };
      const priorityDiff = priorityOrder[a.priority] - priorityOrder[b.priority];
      if (priorityDiff !== 0) return priorityDiff;
      
      // Then by due date (earliest first)
      const aDate = new Date(a.due_date);
      const bDate = new Date(b.due_date);
      return aDate.getTime() - bDate.getTime();
    });
  
  // 3. Block out existing events in the schedule
  existingEvents.forEach(event => {
    const dateStr = event.date;
    if (!schedule[dateStr]) {
      schedule[dateStr] = [];
    }
    
    schedule[dateStr].push({
      date: dateStr,
      startTime: event.startTime,
      endTime: event.endTime,
      taskId: 'event' // Mark as an event so we don't schedule tasks here
    });
  });
  
  // 4. Allocate time slots for each task
  for (const task of tasksToSchedule) {
    // Skip tasks without duration
    if (!task.duration) continue;
    
    // Determine if the task should be chunked
    let chunkDuration = task.duration;
    if (task.chunk_size && task.chunk_size > 0 && task.chunk_size < task.duration) {
      chunkDuration = task.chunk_size;
    }
    
    let remainingDuration = task.duration;
    let currentDate = new Date(startDate);
    
    // Continue scheduling until we've allocated all the task's time
    while (remainingDuration > 0 && currentDate <= endDate) {
      const dateStr = format(currentDate, 'yyyy-MM-dd');
      
      // Initialize schedule for this date if needed
      if (!schedule[dateStr]) {
        schedule[dateStr] = [];
      }
      
      // Find available time slots for this day
      const availableSlots = findAvailableTimeSlots(
        dateStr,
        schedule[dateStr],
        workingHoursStart,
        workingHoursEnd,
        chunkDuration
      );
      
      // If slots are available, schedule a chunk of the task
      if (availableSlots.length > 0) {
        // Use the first available slot (could be more sophisticated here)
        const slot = availableSlots[0];
        
        // Calculate end time based on chunk duration
        const startTime = slot.startTime;
        const startTimeDate = parseTimeStr(dateStr, startTime);
        const endTimeDate = addMinutes(startTimeDate, Math.min(chunkDuration, remainingDuration));
        const endTime = format(endTimeDate, 'HH:mm');
        
        // Add the scheduled block
        schedule[dateStr].push({
          date: dateStr,
          startTime,
          endTime,
          taskId: task.id
        });
        
        // Update remaining duration
        remainingDuration -= Math.min(chunkDuration, remainingDuration);
      }
      
      // Move to the next day
      currentDate = addDays(currentDate, 1);
    }
  }
  
  // 5. Return the schedule with task blocks only (filter out events)
  const taskSchedule: Record<string, ScheduledBlock[]> = {};
  
  Object.keys(schedule).forEach(dateStr => {
    const taskBlocks = schedule[dateStr].filter(block => block.taskId !== 'event');
    if (taskBlocks.length > 0) {
      taskSchedule[dateStr] = taskBlocks;
    }
  });
  
  return taskSchedule;
}

/**
 * Finds available time slots of the given minimum duration
 * on a specific day, taking into account working hours and existing blocks.
 */
function findAvailableTimeSlots(
  dateStr: string,
  daySchedule: ScheduledBlock[],
  workingHoursStart: number,
  workingHoursEnd: number,
  minimumDuration: number
): { startTime: string; duration: number }[] {
  // Convert minimum duration from minutes to milliseconds
  const minDurationMs = minimumDuration * 60 * 1000;
  
  // Sort existing blocks by start time
  const sortedBlocks = [...daySchedule].sort((a, b) => {
    return a.startTime.localeCompare(b.startTime);
  });
  
  // Create a list of busy intervals
  const busyIntervals: { start: Date; end: Date }[] = sortedBlocks.map(block => {
    const [startHour, startMinute] = block.startTime.split(':').map(Number);
    const [endHour, endMinute] = block.endTime.split(':').map(Number);
    
    const date = parseISO(block.date);
    const start = new Date(date);
    start.setHours(startHour, startMinute, 0, 0);
    
    const end = new Date(date);
    end.setHours(endHour, endMinute, 0, 0);
    
    return { start, end };
  });
  
  // Add working hours constraints as busy times (before and after working hours)
  const date = parseISO(dateStr);
  
  // Before working hours
  busyIntervals.push({
    start: new Date(date.setHours(0, 0, 0, 0)),
    end: new Date(date.setHours(workingHoursStart, 0, 0, 0))
  });
  
  // After working hours
  busyIntervals.push({
    start: new Date(date.setHours(workingHoursEnd, 0, 0, 0)),
    end: new Date(date.setHours(23, 59, 59, 999))
  });
  
  // Sort busy intervals by start time
  busyIntervals.sort((a, b) => a.start.getTime() - b.start.getTime());
  
  // Find gaps between busy intervals (free time)
  const availableSlots: { startTime: string; duration: number }[] = [];
  
  for (let i = 0; i < busyIntervals.length - 1; i++) {
    const currentEnd = busyIntervals[i].end;
    const nextStart = busyIntervals[i + 1].start;
    
    // Calculate gap duration
    const gapDuration = nextStart.getTime() - currentEnd.getTime();
    
    // If gap is large enough, add it as an available slot
    if (gapDuration >= minDurationMs) {
      availableSlots.push({
        startTime: format(currentEnd, 'HH:mm'),
        duration: gapDuration / (60 * 1000) // Convert ms back to minutes
      });
    }
  }
  
  return availableSlots;
}

/**
 * Helper function to parse a time string and create a Date
 */
function parseTimeStr(dateStr: string, timeStr: string): Date {
  const [hours, minutes] = timeStr.split(':').map(Number);
  const date = parseISO(dateStr);
  return setMinutes(setHours(date, hours), minutes);
}

/**
 * Helper function to ensure that scheduled blocks have the required taskId
 */
function ensureTaskId(blocks: any[], taskId: string): ScheduledBlock[] {
  return blocks.map(block => ({
    date: block.date,
    startTime: block.startTime,
    endTime: block.endTime,
    taskId: block.taskId || taskId // Use existing taskId or add it if missing
  }));
}

/**
 * Updates a task's scheduled blocks
 */
export async function updateTaskSchedule(
  taskId: string, 
  scheduledBlocks: any[],
  updateTaskFn: (id: string, data: any) => Promise<any>
): Promise<void> {
  // Ensure all blocks have taskId
  const normalizedBlocks = ensureTaskId(scheduledBlocks, taskId);
  await updateTaskFn(taskId, { scheduled_blocks: normalizedBlocks });
}

/**
 * Generates a schedule for all tasks in the given time period
 */
export async function generateScheduleForAll(
  tasks: Task[],
  startDate: Date,
  endDate: Date,
  workingHoursStart: number,
  workingHoursEnd: number,
  existingEvents: any[],
  updateTaskFn: (id: string, data: any) => Promise<any>
): Promise<void> {
  const schedule = scheduleTasksForPeriod({
    tasks,
    startDate,
    endDate,
    workingHoursStart,
    workingHoursEnd,
    existingEvents
  });
  
  // Group scheduled blocks by task
  const taskSchedules: Record<string, ScheduledBlock[]> = {};
  
  Object.keys(schedule).forEach(dateStr => {
    schedule[dateStr].forEach(block => {
      if (!taskSchedules[block.taskId]) {
        taskSchedules[block.taskId] = [];
      }
      taskSchedules[block.taskId].push(block);
    });
  });
  
  // Update each task with its scheduled blocks
  const updatePromises = Object.keys(taskSchedules).map(taskId => {
    return updateTaskFn(taskId, { scheduled_blocks: taskSchedules[taskId] });
  });
  
  await Promise.all(updatePromises);
}
