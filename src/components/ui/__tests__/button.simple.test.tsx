import React from 'react';
import { render } from '@testing-library/react';
import { Button } from '../button';

describe('Button Component', () => {
  it('renders a button element', () => {
    const { getByRole } = render(<Button>Click me</Button>);
    const button = getByRole('button', { name: /click me/i });
    expect(button).toBeTruthy();
  });
});