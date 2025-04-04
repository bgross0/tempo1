'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { testSupabaseConnection } from '@/lib/supabase-test';
import { useAuth } from '@/contexts/AuthContext';

export default function TestSupabasePage() {
  const [results, setResults] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();
  
  const handleTest = async () => {
    setIsLoading(true);
    setResults(['Starting tests...']);
    
    try {
      // Override console.log to capture output
      const originalLog = console.log;
      const originalError = console.error;
      
      const logs: string[] = ['Starting tests...'];
      
      console.log = (...args) => {
        originalLog(...args);
        logs.push(args.join(' '));
        setResults([...logs]);
      };
      
      console.error = (...args) => {
        originalError(...args);
        logs.push(`ERROR: ${args.join(' ')}`);
        setResults([...logs]);
      };
      
      await testSupabaseConnection();
      
      // Restore console functions
      console.log = originalLog;
      console.error = originalError;
    } catch (e) {
      setResults(prev => [...prev, `Test failed: ${e instanceof Error ? e.message : String(e)}`]);
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-4">Supabase Connection Test</h1>
      
      <div className="mb-4">
        <p>Current user: {user ? user.email : 'Not logged in'}</p>
      </div>
      
      <Button 
        onClick={handleTest} 
        disabled={isLoading || !user}
        className="mb-6"
      >
        {isLoading ? 'Testing...' : 'Run Supabase Tests'}
      </Button>
      
      <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg">
        <h2 className="text-lg font-medium mb-2">Results:</h2>
        <pre className="whitespace-pre-wrap text-sm">
          {results.join('\n')}
        </pre>
      </div>
    </div>
  );
}