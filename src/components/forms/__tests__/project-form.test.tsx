import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ProjectForm } from '../project-form';
import { Project } from '@/types/database';
import { format, addDays } from 'date-fns';

// Mock react-hook-form and zod resolver
jest.mock('react-hook-form', () => {
  const original = jest.requireActual('react-hook-form');
  return {
    ...original,
    useForm: jest.fn(() => ({
      control: {},
      handleSubmit: (callback) => (data) => callback(data),
      register: jest.fn(),
      formState: { errors: {} },
      setValue: jest.fn(),
      reset: jest.fn(),
    })),
  };
});

jest.mock('@hookform/resolvers/zod', () => ({
  zodResolver: jest.fn(() => jest.fn()),
}));

describe('ProjectForm Component', () => {
  const today = new Date();
  const nextWeek = addDays(today, 7);
  
  const mockProject: Partial<Project> = {
    id: 'project-1',
    name: 'Test Project',
    description: 'This is a test project',
    start_date: format(today, 'yyyy-MM-dd'),
    due_date: format(nextWeek, 'yyyy-MM-dd'),
    priority: 'high',
    tags: ['test', 'important'],
  };
  
  const onSubmitMock = jest.fn().mockResolvedValue(undefined);
  const onCancelMock = jest.fn();
  
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders the form with default values for a new project', () => {
    render(
      <ProjectForm onSubmit={onSubmitMock} onCancel={onCancelMock} />
    );
    
    // Check that form elements are rendered
    expect(screen.getByLabelText(/project name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/description/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/start date/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/due date/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/priority/i)).toBeInTheDocument();
    
    // Check buttons
    expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /create project/i })).toBeInTheDocument();
  });

  it('renders the form with initial data for editing a project', () => {
    render(
      <ProjectForm 
        initialData={mockProject as Project} 
        onSubmit={onSubmitMock} 
        onCancel={onCancelMock} 
      />
    );
    
    // Check that form elements are rendered with initial data
    const nameInput = screen.getByLabelText(/project name/i);
    expect(nameInput).toHaveAttribute('value', 'Test Project');
    
    const descriptionInput = screen.getByLabelText(/description/i);
    expect(descriptionInput).toHaveValue('This is a test project');
    
    const startDateInput = screen.getByLabelText(/start date/i);
    expect(startDateInput).toHaveAttribute('value', format(today, 'yyyy-MM-dd'));
    
    const dueDateInput = screen.getByLabelText(/due date/i);
    expect(dueDateInput).toHaveAttribute('value', format(nextWeek, 'yyyy-MM-dd'));
    
    // Check that the update button is shown instead of create
    expect(screen.getByRole('button', { name: /update project/i })).toBeInTheDocument();
  });

  it('calls onCancel when cancel button is clicked', () => {
    render(
      <ProjectForm onSubmit={onSubmitMock} onCancel={onCancelMock} />
    );
    
    const cancelButton = screen.getByRole('button', { name: /cancel/i });
    fireEvent.click(cancelButton);
    
    expect(onCancelMock).toHaveBeenCalledTimes(1);
  });

  it('submits the form with entered values', async () => {
    const user = userEvent.setup();
    
    render(
      <ProjectForm onSubmit={onSubmitMock} onCancel={onCancelMock} />
    );
    
    // Fill out the form
    await user.type(screen.getByLabelText(/project name/i), 'New Project');
    await user.type(screen.getByLabelText(/description/i), 'This is a new project');
    
    // Change start date
    const startDateInput = screen.getByLabelText(/start date/i);
    fireEvent.change(startDateInput, { target: { value: '2025-05-01' } });
    
    // Change due date
    const dueDateInput = screen.getByLabelText(/due date/i);
    fireEvent.change(dueDateInput, { target: { value: '2025-05-15' } });
    
    // Submit the form
    const submitButton = screen.getByRole('button', { name: /create project/i });
    await user.click(submitButton);
    
    // Check that the button shows loading state
    expect(submitButton).toHaveTextContent(/saving/i);
    
    // Wait for the promise to resolve
    await waitFor(() => {
      expect(onSubmitMock).toHaveBeenCalled();
    });
  });

  it('displays error when form submission fails', async () => {
    // Mock console.error to prevent test output pollution
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    
    // Mock a rejected promise for the onSubmit function
    const onSubmitWithError = jest.fn().mockRejectedValue(new Error('Submission failed'));
    
    render(
      <ProjectForm onSubmit={onSubmitWithError} onCancel={onCancelMock} />
    );
    
    // Submit the form
    const submitButton = screen.getByRole('button', { name: /create project/i });
    fireEvent.click(submitButton);
    
    // Wait for the promise to reject
    await waitFor(() => {
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Error submitting project:', 
        expect.any(Error)
      );
    });
    
    // Check that the button returns to normal state
    expect(submitButton).toHaveTextContent(/create project/i);
    
    // Clean up
    consoleErrorSpy.mockRestore();
  });

  it('disables buttons during submission', async () => {
    // Create a promise that won't resolve immediately
    let resolvePromise: (value: unknown) => void;
    const pendingPromise = new Promise((resolve) => {
      resolvePromise = resolve;
    });
    
    const pendingSubmit = jest.fn().mockReturnValue(pendingPromise);
    
    render(
      <ProjectForm onSubmit={pendingSubmit} onCancel={onCancelMock} />
    );
    
    // Submit the form
    const submitButton = screen.getByRole('button', { name: /create project/i });
    const cancelButton = screen.getByRole('button', { name: /cancel/i });
    
    fireEvent.click(submitButton);
    
    // Check that both buttons are disabled during submission
    await waitFor(() => {
      expect(submitButton).toBeDisabled();
      expect(cancelButton).toBeDisabled();
    });
    
    // Resolve the promise
    resolvePromise!(undefined);
    
    // Buttons should be enabled again
    await waitFor(() => {
      expect(submitButton).not.toBeDisabled();
      expect(cancelButton).not.toBeDisabled();
    });
  });
});