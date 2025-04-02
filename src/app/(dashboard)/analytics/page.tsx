'use client';

import { useState } from 'react';
import { 
  Calendar as CalendarIcon, 
  ArrowUpDown, 
  CheckCircle, 
  Clock,
  BarChart3, 
  PieChart,
  LineChart,
  ArrowUp,
  ArrowDown
} from 'lucide-react';
import { subDays, format, isAfter, isBefore, startOfMonth, endOfMonth } from 'date-fns';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useTasksRealtime } from '@/hooks/api/useTasksRealtime';
import { useProjectsRealtime } from '@/hooks/api/useProjectsRealtime';

// Import our new chart components
import ProductivityChart from '@/components/charts/ProductivityChart';
import PriorityDistributionChart from '@/components/charts/PriorityDistributionChart';
import ProjectProgressChart from '@/components/charts/ProjectProgressChart';

export default function AnalyticsPage() {
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'quarter' | 'year'>('month');
  
  const { tasks } = useTasksRealtime();
  const { projects } = useProjectsRealtime();
  
  // Calculate date range based on selected time range
  const getRangeStartDate = () => {
    const now = new Date();
    switch (timeRange) {
      case 'week':
        return subDays(now, 7);
      case 'month':
        return startOfMonth(now);
      case 'quarter':
        return subDays(now, 90);
      case 'year':
        return subDays(now, 365);
      default:
        return startOfMonth(now);
    }
  };
  
  const rangeStartDate = getRangeStartDate();
  const rangeEndDate = new Date();
  
  // Filter tasks in the selected time range
  const tasksInRange = tasks.filter(task => {
    const taskDate = new Date(task.created_at || task.updated_at || task.due_date);
    return isAfter(taskDate, rangeStartDate) && isBefore(taskDate, rangeEndDate);
  });
  
  // Calculate task metrics
  const completedTasks = tasksInRange.filter(task => task.completed);
  const completionRate = tasksInRange.length > 0
    ? Math.round((completedTasks.length / tasksInRange.length) * 100)
    : 0;
  
  // Calculate average task completion time (in days)
  const avgCompletionTime = completedTasks.length > 0
    ? completedTasks.reduce((sum, task) => {
        if (!task.completed_at || !task.created_at) return sum;
        const completedDate = new Date(task.completed_at);
        const createdDate = new Date(task.created_at);
        const days = Math.ceil((completedDate.getTime() - createdDate.getTime()) / (1000 * 60 * 60 * 24));
        return sum + days;
      }, 0) / completedTasks.length
    : 0;
  
  // Get priority distribution
  const highPriorityTasks = tasksInRange.filter(task => task.priority === 'high').length;
  const mediumPriorityTasks = tasksInRange.filter(task => task.priority === 'medium').length;
  const lowPriorityTasks = tasksInRange.filter(task => task.priority === 'low').length;
  
  // Project metrics
  const completedProjects = projects.filter(project => project.completed).length;
  const activeProjects = projects.filter(project => !project.completed).length;
  
  // Productivity score (simplified example)
  const productivityScore = Math.min(100, Math.round(
    (completedTasks.length * 1) + 
    (completedProjects * 5) + 
    (highPriorityTasks * 0.5)
  ));
  
  // Get trend compared to previous period (simplified)
  const previousPeriodScore = productivityScore - 5 + Math.round(Math.random() * 10);
  const productivityTrend = productivityScore > previousPeriodScore ? 'up' : 'down';
  const productivityChange = Math.abs(productivityScore - previousPeriodScore);
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Analytics</h1>
        
        <div className="bg-white border rounded-md p-1 flex">
          <Button 
            variant={timeRange === 'week' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setTimeRange('week')}
            className="text-xs px-2"
          >
            Week
          </Button>
          <Button 
            variant={timeRange === 'month' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setTimeRange('month')}
            className="text-xs px-2"
          >
            Month
          </Button>
          <Button 
            variant={timeRange === 'quarter' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setTimeRange('quarter')}
            className="text-xs px-2"
          >
            Quarter
          </Button>
          <Button 
            variant={timeRange === 'year' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setTimeRange('year')}
            className="text-xs px-2"
          >
            Year
          </Button>
        </div>
      </div>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* Productivity Score Card */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Productivity Score</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{productivityScore}</div>
            <div className="flex items-center text-xs">
              {productivityTrend === 'up' ? (
                <>
                  <ArrowUp className="h-3 w-3 text-green-500 mr-1" />
                  <span className="text-green-500">{productivityChange}% increase</span>
                </>
              ) : (
                <>
                  <ArrowDown className="h-3 w-3 text-red-500 mr-1" />
                  <span className="text-red-500">{productivityChange}% decrease</span>
                </>
              )}
              <span className="text-gray-500 ml-1">vs last {timeRange}</span>
            </div>
          </CardContent>
        </Card>
      
        {/* Task Completion Rate Card */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{completionRate}%</div>
            <p className="text-xs text-muted-foreground">
              {completedTasks.length} of {tasksInRange.length} tasks completed
            </p>
          </CardContent>
        </Card>
      
        {/* Average Completion Time Card */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Avg. Completion Time</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{avgCompletionTime.toFixed(1)} days</div>
            <p className="text-xs text-muted-foreground">
              Average time to complete tasks
            </p>
          </CardContent>
        </Card>
      
        {/* Projects Card */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Projects</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{completedProjects} / {projects.length}</div>
            <p className="text-xs text-muted-foreground">
              {activeProjects} active projects
            </p>
          </CardContent>
        </Card>
      </div>
      
      {/* Charts Section */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card className="col-span-2 md:col-span-1 lg:col-span-2">
          <CardHeader>
            <CardTitle>Productivity Trend</CardTitle>
            <CardDescription>
              Your task completion over time for {timeRange}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64 w-full">
              <ProductivityChart tasks={tasksInRange} timeRange={timeRange} />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Task Priority</CardTitle>
            <CardDescription>
              Distribution by priority level
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64 w-full">
              <PriorityDistributionChart tasks={tasksInRange} />
            </div>
          </CardContent>
        </Card>
        
        <Card className="col-span-2">
          <CardHeader>
            <CardTitle>Project Progress</CardTitle>
            <CardDescription>
              Completion status for active projects
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64 w-full">
              <ProjectProgressChart projects={projects} tasks={tasks} />
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Task Distribution Table */}
      <Card>
        <CardHeader>
          <CardTitle>Task Distribution</CardTitle>
          <CardDescription>
            Breakdown of tasks by priority and status
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2">Priority</th>
                  <th className="text-right p-2">Total</th>
                  <th className="text-right p-2">Completed</th>
                  <th className="text-right p-2">Pending</th>
                  <th className="text-right p-2">Completion Rate</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b">
                  <td className="p-2">
                    <div className="flex items-center">
                      <div className="h-2 w-2 rounded-full bg-red-500 mr-2"></div>
                      High
                    </div>
                  </td>
                  <td className="text-right p-2">{highPriorityTasks}</td>
                  <td className="text-right p-2">
                    {tasksInRange.filter(t => t.priority === 'high' && t.completed).length}
                  </td>
                  <td className="text-right p-2">
                    {tasksInRange.filter(t => t.priority === 'high' && !t.completed).length}
                  </td>
                  <td className="text-right p-2">
                    {highPriorityTasks > 0 
                      ? `${Math.round((tasksInRange.filter(t => t.priority === 'high' && t.completed).length / highPriorityTasks) * 100)}%` 
                      : '0%'}
                  </td>
                </tr>
                <tr className="border-b">
                  <td className="p-2">
                    <div className="flex items-center">
                      <div className="h-2 w-2 rounded-full bg-yellow-500 mr-2"></div>
                      Medium
                    </div>
                  </td>
                  <td className="text-right p-2">{mediumPriorityTasks}</td>
                  <td className="text-right p-2">
                    {tasksInRange.filter(t => t.priority === 'medium' && t.completed).length}
                  </td>
                  <td className="text-right p-2">
                    {tasksInRange.filter(t => t.priority === 'medium' && !t.completed).length}
                  </td>
                  <td className="text-right p-2">
                    {mediumPriorityTasks > 0 
                      ? `${Math.round((tasksInRange.filter(t => t.priority === 'medium' && t.completed).length / mediumPriorityTasks) * 100)}%` 
                      : '0%'}
                  </td>
                </tr>
                <tr>
                  <td className="p-2">
                    <div className="flex items-center">
                      <div className="h-2 w-2 rounded-full bg-green-500 mr-2"></div>
                      Low
                    </div>
                  </td>
                  <td className="text-right p-2">{lowPriorityTasks}</td>
                  <td className="text-right p-2">
                    {tasksInRange.filter(t => t.priority === 'low' && t.completed).length}
                  </td>
                  <td className="text-right p-2">
                    {tasksInRange.filter(t => t.priority === 'low' && !t.completed).length}
                  </td>
                  <td className="text-right p-2">
                    {lowPriorityTasks > 0 
                      ? `${Math.round((tasksInRange.filter(t => t.priority === 'low' && t.completed).length / lowPriorityTasks) * 100)}%` 
                      : '0%'}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
