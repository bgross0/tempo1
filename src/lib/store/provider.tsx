'use client';

import { ReactNode } from 'react';
import { useAppStore } from '@/lib/store';

// Create a context provider for the app store
export function AppStoreProvider({ children }: { children: ReactNode }) {
  // The provider doesn't need to do anything special since Zustand is already
  // handling the state management. We're just creating this component to maintain
  // a consistent provider pattern in our application.
  
  return (
    <>
      {children}
    </>
  );
}