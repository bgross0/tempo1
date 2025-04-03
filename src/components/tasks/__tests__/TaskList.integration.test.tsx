import React from 'react';
import { render, screen, fireEvent, waitFor } from '@/lib/test-utils';
import TaskList from '@/components/tasks/TaskList';
import { supabase } from '@/lib/supabase';

describe('TaskList Integration', () => {
  const mockTasks = [
    {
      id: '1',
      user_id: 'user-123',
      name: 'Complete project proposal',
      description: 'Finish the TaskJet proposal',
      priority: 'high',
      due_date: '2025-05-01',
      completed: false,
      created_at: '2025-04-01T10:00:00Z',
      updated_at: '2025-04-01T10:00:00Z',
    },
    {
      id: '2',
      user_id: 'user-123',
      name: 'Research competitors',
      description: 'Analyze similar task management apps',
      priority: 'medium',
      due_date: '2025-04-15',
      completed: true,
      completed_at: '2025-04-10T15:30:00Z',
      created_at: '2025-04-01T11:00:00Z',
      updated_at: '2025-04-10T15:30:00Z',
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Mock the Supabase query response
    (supabase.from as jest.Mock).mockImplementation((table) => {
      if (table === 'tasks') {
        return {
          select: jest.fn().mockReturnValue({
            eq: jest.fn().mockReturnValue({
              order: jest.fn().mockResolvedValue({
                data: mockTasks,
                error: null,
              }),
            }),
          }),
          update: jest.fn().mockReturnValue({
            eq: jest.fn().mockResolvedValue({
              data: { ...mockTasks[0], completed: true },
              error: null,
            }),
          }),
          delete: jest.fn().mockReturnValue({
            eq: jest.fn().mockResolvedValue({
              data: {},
              error: null,
            }),
          }),
        };
      }
      return {
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            data: [],
            error: null,
          }),
        }),
      };
    });
  });

  it('should render tasks from the API', async () => {
    render(<TaskList />);

    // Check loading state
    expect(screen.getByText(/loading tasks/i)).toBeInTheDocument();

    // Wait for tasks to load
    await waitFor(() => {
      expect(screen.getByText('Complete project proposal')).toBeInTheDocument();
      expect(screen.getByText('Research competitors')).toBeInTheDocument();
    });

    // Verify task details are displayed correctly
    expect(screen.getByText('high')).toBeInTheDocument();
    expect(screen.getByText('medium')).toBeInTheDocument();
    expect(screen.getByText(/may 1, 2025/i)).toBeInTheDocument();
    expect(screen.getByText(/apr 15, 2025/i)).toBeInTheDocument();
  });

  it('should mark a task as complete', async () => {
    render(<TaskList />);

    // Wait for tasks to load
    await waitFor(() => {
      expect(screen.getByText('Complete project proposal')).toBeInTheDocument();
    });

    // Find the checkbox for the first task and click it
    const checkbox = screen.getAllByRole('checkbox')[0];
    fireEvent.click(checkbox);

    // Verify the Supabase update function was called correctly
    await waitFor(() => {
      expect(supabase.from).toHaveBeenCalledWith('tasks');
      expect(supabase.from('tasks').update).toHaveBeenCalledWith({ 
        completed: true,
        completed_at: expect.any(String)
      });
    });
  });

  it('should filter tasks based on completion status', async () => {
    render(<TaskList />);

    // Wait for tasks to load
    await waitFor(() => {
      expect(screen.getByText('Complete project proposal')).toBeInTheDocument();
      expect(screen.getByText('Research competitors')).toBeInTheDocument();
    });

    // Click the "Completed" filter button
    const completedFilter = screen.getByRole('button', { name: /completed/i });
    fireEvent.click(completedFilter);

    // Only the completed task should be visible
    expect(screen.queryByText('Complete project proposal')).not.toBeInTheDocument();
    expect(screen.getByText('Research competitors')).toBeInTheDocument();

    // Click the "Active" filter button
    const activeFilter = screen.getByRole('button', { name: /active/i });
    fireEvent.click(activeFilter);

    // Only the active task should be visible
    expect(screen.getByText('Complete project proposal')).toBeInTheDocument();
    expect(screen.queryByText('Research competitors')).not.toBeInTheDocument();
  });

  it('should handle API errors gracefully', async () => {
    // Mock an error response
    (supabase.from as jest.Mock).mockImplementation(() => ({
      select: jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          order: jest.fn().mockResolvedValue({
            data: null,
            error: { message: 'Failed to fetch tasks' },
          }),
        }),
      }),
    }));

    render(<TaskList />);

    // Check for error message
    await waitFor(() => {
      expect(screen.getByText(/failed to fetch tasks/i)).toBeInTheDocument();
    });

    // Check for retry button
    const retryButton = screen.getByRole('button', { name: /retry/i });
    expect(retryButton).toBeInTheDocument();

    // Click retry and verify the query is called again
    fireEvent.click(retryButton);
    await waitFor(() => {
      expect(supabase.from).toHaveBeenCalledTimes(2);
    });
  });
});