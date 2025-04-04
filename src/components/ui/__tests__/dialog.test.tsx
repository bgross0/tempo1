import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from '../dialog';
import { Button } from '../button';

// Mock RadixUI's Portal to render contents in the test DOM
jest.mock('@radix-ui/react-dialog', () => {
  const actual = jest.requireActual('@radix-ui/react-dialog');
  return {
    ...actual,
    Portal: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  };
});

describe('Dialog Component', () => {
  it('renders a dialog with trigger, title, description, and close button', async () => {
    render(
      <Dialog>
        <DialogTrigger asChild>
          <Button data-testid="dialog-trigger">Open Dialog</Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Dialog Title</DialogTitle>
            <DialogDescription>This is a dialog description.</DialogDescription>
          </DialogHeader>
          <div>Dialog content goes here</div>
          <DialogFooter>
            <DialogClose asChild>
              <Button data-testid="close-button">Close</Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
    
    // Check that trigger is rendered
    const trigger = screen.getByTestId('dialog-trigger');
    expect(trigger).toBeInTheDocument();
    
    // Dialog content should not be visible initially
    expect(screen.queryByText('Dialog Title')).not.toBeInTheDocument();
    expect(screen.queryByText('This is a dialog description.')).not.toBeInTheDocument();
    
    // Open the dialog
    fireEvent.click(trigger);
    
    // Dialog content should now be visible
    await waitFor(() => {
      expect(screen.getByText('Dialog Title')).toBeInTheDocument();
      expect(screen.getByText('This is a dialog description.')).toBeInTheDocument();
      expect(screen.getByText('Dialog content goes here')).toBeInTheDocument();
      expect(screen.getByTestId('close-button')).toBeInTheDocument();
    });
    
    // Close the dialog using the button
    fireEvent.click(screen.getByTestId('close-button'));
    
    // Dialog content should be hidden again
    await waitFor(() => {
      expect(screen.queryByText('Dialog Title')).not.toBeInTheDocument();
    });
  });

  it('closes when clicking the X icon button', async () => {
    render(
      <Dialog>
        <DialogTrigger asChild>
          <Button data-testid="dialog-trigger">Open Dialog</Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Dialog Title</DialogTitle>
          </DialogHeader>
          <div>Dialog content goes here</div>
        </DialogContent>
      </Dialog>
    );
    
    // Open the dialog
    fireEvent.click(screen.getByTestId('dialog-trigger'));
    
    // Wait for dialog to open
    await waitFor(() => {
      expect(screen.getByText('Dialog Title')).toBeInTheDocument();
    });
    
    // Find and click the X close button (it has a sr-only span with "Close" text)
    const closeButton = screen.getByText('Close').closest('button');
    fireEvent.click(closeButton!);
    
    // Dialog should close
    await waitFor(() => {
      expect(screen.queryByText('Dialog Title')).not.toBeInTheDocument();
    });
  });

  it('applies custom classes correctly', async () => {
    render(
      <Dialog>
        <DialogTrigger asChild>
          <Button data-testid="dialog-trigger">Open Dialog</Button>
        </DialogTrigger>
        <DialogContent className="custom-content-class">
          <DialogHeader className="custom-header-class">
            <DialogTitle className="custom-title-class">Dialog Title</DialogTitle>
            <DialogDescription className="custom-description-class">Description</DialogDescription>
          </DialogHeader>
          <DialogFooter className="custom-footer-class">
            <Button>OK</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
    
    // Open the dialog
    fireEvent.click(screen.getByTestId('dialog-trigger'));
    
    // Wait for dialog to open and check custom classes
    await waitFor(() => {
      expect(screen.getByText('Dialog Title').closest('[class*="custom-content-class"]')).toBeInTheDocument();
      expect(screen.getByText('Dialog Title').closest('[class*="custom-header-class"]')).toBeInTheDocument();
      expect(screen.getByText('Dialog Title')).toHaveClass('custom-title-class');
      expect(screen.getByText('Description')).toHaveClass('custom-description-class');
      expect(screen.getByText('OK').closest('[class*="custom-footer-class"]')).toBeInTheDocument();
    });
  });

  it('renders without a footer', async () => {
    render(
      <Dialog>
        <DialogTrigger asChild>
          <Button data-testid="dialog-trigger">Open Dialog</Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Dialog Title</DialogTitle>
          </DialogHeader>
          <div>Content without footer</div>
        </DialogContent>
      </Dialog>
    );
    
    // Open the dialog
    fireEvent.click(screen.getByTestId('dialog-trigger'));
    
    // Wait for dialog to open
    await waitFor(() => {
      expect(screen.getByText('Dialog Title')).toBeInTheDocument();
      expect(screen.getByText('Content without footer')).toBeInTheDocument();
    });
  });

  it('renders with a form and handles submission', async () => {
    const handleSubmit = jest.fn((e) => e.preventDefault());
    
    render(
      <Dialog>
        <DialogTrigger asChild>
          <Button data-testid="dialog-trigger">Open Form Dialog</Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Form Dialog</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} data-testid="dialog-form">
            <input type="text" placeholder="Enter name" />
            <DialogFooter>
              <Button type="submit" data-testid="submit-button">Submit</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    );
    
    // Open the dialog
    fireEvent.click(screen.getByTestId('dialog-trigger'));
    
    // Wait for dialog to open
    await waitFor(() => {
      expect(screen.getByText('Form Dialog')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Enter name')).toBeInTheDocument();
    });
    
    // Fill the form
    fireEvent.change(screen.getByPlaceholderText('Enter name'), { 
      target: { value: 'Test User' } 
    });
    
    // Submit the form
    fireEvent.click(screen.getByTestId('submit-button'));
    
    // Check that the form submission handler was called
    expect(handleSubmit).toHaveBeenCalledTimes(1);
  });

  it('supports keyboard accessibility', async () => {
    render(
      <Dialog>
        <DialogTrigger asChild>
          <Button data-testid="dialog-trigger">Open Dialog</Button>
        </DialogTrigger>
        <DialogContent>
          <DialogTitle>Keyboard Accessible Dialog</DialogTitle>
          <DialogDescription>Press ESC to close</DialogDescription>
        </DialogContent>
      </Dialog>
    );
    
    // Open the dialog
    fireEvent.click(screen.getByTestId('dialog-trigger'));
    
    // Wait for dialog to open
    await waitFor(() => {
      expect(screen.getByText('Keyboard Accessible Dialog')).toBeInTheDocument();
    });
    
    // Press ESC to close the dialog
    fireEvent.keyDown(document.body, { key: 'Escape', code: 'Escape', keyCode: 27 });
    
    // Dialog should close
    await waitFor(() => {
      expect(screen.queryByText('Keyboard Accessible Dialog')).not.toBeInTheDocument();
    });
  });
});