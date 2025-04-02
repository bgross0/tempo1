// src/lib/scheduling.ts
import { Task, ScheduledBlock, UserSettings } from '@/types';

interface ScheduleDay {
  date: Date;
  availableMinutes: number;
  timeSlots: Array<{
    taskId: string;
    startMinute: number;
    duration: number;
  }>;
}

interface Schedule {
  [date: string]: ScheduleDay;
}

export function scheduleAllTasks(tasks: Task[], settings: UserSettings): Task[] {
  try {
    console.log('Scheduling all tasks');
    
    // Clear all previous scheduling
    tasks = tasks.map(task => ({
      ...task,
      scheduledBlocks: []
    }));
    
    // Get only incomplete tasks with due dates
    const tasksToSchedule = tasks
      .filter(task => !task.completed && task.dueDate)
      .sort((a, b) => {
        // Sort algorithm based on strategy
        const strategy = settings.taskSchedulingStrategy;
        
        if (strategy === 'priority-first') {
          // High priority first, then by due date
          const priorityScore = { 'high': 0, 'medium': 1, 'low': 2 };
          if (priorityScore[a.priority] !== priorityScore[b.priority]) {
            return priorityScore[a.priority] - priorityScore[b.priority];
          }
        }
        
        if (strategy === 'deadline-first' || strategy === 'balanced') {
          // Always consider deadline next
          const dateA = new Date(a.dueDate);
          const dateB = new Date(b.dueDate);
          if (dateA.getTime() !== dateB.getTime()) {
            return dateA.getTime() - dateB.getTime();
          }
        }
        
        if (strategy === 'balanced') {
          // For balanced, consider priority as a secondary factor
          const priorityScore = { 'high': 0, 'medium': 1, 'low': 2 };
          if (priorityScore[a.priority] !== priorityScore[b.priority]) {
            return priorityScore[a.priority] - priorityScore[b.priority];
          }
        }
        
        // Default sort by creation date
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      });
    
    if (tasksToSchedule.length === 0) {
      console.log('No tasks to schedule');
      return tasks;
    }

    // Calculate working hours in minutes
    const [startHours, startMinutes] = settings.workingHoursStart.split(':').map(Number);
    const [endHours, endMinutes] = settings.workingHoursEnd.split(':').map(Number);
    const startTimeMinutes = startHours * 60 + startMinutes;
    const endTimeMinutes = endHours * 60 + endMinutes;
    const workingMinutesPerDay = endTimeMinutes - startTimeMinutes;
    
    // Schedule for the next 30 days
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Create a schedule template for each day
    const schedule: Schedule = {};
    for (let i = 0; i < 30; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      const dateString = date.toISOString().split('T')[0];
      
      // Initialize each day with available time slots
      schedule[dateString] = {
        date: date,
        availableMinutes: workingMinutesPerDay,
        timeSlots: []
      };
    }
    
    // First, schedule tasks with specific start dates
    const tasksWithStartDates = tasksToSchedule.filter(task => task.startDate);
    const tasksWithoutStartDates = tasksToSchedule.filter(task => !task.startDate);
    
    // Schedule tasks with start dates
    tasksWithStartDates.forEach(task => {
      console.log(`Scheduling task with start date: ${task.name}`);
      const startDate = new Date(task.startDate!);
      startDate.setHours(0, 0, 0, 0);
      const startDateString = startDate.toISOString().split('T')[0];
      
      // Check if start date is within our scheduling window
      if (schedule[startDateString]) {
        scheduleTaskFromDate(task, schedule, startDateString, settings);
      }
    });
    
    // Then schedule tasks without start dates
    tasksWithoutStartDates.forEach(task => {
      console.log(`Scheduling task without start date: ${task.name}`);
      const dueDate = new Date(task.dueDate);
      dueDate.setHours(0, 0, 0, 0);
      
      // Find the best day to schedule this task
      let bestDayToSchedule = null;
      
      // Try to schedule as close to today as possible
      for (const dateString in schedule) {
        const scheduleDate = new Date(dateString);
        
        // Only consider dates before or on the due date
        if (scheduleDate <= dueDate) {
          if (schedule[dateString].availableMinutes >= Math.min(task.duration, task.chunkSize || task.duration)) {
            bestDayToSchedule = dateString;
            break;
          }
        }
      }
      
      if (bestDayToSchedule) {
        scheduleTaskFromDate(task, schedule, bestDayToSchedule, settings);
      }
    });
    
    console.log('Task scheduling completed');
    
    return tasks;
  } catch (error) {
    console.error('Error during task scheduling:', error);
    return tasks;
  }
}

