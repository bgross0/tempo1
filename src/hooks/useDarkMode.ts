import { useState } from 'react';

type Theme = 'dark' | 'light' | 'system';

// Simplified version that doesn't modify HTML classes
export function useDarkMode() {
  const [theme, setTheme] = useState<Theme>('light');
  const [isDarkMode, setIsDarkMode] = useState(false);
  
  // Basic function that doesn't actually do anything
  // This is temporary to disable the dark mode functionality
  const setThemeNoOp = (newTheme: Theme) => {
    console.log("Theme changing disabled temporarily", newTheme);
    // Don't actually set the theme
  };
  
  return { 
    theme, 
    setTheme: setThemeNoOp, 
    isDarkMode: false 
  };
}
