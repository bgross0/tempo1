import React from 'react';
import { render, screen, fireEvent, waitFor } from '@/lib/test-utils';
import CalendarView from '@/components/calendar/CalendarView';
import { supabase } from '@/lib/supabase';
import { addDays, format } from 'date-fns';

describe('CalendarView Integration', () => {
  const today = new Date();
  const tomorrow = addDays(today, 1);
  const nextWeek = addDays(today, 7);
  
  const mockEvents = [
    {
      id: '1',
      user_id: 'user-123',
      name: 'Team Meeting',
      description: 'Weekly standup',
      start_date: format(tomorrow, 'yyyy-MM-dd'),
      start_time: '10:00:00',
      end_date: format(tomorrow, 'yyyy-MM-dd'),
      end_time: '11:00:00',
      location: 'Conference Room A',
      recurring: 'none',
      created_at: '2025-04-01T10:00:00Z',
      updated_at: '2025-04-01T10:00:00Z',
    },
    {
      id: '2',
      user_id: 'user-123',
      name: 'Project Review',
      description: 'End of sprint review',
      start_date: format(nextWeek, 'yyyy-MM-dd'),
      start_time: '14:00:00',
      end_date: format(nextWeek, 'yyyy-MM-dd'),
      end_time: '15:30:00',
      location: 'Zoom',
      recurring: 'none',
      created_at: '2025-04-01T11:00:00Z',
      updated_at: '2025-04-01T11:00:00Z',
    },
  ];

  const mockTasks = [
    {
      id: '1',
      user_id: 'user-123',
      name: 'Prepare presentation',
      description: 'For the team meeting',
      priority: 'high',
      due_date: format(tomorrow, 'yyyy-MM-dd'),
      due_time: '09:00:00',
      completed: false,
      created_at: '2025-04-01T10:00:00Z',
      updated_at: '2025-04-01T10:00:00Z',
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Mock the Supabase query responses
    (supabase.from as jest.Mock).mockImplementation((table) => {
      if (table === 'events') {
        return {
          select: jest.fn().mockReturnValue({
            eq: jest.fn().mockReturnValue({
              gte: jest.fn().mockReturnValue({
                lte: jest.fn().mockReturnValue({
                  order: jest.fn().mockResolvedValue({
                    data: mockEvents,
                    error: null,
                  }),
                }),
              }),
            }),
          }),
        };
      } else if (table === 'tasks') {
        return {
          select: jest.fn().mockReturnValue({
            eq: jest.fn().mockReturnValue({
              gte: jest.fn().mockReturnValue({
                lte: jest.fn().mockReturnValue({
                  order: jest.fn().mockResolvedValue({
                    data: mockTasks,
                    error: null,
                  }),
                }),
              }),
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

  it('should render calendar with events and tasks', async () => {
    render(<CalendarView />);

    // Check loading state
    expect(screen.getByText(/loading calendar/i)).toBeInTheDocument();

    // Wait for events to load
    await waitFor(() => {
      expect(screen.getByText('Team Meeting')).toBeInTheDocument();
      expect(screen.getByText('Prepare presentation')).toBeInTheDocument();
    });
  });

  it('should switch between different calendar views', async () => {
    render(<CalendarView />);

    // Wait for events to load
    await waitFor(() => {
      expect(screen.getByText('Team Meeting')).toBeInTheDocument();
    });

    // Change to week view
    const weekButton = screen.getByRole('button', { name: /week/i });
    fireEvent.click(weekButton);

    // Verify week view is active
    expect(screen.getByText(/week of/i)).toBeInTheDocument();

    // Change to month view
    const monthButton = screen.getByRole('button', { name: /month/i });
    fireEvent.click(monthButton);

    // Verify month view is active
    const currentMonth = format(today, 'MMMM yyyy');
    expect(screen.getByText(currentMonth, { exact: false })).toBeInTheDocument();

    // Change to day view
    const dayButton = screen.getByRole('button', { name: /day/i });
    fireEvent.click(dayButton);

    // Verify day view is active
    const currentDay = format(today, 'EEEE, MMMM d');
    expect(screen.getByText(currentDay, { exact: false })).toBeInTheDocument();
  });

  it('should navigate between dates', async () => {
    render(<CalendarView />);

    // Wait for events to load
    await waitFor(() => {
      expect(screen.getByText('Team Meeting')).toBeInTheDocument();
    });

    // Click the next button to navigate forward
    const nextButton = screen.getByLabelText(/next/i);
    fireEvent.click(nextButton);

    // Verify Supabase queries are called again with new date range
    await waitFor(() => {
      expect(supabase.from).toHaveBeenCalledWith('events');
      expect(supabase.from).toHaveBeenCalledWith('tasks');
    });

    // Click the previous button to navigate backward
    const prevButton = screen.getByLabelText(/previous/i);
    fireEvent.click(prevButton);

    // Verify Supabase queries are called again
    await waitFor(() => {
      expect(supabase.from).toHaveBeenCalledTimes(4); // Initial + next + prev = 3 calls
    });
  });

  it('should handle error states gracefully', async () => {
    // Mock an error response
    (supabase.from as jest.Mock).mockImplementation(() => ({
      select: jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          gte: jest.fn().mockReturnValue({
            lte: jest.fn().mockReturnValue({
              order: jest.fn().mockResolvedValue({
                data: null,
                error: { message: 'Failed to fetch calendar data' },
              }),
            }),
          }),
        }),
      }),
    }));

    render(<CalendarView />);

    // Check for error message
    await waitFor(() => {
      expect(screen.getByText(/failed to fetch calendar data/i)).toBeInTheDocument();
    });

    // Check for retry button
    const retryButton = screen.getByRole('button', { name: /retry/i });
    expect(retryButton).toBeInTheDocument();

    // Click retry and verify the query is called again
    fireEvent.click(retryButton);
    await waitFor(() => {
      expect(supabase.from).toHaveBeenCalledWith('events');
      expect(supabase.from).toHaveBeenCalledWith('tasks');
    });
  });
});