function scheduleTaskFromDate(task: Task, schedule: Schedule, startDateString: string, settings: UserSettings) {
  try {
    console.log(`Scheduling task ${task.name} from ${startDateString}`);
    let remainingDuration = task.duration;
    const chunkSize = task.chunkSize || task.duration;
    let currentDateString = startDateString;
    
    // If the task has a specific start time, use that
    let startMinute = null;
    if (task.startTime) {
      const [hours, minutes] = task.startTime.split(':').map(Number);
      startMinute = hours * 60 + minutes;
    }
    
    // Continue scheduling chunks until the task is fully scheduled
    while (remainingDuration > 0 && schedule[currentDateString]) {
      const currentChunkSize = Math.min(remainingDuration, chunkSize, schedule[currentDateString].availableMinutes);
      
      // If we can't fit even the minimum chunk on this day, move to the next day
      if (currentChunkSize < Math.min(chunkSize, 30)) {
        // Find the next date
        const currentDate = new Date(currentDateString);
        currentDate.setDate(currentDate.getDate() + 1);
        currentDateString = currentDate.toISOString().split('T')[0];
        
        // Reset specific start time after the first day
        startMinute = null;
        
        // If we've gone beyond our scheduling window, break
        if (!schedule[currentDateString]) {
          break;
        }
        continue;
      }
      
      // Calculate start time in minutes from the start of working hours
      const [startHours, startMinutes] = settings.workingHoursStart.split(':').map(Number);
      const startTimeMinutes = startHours * 60 + startMinutes;
      
      // Find the first available time slot
      let slotStartMinute = startMinute !== null ? startMinute : startTimeMinutes;
      const existingSlots = [...schedule[currentDateString].timeSlots].sort((a, b) => a.startMinute - b.startMinute);
      
      // If using a specific start time, check if it conflicts with existing slots
      if (startMinute !== null) {
        const conflictingSlot = existingSlots.find(slot => 
          (slot.startMinute <= slotStartMinute && slot.startMinute + slot.duration > slotStartMinute) ||
          (slotStartMinute <= slot.startMinute && slotStartMinute + currentChunkSize > slot.startMinute)
        );
        
        if (conflictingSlot) {
          // If there's a conflict, try to schedule after all slots
          slotStartMinute = Math.max(
            ...existingSlots.map(slot => slot.startMinute + slot.duration),
            startTimeMinutes
          );
        }
      } else {
        // Find a gap between existing slots
        for (const slot of existingSlots) {
          if (slot.startMinute >= slotStartMinute + currentChunkSize) {
            // There's enough space before this slot
            break;
          }
          // Move our start time to after this slot
          slotStartMinute = slot.startMinute + slot.duration;
        }
      }
      
      // Ensure we're still within working hours
      const [endHours, endMinutes] = settings.workingHoursEnd.split(':').map(Number);
      const endTimeMinutes = endHours * 60 + endMinutes;
      
      if (slotStartMinute + currentChunkSize <= endTimeMinutes) {
        // Create a new scheduled block
        const scheduledBlock: ScheduledBlock = {
          date: currentDateString,
          startMinute: slotStartMinute,
          duration: currentChunkSize,
          startTime: minutesToTime(slotStartMinute),
          endTime: minutesToTime(slotStartMinute + currentChunkSize)
        };
        
        console.log(`Added block for task ${task.name}: ${scheduledBlock.date} ${scheduledBlock.startTime}-${scheduledBlock.endTime}`);
        
        // Add to task's scheduled blocks
        if (!task.scheduledBlocks) {
          task.scheduledBlocks = [];
        }
        task.scheduledBlocks.push(scheduledBlock);
        
        // Update the schedule
        schedule[currentDateString].timeSlots.push({
          taskId: task.id,
          startMinute: slotStartMinute,
          duration: currentChunkSize
        });
        schedule[currentDateString].availableMinutes -= currentChunkSize;
        
        // Update remaining duration
        remainingDuration -= currentChunkSize;
        
        // Reset specific start time after the first chunk
        startMinute = null;
      } else {
        // If we can't fit the chunk in today's working hours, move to the next day
        const currentDate = new Date(currentDateString);
        currentDate.setDate(currentDate.getDate() + 1);
        currentDateString = currentDate.toISOString().split('T')[0];
        
        // Reset specific start time after the first day
        startMinute = null;
        
        // If we've gone beyond our scheduling window, break
        if (!schedule[currentDateString]) {
          break;
        }
      }
    }
    
    return task;
  } catch (error) {
    console.error('Error scheduling task from date:', error);
    return task;
  }
}

function minutesToTime(minutes: number): string {
  try {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
  } catch (error) {
    console.error('Error converting minutes to time:', error);
    return '00:00';
  }
}