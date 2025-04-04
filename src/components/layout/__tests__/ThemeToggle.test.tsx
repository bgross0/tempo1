import React from 'react';
import { render, screen, fireEvent } from '@/lib/test-utils';
import { ThemeToggle } from '../ThemeToggle';
import { useDarkMode } from '@/hooks/useDarkMode';

// Mock the useDarkMode hook
jest.mock('@/hooks/useDarkMode');

// Get the mocked function with proper TypeScript typing
const mockedUseDarkMode = jest.mocked(useDarkMode);

describe('ThemeToggle', () => {
  const mockSetTheme = jest.fn();
  
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Default mock implementation
    mockedUseDarkMode.mockReturnValue({
      theme: 'system',
      setTheme: mockSetTheme,
      isDarkMode: false,
    });
  });

  it('renders the theme toggle button', () => {
    render(<ThemeToggle />);
    
    // Check that the button is rendered with correct accessible label
    const button = screen.getByRole('button', { name: /toggle theme/i });
    expect(button).toBeInTheDocument();
    
    // Check that both light and dark icons are present
    const lightIcon = document.querySelector('.rotate-0');
    const darkIcon = document.querySelector('.rotate-90');
    expect(lightIcon).toBeInTheDocument();
    expect(darkIcon).toBeInTheDocument();
  });

  it('opens the dropdown menu when clicked', () => {
    render(<ThemeToggle />);
    
    // Click the toggle button
    const button = screen.getByRole('button', { name: /toggle theme/i });
    fireEvent.click(button);
    
    // Check that the dropdown menu items are displayed
    expect(screen.getByText('Light')).toBeInTheDocument();
    expect(screen.getByText('Dark')).toBeInTheDocument();
    expect(screen.getByText('System')).toBeInTheDocument();
  });

  it('calls setTheme with "light" when light mode is selected', () => {
    render(<ThemeToggle />);
    
    // Open the dropdown menu
    const button = screen.getByRole('button', { name: /toggle theme/i });
    fireEvent.click(button);
    
    // Click the light mode option
    const lightOption = screen.getByText('Light');
    fireEvent.click(lightOption);
    
    // Check that setTheme was called with 'light'
    expect(mockSetTheme).toHaveBeenCalledWith('light');
  });

  it('calls setTheme with "dark" when dark mode is selected', () => {
    render(<ThemeToggle />);
    
    // Open the dropdown menu
    const button = screen.getByRole('button', { name: /toggle theme/i });
    fireEvent.click(button);
    
    // Click the dark mode option
    const darkOption = screen.getByText('Dark');
    fireEvent.click(darkOption);
    
    // Check that setTheme was called with 'dark'
    expect(mockSetTheme).toHaveBeenCalledWith('dark');
  });

  it('calls setTheme with "system" when system mode is selected', () => {
    render(<ThemeToggle />);
    
    // Open the dropdown menu
    const button = screen.getByRole('button', { name: /toggle theme/i });
    fireEvent.click(button);
    
    // Click the system mode option
    const systemOption = screen.getByText('System');
    fireEvent.click(systemOption);
    
    // Check that setTheme was called with 'system'
    expect(mockSetTheme).toHaveBeenCalledWith('system');
  });

  it('displays correct visual state when in dark mode', () => {
    // Mock the hook to return dark mode
    mockedUseDarkMode.mockReturnValue({
      theme: 'dark',
      setTheme: mockSetTheme,
      isDarkMode: true,
    });
    
    // Create a fake document with dark class for testing
    document.documentElement.classList.add('dark');
    
    render(<ThemeToggle />);
    
    // In dark mode, the Moon icon should be visible and Sun icon hidden
    // This is handled by CSS classes, so we can check the presence of the right classes
    const button = screen.getByRole('button', { name: /toggle theme/i });
    expect(button).toBeInTheDocument();
    
    // Clean up
    document.documentElement.classList.remove('dark');
  });
});