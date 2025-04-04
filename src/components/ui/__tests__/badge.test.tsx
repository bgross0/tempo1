import React from 'react';
import { render, screen } from '@testing-library/react';
import { Badge } from '../badge';

describe('Badge Component', () => {
  it('renders a badge with default variant', () => {
    render(<Badge>Default Badge</Badge>);
    
    const badge = screen.getByText('Default Badge');
    expect(badge).toBeInTheDocument();
    expect(badge).toHaveClass('bg-blue-500');
    expect(badge).toHaveClass('text-white');
    expect(badge).toHaveClass('border-transparent');
  });

  it('renders a badge with secondary variant', () => {
    render(<Badge variant="secondary">Secondary Badge</Badge>);
    
    const badge = screen.getByText('Secondary Badge');
    expect(badge).toBeInTheDocument();
    expect(badge).toHaveClass('bg-gray-100');
    expect(badge).toHaveClass('text-gray-900');
    expect(badge).toHaveClass('border-transparent');
  });

  it('renders a badge with destructive variant', () => {
    render(<Badge variant="destructive">Destructive Badge</Badge>);
    
    const badge = screen.getByText('Destructive Badge');
    expect(badge).toBeInTheDocument();
    expect(badge).toHaveClass('bg-red-500');
    expect(badge).toHaveClass('text-white');
    expect(badge).toHaveClass('border-transparent');
  });

  it('renders a badge with outline variant', () => {
    render(<Badge variant="outline">Outline Badge</Badge>);
    
    const badge = screen.getByText('Outline Badge');
    expect(badge).toBeInTheDocument();
    expect(badge).toHaveClass('text-gray-950');
    expect(badge).toHaveClass('border-gray-200');
  });

  it('applies custom className correctly', () => {
    render(<Badge className="custom-class">Custom Badge</Badge>);
    
    const badge = screen.getByText('Custom Badge');
    expect(badge).toHaveClass('custom-class');
    // Should still have the base classes
    expect(badge).toHaveClass('inline-flex');
    expect(badge).toHaveClass('rounded-full');
  });

  it('forwards additional props to the div element', () => {
    render(
      <Badge 
        data-testid="test-badge"
        id="badge-1"
        aria-label="Status badge"
      >
        Test Badge
      </Badge>
    );
    
    const badge = screen.getByText('Test Badge');
    expect(badge).toHaveAttribute('data-testid', 'test-badge');
    expect(badge).toHaveAttribute('id', 'badge-1');
    expect(badge).toHaveAttribute('aria-label', 'Status badge');
  });

  it('renders with child elements correctly', () => {
    render(
      <Badge>
        <span data-testid="icon">🔔</span>
        <span data-testid="text">Notification</span>
      </Badge>
    );
    
    expect(screen.getByTestId('icon')).toBeInTheDocument();
    expect(screen.getByTestId('text')).toBeInTheDocument();
    expect(screen.getByText('🔔')).toBeInTheDocument();
    expect(screen.getByText('Notification')).toBeInTheDocument();
  });

  it('has all common base styles regardless of variant', () => {
    const { rerender } = render(<Badge>Default Badge</Badge>);
    
    let badge = screen.getByText('Default Badge');
    expect(badge).toHaveClass('inline-flex');
    expect(badge).toHaveClass('items-center');
    expect(badge).toHaveClass('rounded-full');
    expect(badge).toHaveClass('px-2.5');
    expect(badge).toHaveClass('py-0.5');
    expect(badge).toHaveClass('text-xs');
    expect(badge).toHaveClass('font-semibold');
    
    // Check other variants have the same base classes
    rerender(<Badge variant="secondary">Secondary Badge</Badge>);
    badge = screen.getByText('Secondary Badge');
    expect(badge).toHaveClass('inline-flex');
    expect(badge).toHaveClass('items-center');
    expect(badge).toHaveClass('rounded-full');
  });

  it('renders badges that are accessible', () => {
    render(
      <Badge aria-label="Status: Complete">
        Complete
      </Badge>
    );
    
    const badge = screen.getByText('Complete');
    expect(badge).toHaveAttribute('aria-label', 'Status: Complete');
  });
});