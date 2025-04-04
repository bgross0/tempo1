import React from 'react';
import { render, screen, fireEvent } from '@/lib/test-utils';
import TaskCard from '../TaskCard';
import { Task, TaskStatus } from '@/types';
import { format } from 'date-fns';

// Mock functions to test interactions
const mockSetCurrentEditItem = jest.fn();
const mockSetContextMenuTaskId = jest.fn();

// Create a mock implementation for the store
const mockStore = {
  setCurrentEditItem: mockSetCurrentEditItem,
  setContextMenuTaskId: mockSetContextMenuTaskId,
};

// Mock the Zustand store with proper TypeScript support
jest.mock('@/lib/store', () => ({
  useAppStore: jest.fn().mockImplementation((selector) => {
    // If selector is a function (standard Zustand pattern)
    if (typeof selector === 'function') {
      return selector(mockStore);
    }
    // For direct state access (older approach)
    return mockStore[selector] || jest.fn();
  }),
}));

describe('TaskCard', () => {
  // Sample task data for testing
  const mockTask: Task = {
    id: 'task-1',
    name: 'Test Task',
    description: 'This is a test task',
    startDate: null,
    startTime: null,
    dueDate: '2025-05-01',
    dueTime: '14:00:00',
    priority: 'medium',
    projectId: null,
    duration: 60, // 1 hour
    chunkSize: null,
    hardDeadline: false,
    tags: ['test'],
    completed: false,
    status: 'todo' as TaskStatus,
    createdAt: '2025-04-01T10:00:00Z',
    scheduledBlocks: []
  };

  const completedTask: Task = {
    ...mockTask,
    id: 'task-2',
    name: 'Completed Task',
    completed: true
  };

  const highPriorityTask: Task = {
    ...mockTask,
    id: 'task-3',
    name: 'High Priority Task',
    priority: 'high'
  };

  const pastDueTask: Task = {
    ...mockTask,
    id: 'task-4',
    name: 'Past Due Task',
    dueDate: '2023-01-01',
    dueTime: '10:00:00'
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders task details correctly', () => {
    render(<TaskCard task={mockTask} />);
    
    // Check that the task name is displayed
    expect(screen.getByText('Test Task')).toBeInTheDocument();
    
    // Check that the description is displayed
    expect(screen.getByText('This is a test task')).toBeInTheDocument();
    
    // Check that the duration is displayed correctly (1h)
    expect(screen.getByText('1.0h')).toBeInTheDocument();
    
    // Check that the due date is displayed correctly
    expect(screen.getByText('May 1, 14:00')).toBeInTheDocument();
  });

  it('renders completed task with line-through style and check icon', () => {
    render(<TaskCard task={completedTask} />);
    
    // Check for the check icon
    const checkIcon = screen.getByText('').closest('svg');
    expect(checkIcon).toBeInTheDocument();
    
    // Check that the name has line-through style
    const taskName = screen.getByText('Completed Task');
    expect(taskName).toHaveClass('line-through');
    expect(taskName).toHaveClass('text-gray-500');
  });

  it('renders high priority task with appropriate colors', () => {
    render(<TaskCard task={highPriorityTask} />);
    
    // Check for the task card with high priority styling
    const taskCard = screen.getByText('High Priority Task').closest('div');
    expect(taskCard).toHaveClass('bg-red-100');
    expect(taskCard).toHaveClass('border-l-red-500');
  });

  it('renders past due task with alert icon', () => {
    render(<TaskCard task={pastDueTask} />);
    
    // Check for the alert icon for past due
    const alertIcon = screen.getByText('').closest('svg');
    expect(alertIcon).toBeInTheDocument();
    
    // Check for the past due styling
    const taskCard = screen.getByText('Past Due Task').closest('div');
    expect(taskCard).toHaveClass('bg-red-50');
    expect(taskCard).toHaveClass('border-l-red-500');
  });

  it('renders minimal view when minimal prop is true', () => {
    render(<TaskCard task={mockTask} minimal={true} />);
    
    // Check that the view is minimal (no description shown)
    expect(screen.queryByText('This is a test task')).not.toBeInTheDocument();
    
    // Check that the name is still shown
    expect(screen.getByText('Test Task')).toBeInTheDocument();
  });

  it('calls setCurrentEditItem when clicked', () => {
    render(<TaskCard task={mockTask} />);
    
    // Simulate clicking on the task card
    fireEvent.click(screen.getByText('Test Task'));
    
    // Check that setCurrentEditItem was called with the correct arguments
    expect(mockSetCurrentEditItem).toHaveBeenCalledWith('task-1', 'task');
  });

  it('calls setContextMenuTaskId on right-click', () => {
    render(<TaskCard task={mockTask} />);
    
    // Simulate right-clicking on the task card
    fireEvent.contextMenu(screen.getByText('Test Task'));
    
    // Check that setContextMenuTaskId was called with the correct argument
    expect(mockSetContextMenuTaskId).toHaveBeenCalledWith('task-1');
  });

  it('displays correct duration format for tasks less than 1 hour', () => {
    const shortTask = {
      ...mockTask,
      duration: 30, // 30 minutes
    };
    
    render(<TaskCard task={shortTask} />);
    
    // Check that duration is shown in minutes
    expect(screen.getByText('30m')).toBeInTheDocument();
  });
});