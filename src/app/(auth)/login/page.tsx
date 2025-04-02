'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { toast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

export default function LoginPage() {
  const searchParams = useSearchParams();
  const { signIn } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [redirectPath, setRedirectPath] = useState('/dashboard');
  
  // Get the redirectTo parameter if present
  useEffect(() => {
    const redirectTo = searchParams.get('redirectTo');
    if (redirectTo) {
      console.log('Found redirectTo parameter:', redirectTo);
      setRedirectPath(redirectTo);
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      console.log('Attempting to sign in with:', { email });
      
      // Use direct Supabase auth like in simple-login
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      if (error) {
        console.error('Login error:', error);
        toast({
          variant: "destructive",
          title: "Login failed",
          description: error.message || "Please check your credentials",
        });
      } else {
        // Log session info to help with debugging
        console.log('Login successful! Session:', data.session ? 'exists' : 'missing');
        if (data.session) {
          console.log('User:', data.session.user.email);
          console.log('Session expires:', new Date(data.session.expires_at * 1000).toISOString());
        }
        
        toast({
          title: "Login successful",
          description: `Redirecting to ${redirectPath === '/dashboard' ? 'dashboard' : 'requested page'}...`,
        });
        
        // Use a longer delay to ensure cookies are properly set before navigation
        // This is crucial for the auth flow to work correctly
        setTimeout(() => {
          console.log('Redirecting to:', redirectPath);
          window.location.href = redirectPath;
        }, 1000);
      }
    } catch (err) {
      console.error('Unexpected error during login:', err);
      toast({
        variant: "destructive",
        title: "An unexpected error occurred",
        description: err instanceof Error ? err.message : "Please try again later",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container flex h-screen w-screen flex-col items-center justify-center">
      <Link
        href="/"
        className="absolute left-4 top-4 md:left-8 md:top-8 text-lg font-bold text-blue-600"
      >
        TaskJet
      </Link>
      
      <Card className="mx-auto max-w-md w-full">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">Log in</CardTitle>
          <CardDescription className="text-center">
            Enter your email and password to access your account
          </CardDescription>
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
            Don't have an account?{' '}
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
