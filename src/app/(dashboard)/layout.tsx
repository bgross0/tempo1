'use client';

import { useEffect, useState } from 'react';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';

// Add a global variable to prevent multiple redirects
let redirectAttempted = false;

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
          if (!redirectAttempted) {
            redirectAttempted = true;
            window.location.href = '/login';
          }
          return;
        }
        
        if (!data.session) {
          console.log('No session found in dashboard layout, redirecting to login');
          if (!redirectAttempted) {
            redirectAttempted = true;
            window.location.href = '/login';
          }
          return;
        }
        
        console.log('Session found for user:', data.session.user.email);
        setIsAuthenticated(true);
      } catch (err) {
        console.error('Unexpected error in auth check:', err);
        if (!redirectAttempted) {
          redirectAttempted = true;
          window.location.href = '/login';
        }
      } finally {
        setIsCheckingAuth(false);
      }
    };
    
    // Add a small delay to ensure cookies are properly processed
    // Increased delay to give more time for session loading
    const timer = setTimeout(() => {
      checkAuth();
    }, 1000);
    
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
  
  // Show a friendly message instead of redirecting in a loop
  return (
    <div className="flex h-screen flex-col items-center justify-center p-4 text-center">
      <h1 className="text-2xl font-bold mb-4">Authentication Required</h1>
      <p className="mb-6">You need to be logged in to access this page.</p>
      <button 
        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        onClick={() => window.location.href = '/login'}
      >
        Go to Login
      </button>
    </div>
  );
}
