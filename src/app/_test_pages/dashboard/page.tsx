'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';

export default function DashboardDirectPage() {
  const { user, session, signOut } = useAuth();
  const [loading, setLoading] = useState(true);
  const [clientSession, setClientSession] = useState<any>(null);
  
  // Extra check to ensure we have valid auth data
  useEffect(() => {
    const checkSession = async () => {
      try {
        // Direct check with supabase client
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Error checking session:', error.message);
        } else {
          console.log('Client-side session check:', 
            data.session ? `Found for ${data.session.user.email}` : 'No session found');
          setClientSession(data.session);
        }
      } catch (err) {
        console.error('Unexpected error:', err);
      } finally {
        setLoading(false);
      }
    };
    
    checkSession();
  }, []);
  
  if (loading) {
    return (
      <div className="container mx-auto p-8">
        <h1 className="text-2xl font-bold mb-4">Dashboard</h1>
        <p>Loading session information...</p>
      </div>
    );
  }
  
  // If no session from either source, show error
  if (!user && !clientSession) {
    return (
      <div className="container mx-auto p-8">
        <h1 className="text-2xl font-bold mb-4">Dashboard Error</h1>
        <Card className="mb-6 bg-red-50">
          <CardContent className="p-6">
            <p className="text-red-600 mb-4">No authenticated session found.</p>
            <Button onClick={() => window.location.href = '/login'}>
              Go to Login
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  // Use whichever session data we have
  const activeUser = user || clientSession?.user;
  
  return (
    <div className="container mx-auto p-8">
      <h1 className="text-2xl font-bold mb-4">Dashboard (Direct Route)</h1>
      
      <Card className="mb-6">
        <CardContent className="p-6">
          <p>You are logged in as: {activeUser?.email}</p>
          
          <div className="mt-4 space-y-2">
            <div>
              <p className="text-sm text-gray-600">Auth Context Session: {session ? 'Valid' : 'Not found'}</p>
              <p className="text-sm text-gray-600">Direct Client Session: {clientSession ? 'Valid' : 'Not found'}</p>
            </div>
            
            <div className="pt-4 flex flex-wrap gap-4">
              <Button onClick={() => window.location.href = '/dashboard/real'}>
                Go to Real Dashboard
              </Button>
              
              <Button 
                variant="destructive"
                onClick={async () => {
                  await signOut();
                  window.location.href = '/login';
                }}
              >
                Sign Out
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
