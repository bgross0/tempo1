// Example React component test with Vitest
import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';

// Simple counter component
function Counter() {
  const [count, setCount] = React.useState(0);
  
  return (
    <div>
      <span data-testid="count">{count}</span>
      <button onClick={() => setCount(count + 1)}>Increment</button>
    </div>
  );
}

// Component tests
describe('Counter Component', () => {
  it('renders with initial count of 0', () => {
    render(<Counter />);
    expect(screen.getByTestId('count').textContent).toBe('0');
  });
  
  it('increments count when button is clicked', async () => {
    render(<Counter />);
    const button = screen.getByRole('button', { name: /increment/i });
    
    fireEvent.click(button);
    expect(screen.getByTestId('count').textContent).toBe('1');
    
    fireEvent.click(button);
    expect(screen.getByTestId('count').textContent).toBe('2');
  });
});