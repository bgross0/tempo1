"use client"

import { Activity, CheckCircle, Clock, Calendar, BarChart3, Target, AlertCircle } from "lucide-react"
import React from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import MiniCalendar from "@/components/calendar/MiniCalendar"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs/index"
import { useEffect, useState } from "react"

// Example data for tasks
const TASKS_BY_PRIORITY = [
  { id: 1, title: "Finalize Q1 Report", priority: "High", dueDate: "Today", completed: false, project: "Finance" },
  { id: 2, title: "Team Retrospective Meeting", priority: "Medium", dueDate: "Today", completed: false, project: "Management" },
  { id: 3, title: "Update Product Roadmap", priority: "High", dueDate: "Tomorrow", completed: false, project: "Product" },
  { id: 4, title: "Client Demo Preparation", priority: "High", dueDate: "Mar 6", completed: false, project: "Sales" },
  { id: 5, title: "Review Marketing Campaign", priority: "Medium", dueDate: "Mar 7", completed: false, project: "Marketing" },
]

// Example projects data
const PROJECTS = [
  { id: 1, name: "Website Redesign", progress: 75, tasks: { total: 12, completed: 9 } },
  { id: 2, name: "Mobile App Development", progress: 40, tasks: { total: 20, completed: 8 } },
  { id: 3, name: "Marketing Campaign", progress: 90, tasks: { total: 8, completed: 7 } },
]

// Example time allocation data
const TIME_ALLOCATION = [
  { category: "Meetings", hours: 12, percentage: 30 },
  { category: "Development", hours: 16, percentage: 40 },
  { category: "Planning", hours: 6, percentage: 15 },
  { category: "Research", hours: 6, percentage: 15 },
]

export function ProductivityDashboard() {
  const [progress, setProgress] = useState(0)
  
  useEffect(() => {
    const timer = setTimeout(() => setProgress(66), 500)
    return () => clearTimeout(timer)
  }, [])
  
  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
          <p className="text-muted-foreground">
            Your productivity at a glance
          </p>
        </div>
        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">
                This Week <ChevronDown className="ml-2 h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Time Period</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>Today</DropdownMenuItem>
              <DropdownMenuItem>This Week</DropdownMenuItem>
              <DropdownMenuItem>This Month</DropdownMenuItem>
              <DropdownMenuItem>This Quarter</DropdownMenuItem>
              <DropdownMenuItem>Custom Range...</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            New Task
          </Button>
        </div>
      </div>
      
      {/* Metrics Overview */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Productivity Score</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{progress}%</div>
            <Progress value={progress} className="mt-2" />
            <p className="text-xs text-muted-foreground mt-2">+4% from last week</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tasks Completed</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">24/36</div>
            <p className="text-xs text-muted-foreground mt-2">67% completion rate</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Focus Time</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">18.5 hrs</div>
            <p className="text-xs text-muted-foreground mt-2">+2.5 hrs from last week</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Upcoming Deadlines</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3</div>
            <p className="text-xs text-muted-foreground mt-2">Within next 48 hours</p>
          </CardContent>
        </Card>
      </div>
      
      {/* Main Content */}
      <div className="grid gap-4 md:grid-cols-7">
        {/* Tasks and Projects */}
        <div className="col-span-5">
          <Tabs defaultValue="tasks" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="tasks">Tasks</TabsTrigger>
              <TabsTrigger value="projects">Projects</TabsTrigger>
            </TabsList>
            <TabsContent value="tasks" className="border rounded-md mt-4">
              <div className="p-4">
                <div className="flex justify-between mb-4">
                  <h3 className="text-lg font-semibold">Priority Tasks</h3>
                  <Button variant="outline" size="sm">View All</Button>
                </div>
                <div className="space-y-3">
                  {TASKS_BY_PRIORITY.map((task) => (
                    <div key={task.id} className="flex items-center p-3 border rounded-md hover:bg-accent hover:text-accent-foreground transition-colors">
                      <div className="flex-1">
                        <div className="font-medium flex items-center gap-2">
                          {task.title}
                          <Badge variant={task.priority === 'High' ? 'destructive' : 'secondary'}>
                            {task.priority}
                          </Badge>
                        </div>
                        <div className="text-sm text-muted-foreground flex items-center gap-2">
                          <span>Due: {task.dueDate}</span>
                          <span>•</span>
                          <span>{task.project}</span>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="icon">
                          <CheckCircle className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="icon">
                          <Clock className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </TabsContent>
            <TabsContent value="projects" className="p-4 border rounded-md mt-4">
              <div className="flex justify-between mb-4">
                <h3 className="text-lg font-semibold">Active Projects</h3>
                <Button variant="outline" size="sm">View All</Button>
              </div>
              <div className="space-y-4">
                {PROJECTS.map((project) => (
                  <div key={project.id} className="border rounded-md p-4">
                    <div className="flex justify-between mb-2">
                      <h4 className="font-medium">{project.name}</h4>
                      <span className="text-sm text-muted-foreground">
                        {project.tasks.completed}/{project.tasks.total} tasks
                      </span>
                    </div>
                    <Progress value={project.progress} className="mb-2" />
                    <div className="flex justify-between text-sm text-muted-foreground">
                      <span>{project.progress}% complete</span>
                      <Button variant="link" size="sm" className="p-0">Details</Button>
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>
          </Tabs>
          
          {/* Time Allocation */}
          <Card className="mt-4">
            <CardHeader>
              <CardTitle>Time Allocation</CardTitle>
              <CardDescription>How you spent your time this week</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {TIME_ALLOCATION.map((item) => (
                  <div key={item.category} className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span>{item.category}</span>
                      <span className="font-medium">{item.hours} hours ({item.percentage}%)</span>
                    </div>
                    <Progress value={item.percentage} className="h-2" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Calendar & Schedule */}
        <div className="col-span-2 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Calendar</CardTitle>
              <CardDescription>Your upcoming schedule</CardDescription>
            </CardHeader>
            <CardContent>
              <MiniCalendar />
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="w-full">
                <Calendar className="mr-2 h-4 w-4" />
                View Full Calendar
              </Button>
            </CardFooter>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Today's Schedule</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-3 p-2 border rounded-md">
                <div className="bg-primary w-1 h-10 rounded-full"></div>
                <div>
                  <div className="font-medium">Team Stand-up</div>
                  <div className="text-sm text-muted-foreground">9:30 - 10:00 AM</div>
                </div>
              </div>
              <div className="flex items-center gap-3 p-2 border rounded-md">
                <div className="bg-blue-500 w-1 h-10 rounded-full"></div>
                <div>
                  <div className="font-medium">Client Meeting</div>
                  <div className="text-sm text-muted-foreground">11:00 AM - 12:00 PM</div>
                </div>
              </div>
              <div className="flex items-center gap-3 p-2 border rounded-md">
                <div className="bg-green-500 w-1 h-10 rounded-full"></div>
                <div>
                  <div className="font-medium">Project Review</div>
                  <div className="text-sm text-muted-foreground">2:00 - 3:30 PM</div>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button variant="ghost" className="w-full">View All Events</Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  )
}

// Missing import components
function ChevronDown(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="m6 9 6 6 6-6"/>
    </svg>
  )
}

function Plus(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M5 12h14" />
      <path d="M12 5v14" />
    </svg>
  )
}