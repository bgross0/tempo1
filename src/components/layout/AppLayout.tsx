'use client';

import { ReactNode, useEffect } from 'react';
// Next.js App Router uses useRouter differently
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { SidebarLeft } from '@/components/sidebar-left';

interface AppLayoutProps {
  children: ReactNode;
}

export default function AppLayout({ children }: AppLayoutProps) {
  const { user, loading } = useAuth();
  const router = useRouter();
  
  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);
  
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }
  
  if (!user) {
    return null;
  }
  
  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      <SidebarLeft />
      <div className="flex flex-col flex-1 overflow-hidden">
        <div className="border-b bg-background flex h-14 items-center px-4 justify-between">
          <h1 className="text-lg font-semibold">TaskJet</h1>
        </div>
        <main className="flex-1 overflow-y-auto p-4">
          {children}
        </main>
      </div>
    </div>
  );
}