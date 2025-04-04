'use client';

import Link from 'next/link';

export default function SimpleLoginPage() {
  return (
    <div className="flex flex-col min-h-screen items-center justify-center p-8">
      <div className="w-full max-w-md border rounded-lg p-8 shadow-md">
        <h1 className="text-2xl font-bold mb-6 text-center">Simplified Login Page</h1>
        
        <form className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <input
              type="email"
              className="w-full p-2 border rounded"
              placeholder="your@email.com"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Password</label>
            <input
              type="password"
              className="w-full p-2 border rounded"
              placeholder="••••••••"
            />
          </div>
          
          <button
            type="button"
            className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700"
          >
            Log in (Demo Only)
          </button>
        </form>
        
        <div className="mt-4 text-center">
          <Link href="/" className="text-blue-600 hover:underline">
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}