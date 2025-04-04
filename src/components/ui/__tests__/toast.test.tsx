import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import {
  Toast,
  ToastProvider,
  ToastViewport,
  ToastTitle,
  ToastDescription,
  ToastAction,
  ToastClose,
} from '../toast';

// Mock RadixUI's Provider and animations
jest.mock('@radix-ui/react-toast', () => {
  const actual = jest.requireActual('@radix-ui/react-toast');
  return {
    ...actual,
    Provider: function ToastProviderMock({ children }: { children: React.ReactNode }) {
      return <div data-testid="toast-provider">{children}</div>;
    },
    Viewport: React.forwardRef(function ToastViewportMock({ children, ...props }: any, ref: any) {
      return (
        <div data-testid="toast-viewport" {...props} ref={ref}>
          {children}
        </div>
      );
    }),
    Root: React.forwardRef(function ToastRootMock({ children, ...props }: any, ref: any) {
      return (
        <div data-testid="toast-root" {...props} ref={ref}>
          {children}
        </div>
      );
    }),
  };
});

describe('Toast Component', () => {
  it('renders toast provider and viewport', () => {
    render(
      <ToastProvider>
        <ToastViewport />
      </ToastProvider>
    );
    
    expect(screen.getByTestId('toast-provider')).toBeInTheDocument();
    expect(screen.getByTestId('toast-viewport')).toBeInTheDocument();
  });

  it('renders a basic toast with title and description', () => {
    render(
      <Toast>
        <ToastTitle>Notification</ToastTitle>
        <ToastDescription>Your message has been sent.</ToastDescription>
      </Toast>
    );
    
    expect(screen.getByTestId('toast-root')).toBeInTheDocument();
    expect(screen.getByText('Notification')).toBeInTheDocument();
    expect(screen.getByText('Your message has been sent.')).toBeInTheDocument();
  });

  it('renders with default variant styling', () => {
    render(<Toast variant="default">Default Toast</Toast>);
    
    const toast = screen.getByText('Default Toast').closest('[data-testid="toast-root"]');
    expect(toast).toHaveClass('border');
    expect(toast).toHaveClass('bg-background');
  });

  it('renders with destructive variant styling', () => {
    render(<Toast variant="destructive">Destructive Toast</Toast>);
    
    const toast = screen.getByText('Destructive Toast').closest('[data-testid="toast-root"]');
    expect(toast).toHaveClass('destructive');
    expect(toast).toHaveClass('border-destructive');
    expect(toast).toHaveClass('bg-destructive');
  });

  it('renders with a close button', () => {
    render(
      <Toast>
        <ToastTitle>Notification</ToastTitle>
        <ToastClose data-testid="toast-close-button" />
      </Toast>
    );
    
    const closeButton = screen.getByTestId('toast-close-button');
    expect(closeButton).toBeInTheDocument();
    
    // Check for X icon
    const xIcon = closeButton.querySelector('svg');
    expect(xIcon).toBeInTheDocument();
  });

  it('renders with action button', () => {
    const handleAction = jest.fn();
    
    render(
      <Toast>
        <ToastTitle>Notification</ToastTitle>
        <ToastDescription>Your changes were not saved.</ToastDescription>
        <ToastAction 
          data-testid="toast-action" 
          altText="Retry"
          onClick={handleAction}
        >
          Retry
        </ToastAction>
      </Toast>
    );
    
    const actionButton = screen.getByTestId('toast-action');
    expect(actionButton).toBeInTheDocument();
    expect(screen.getByText('Retry')).toBeInTheDocument();
    
    // Test action click handler
    fireEvent.click(actionButton);
    expect(handleAction).toHaveBeenCalledTimes(1);
  });

  it('applies custom classes to toast components', () => {
    render(
      <Toast className="custom-toast-class">
        <ToastTitle className="custom-title-class">Title</ToastTitle>
        <ToastDescription className="custom-description-class">Description</ToastDescription>
        <ToastAction className="custom-action-class">Action</ToastAction>
        <ToastClose className="custom-close-class" />
      </Toast>
    );
    
    // Check for custom classes
    const toast = screen.getByText('Title').closest('[data-testid="toast-root"]');
    expect(toast).toHaveClass('custom-toast-class');
    
    expect(screen.getByText('Title')).toHaveClass('custom-title-class');
    expect(screen.getByText('Description')).toHaveClass('custom-description-class');
    expect(screen.getByText('Action')).toHaveClass('custom-action-class');
  });

  it('handles viewport position correctly', () => {
    render(
      <ToastViewport className="custom-viewport-class" />
    );
    
    const viewport = screen.getByTestId('toast-viewport');
    expect(viewport).toHaveClass('custom-viewport-class');
    expect(viewport).toHaveClass('fixed');
    expect(viewport).toHaveClass('top-0');
    expect(viewport).toHaveClass('z-[100]');
  });

  it('forwards refs to components', () => {
    const toastRef = React.createRef<HTMLDivElement>();
    const titleRef = React.createRef<HTMLDivElement>();
    const descriptionRef = React.createRef<HTMLDivElement>();
    
    render(
      <Toast ref={toastRef}>
        <ToastTitle ref={titleRef}>Title</ToastTitle>
        <ToastDescription ref={descriptionRef}>Description</ToastDescription>
      </Toast>
    );
    
    expect(toastRef.current).not.toBeNull();
    expect(titleRef.current).not.toBeNull();
    expect(descriptionRef.current).not.toBeNull();
  });
});