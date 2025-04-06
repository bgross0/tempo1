// Example Vitest test file
import { describe, it, expect } from 'vitest';

// Simple function to test
function sum(a: number, b: number): number {
  return a + b;
}

describe('Example Test Suite', () => {
  it('adds two numbers correctly', () => {
    expect(sum(1, 2)).toBe(3);
  });

  it('demonstrates basic assertions', () => {
    // Type assertions
    expect(sum(1, 2)).toBeTypeOf('number');
    
    // Equality 
    expect('test').toBe('test');
    expect({ a: 1 }).toEqual({ a: 1 });
    
    // Truthiness
    expect(true).toBeTruthy();
    expect(false).toBeFalsy();
    
    // Numeric comparisons
    expect(10).toBeGreaterThan(5);
    expect(5).toBeLessThan(10);
    
    // String matching
    expect('Testing is important').toMatch(/important/);
  });
});