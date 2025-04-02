'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from '@/components/ui/use-toast';

export default function TestPage() {
  const [value, setValue] = useState('');

  const handleClick = () => {
    toast({
      title: "Success!",
      description: `You entered: ${value || 'nothing'}`,
    });
  };

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-3xl font-bold mb-8">Component Test Page</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <Card>
          <CardHeader>
            <CardTitle>UI Components Test</CardTitle>
            <CardDescription>Test that shadcn/ui components are working</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="test-input">Test Input</Label>
              <Input 
                id="test-input" 
                placeholder="Type something..." 
                value={value}
                onChange={(e) => setValue(e.target.value)}
              />
            </div>
          </CardContent>
          <CardFooter>
            <Button onClick={handleClick}>Show Toast</Button>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Styling Test</CardTitle>
            <CardDescription>Test that Tailwind classes are working</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 bg-blue-100 rounded-lg text-blue-800">
              This should be blue background with blue text
            </div>
            <div className="p-4 bg-green-100 rounded-lg text-green-800">
              This should be green background with green text
            </div>
            <div className="p-4 bg-red-100 rounded-lg text-red-800">
              This should be red background with red text
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
