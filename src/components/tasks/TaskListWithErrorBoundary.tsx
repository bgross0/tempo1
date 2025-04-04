'use client';

import { withErrorBoundary } from '@/components/ui/error-boundary';
import { ListView } from './list-view';
import { Button } from '@/components/ui/button';
import { AlertCircle, RefreshCcw } from 'lucide-react';

const TaskListErrorFallback = ({ resetErrorBoundary }: { resetErrorBoundary: () => void }) => (
  <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 dark:border-amber-800/30 dark:bg-amber-900/20">
    <div className="flex items-start">
      <AlertCircle className="mt-1 h-5 w-5 text-amber-600 dark:text-amber-400" />
      <div className="ml-3">
        <h3 className="text-sm font-medium text-amber-800 dark:text-amber-300">
          Task list failed to load
        </h3>
        <div className="mt-2 text-sm text-amber-700 dark:text-amber-400">
          <p>There was an error loading your tasks. Please try again.</p>
        </div>
        <div className="mt-4">
          <Button
            onClick={resetErrorBoundary}
            size="sm"
            variant="outline"
            className="flex items-center gap-1"
          >
            <RefreshCcw className="h-3.5 w-3.5" />
            Try Again
          </Button>
        </div>
      </div>
    </div>
  </div>
);

// Apply the error boundary using the HOC pattern
const TaskListWithErrorBoundary = withErrorBoundary(ListView, {
  fallback: <TaskListErrorFallback resetErrorBoundary={() => {}} />,
  onError: (error) => {
    console.error('Task list error:', error);
    // In production, send to error reporting service
  }
});

export default TaskListWithErrorBoundary;