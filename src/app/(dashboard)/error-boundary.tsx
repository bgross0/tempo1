'use client';

import React from 'react';
import ErrorBoundary from '@/components/ui/error-boundary';
import { Button } from '@/components/ui/button';
import { HomeIcon, RefreshCcw } from 'lucide-react';
import Link from 'next/link';

interface AppErrorBoundaryProps {
  children: React.ReactNode;
}

const AppErrorFallback = ({ resetErrorBoundary }: { resetErrorBoundary: () => void }) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] p-8">
      <div className="max-w-md mx-auto text-center p-8 border rounded-lg bg-background shadow-sm">
        <h2 className="text-2xl font-semibold mb-4">Something went wrong</h2>
        <p className="text-muted-foreground mb-6">
          We've encountered an unexpected error. You can try refreshing the page or return to the dashboard.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button onClick={resetErrorBoundary} variant="outline" className="flex items-center gap-2">
            <RefreshCcw className="h-4 w-4" />
            Retry
          </Button>
          <Link href="/dashboard" passHref>
            <Button className="flex items-center gap-2">
              <HomeIcon className="h-4 w-4" />
              Go to Dashboard
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

const AppErrorBoundary: React.FC<AppErrorBoundaryProps> = ({ children }) => {
  const handleError = (error: Error) => {
    // In production, you would send this to an error reporting service
    console.error('Application error:', error);
  };

  return (
    <ErrorBoundary
      onError={handleError}
      fallback={({ resetErrorBoundary }) => (
        <AppErrorFallback resetErrorBoundary={resetErrorBoundary} />
      )}
    >
      {children}
    </ErrorBoundary>
  );
};

export default AppErrorBoundary;