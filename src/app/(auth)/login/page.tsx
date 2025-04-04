'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSearchParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { toast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { signIn, user, isLoading: authLoading } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [redirectPath, setRedirectPath] = useState('/dashboard');
  const [showErrorReset, setShowErrorReset] = useState(false);
  
  // Check for already authenticated users and handle redirection
  useEffect(() => {
    // Don't redirect if still loading auth state
    if (authLoading) {
      return;
    }
    
    // Only redirect if we have a valid authenticated user from server verification
    // The check only passes once server verification has completed (authLoading=false)
    if (user && !authLoading) {
      // Check if the user has recently verified their login (last 30 minutes)
      const hasRecentAuth = user.last_sign_in_at && 
        (new Date().getTime() - new Date(user.last_sign_in_at).getTime() < 30 * 60 * 1000);
      
      if (hasRecentAuth) {
        console.log('User recently authenticated, redirecting to dashboard');
        // Redirect to dashboard or the requested path
        const baseUrl = window.location.origin;
        window.location.assign(`${baseUrl}${redirectPath}`);
      } else {
        console.log('User has valid session but not recently authenticated');
        // Let them stay on the login page - they might want to re-login or switch accounts
      }
    }
  }, [user, authLoading, redirectPath]);
  
  // Get the redirectTo parameter if present
  useEffect(() => {
    if (searchParams) {
      const redirectTo = searchParams.get('redirectTo');
      if (redirectTo) {
        console.log('Found redirectTo parameter:', redirectTo);
        setRedirectPath(redirectTo);
      }
      
      // Check for error indicators in the URL
      const reason = searchParams.get('reason');
      const error = searchParams.get('error');
      
      // Handle auth loop detection
      if (error === 'auth_loop') {
        setShowErrorReset(true);
        toast({
          variant: "destructive",
          title: "Authentication Loop Detected",
          description: "We've detected an authentication redirect loop. Please reset your auth state to continue.",
        });
      }
      // Handle other auth errors
      else if (reason === 'auth_error') {
        setShowErrorReset(true);
        toast({
          variant: "destructive",
          title: "Authentication error",
          description: "There was a problem with your authentication state. Please log in again.",
        });
      }
    }
  }, [searchParams]);

  // Using direct Supabase authentication with detailed debugging
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      console.log('=========== LOGIN ATTEMPT ===========');
      console.log(`Attempting login with: ${email}`);
      
      // DEBUGGING: Check if we already have a session before login
      const { data: existingSession } = await supabase.auth.getSession();
      console.log('Pre-login session check:', existingSession.session ? 'Session exists' : 'No session');
      
      // CRITICAL FIX: DO NOT sign out before signing in!
      // This was causing auth state flicker and redirect loops
      
      // We leave any existing session in place
      console.log('Proceeding with login WITHOUT clearing existing state');
      
      // Direct authentication with Supabase
      console.log('Executing signInWithPassword...');
      const { error, data } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) {
        console.error('LOGIN ERROR:', error.message);
        
        toast({
          variant: "destructive",
          title: "Login failed",
          description: error.message || "Please check your credentials",
        });
        
        setIsLoading(false);
        return;
      }
      
      console.log('Login API call succeeded');
      console.log('Session created:', !!data.session);
      
      if (data.session) {
        console.log('User:', data.user?.email);
        console.log('Access token present:', !!data.session.access_token);
        console.log('Token expires at:', data.session.expires_at ? new Date(data.session.expires_at * 1000).toISOString() : 'unknown');
        
        toast({
          title: "Login successful",
          description: "Redirecting...",
        });
        
        // Delay to allow session to be properly stored
        console.log('Waiting briefly for session storage...');
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // DEBUGGING: Verify session was properly stored
        const { data: verifySession } = await supabase.auth.getSession();
        console.log('Post-login session check:', verifySession.session ? 'Session stored' : 'No session stored!');
        
        console.log(`Redirecting to ${redirectPath} with window.location.replace...`);
        
        // Use the redirect path from URL params if available, otherwise dashboard
        // Replace current location entirely to avoid navigation history issues
        window.location.replace(redirectPath);
      } else {
        console.error('Login succeeded but no session was created!');
        toast({
          variant: "destructive", 
          title: "Login failed",
          description: "Authentication succeeded but no session was created. Please try again.",
        });
        setIsLoading(false);
      }
    } catch (err) {
      console.error('UNEXPECTED ERROR DURING LOGIN:', err);
      toast({
        variant: "destructive",
        title: "An unexpected error occurred",
        description: err instanceof Error ? err.message : "Please try again later",
      });
      setIsLoading(false);
    }
  };
  
  // Comprehensive function to reset auth state if needed
  const handleResetAuthState = async () => {
    try {
      console.log('Performing complete auth state reset...');
      
      // First sign out of Supabase with full scope
      await supabase.auth.signOut({ scope: 'local' });
      
      // Clear localStorage items
      if (typeof localStorage !== 'undefined') {
        localStorage.removeItem('tempo-auth-storage');
        localStorage.removeItem('supabase-auth-token');
        localStorage.removeItem('tempo-auth-state'); // New persistence key
      }
      
      // Clear cookies
      if (typeof document !== 'undefined') {
        document.cookie = 'supabase-auth-token=;path=/;max-age=0';
        document.cookie = 'tempo-auth-storage=;path=/;max-age=0';
      }
      
      // Show toast message
      toast({
        title: "Auth state reset",
        description: "Your authentication state has been reset. The page will reload.",
      });
      
      // Wait briefly so the user sees the toast
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Force reload the page with a cache-busting parameter
      window.location.href = `/login?reset=true&t=${Date.now()}`;
    } catch (err) {
      console.error('Error resetting auth state:', err);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to reset authentication state. Please try again."
      });
    }
  };

  // Show loading state if auth is being checked
  if (authLoading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-500">Checking authentication...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container flex h-screen w-screen flex-col items-center justify-center">
      <Link
        href="/"
        className="absolute left-4 top-4 md:left-8 md:top-8"
      >
        <Image 
          src="/images/logo.png" 
          alt="Tempo Logo" 
          width={32}
          height={32}
          className="h-8 w-auto" 
        />
      </Link>
      
      <Card className="mx-auto max-w-md w-full">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">Log in</CardTitle>
          <CardDescription className="text-center">
            Enter your email and password to access your account
          </CardDescription>
          
          {showErrorReset && (
            <div className="bg-red-50 p-4 rounded-md mt-2 border border-red-200">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-600" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">Authentication Error Detected</h3>
                  <div className="mt-2 text-sm text-red-700">
                    <p>
                      We&apos;ve detected an issue with your authentication state, which may be causing redirect loops 
                      or preventing you from logging in properly.
                    </p>
                    <p className="mt-1">
                      Please try resetting your authentication state to fix this issue.
                    </p>
                  </div>
                  <div className="mt-3">
                    <Button 
                      variant="destructive" 
                      className="w-full"
                      onClick={handleResetAuthState}
                    >
                      Reset Authentication State
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                placeholder="name@example.com"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                <Link 
                  href="/reset-password" 
                  className="text-sm text-blue-600 hover:text-blue-500"
                >
                  Forgot your password?
                </Link>
              </div>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="remember-me"
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="remember-me" className="text-sm text-gray-600">
                Remember me
              </label>
            </div>
            
            <Button 
              type="submit" 
              variant="tempo"
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? 'Logging in...' : 'Log in'}
            </Button>
          </form>
          
          <div className="relative my-4">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">
                Or continue with
              </span>
            </div>
          </div>
          
          <div className="grid grid-cols-3 gap-3">
            <Button variant="outline" className="w-full" type="button">
              <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M20.283 10.356h-8.327v3.451h4.792c-.446 2.193-2.313 3.453-4.792 3.453a5.27 5.27 0 0 1-5.279-5.28 5.27 5.27 0 0 1 5.279-5.279c1.259 0 2.397.447 3.29 1.178l2.6-2.599c-1.584-1.381-3.615-2.233-5.89-2.233a8.908 8.908 0 0 0-8.934 8.934 8.907 8.907 0 0 0 8.934 8.934c4.467 0 8.529-3.249 8.529-8.934 0-.528-.081-1.097-.202-1.625z" />
              </svg>
              Google
            </Button>
            <Button variant="outline" className="w-full" type="button">
              <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M12.026 2c-5.509 0-9.974 4.465-9.974 9.974 0 4.406 2.857 8.145 6.821 9.465.499.09.679-.217.679-.481 0-.237-.008-.865-.011-1.696-2.775.602-3.361-1.338-3.361-1.338-.452-1.152-1.107-1.459-1.107-1.459-.905-.619.069-.605.069-.605 1.002.07 1.527 1.028 1.527 1.028.89 1.524 2.336 1.084 2.902.829.091-.645.351-1.085.635-1.334-2.214-.251-4.542-1.107-4.542-4.93 0-1.087.389-1.979 1.024-2.675-.101-.253-.446-1.268.099-2.64 0 0 .837-.269 2.742 1.021a9.582 9.582 0 0 1 2.496-.336 9.554 9.554 0 0 1 2.496.336c1.906-1.291 2.742-1.021 2.742-1.021.545 1.372.203 2.387.099 2.64.64.696 1.024 1.587 1.024 2.675 0 3.833-2.33 4.675-4.552 4.922.355.308.675.916.675 1.846 0 1.334-.012 2.41-.012 2.737 0 .267.178.577.687.479C19.146 20.115 22 16.379 22 11.974 22 6.465 17.535 2 12.026 2z" />
              </svg>
              GitHub
            </Button>
            <Button variant="outline" className="w-full" type="button">
              <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M13.829 7.172c1.562-.108 3.518.66 4.456 2.042-1.223.787-2.618 1.71-2.618 1.71s1.524 1.129 2.595 1.805C19.97 13.895 20 16 20 16s-2.803-.307-4.976-.93c0 0-2.182 2.296-4.24 3.055-2.064.786-3.947.03-5.867-1.517 0 0 .125-1.178.6-2.008.475-.83 1.363-1.517 1.363-1.517-1.672-.23-3.315-.627-3.315-2.261 0 0 0-2.466 6.686-1.947 0 0 .33-1.09 1.109-1.578.775-.488 1.541-.52 2.47-.125zM12 22c5.514 0 10-4.486 10-10S17.514 2 12 2 2 6.486 2 12s4.486 10 10 10z" />
              </svg>
              Microsoft
            </Button>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col space-y-4 text-center">
          <div className="text-sm text-gray-600">
            Don&apos;t have an account?{' '}
            <Link 
              href="/signup"
              className="text-blue-600 hover:text-blue-500 font-medium"
            >
              Sign up
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}