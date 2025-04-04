import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { Input } from '../input';

describe('Input Component', () => {
  it('renders an input with the correct base styles', () => {
    render(<Input placeholder="Test input" />);
    
    const input = screen.getByPlaceholderText('Test input');
    expect(input).toBeInTheDocument();
    expect(input).toHaveClass('flex');
    expect(input).toHaveClass('h-10');
    expect(input).toHaveClass('w-full');
    expect(input).toHaveClass('rounded-md');
    expect(input).toHaveClass('border');
    expect(input).toHaveClass('border-input');
    expect(input).toHaveClass('bg-background');
  });

  it('applies custom className correctly', () => {
    render(<Input placeholder="Custom input" className="custom-class" />);
    
    const input = screen.getByPlaceholderText('Custom input');
    expect(input).toHaveClass('custom-class');
    // Should still have the base classes
    expect(input).toHaveClass('flex');
    expect(input).toHaveClass('h-10');
  });

  it('handles different types correctly', () => {
    render(<Input type="password" placeholder="Password" />);
    
    const input = screen.getByPlaceholderText('Password');
    expect(input).toHaveAttribute('type', 'password');
  });

  it('handles disabled state correctly', () => {
    render(<Input placeholder="Disabled input" disabled />);
    
    const input = screen.getByPlaceholderText('Disabled input');
    expect(input).toBeDisabled();
    expect(input).toHaveClass('disabled:cursor-not-allowed');
    expect(input).toHaveClass('disabled:opacity-50');
  });

  it('handles required state correctly', () => {
    render(<Input placeholder="Required input" required />);
    
    const input = screen.getByPlaceholderText('Required input');
    expect(input).toHaveAttribute('required');
  });

  it('accepts and updates values', () => {
    render(<Input placeholder="Value input" />);
    
    const input = screen.getByPlaceholderText('Value input');
    fireEvent.change(input, { target: { value: 'test value' } });
    
    expect(input).toHaveValue('test value');
  });

  it('calls onChange handler when value changes', () => {
    const handleChange = jest.fn();
    render(<Input placeholder="Change input" onChange={handleChange} />);
    
    const input = screen.getByPlaceholderText('Change input');
    fireEvent.change(input, { target: { value: 'new value' } });
    
    expect(handleChange).toHaveBeenCalledTimes(1);
  });

  it('forwards other props to the underlying input', () => {
    render(
      <Input 
        placeholder="Props input"
        id="test-id"
        name="test-name"
        maxLength={10}
        autoComplete="off"
        aria-label="Test input"
      />
    );
    
    const input = screen.getByPlaceholderText('Props input');
    expect(input).toHaveAttribute('id', 'test-id');
    expect(input).toHaveAttribute('name', 'test-name');
    expect(input).toHaveAttribute('maxLength', '10');
    expect(input).toHaveAttribute('autoComplete', 'off');
    expect(input).toHaveAttribute('aria-label', 'Test input');
  });

  it('supports ref forwarding', () => {
    const ref = React.createRef<HTMLInputElement>();
    render(<Input placeholder="Ref input" ref={ref} />);
    
    expect(ref.current).not.toBeNull();
    expect(ref.current?.tagName).toBe('INPUT');
  });

  it('handles focus and blur events', () => {
    const handleFocus = jest.fn();
    const handleBlur = jest.fn();
    
    render(
      <Input 
        placeholder="Focus input" 
        onFocus={handleFocus} 
        onBlur={handleBlur}
      />
    );
    
    const input = screen.getByPlaceholderText('Focus input');
    
    fireEvent.focus(input);
    expect(handleFocus).toHaveBeenCalledTimes(1);
    
    fireEvent.blur(input);
    expect(handleBlur).toHaveBeenCalledTimes(1);
  });
});