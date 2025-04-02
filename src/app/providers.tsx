'use client';

import { ReactNode, useEffect, useState } from 'react';
import { AuthProvider } from '@/contexts/AuthContext';
import { Toaster } from '@/components/ui/toaster';
import { AppStoreProvider } from '@/lib/store/provider';

export function Providers({ children }: { children: ReactNode }) {
  const [mounted, setMounted] = useState(false);

  // useEffect only runs on the client, preventing hydration issues with dark mode
  useEffect(() => {
    setMounted(true);
  }, []);

  // Apply theme from localStorage when component mounts
  useEffect(() => {
    if (mounted) {
      // Check for theme in localStorage
      const theme = localStorage.getItem('theme');
      const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      
      // Apply dark mode if explicitly set or if system prefers dark and no preference is saved
      if (
        theme === 'dark' || 
        (theme === 'system' && systemPrefersDark) || 
        (!theme && systemPrefersDark)
      ) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    }
  }, [mounted]);

  return (
    <AuthProvider>
      <AppStoreProvider>
        {children}
        <Toaster />
      </AppStoreProvider>
    </AuthProvider>
  );
}
