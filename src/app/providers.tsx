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

  // Set mounted state
  useEffect(() => {
    setMounted(true);
  }, []);

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