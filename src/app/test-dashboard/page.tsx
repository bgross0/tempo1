'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAppStore } from '@/lib/store/app-store';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function TestDashboardPage() {
  const [value, setValue] = useState(0);
  const { 
    sidebarCollapsed, 
    setSidebarCollapsed, 
    viewMode,
    setViewMode,
    commandPaletteOpen,
    setCommandPaletteOpen
  } = useAppStore();

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Dashboard Test Page</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle>App State</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span>Sidebar Collapsed:</span>
              <span className="font-mono">{sidebarCollapsed ? 'true' : 'false'}</span>
            </div>
            <div className="flex justify-between items-center">
              <span>View Mode:</span>
              <span className="font-mono">{viewMode}</span>
            </div>
            <div className="flex justify-between items-center">
              <span>Command Palette Open:</span>
              <span className="font-mono">{commandPaletteOpen ? 'true' : 'false'}</span>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>App Controls</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <Button onClick={() => setSidebarCollapsed(!sidebarCollapsed)}>
                Toggle Sidebar
              </Button>
            </div>
            <div className="flex justify-between items-center">
              <Button onClick={() => setCommandPaletteOpen(true)}>
                Open Command Palette
              </Button>
              <div className="flex gap-2">
                <Button 
                  variant={viewMode === 'list' ? 'default' : 'outline'} 
                  onClick={() => setViewMode('list')}
                >
                  List
                </Button>
                <Button 
                  variant={viewMode === 'kanban' ? 'default' : 'outline'} 
                  onClick={() => setViewMode('kanban')}
                >
                  Kanban
                </Button>
                <Button 
                  variant={viewMode === 'table' ? 'default' : 'outline'} 
                  onClick={() => setViewMode('table')}
                >
                  Table
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <div className="mt-8 space-y-2">
        <Button asChild variant="outline">
          <Link href="/">Back to Home</Link>
        </Button>
      </div>
    </div>
  );
}