import React from 'react';
import { render, screen } from '@/lib/test-utils';
import { ProductivityScore } from '../ProductivityScore';
import { Task } from '@/types/database';
import { subDays } from 'date-fns';

// Mock date-fns to control date values
jest.mock('date-fns', () => {
  const actual = jest.requireActual('date-fns');
  return {
    ...actual,
    subDays: jest.fn(actual.subDays),
  };
});

describe('ProductivityScore', () => {
  // Mock task data
  const today = new Date().toISOString();
  const yesterday = subDays(new Date(), 1).toISOString();
  const lastWeek = subDays(new Date(), 8).toISOString();

  const mockTasks: Task[] = [
    {
      id: 'task-1',
      user_id: 'user-1',
      project_id: null,
      name: 'High Priority Task',
      description: 'Description',
      start_date: null,
      start_time: null,
      due_date: '2025-05-01',
      due_time: null,
      priority: 'high',
      duration: 60,
      chunk_size: null,
      hard_deadline: false,
      completed: true,
      completed_at: today,
      tags: [],
      created_at: today,
      updated_at: today,
      scheduled_blocks: null
    },
    {
      id: 'task-2',
      user_id: 'user-1',
      project_id: null,
      name: 'Medium Priority Task',
      description: 'Description',
      start_date: null,
      start_time: null,
      due_date: '2025-05-02',
      due_time: null,
      priority: 'medium',
      duration: 60,
      chunk_size: null,
      hard_deadline: false,
      completed: true,
      completed_at: yesterday,
      tags: [],
      created_at: yesterday,
      updated_at: yesterday,
      scheduled_blocks: null
    },
    {
      id: 'task-3',
      user_id: 'user-1',
      project_id: null,
      name: 'Old Task',
      description: 'Description',
      start_date: null,
      start_time: null,
      due_date: '2025-04-20',
      due_time: null,
      priority: 'low',
      duration: 30,
      chunk_size: null,
      hard_deadline: false,
      completed: true,
      completed_at: lastWeek,
      tags: [],
      created_at: lastWeek,
      updated_at: lastWeek,
      scheduled_blocks: null
    },
    {
      id: 'task-4',
      user_id: 'user-1',
      project_id: null,
      name: 'Incomplete Task',
      description: 'Description',
      start_date: null,
      start_time: null,
      due_date: '2025-05-05',
      due_time: null,
      priority: 'high',
      duration: 90,
      chunk_size: null,
      hard_deadline: false,
      completed: false,
      completed_at: null,
      tags: [],
      created_at: today,
      updated_at: today,
      scheduled_blocks: null
    }
  ];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders the productivity score component correctly', () => {
    render(<ProductivityScore tasks={mockTasks} />);
    
    // Check that the title is displayed
    expect(screen.getByText('Productivity Score')).toBeInTheDocument();
    
    // Check that the time period is displayed
    expect(screen.getByText(/over the last 7 days/)).toBeInTheDocument();
    
    // Check that trend indicator is present
    expect(screen.getByText(/from last week/)).toBeInTheDocument();
  });

  it('filters tasks based on completion date', () => {
    // Only 2 tasks should be counted (within 7 days)
    render(<ProductivityScore tasks={mockTasks} />);
    
    // The score is calculated as 5 (high) + 3 (medium) = 8 weighted points = 80 score
    expect(screen.getByText('80')).toBeInTheDocument();
    
    // The color should be green for a score of 80
    const scoreElement = screen.getByText('80');
    expect(scoreElement).toHaveClass('text-green-500');
  });

  it('handles an empty task list gracefully', () => {
    render(<ProductivityScore tasks={[]} />);
    
    // Score should be 0 for no tasks
    expect(screen.getByText('0')).toBeInTheDocument();
    
    // The color should be red for a score of 0
    const scoreElement = screen.getByText('0');
    expect(scoreElement).toHaveClass('text-red-500');
  });

  it('uses a custom time period when specified', () => {
    render(<ProductivityScore tasks={mockTasks} days={14} />);
    
    // Check that the custom time period is displayed
    expect(screen.getByText(/over the last 14 days/)).toBeInTheDocument();
    
    // With a 14-day window, all 3 completed tasks should be counted
    // 5 (high) + 3 (medium) + 1 (low) = 9 weighted points = 90 score
    expect(screen.getByText('90')).toBeInTheDocument();
  });

  it('applies different colors based on score value', () => {
    // For a medium score (between
    const mediumPriorityTasks: Task[] = [
      {
        ...mockTasks[1], // Copy the medium priority task
        id: 'task-5',
        name: 'Another Medium Task',
        completed_at: today
      }
    ];
    
    render(<ProductivityScore tasks={mediumPriorityTasks} />);
    
    // The score should be 3 weighted points = 30 score
    expect(screen.getByText('30')).toBeInTheDocument();
    
    // The color should be red for a score below 60
    const scoreElement = screen.getByText('30');
    expect(scoreElement).toHaveClass('text-red-500');
  });
});