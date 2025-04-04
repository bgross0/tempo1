import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TaskForm } from '../task-form';
import { Task } from '@/types/database';
import { format } from 'date-fns';

// Mock dependencies
jest.mock('@hookform/resolvers/zod', () => ({
  zodResolver: jest.fn(() => jest.fn()),
}));

// Create a sample task for testing
const mockTask: Partial<Task> = {
  id: 'task-1',
  name: 'Test Task',
  description: 'This is a test task',
  start_date: '2025-05-01',
  start_time: '09:00',
  due_date: '2025-05-15',
  due_time: '17:00',
  priority: 'high',
  duration: 120,
  chunk_size: 30,
  hard_deadline: true,
  project_id: null,
  tags: ['test', 'important'],
};

describe('TaskForm Component', () => {
  const onSubmitMock = jest.fn().mockResolvedValue(undefined);
  const onCancelMock = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders the form with default values for a new task', () => {
    render(
      <TaskForm onSubmit={onSubmitMock} onCancel={onCancelMock} />
    );
    
    // Check that form elements are rendered
    expect(screen.getByLabelText(/task name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/description/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/due date/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/priority/i)).toBeInTheDocument();
    
    // Check default values
    expect(screen.getByLabelText(/task name/i)).toHaveValue('');
    expect(screen.getByLabelText(/description/i)).toHaveValue('');
    expect(screen.getByLabelText(/due date/i)).toHaveValue(format(new Date(), 'yyyy-MM-dd'));
    
    // Check buttons
    expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /create task/i })).toBeInTheDocument();
  });

  it('renders the form with initial data for editing a task', () => {
    render(
      <TaskForm 
        initialData={mockTask as Task} 
        onSubmit={onSubmitMock} 
        onCancel={onCancelMock} 
      />
    );
    
    // Check that form elements are rendered with initial data
    expect(screen.getByLabelText(/task name/i)).toHaveValue('Test Task');
    expect(screen.getByLabelText(/description/i)).toHaveValue('This is a test task');
    expect(screen.getByLabelText(/due date/i)).toHaveValue('2025-05-15');
    expect(screen.getByLabelText(/due time/i)).toHaveValue('17:00');
    expect(screen.getByLabelText(/start date/i)).toHaveValue('2025-05-01');
    expect(screen.getByLabelText(/start time/i)).toHaveValue('09:00');
    
    // Check duration and chunk size
    const durationInput = screen.getByLabelText(/duration/i);
    expect(durationInput).toHaveValue(120);
    
    const chunkSizeInput = screen.getByLabelText(/chunk size/i);
    expect(chunkSizeInput).toHaveValue(30);
    
    // Check hard deadline checkbox
    const hardDeadlineCheckbox = screen.getByRole('checkbox', { name: /hard deadline/i });
    expect(hardDeadlineCheckbox).toBeChecked();
    
    // Check that the update button is shown instead of create
    expect(screen.getByRole('button', { name: /update task/i })).toBeInTheDocument();
  });

  it('calls onCancel when cancel button is clicked', () => {
    render(
      <TaskForm onSubmit={onSubmitMock} onCancel={onCancelMock} />
    );
    
    const cancelButton = screen.getByRole('button', { name: /cancel/i });
    fireEvent.click(cancelButton);
    
    expect(onCancelMock).toHaveBeenCalledTimes(1);
  });

  it('validates required fields on submission', async () => {
    render(
      <TaskForm onSubmit={onSubmitMock} onCancel={onCancelMock} />
    );
    
    // Clear the task name field (it's required)
    const nameInput = screen.getByLabelText(/task name/i);
    fireEvent.change(nameInput, { target: { value: '' } });
    
    // Submit the form
    const submitButton = screen.getByRole('button', { name: /create task/i });
    fireEvent.click(submitButton);
    
    // The form should not submit if validation fails
    await waitFor(() => {
      expect(onSubmitMock).not.toHaveBeenCalled();
    });
  });

  it('submits form with entered values', async () => {
    const user = userEvent.setup();
    
    render(
      <TaskForm onSubmit={onSubmitMock} onCancel={onCancelMock} />
    );
    
    // Fill out the form
    await user.type(screen.getByLabelText(/task name/i), 'New Task');
    await user.type(screen.getByLabelText(/description/i), 'This is a new task');
    
    // Set due date to next month
    const nextMonth = new Date();
    nextMonth.setMonth(nextMonth.getMonth() + 1);
    const formattedDate = format(nextMonth, 'yyyy-MM-dd');
    
    const dueDateInput = screen.getByLabelText(/due date/i);
    fireEvent.change(dueDateInput, { target: { value: formattedDate } });
    
    // Set duration
    const durationInput = screen.getByLabelText(/duration/i);
    fireEvent.change(durationInput, { target: { value: '60' } });
    
    // Select priority (this is more complicated due to the custom Select component)
    // For simplicity, we'll just test the submission with default values
    
    // Submit the form
    const submitButton = screen.getByRole('button', { name: /create task/i });
    await user.click(submitButton);
    
    // Check loading state
    expect(submitButton).toHaveTextContent(/saving/i);
    
    // Wait for submission to complete
    await waitFor(() => {
      expect(onSubmitMock).toHaveBeenCalledTimes(1);
    });
    
    // Verify the submitted data
    expect(onSubmitMock).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'New Task',
        description: 'This is a new task',
        due_date: formattedDate,
        duration: 60,
      })
    );
  });

  it('toggles the hard deadline checkbox correctly', async () => {
    const user = userEvent.setup();
    
    render(
      <TaskForm onSubmit={onSubmitMock} onCancel={onCancelMock} />
    );
    
    const hardDeadlineCheckbox = screen.getByRole('checkbox', { name: /hard deadline/i });
    expect(hardDeadlineCheckbox).not.toBeChecked();
    
    await user.click(hardDeadlineCheckbox);
    expect(hardDeadlineCheckbox).toBeChecked();
    
    await user.click(hardDeadlineCheckbox);
    expect(hardDeadlineCheckbox).not.toBeChecked();
  });

  it('handles error during form submission', async () => {
    // Mock console.error to prevent test output pollution
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    
    // Mock a rejected promise for the onSubmit function
    const onSubmitWithError = jest.fn().mockRejectedValue(new Error('Submission failed'));
    
    render(
      <TaskForm onSubmit={onSubmitWithError} onCancel={onCancelMock} />
    );
    
    // Fill required field
    const nameInput = screen.getByLabelText(/task name/i);
    fireEvent.change(nameInput, { target: { value: 'Task with error' } });
    
    // Submit the form
    const submitButton = screen.getByRole('button', { name: /create task/i });
    fireEvent.click(submitButton);
    
    // Wait for the error to be caught
    await waitFor(() => {
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Error submitting task:', 
        expect.any(Error)
      );
    });
    
    // Button should return to normal state
    expect(submitButton).toHaveTextContent(/create task/i);
    
    // Clean up
    consoleErrorSpy.mockRestore();
  });
});