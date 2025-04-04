import React from 'react';
import { render, screen } from '@testing-library/react';
import { Progress } from '../progress';

describe('Progress Component', () => {
  it('renders a progress bar with 0% progress by default', () => {
    render(<Progress aria-label="Progress" />);
    
    const progressBar = screen.getByRole('progressbar');
    expect(progressBar).toBeInTheDocument();
    
    // Check that the indicator has the correct style for 0% progress
    const indicator = progressBar.querySelector('div');
    expect(indicator).toHaveStyle('transform: translateX(-100%)');
  });

  it('renders a progress bar with specified progress value', () => {
    render(<Progress value={50} aria-label="Progress" />);
    
    const progressBar = screen.getByRole('progressbar');
    expect(progressBar).toBeInTheDocument();
    
    // Check that the indicator has the correct style for 50% progress
    const indicator = progressBar.querySelector('div');
    expect(indicator).toHaveStyle('transform: translateX(-50%)');
  });

  it('renders with custom className', () => {
    render(<Progress className="custom-progress" aria-label="Progress" />);
    
    const progressBar = screen.getByRole('progressbar');
    expect(progressBar).toHaveClass('custom-progress');
    // Should still have the base classes
    expect(progressBar).toHaveClass('relative');
    expect(progressBar).toHaveClass('h-4');
    expect(progressBar).toHaveClass('w-full');
  });

  it('handles progress values at boundaries', () => {
    const { rerender } = render(<Progress value={0} aria-label="Progress" />);
    
    let progressBar = screen.getByRole('progressbar');
    let indicator = progressBar.querySelector('div');
    expect(indicator).toHaveStyle('transform: translateX(-100%)');
    
    // Test 100% progress
    rerender(<Progress value={100} aria-label="Progress" />);
    
    progressBar = screen.getByRole('progressbar');
    indicator = progressBar.querySelector('div');
    expect(indicator).toHaveStyle('transform: translateX(-0%)');
  });

  it('handles negative progress values by treating them as 0', () => {
    render(<Progress value={-10} aria-label="Progress" />);
    
    const progressBar = screen.getByRole('progressbar');
    const indicator = progressBar.querySelector('div');
    
    // Negative values should be treated as 0
    expect(indicator).toHaveStyle('transform: translateX(-100%)');
  });

  it('handles progress values above 100 correctly', () => {
    render(<Progress value={120} aria-label="Progress" />);
    
    const progressBar = screen.getByRole('progressbar');
    const indicator = progressBar.querySelector('div');
    
    // Values above 100 should result in full progress
    expect(indicator).toHaveStyle('transform: translateX(-0%)');
  });

  it('forwards additional props to the root element', () => {
    render(
      <Progress 
        aria-label="Test progress"
        data-testid="test-progress"
        id="progress-1"
      />
    );
    
    const progressBar = screen.getByRole('progressbar');
    expect(progressBar).toHaveAttribute('aria-label', 'Test progress');
    expect(progressBar).toHaveAttribute('data-testid', 'test-progress');
    expect(progressBar).toHaveAttribute('id', 'progress-1');
  });

  it('renders with the correct aria attributes for accessibility', () => {
    render(<Progress value={75} max={100} aria-label="Loading progress" />);
    
    const progressBar = screen.getByRole('progressbar');
    expect(progressBar).toHaveAttribute('aria-label', 'Loading progress');
    expect(progressBar).toHaveAttribute('max', '100');
    expect(progressBar).toHaveAttribute('value', '75');
  });

  it('supports ref forwarding to the root element', () => {
    const ref = React.createRef<HTMLDivElement>();
    render(<Progress ref={ref} aria-label="Progress" />);
    
    expect(ref.current).not.toBeNull();
    expect(ref.current?.getAttribute('role')).toBe('progressbar');
  });
});