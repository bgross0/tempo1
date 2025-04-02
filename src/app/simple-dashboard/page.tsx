'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function SimpleDashboardPage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    const checkSession = async () => {
      try {
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          setError(error.message);
          return;
        }
        
        if (data.session) {
          setUser(data.session.user);
        } else {
          setError('No active session found');
        }
      } catch (err) {
        setError('Failed to check authentication status');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    
    checkSession();
  }, []);
  
  const handleSignOut = async () => {
    await supabase.auth.signOut();
    window.location.href = '/simple-login';
  };
  
  if (loading) {
    return (
      <div className="container flex justify-center items-center min-h-screen">
        <p>Loading...</p>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto p-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6">Simple Dashboard</h1>
      
      {error ? (
        <Card>
          <CardContent className="p-6">
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
              <p className="font-bold">Error</p>
              <p>{error}</p>
            </div>
            <Button 
              className="mt-4" 
              onClick={() => window.location.href = '/simple-login'}
            >
              Go to Login
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Welcome, {user?.email}</CardTitle>
          </CardHeader>
          <CardContent>
            <p>You are successfully authenticated!</p>
            
            <div className="mt-6 space-y-2">
              <p className="font-semibold">User Information:</p>
              <div className="bg-gray-100 p-4 rounded-md">
                <p><strong>ID:</strong> {user?.id}</p>
                <p><strong>Email:</strong> {user?.email}</p>
                <p><strong>Email Verified:</strong> {user?.email_confirmed_at ? 'Yes' : 'No'}</p>
              </div>
            </div>
            
            <div className="flex gap-4 mt-6">
              <Button onClick={() => window.location.href = '/dashboard'}>
                Go to Main Dashboard
              </Button>
              
              <Button variant="outline" onClick={handleSignOut}>
                Sign Out
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
