'use client';

import { useState, useEffect } from 'react';

export default function TestConnectionPage() {
  const [status, setStatus] = useState('Loading...');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Test the API health endpoint
    fetch('/api/health')
      .then(res => {
        if (!res.ok) {
          throw new Error(`API returned status ${res.status}`);
        }
        return res.json();
      })
      .then(data => {
        setStatus('API Connection: OK');
        console.log('API Health Data:', data);
      })
      .catch(err => {
        setError(`API Error: ${err.message}`);
        console.error('API Error:', err);
      });
  }, []);

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Connection Test Page</h1>
      
      <div className="mb-4 p-4 bg-gray-100 rounded">
        <h2 className="font-semibold mb-2">Status</h2>
        <div className={error ? "text-red-500" : "text-green-500"}>{error || status}</div>
      </div>
      
      <div className="mb-4 p-4 bg-gray-100 rounded">
        <h2 className="font-semibold mb-2">Environment</h2>
        <div>
          <p>App URL: {process.env.NEXT_PUBLIC_APP_URL || 'Not set'}</p>
          <p>Supabase URL: {process.env.NEXT_PUBLIC_SUPABASE_URL ? 'Set' : 'Not set'}</p>
          <p>Supabase Anon Key: {process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'Set' : 'Not set'}</p>
        </div>
      </div>
      
      <div className="mb-4 p-4 bg-gray-100 rounded">
        <h2 className="font-semibold mb-2">Browser Info</h2>
        <p>User Agent: {navigator.userAgent}</p>
      </div>
      
      <div className="flex gap-4">
        <a href="/" className="px-4 py-2 bg-blue-500 text-white rounded">Go to Home</a>
        <button 
          onClick={() => window.location.reload()} 
          className="px-4 py-2 bg-gray-500 text-white rounded"
        >
          Reload Page
        </button>
      </div>
    </div>
  );
}