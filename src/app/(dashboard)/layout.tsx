'use client';

import { useEffect, useState } from 'react';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';

export default function Layout({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  
  useEffect(() => {
    const checkAuth = async () => {
      try {
        // First check - use auth context
        if (user) {
          console.log('User found in auth context:', user.email);
          setIsAuthenticated(true);
          setIsCheckingAuth(false);
          return;
        }
        
        // Second check - directly check session
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Error checking auth in dashboard layout:', error);
          window.location.href = '/login';
          return;
        }
        
        if (!data.session) {
          console.log('No session found in dashboard layout, redirecting to login');
          window.location.href = '/login';
          return;
        }
        
        console.log('Session found for user:', data.session.user.email);
        setIsAuthenticated(true);
      } catch (err) {
        console.error('Unexpected error in auth check:', err);
        window.location.href = '/login';
      } finally {
        setIsCheckingAuth(false);
      }
    };
    
    // Add a small delay to ensure cookies are properly processed
    const timer = setTimeout(() => {
      checkAuth();
    }, 500);
    
    return () => clearTimeout(timer);
  }, [user]);
  
  // Show loading state
  if (isCheckingAuth || isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }
  
  // Render children only if authenticated
  if (isAuthenticated) {
    return <DashboardLayout>{children}</DashboardLayout>;
  }
  
  // This should not render, but just in case
  return null;
}
