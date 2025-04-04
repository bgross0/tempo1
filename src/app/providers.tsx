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

  // Root provider - intentionally NOT setting dark mode class here
  // Let the useDarkMode hook handle the dark mode class to avoid conflicts
  useEffect(() => {
    if (mounted) {
      console.log("Root providers mounted - dark mode will be handled by useDarkMode hook");
    }
  }, [mounted]);

  // Always render children to avoid hydration issues
  return (
    <AuthProvider>
      <AppStoreProvider>
        {children}
        <Toaster />
      </AppStoreProvider>
    </AuthProvider>
  );
}