'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';

export default function TestAuthPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [status, setStatus] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const handleTestLogin = async () => {
    setLoading(true);
    setStatus(null);
    
    try {
      // Test direct Supabase API call
      const response = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      setStatus({
        success: !response.error,
        data: response.data,
        error: response.error,
      });
      
      console.log('Direct Supabase response:', response);
    } catch (error) {
      console.error('Test login error:', error);
      setStatus({
        success: false,
        error: error instanceof Error ? error.message : String(error),
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container max-w-md mx-auto py-10">
      <Card>
        <CardHeader>
          <CardTitle>Test Authentication</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="test-email">Email</Label>
            <Input
              id="test-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Your email"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="test-password">Password</Label>
            <Input
              id="test-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Your password"
            />
          </div>
          
          <Button 
            onClick={handleTestLogin}
            disabled={loading}
            className="w-full"
          >
            {loading ? 'Testing...' : 'Test Login'}
          </Button>
        </CardContent>
        
        {status && (
          <CardFooter className="flex flex-col">
            <div className={`p-3 rounded-md w-full ${status.success ? 'bg-green-100' : 'bg-red-100'}`}>
              <pre className="text-xs overflow-auto">
                {JSON.stringify(status, null, 2)}
              </pre>
            </div>
          </CardFooter>
        )}
      </Card>
    </div>
  );
}
