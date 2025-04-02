'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { DashboardLayout } from '@/components/layout/dashboard-layout';

export default function RealDashboardPage() {
  const { user } = useAuth();
  
  return (
    <div className="container mx-auto p-8">
      <h1 className="text-2xl font-bold mb-4">Real Dashboard Page</h1>
      
      <Card className="mb-6">
        <CardContent className="p-6">
          <p>You are logged in as: {user?.email}</p>
          
          <div className="flex flex-wrap gap-4 mt-4">
            <Button asChild>
              <Link href="/dashboard/tasks">Tasks</Link>
            </Button>
            
            <Button asChild>
              <Link href="/dashboard/projects">Projects</Link>
            </Button>
            
            <Button asChild>
              <Link href="/dashboard/calendar">Calendar</Link>
            </Button>
            
            <Button asChild>
              <Link href="/dashboard/analytics">Analytics</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
      
      <p className="text-sm text-gray-500 mt-4">
        Note: This is a simple dashboard page for testing routing. The fully styled dashboard can be accessed from the main navigation.
      </p>
    </div>
  );
}
