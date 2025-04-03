'use client';

import { useEffect, useState, useRef } from 'react';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import AppErrorBoundary from './error-boundary';

export default function Layout({ children }: { children: React.ReactNode }) {
  const { user, isLoading: authContextLoading } = useAuth();
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [redirectAttempts, setRedirectAttempts] = useState(0);
  const checkStartTime = useRef(Date.now());
  
  useEffect(() => {
    console.log('Dashboard layout mounted, checking auth...');
    
    // Generate instance ID for tracking
    const instanceId = Math.random().toString(36).substring(2, 9);
    console.log(`[Dashboard-${instanceId}] Dashboard layout initialized`);
    
    // If authentication check takes too long, show error message
    const timeoutId = setTimeout(() => {
      if (isCheckingAuth) {
        console.log(`[Dashboard-${instanceId}] Auth check taking longer than expected...`);
      }
    }, 5000);
    
    // Track if we've already redirected to prevent multiple redirects
    let hasRedirected = false;
    
    const checkAuth = async () => {
      try {
        console.log(`[Dashboard-${instanceId}] Starting auth check in dashboard layout`);
        
        // Check if we have a timestamp parameter to prevent redirect loops
        const urlParams = new URLSearchParams(window.location.search);
        const timestamp = urlParams.get('t');
        
        // First check - use auth context (fastest)
        if (user) {
          console.log(`[Dashboard-${instanceId}] User found in auth context:`, user.email);
          setIsAuthenticated(true);
          setIsCheckingAuth(false);
          return;
        }
        
        // Add a small delay to ensure auth context has time to load
        if (authContextLoading) {
          console.log(`[Dashboard-${instanceId}] Auth context still loading, waiting...`);
          return; // Don't proceed - we'll try again when authContextLoading changes
        }
        
        // If it's been over 3 seconds and we still don't have user info, try direct check
        if (!hasRedirected) {
          // Second check - directly check session with Supabase
          console.log(`[Dashboard-${instanceId}] Checking session with Supabase directly`);
          const { data, error } = await supabase.auth.getSession();
          
          if (error) {
            console.error(`[Dashboard-${instanceId}] Error checking auth:`, error);
            handleRedirectToLogin('auth_error');
            return;
          }
          
          if (!data.session) {
            console.log(`[Dashboard-${instanceId}] No session found, redirecting to login`);
            handleRedirectToLogin('no_session');
            return;
          }
          
          console.log(`[Dashboard-${instanceId}] Valid session found for user:`, data.session.user.email);
          setIsAuthenticated(true);
        }
      } catch (err) {
        console.error(`[Dashboard-${instanceId}] Unexpected error in auth check:`, err);
        handleRedirectToLogin('exception');
      } finally {
        setIsCheckingAuth(false);
      }
    };
    
    const handleRedirectToLogin = (reason: string) => {
      // Prevent excessive redirect attempts and avoid redirect loops
      setRedirectAttempts(prev => {
        const newCount = prev + 1;
        console.log(`[Dashboard-${instanceId}] Redirect attempt ${newCount} for reason: ${reason}`);
        
        if (newCount > 2 || hasRedirected) {
          console.log(`[Dashboard-${instanceId}] Too many redirect attempts, showing error instead`);
          return newCount;
        }
        
        hasRedirected = true;
        
        // Clear any stale auth data before redirecting
        try {
          // Clear cookies that might be causing issues
          document.cookie = 'supabase-auth-token=;path=/;max-age=0';
          document.cookie = 'tempo-auth-storage=;path=/;max-age=0';
        } catch (e) {
          console.error('Error clearing auth cookies:', e);
        }
        
        // Add timestamp to prevent caching
        const timestamp = Date.now();
        
        // Use window.location for most reliable navigation
        window.location.href = `/login?reason=${reason}&redirectTo=%2Fdashboard&t=${timestamp}`;
        
        return newCount;
      });
    };
    
    // Add delay to allow auth context to fully initialize before checking
    const authCheckDelay = setTimeout(() => {
      checkAuth();
    }, 100);
    
    return () => {
      console.log(`[Dashboard-${instanceId}] Dashboard layout unmounting`);
      clearTimeout(timeoutId);
      clearTimeout(authCheckDelay);
    };
  }, [user, authContextLoading]);
  
  // Enhanced redirect logic with detailed session checking
  useEffect(() => {
    // Wait for authentication to complete
    if (!isCheckingAuth && !authContextLoading && !user) {
      console.log('============ DASHBOARD AUTH CHECK ============');
      console.log('Dashboard layout: No authenticated user detected');
      
      // Function to check session directly with Supabase
      const verifySession = async () => {
        console.log('Verifying session with direct Supabase check...');
        
        try {
          const { data, error } = await supabase.auth.getSession();
          
          if (error) {
            console.error('Error checking session:', error.message);
            redirectToLogin('session_error');
            return;
          }
          
          if (!data.session) {
            console.log('No session found in direct check, redirecting to login');
            redirectToLogin('no_session');
            return;
          }
          
          // We found a session but AuthContext doesn't have it - update state
          console.log('Session found but not in AuthContext! This indicates a sync problem.');
          console.log('Session user:', data.session.user.email);
          setIsAuthenticated(true);
        } catch (e) {
          console.error('Unexpected error checking session:', e);
          redirectToLogin('verify_error');
        }
      };
      
      // Function to handle redirects
      const redirectToLogin = (reason: string) => {
        console.log(`Redirecting to login: ${reason}`);
        const baseUrl = window.location.origin;
        const timestamp = Date.now();
        window.location.replace(`${baseUrl}/login?reason=${reason}&t=${timestamp}`);
      };
      
      // Run the verification with a small delay
      const redirectTimer = setTimeout(() => {
        verifySession();
      }, 500);
      
      return () => clearTimeout(redirectTimer);
    }
  }, [isCheckingAuth, authContextLoading, user]);
  
  // Show loading state
  if (isCheckingAuth || authContextLoading) {
    const elapsedTime = Date.now() - checkStartTime.current;
    const showExtendedMessage = elapsedTime > 3000;
    
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-500">Loading your dashboard...</p>
          
          {showExtendedMessage && (
            <p className="text-gray-400 text-sm mt-2">
              This is taking longer than usual. Please wait a moment...
            </p>
          )}
        </div>
      </div>
    );
  }
  
  // Render children with error boundary if authenticated
  if (isAuthenticated) {
    return (
      <AppErrorBoundary>
        <DashboardLayout>{children}</DashboardLayout>
      </AppErrorBoundary>
    );
  }
  
  // Show a temporary loading state while redirecting
  return (
    <div className="flex h-screen flex-col items-center justify-center p-4 text-center">
      <h1 className="text-2xl font-bold mb-4">Authentication Required</h1>
      <p className="mb-6">Redirecting to login page...</p>
      
      <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
    </div>
  );
}