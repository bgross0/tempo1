import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuCheckboxItem,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
} from '../dropdown-menu';

// Mock RadixUI's Portal to render contents in the test DOM
jest.mock('@radix-ui/react-dropdown-menu', () => {
  const actual = jest.requireActual('@radix-ui/react-dropdown-menu');
  return {
    ...actual,
    Portal: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  };
});

describe('DropdownMenu Component', () => {
  it('renders a basic dropdown menu', async () => {
    render(
      <DropdownMenu>
        <DropdownMenuTrigger data-testid="trigger">Menu</DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem>Item 1</DropdownMenuItem>
          <DropdownMenuItem>Item 2</DropdownMenuItem>
          <DropdownMenuItem>Item 3</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
    
    // The trigger should be rendered
    const trigger = screen.getByTestId('trigger');
    expect(trigger).toBeInTheDocument();
    
    // Before clicking, the menu content should not be visible
    expect(screen.queryByText('Item 1')).not.toBeInTheDocument();
    
    // Click to open the menu
    fireEvent.click(trigger);
    
    // Now the menu items should be visible
    await waitFor(() => {
      expect(screen.getByText('Item 1')).toBeInTheDocument();
      expect(screen.getByText('Item 2')).toBeInTheDocument();
      expect(screen.getByText('Item 3')).toBeInTheDocument();
    });
  });

  it('handles clicking on menu items', async () => {
    const handleItemClick = jest.fn();
    
    render(
      <DropdownMenu>
        <DropdownMenuTrigger data-testid="trigger">Menu</DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem onClick={handleItemClick}>Clickable Item</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
    
    // Open the menu
    fireEvent.click(screen.getByTestId('trigger'));
    
    // Wait for the item to appear and click it
    await waitFor(() => {
      expect(screen.getByText('Clickable Item')).toBeInTheDocument();
    });
    
    fireEvent.click(screen.getByText('Clickable Item'));
    
    // Check that the click handler was called
    expect(handleItemClick).toHaveBeenCalledTimes(1);
  });

  it('renders checkbox menu items', async () => {
    const handleCheckedChange = jest.fn();
    
    render(
      <DropdownMenu>
        <DropdownMenuTrigger data-testid="trigger">Menu</DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuCheckboxItem
            checked={true}
            onCheckedChange={handleCheckedChange}
          >
            Checked Item
          </DropdownMenuCheckboxItem>
          <DropdownMenuCheckboxItem
            checked={false}
            onCheckedChange={handleCheckedChange}
          >
            Unchecked Item
          </DropdownMenuCheckboxItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
    
    // Open the menu
    fireEvent.click(screen.getByTestId('trigger'));
    
    // Wait for items to appear
    await waitFor(() => {
      expect(screen.getByText('Checked Item')).toBeInTheDocument();
      expect(screen.getByText('Unchecked Item')).toBeInTheDocument();
    });
    
    // Click the checked item to uncheck it
    fireEvent.click(screen.getByText('Checked Item'));
    
    // Check that the handler was called with the new state
    expect(handleCheckedChange).toHaveBeenCalledWith(false);
    
    // Click the unchecked item to check it
    fireEvent.click(screen.getByText('Unchecked Item'));
    
    // Check that the handler was called with the new state
    expect(handleCheckedChange).toHaveBeenCalledWith(true);
  });

  it('renders radio menu items', async () => {
    const handleValueChange = jest.fn();
    
    render(
      <DropdownMenu>
        <DropdownMenuTrigger data-testid="trigger">Menu</DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuRadioGroup value="option2" onValueChange={handleValueChange}>
            <DropdownMenuRadioItem value="option1">Option 1</DropdownMenuRadioItem>
            <DropdownMenuRadioItem value="option2">Option 2</DropdownMenuRadioItem>
            <DropdownMenuRadioItem value="option3">Option 3</DropdownMenuRadioItem>
          </DropdownMenuRadioGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    );
    
    // Open the menu
    fireEvent.click(screen.getByTestId('trigger'));
    
    // Wait for items to appear
    await waitFor(() => {
      expect(screen.getByText('Option 1')).toBeInTheDocument();
      expect(screen.getByText('Option 2')).toBeInTheDocument();
      expect(screen.getByText('Option 3')).toBeInTheDocument();
    });
    
    // Click option 1
    fireEvent.click(screen.getByText('Option 1'));
    
    // Check that the handler was called with the new value
    expect(handleValueChange).toHaveBeenCalledWith('option1');
  });

  it('renders labels and separators correctly', async () => {
    render(
      <DropdownMenu>
        <DropdownMenuTrigger data-testid="trigger">Menu</DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuLabel>Group 1</DropdownMenuLabel>
          <DropdownMenuItem>Item 1</DropdownMenuItem>
          <DropdownMenuItem>Item 2</DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuLabel>Group 2</DropdownMenuLabel>
          <DropdownMenuItem>Item 3</DropdownMenuItem>
          <DropdownMenuItem>Item 4</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
    
    // Open the menu
    fireEvent.click(screen.getByTestId('trigger'));
    
    // Wait for items to appear
    await waitFor(() => {
      // Check for labels
      expect(screen.getByText('Group 1')).toBeInTheDocument();
      expect(screen.getByText('Group 2')).toBeInTheDocument();
      
      // Check for items
      expect(screen.getByText('Item 1')).toBeInTheDocument();
      expect(screen.getByText('Item 2')).toBeInTheDocument();
      expect(screen.getByText('Item 3')).toBeInTheDocument();
      expect(screen.getByText('Item 4')).toBeInTheDocument();
      
      // Separator is harder to test directly since it's just a styled line
      // but we can check it exists in the DOM
      expect(document.querySelector('[class*="h-px"]')).toBeInTheDocument();
    });
  });

  it('renders shortcuts correctly', async () => {
    render(
      <DropdownMenu>
        <DropdownMenuTrigger data-testid="trigger">Menu</DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem>
            Copy
            <DropdownMenuShortcut>⌘C</DropdownMenuShortcut>
          </DropdownMenuItem>
          <DropdownMenuItem>
            Paste
            <DropdownMenuShortcut>⌘V</DropdownMenuShortcut>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
    
    // Open the menu
    fireEvent.click(screen.getByTestId('trigger'));
    
    // Wait for items to appear
    await waitFor(() => {
      expect(screen.getByText('Copy')).toBeInTheDocument();
      expect(screen.getByText('Paste')).toBeInTheDocument();
      
      // Check shortcuts
      expect(screen.getByText('⌘C')).toBeInTheDocument();
      expect(screen.getByText('⌘V')).toBeInTheDocument();
    });
  });

  it('applies custom classes correctly', async () => {
    render(
      <DropdownMenu>
        <DropdownMenuTrigger data-testid="trigger">Menu</DropdownMenuTrigger>
        <DropdownMenuContent className="custom-content-class">
          <DropdownMenuItem className="custom-item-class">
            Custom Item
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
    
    // Open the menu
    fireEvent.click(screen.getByTestId('trigger'));
    
    // Wait for items to appear and check custom classes
    await waitFor(() => {
      const contentElement = screen.getByText('Custom Item').parentElement;
      expect(contentElement).toHaveClass('custom-content-class');
      
      const itemElement = screen.getByText('Custom Item');
      expect(itemElement).toHaveClass('custom-item-class');
    });
  });

  it('handles disabled items correctly', async () => {
    const handleItemClick = jest.fn();
    
    render(
      <DropdownMenu>
        <DropdownMenuTrigger data-testid="trigger">Menu</DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem onClick={handleItemClick}>Enabled Item</DropdownMenuItem>
          <DropdownMenuItem disabled onClick={handleItemClick}>
            Disabled Item
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
    
    // Open the menu
    fireEvent.click(screen.getByTestId('trigger'));
    
    // Wait for items to appear
    await waitFor(() => {
      expect(screen.getByText('Enabled Item')).toBeInTheDocument();
      expect(screen.getByText('Disabled Item')).toBeInTheDocument();
    });
    
    // Click the disabled item
    fireEvent.click(screen.getByText('Disabled Item'));
    
    // The click handler should not be called for disabled items
    expect(handleItemClick).not.toHaveBeenCalled();
    
    // Click the enabled item
    fireEvent.click(screen.getByText('Enabled Item'));
    
    // The click handler should be called
    expect(handleItemClick).toHaveBeenCalledTimes(1);
  });
});