'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';

export default function StatusPage() {
  const [status, setStatus] = useState({
    middleware: 'Checking middleware...',
    auth: 'Checking auth state...',
    api: 'Checking API status...',
    location: 'Checking current URL...'
  });

  useEffect(() => {
    async function checkStatus() {
      try {
        // Check auth state
        const { data, error } = await supabase.auth.getSession();
        if (error) {
          setStatus(prev => ({ 
            ...prev,
            auth: `Auth error: ${error.message}`
          }));
        } else {
          setStatus(prev => ({ 
            ...prev,
            auth: data.session 
              ? `Authenticated as: ${data.session.user.email}` 
              : 'Not authenticated'
          }));
        }

        // Check API status
        try {
          const apiResponse = await fetch('/api/health');
          if (apiResponse.ok) {
            setStatus(prev => ({ 
              ...prev,
              api: 'API is working correctly'
            }));
          } else {
            setStatus(prev => ({ 
              ...prev,
              api: `API error: ${apiResponse.status} ${apiResponse.statusText}`
            }));
          }
        } catch (apiError) {
          setStatus(prev => ({ 
            ...prev,
            api: `API error: ${apiError instanceof Error ? apiError.message : String(apiError)}`
          }));
        }

        // Set location info
        setStatus(prev => ({ 
          ...prev,
          location: `Current URL: ${window.location.href}`,
          middleware: 'Middleware is working (page loaded successfully)'
        }));
      } catch (error) {
        console.error('Error checking status:', error);
      }
    }

    checkStatus();
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8 p-10 bg-white rounded-xl shadow-md">
        <div className="text-center">
          <h1 className="text-3xl font-bold">System Status</h1>
          <p className="mt-2 text-gray-600">This page helps diagnose Tempo&apos;s current status</p>
        </div>

        <div className="mt-8 space-y-6">
          <div className="bg-blue-50 p-4 rounded-md border border-blue-200">
            <h2 className="font-medium text-blue-800">Auth State</h2>
            <p className="mt-1 text-blue-700">{status.auth}</p>
          </div>

          <div className="bg-green-50 p-4 rounded-md border border-green-200">
            <h2 className="font-medium text-green-800">Middleware Status</h2>
            <p className="mt-1 text-green-700">{status.middleware}</p>
          </div>

          <div className="bg-purple-50 p-4 rounded-md border border-purple-200">
            <h2 className="font-medium text-purple-800">API Status</h2>
            <p className="mt-1 text-purple-700">{status.api}</p>
          </div>

          <div className="bg-gray-100 p-4 rounded-md border border-gray-200">
            <h2 className="font-medium text-gray-800">Location Info</h2>
            <p className="mt-1 text-gray-700">{status.location}</p>
          </div>
        </div>

        <div className="mt-8 flex flex-col space-y-3">
          <Link href="/" className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
            Go to Home
          </Link>
          <Link href="/dashboard" className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
            Try Dashboard
          </Link>
          <Link href="/login" className="inline-flex justify-center py-2 px-4 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
            Try Login Page
          </Link>
        </div>
      </div>
    </div>
  );
}