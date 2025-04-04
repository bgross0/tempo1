import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { Checkbox } from '../checkbox';

describe('Checkbox Component', () => {
  it('renders a checkbox with the correct base styles', () => {
    render(<Checkbox aria-label="Test checkbox" />);
    
    const checkbox = screen.getByRole('checkbox', { name: /test checkbox/i });
    expect(checkbox).toBeInTheDocument();
    expect(checkbox).toHaveClass('peer');
    expect(checkbox).toHaveClass('h-4');
    expect(checkbox).toHaveClass('w-4');
    expect(checkbox).toHaveClass('rounded-sm');
    expect(checkbox).toHaveClass('border');
    expect(checkbox).toHaveClass('border-primary');
  });

  it('applies custom className correctly', () => {
    render(<Checkbox aria-label="Custom checkbox" className="custom-class" />);
    
    const checkbox = screen.getByRole('checkbox', { name: /custom checkbox/i });
    expect(checkbox).toHaveClass('custom-class');
    // Should still have the base classes
    expect(checkbox).toHaveClass('peer');
  });

  it('handles disabled state correctly', () => {
    render(<Checkbox aria-label="Disabled checkbox" disabled />);
    
    const checkbox = screen.getByRole('checkbox', { name: /disabled checkbox/i });
    expect(checkbox).toBeDisabled();
    expect(checkbox).toHaveClass('disabled:cursor-not-allowed');
    expect(checkbox).toHaveClass('disabled:opacity-50');
  });

  it('handles checked state correctly', () => {
    const { container } = render(
      <Checkbox aria-label="Checked checkbox" checked />
    );
    
    const checkbox = screen.getByRole('checkbox', { name: /checked checkbox/i });
    expect(checkbox).toBeChecked();
    
    // Check for the indicator element when checked
    const indicator = container.querySelector('[data-state="checked"]');
    expect(indicator).toBeInTheDocument();
  });

  it('calls onChange handler when clicked', () => {
    const handleChange = jest.fn();
    render(
      <Checkbox aria-label="Interactive checkbox" onCheckedChange={handleChange} />
    );
    
    const checkbox = screen.getByRole('checkbox', { name: /interactive checkbox/i });
    fireEvent.click(checkbox);
    
    expect(handleChange).toHaveBeenCalledTimes(1);
    expect(handleChange).toHaveBeenCalledWith(true);
  });

  it('forwards other props to the underlying element', () => {
    render(
      <Checkbox 
        aria-label="Props checkbox"
        id="test-id"
        data-testid="test-checkbox"
      />
    );
    
    const checkbox = screen.getByRole('checkbox', { name: /props checkbox/i });
    expect(checkbox).toHaveAttribute('id', 'test-id');
    expect(checkbox).toHaveAttribute('data-testid', 'test-checkbox');
  });

  it('renders the check icon when checked', () => {
    const { container } = render(
      <Checkbox aria-label="Checked with icon" checked />
    );
    
    // Since the SVG is not easily testable with getByRole, we'll look for it in the container
    const checkIcon = container.querySelector('svg');
    expect(checkIcon).toBeInTheDocument();
    expect(checkIcon).toHaveClass('h-4');
    expect(checkIcon).toHaveClass('w-4');
  });

  it('toggles checked state on click', () => {
    render(<Checkbox aria-label="Toggle checkbox" defaultChecked={false} />);
    
    const checkbox = screen.getByRole('checkbox', { name: /toggle checkbox/i });
    expect(checkbox).not.toBeChecked();
    
    fireEvent.click(checkbox);
    expect(checkbox).toBeChecked();
    
    fireEvent.click(checkbox);
    expect(checkbox).not.toBeChecked();
  });
});