// src/lib/__tests__/scheduling.test.ts
import { scheduleAllTasks } from '../scheduling';
import { Task, UserSettings } from '@/types';

describe('scheduleAllTasks', () => {
  it('should schedule tasks with start dates', () => {
    const settings: UserSettings = {
      workingHoursStart: '09:00',
      workingHoursEnd: '17:00',
      taskSchedulingStrategy: 'balanced',
      defaultChunkDuration: 30,
      defaultView: 'calendar',
      defaultCalendarView: 'week',
      theme: 'light',
      primaryColor: '#4a6bdf'
    };
    
    const today = new Date();
    const todayString = today.toISOString().split('T')[0];
    
    const tasks: Task[] = [
      {
        id: '1',
        userId: 'user1',
        name: 'Task with start date',
        dueDate: todayString,
        startDate: todayString,
        startTime: '10:00',
        priority: 'medium',
        duration: 60,
        hardDeadline: false,
        tags: [],
        completed: false,
        scheduledBlocks: [],
        createdAt: todayString,
        updatedAt: todayString
      }
    ];
    
    const result = scheduleAllTasks(tasks, settings);
    
    // Check if task was scheduled
    expect(result[0].scheduledBlocks.length).toBeGreaterThan(0);
    expect(result[0].scheduledBlocks[0].date).toBe(todayString);
    expect(result[0].scheduledBlocks[0].startTime).toBe('10:00');
  });
});