"use client"

import { Activity, CreditCard, DollarSign, Users, Calendar, BarChart3, Clock, FileText } from "lucide-react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Calendar as CalendarComponent } from "@/components/ui/calendar"
import { Button } from "@/components/ui/button"
import { useEffect, useState } from "react"
import { 
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"

// Example data for upcoming tasks
const EXAMPLE_TASKS = [
  { id: 1, title: "Review Project Proposal", priority: "High", dueDate: "Today", status: "Pending" },
  { id: 2, title: "Weekly Team Meeting", priority: "Medium", dueDate: "Tomorrow", status: "Scheduled" },
  { id: 3, title: "Client Presentation", priority: "High", dueDate: "Mar 6", status: "In Progress" },
  { id: 4, title: "Budget Review", priority: "Medium", dueDate: "Mar 7", status: "Not Started" },
]

// Example activity data
const ACTIVITY_DATA = [
  { id: 1, user: "John Doe", action: "completed", task: "Website Redesign", time: "2 hours ago" },
  { id: 2, user: "Sarah Smith", action: "commented on", task: "Mobile App Design", time: "3 hours ago" },
  { id: 3, user: "Alex Johnson", action: "created", task: "Marketing Campaign", time: "Yesterday" },
  { id: 4, user: "Lisa Brown", action: "updated", task: "Q1 Report", time: "Yesterday" },
]

export function DashboardEnhanced() {
  const [date, setDate] = useState<Date | undefined>(new Date())
  
  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
        <div className="flex items-center space-x-2">
          <Dialog>
            <DialogTrigger asChild>
              <Button>
                <Calendar className="mr-2 h-4 w-4" />
                Schedule Task
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Schedule New Task</DialogTitle>
                <DialogDescription>
                  Create a new task and add it to your calendar.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <label htmlFor="task-title">Task Title</label>
                  <input
                    id="task-title"
                    className="p-2 border rounded-md"
                    placeholder="Enter task title"
                  />
                </div>
                <div className="grid gap-2">
                  <label>Due Date</label>
                  <div className="border rounded-md p-2">
                    <CalendarComponent
                      mode="single"
                      selected={date}
                      onSelect={setDate}
                      className="rounded-md border"
                    />
                  </div>
                </div>
              </div>
              <div className="flex justify-end">
                <Button>Create Task</Button>
              </div>
            </DialogContent>
          </Dialog>
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline">
                <BarChart3 className="mr-2 h-4 w-4" />
                View Reports
              </Button>
            </SheetTrigger>
            <SheetContent>
              <SheetHeader>
                <SheetTitle>Analytics Dashboard</SheetTitle>
                <SheetDescription>
                  View your productivity metrics and reports.
                </SheetDescription>
              </SheetHeader>
              <div className="grid gap-4 py-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Task Completion Rate</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">87%</div>
                    <p className="text-xs text-muted-foreground">+2.5% from last month</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Time Spent on Tasks</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[120px] bg-muted rounded-md flex items-center justify-center text-muted-foreground">
                      Chart Placeholder
                    </div>
                  </CardContent>
                </Card>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Tasks</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">24</div>
            <p className="text-xs text-muted-foreground">+2 added today</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">In Progress</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">7</div>
            <p className="text-xs text-muted-foreground">+3 from yesterday</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">15</div>
            <p className="text-xs text-muted-foreground">+5 this week</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Productivity Score</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">82%</div>
            <p className="text-xs text-muted-foreground">+2% from last week</p>
          </CardContent>
        </Card>
      </div>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Upcoming Tasks</CardTitle>
            <CardDescription>
              Tasks that need your attention soon.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {EXAMPLE_TASKS.map((task) => (
                <div key={task.id} className="flex items-center p-2 border rounded-md">
                  <div className="flex-1">
                    <div className="font-medium">{task.title}</div>
                    <div className="text-sm text-muted-foreground">Due: {task.dueDate}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className={`text-sm px-2 py-1 rounded-full ${
                      task.priority === 'High' 
                        ? 'bg-red-100 text-red-800' 
                        : 'bg-blue-100 text-blue-800'
                    }`}>
                      {task.priority}
                    </div>
                    <div className="text-sm px-2 py-1 bg-gray-100 rounded-full">
                      {task.status}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
          <CardFooter>
            <Button variant="outline" className="w-full">
              View All Tasks
            </Button>
          </CardFooter>
        </Card>
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>
              Latest updates from your team.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {ACTIVITY_DATA.map((activity) => (
                <div key={activity.id} className="flex items-start gap-3">
                  <div className="rounded-full bg-gray-100 p-2">
                    <Users className="h-4 w-4" />
                  </div>
                  <div className="flex-1 space-y-1">
                    <p className="text-sm font-medium leading-none">
                      <span className="font-semibold">{activity.user}</span>{' '}
                      <span className="text-muted-foreground">{activity.action}</span>{' '}
                      <span className="font-medium">{activity.task}</span>
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {activity.time}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
          <CardFooter>
            <Button variant="outline" className="w-full">
              View All Activity
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}