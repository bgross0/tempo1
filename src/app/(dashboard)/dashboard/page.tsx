'use client';

import { useState } from 'react';
import Link from 'next/link';
import { 
  ChevronRight, 
  Plus, 
  Check, 
  Clock, 
  AlertTriangle, 
  Calendar as CalendarIcon,
  BarChart3,
  ArrowRight,
  Settings,
  LineChart,
  User
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/contexts/AuthContext';
import { useTasksRealtime } from '@/hooks/api/useTasksRealtime';
import { useProjectsRealtime } from '@/hooks/api/useProjectsRealtime';
import type { Task, Project } from '@/types/database';

// Import settings dialog
import { SettingsDialog } from '@/components/settings-dialog';

// Import our custom dashboard components
import DashboardStats from '@/components/dashboard/DashboardStats';
import TaskCard from '@/components/dashboard/TaskCard';
import TaskTimeline from '@/components/dashboard/TaskTimeline';
import CalendarWidget from '@/components/dashboard/CalendarWidget';
import { SchedulerPanel } from '@/components/tasks/SchedulerPanel';
import { ScheduleView } from '@/components/tasks/ScheduleView';

export default function DashboardPage() {
  const { user } = useAuth();
  const { tasks } = useTasksRealtime();
  const { projects } = useProjectsRealtime();
  const [settingsOpen, setSettingsOpen] = useState(false);
  
  // Get current date to filter tasks due today
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayDateStr = today.toISOString().split('T')[0];
  
  // Filter tasks that are due today
  const tasksToday = tasks.filter((task: Task) => {
    const taskDate = new Date(task.due_date);
    taskDate.setHours(0, 0, 0, 0);
    return taskDate.toISOString().split('T')[0] === todayDateStr && !task.completed;
  });
  
  // Find tasks that are overdue
  const overdueTasks = tasks.filter((task: Task) => {
    const taskDate = new Date(task.due_date);
    taskDate.setHours(0, 0, 0, 0);
    return taskDate < today && !task.completed;
  });
  
  // Format user's name for greeting
  const userName = user?.email?.split('@')[0] || 'there';
  
  // Handler for scheduler's view schedule action
  const handleViewSchedule = () => {
    // Scroll to schedule view section or focus it
    const scheduleElement = document.getElementById('schedule-view-section');
    if (scheduleElement) {
      scheduleElement.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="w-full h-full">
      {/* Show settings dialog when settings is clicked */}
      {settingsOpen && <SettingsDialog open={settingsOpen} onOpenChange={setSettingsOpen} />}
      
      {/* Header Section */}
      <section className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">
            Good {getGreeting()}, {userName}!
          </h1>
          <p className="text-gray-500 mt-1">
            Here's what's happening with your tasks and projects
          </p>
        </div>
        
        <div className="flex gap-2">
          <Button asChild variant="outline" size="sm">
            <Link href="/tasks?create=true">
              <Plus className="h-4 w-4 mr-1" />
              New Task
            </Link>
          </Button>
          <Button asChild variant="outline" size="sm">
            <Link href="/projects?create=true">
              <Plus className="h-4 w-4 mr-1" />
              New Project
            </Link>
          </Button>
        </div>
      </section>
      
      {/* Stats Cards */}
      <DashboardStats tasks={tasks} projects={projects} />
      
      {/* Main Content Tabs */}
      <Tabs defaultValue="overview" className="space-y-4 mt-6">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="today">Today's Tasks</TabsTrigger>
          <TabsTrigger value="overdue">Overdue</TabsTrigger>
        </TabsList>
        
        {/* Overview Tab - Reorganized as rows instead of columns */}
        <TabsContent value="overview" className="space-y-6">
          {/* Task Timeline Section */}
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Task Timeline</h2>
              <Button asChild variant="ghost" size="sm">
                <Link href="/tasks" className="flex items-center text-sm text-zinc-600">
                  View all
                  <ChevronRight className="ml-1 h-3 w-3" />
                </Link>
              </Button>
            </div>
            
            <TaskTimeline tasks={tasks} />
          </section>
          
          {/* Projects Section */}
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Active Projects</h2>
              <Button asChild variant="ghost" size="sm">
                <Link href="/projects" className="flex items-center text-sm text-zinc-600">
                  View all
                  <ChevronRight className="ml-1 h-3 w-3" />
                </Link>
              </Button>
            </div>
            
            <Card>
              <CardContent className="p-4 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {projects.filter(p => !p.completed).slice(0, 4).map(project => (
                    <div key={project.id} className="border rounded-lg p-3 hover:border-zinc-200 transition-colors">
                      <div className="flex justify-between">
                        <h3 className="font-medium text-sm">{project.name}</h3>
                        <div className={`px-2 py-0.5 text-xs rounded-full ${getPriorityClass(project.priority)}`}>
                          {project.priority}
                        </div>
                      </div>
                      
                      {project.description && (
                        <p className="text-xs text-gray-500 mt-1 line-clamp-1">
                          {project.description}
                        </p>
                      )}
                      
                      <div className="flex items-center justify-between mt-3">
                        <div className="text-xs text-gray-500">
                          Due: {new Date(project.due_date).toLocaleDateString()}
                        </div>
                        
                        <Button asChild variant="ghost" size="sm" className="h-7 px-2">
                          <Link href={`/projects/${project.id}`}>
                            Details
                            <ArrowRight className="ml-1 h-3 w-3" />
                          </Link>
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
                
                {projects.filter(p => !p.completed).length === 0 && (
                  <div className="text-center py-6">
                    <p className="text-gray-500">No active projects</p>
                    <Button asChild variant="outline" className="mt-2">
                      <Link href="/projects?create=true">
                        <Plus className="mr-1 h-4 w-4" />
                        Create Project
                      </Link>
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </section>

          {/* Calendar and Schedule Section */}
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Calendar</h2>
              <Button asChild variant="ghost" size="sm">
                <Link href="/calendar" className="flex items-center text-sm text-zinc-600">
                  Full view
                  <ChevronRight className="ml-1 h-3 w-3" />
                </Link>
              </Button>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <CalendarWidget tasks={tasks} />
              <div className="space-y-4">
                <SchedulerPanel tasks={tasks} onViewSchedule={handleViewSchedule} />
                <div id="schedule-view-section">
                  <ScheduleView tasks={tasks} />
                </div>
              </div>
            </div>
          </section>
          
          {/* Quick Access */}
          <section className="space-y-4">
            <h2 className="text-lg font-semibold">Quick Access</h2>
            <div className="grid gap-4 grid-cols-2 sm:grid-cols-4">
              <QuickAccessCard 
                title="Calendar" 
                description="View your schedule"
                icon={<CalendarIcon className="h-5 w-5" />}
                href="/calendar"
              />
              <QuickAccessCard 
                title="Analytics" 
                description="Track productivity"
                icon={<BarChart3 className="h-5 w-5" />}
                href="/analytics"
              />
              <QuickAccessCard 
                title="Add Task" 
                description="Create a new task"
                icon={<Plus className="h-5 w-5" />}
                href="/tasks?create=true"
              />
              <QuickAccessCard 
                title="Add Project" 
                description="Start a new project"
                icon={<Plus className="h-5 w-5" />}
                href="/projects?create=true"
              />
            </div>
          </section>
        </TabsContent>
        
        {/* Today's Tasks Tab */}
        <TabsContent value="today">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Today's Tasks</CardTitle>
              <CardDescription>Tasks due today: {tasksToday.length}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {tasksToday.length > 0 ? (
                tasksToday.map(task => (
                  <TaskCard key={task.id} task={task} compact />
                ))
              ) : (
                <div className="text-center py-6">
                  <Check className="h-12 w-12 text-green-500 mx-auto mb-3" />
                  <h3 className="text-lg font-medium">All Clear!</h3>
                  <p className="text-gray-500 mt-1">
                    You have no tasks due today
                  </p>
                  <Button className="mt-4" variant="outline" asChild>
                    <Link href="/tasks?create=true">
                      <Plus className="mr-2 h-4 w-4" />
                      Create Task
                    </Link>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Overdue Tasks Tab */}
        <TabsContent value="overdue">
          <Card className={overdueTasks.length > 0 ? "border-red-200" : ""}>
            <CardHeader>
              <CardTitle className="text-lg">Overdue Tasks</CardTitle>
              <CardDescription className={overdueTasks.length > 0 ? "text-red-500" : ""}>
                {overdueTasks.length > 0 
                  ? `${overdueTasks.length} task${overdueTasks.length > 1 ? 's' : ''} past due date` 
                  : "No overdue tasks"}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {overdueTasks.length > 0 ? (
                overdueTasks.map(task => (
                  <TaskCard key={task.id} task={task} compact />
                ))
              ) : (
                <div className="text-center py-6">
                  <Check className="h-12 w-12 text-green-500 mx-auto mb-3" />
                  <h3 className="text-lg font-medium">Great Job!</h3>
                  <p className="text-gray-500 mt-1">
                    You're all caught up with your tasks
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

// Helper component for Quick Access cards
function QuickAccessCard({ 
  title, 
  description, 
  icon, 
  href 
}: { 
  title: string; 
  description: string; 
  icon: React.ReactNode; 
  href: string; 
}) {
  return (
    <Card className="overflow-hidden hover:border-zinc-200 transition-colors">
      <Link href={href} className="block h-full">
        <CardContent className="p-4">
          <div className="flex flex-col items-center text-center">
            <div className="p-2 rounded-full bg-zinc-50 text-zinc-600 mb-3">
              {icon}
            </div>
            <h3 className="font-medium text-sm">{title}</h3>
            <p className="text-xs text-gray-500 mt-1">{description}</p>
          </div>
        </CardContent>
      </Link>
    </Card>
  );
}

// Helper functions
function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return 'morning';
  if (hour < 18) return 'afternoon';
  return 'evening';
}

function getPriorityClass(priority: string) {
  switch (priority) {
    case 'high':
      return 'bg-red-100 text-red-800';
    case 'medium':
      return 'bg-yellow-100 text-yellow-800';
    case 'low':
      return 'bg-green-100 text-green-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
}