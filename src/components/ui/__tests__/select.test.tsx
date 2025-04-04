import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
  SelectGroup,
  SelectLabel,
  SelectSeparator,
} from '../select';

// Mock RadixUI's Portal to render contents in the test DOM
jest.mock('@radix-ui/react-select', () => {
  const actual = jest.requireActual('@radix-ui/react-select');
  return {
    ...actual,
    Portal: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  };
});

describe('Select Component', () => {
  it('renders a select component with trigger and value', () => {
    render(
      <Select defaultValue="apple">
        <SelectTrigger data-testid="select-trigger">
          <SelectValue placeholder="Select a fruit" />
        </SelectTrigger>
      </Select>
    );
    
    // The trigger should be rendered
    const trigger = screen.getByTestId('select-trigger');
    expect(trigger).toBeInTheDocument();
    
    // The placeholder should not be visible when there's a value
    expect(screen.queryByText('Select a fruit')).not.toBeInTheDocument();
  });

  it('renders with a placeholder when no value is selected', () => {
    render(
      <Select>
        <SelectTrigger>
          <SelectValue placeholder="Select a fruit" />
        </SelectTrigger>
      </Select>
    );
    
    // The placeholder should be visible
    expect(screen.getByText('Select a fruit')).toBeInTheDocument();
  });

  it('opens content when trigger is clicked and displays items', async () => {
    render(
      <Select>
        <SelectTrigger data-testid="select-trigger">
          <SelectValue placeholder="Select a fruit" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="apple">Apple</SelectItem>
          <SelectItem value="banana">Banana</SelectItem>
          <SelectItem value="orange">Orange</SelectItem>
        </SelectContent>
      </Select>
    );
    
    // Click the trigger to open the content
    const trigger = screen.getByTestId('select-trigger');
    fireEvent.click(trigger);
    
    // Wait for the content to appear
    await waitFor(() => {
      expect(screen.getByText('Apple')).toBeInTheDocument();
      expect(screen.getByText('Banana')).toBeInTheDocument();
      expect(screen.getByText('Orange')).toBeInTheDocument();
    });
  });

  it('displays grouped items with labels correctly', async () => {
    render(
      <Select>
        <SelectTrigger data-testid="select-trigger">
          <SelectValue placeholder="Select a fruit" />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            <SelectLabel>Fruits</SelectLabel>
            <SelectItem value="apple">Apple</SelectItem>
            <SelectItem value="banana">Banana</SelectItem>
          </SelectGroup>
          <SelectSeparator />
          <SelectGroup>
            <SelectLabel>Vegetables</SelectLabel>
            <SelectItem value="carrot">Carrot</SelectItem>
            <SelectItem value="potato">Potato</SelectItem>
          </SelectGroup>
        </SelectContent>
      </Select>
    );
    
    // Click the trigger to open the content
    const trigger = screen.getByTestId('select-trigger');
    fireEvent.click(trigger);
    
    // Wait for the content to appear with labels and items
    await waitFor(() => {
      expect(screen.getByText('Fruits')).toBeInTheDocument();
      expect(screen.getByText('Vegetables')).toBeInTheDocument();
      expect(screen.getByText('Apple')).toBeInTheDocument();
      expect(screen.getByText('Banana')).toBeInTheDocument();
      expect(screen.getByText('Carrot')).toBeInTheDocument();
      expect(screen.getByText('Potato')).toBeInTheDocument();
      
      // Check for separator
      const separator = document.querySelector('[class*="h-px"]');
      expect(separator).toBeInTheDocument();
    });
  });

  it('handles disabled items correctly', async () => {
    render(
      <Select>
        <SelectTrigger data-testid="select-trigger">
          <SelectValue placeholder="Select a fruit" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="apple">Apple</SelectItem>
          <SelectItem value="banana" disabled>Banana</SelectItem>
          <SelectItem value="orange">Orange</SelectItem>
        </SelectContent>
      </Select>
    );
    
    // Click the trigger to open the content
    const trigger = screen.getByTestId('select-trigger');
    fireEvent.click(trigger);
    
    // Wait for the content to appear
    await waitFor(() => {
      expect(screen.getByText('Apple')).toBeInTheDocument();
      expect(screen.getByText('Banana')).toBeInTheDocument();
      expect(screen.getByText('Orange')).toBeInTheDocument();
      
      // The banana item should have the disabled class
      const bananaItem = screen.getByText('Banana').closest('[data-disabled]');
      expect(bananaItem).toBeInTheDocument();
    });
  });

  it('applies custom classes to components correctly', () => {
    render(
      <Select>
        <SelectTrigger className="custom-trigger-class" data-testid="select-trigger">
          <SelectValue className="custom-value-class" placeholder="Select a fruit" />
        </SelectTrigger>
        <SelectContent className="custom-content-class">
          <SelectGroup className="custom-group-class">
            <SelectLabel className="custom-label-class">Fruits</SelectLabel>
            <SelectItem className="custom-item-class" value="apple">Apple</SelectItem>
          </SelectGroup>
          <SelectSeparator className="custom-separator-class" />
        </SelectContent>
      </Select>
    );
    
    // Check custom class on trigger
    const trigger = screen.getByTestId('select-trigger');
    expect(trigger).toHaveClass('custom-trigger-class');
    
    // Check that it still has base classes
    expect(trigger).toHaveClass('flex');
    expect(trigger).toHaveClass('h-10');
  });

  it('forwards ref to trigger element', () => {
    const ref = React.createRef<HTMLButtonElement>();
    
    render(
      <Select>
        <SelectTrigger ref={ref} data-testid="select-trigger">
          <SelectValue placeholder="Select a fruit" />
        </SelectTrigger>
      </Select>
    );
    
    expect(ref.current).not.toBeNull();
    expect(ref.current).toEqual(screen.getByTestId('select-trigger'));
  });

  it('renders with icons in trigger and items', async () => {
    render(
      <Select>
        <SelectTrigger data-testid="select-trigger">
          <SelectValue placeholder="Select a fruit" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="apple">
            Apple
          </SelectItem>
        </SelectContent>
      </Select>
    );
    
    // Check for chevron icon in trigger
    const trigger = screen.getByTestId('select-trigger');
    expect(trigger.querySelector('svg')).toBeInTheDocument();
    
    // Click to open content
    fireEvent.click(trigger);
    
    // Wait for content to appear and check for check icon in selected item
    await waitFor(() => {
      expect(screen.getByText('Apple')).toBeInTheDocument();
      
      // Hard to test for icon directly since it's only shown for selected items
      // and we're not mocking the selection state here
    });
  });
});