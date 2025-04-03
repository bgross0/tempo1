import Link from 'next/link';
import { CheckCircle, Clock, BarChart3, Calendar, Target, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function HomePage() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Navigation */}
      <header className="sticky top-0 z-40 w-full border-b bg-white">
        <div className="container flex h-16 items-center justify-between px-4 md:px-6">
          <div className="flex items-center gap-2">
            <Link href="/" className="flex items-center">
              <img 
                src="/images/logo.png" 
                alt="Tempo Logo" 
                className="h-8 w-auto" 
              />
            </Link>
          </div>
          <nav className="hidden md:flex gap-6">
            <Link href="#features" className="text-sm font-medium text-gray-600 hover:text-blue-600">
              Features
            </Link>
            <Link href="#how-it-works" className="text-sm font-medium text-gray-600 hover:text-blue-600">
              How It Works
            </Link>
            <Link href="#pricing" className="text-sm font-medium text-gray-600 hover:text-blue-600">
              Pricing
            </Link>
          </nav>
          <div className="flex items-center gap-4">
            <Link 
              href="/login"
              className="text-sm font-medium text-gray-600 hover:text-blue-600"
            >
              Log in
            </Link>
            <Button asChild>
              <Link href="/signup">
                Sign up
              </Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="w-full py-12 md:py-24 lg:py-32 bg-gradient-to-b from-blue-50 to-blue-100">
        <div className="container grid items-center gap-6 px-4 md:px-6 lg:grid-cols-2 lg:gap-10">
          <div className="space-y-6">
            <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl">
              Manage your tasks with power and simplicity
            </h1>
            <p className="max-w-[600px] text-gray-600 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
              Tempo helps you organize tasks, manage projects, and boost productivity with a smart, intuitive interface.
            </p>
            <div className="flex flex-col gap-2 min-[400px]:flex-row">
              <Button size="lg" asChild>
                <Link href="/signup">Get Started</Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="#features">Learn More</Link>
              </Button>
            </div>
          </div>
          <div className="flex items-center justify-center">
            <div className="relative mx-auto aspect-video overflow-hidden rounded-xl border bg-gray-100 md:aspect-square lg:aspect-video w-full max-w-[500px]">
              <div className="flex items-center justify-center h-full bg-gray-200 rounded-lg">
                <div className="text-center p-4">
                  <h3 className="text-lg font-medium text-gray-800">Tempo Dashboard</h3>
                  <p className="text-sm text-gray-600">Modern Task Management</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="w-full py-12 md:py-24 lg:py-32">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <div className="inline-block rounded-lg bg-blue-100 px-3 py-1 text-sm text-blue-700">
              Features
            </div>
            <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
              Everything you need to stay productive
            </h2>
            <p className="max-w-[900px] text-gray-600 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
              Tempo combines powerful features with intuitive design to help you manage your work efficiently.
            </p>
          </div>
          <div className="mx-auto grid max-w-5xl grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 mt-12">
            <div className="flex flex-col items-center space-y-4 rounded-lg border p-6">
              <div className="rounded-full bg-blue-100 p-3">
                <CheckCircle className="h-6 w-6 text-blue-700" />
              </div>
              <h3 className="text-xl font-bold">Smart Task Management</h3>
              <p className="text-center text-gray-600">
                Organize tasks by priority, deadlines, projects, and custom tags to stay on top of your work.
              </p>
            </div>
            <div className="flex flex-col items-center space-y-4 rounded-lg border p-6">
              <div className="rounded-full bg-blue-100 p-3">
                <Target className="h-6 w-6 text-blue-700" />
              </div>
              <h3 className="text-xl font-bold">Project Dashboard</h3>
              <p className="text-center text-gray-600">
                Visual overview of all projects with progress indicators and deadline monitoring.
              </p>
            </div>
            <div className="flex flex-col items-center space-y-4 rounded-lg border p-6">
              <div className="rounded-full bg-blue-100 p-3">
                <Calendar className="h-6 w-6 text-blue-700" />
              </div>
              <h3 className="text-xl font-bold">Flexible Calendar</h3>
              <p className="text-center text-gray-600">
                View your schedule in daily, weekly, or monthly formats with easy task scheduling.
              </p>
            </div>
            <div className="flex flex-col items-center space-y-4 rounded-lg border p-6">
              <div className="rounded-full bg-blue-100 p-3">
                <Zap className="h-6 w-6 text-blue-700" />
              </div>
              <h3 className="text-xl font-bold">Smart Scheduling</h3>
              <p className="text-center text-gray-600">
                Automatically schedules tasks based on priority, deadlines, and your working hours.
              </p>
            </div>
            <div className="flex flex-col items-center space-y-4 rounded-lg border p-6">
              <div className="rounded-full bg-blue-100 p-3">
                <Clock className="h-6 w-6 text-blue-700" />
              </div>
              <h3 className="text-xl font-bold">Time Tracking</h3>
              <p className="text-center text-gray-600">
                Track time spent on tasks and projects to improve productivity and billing accuracy.
              </p>
            </div>
            <div className="flex flex-col items-center space-y-4 rounded-lg border p-6">
              <div className="rounded-full bg-blue-100 p-3">
                <BarChart3 className="h-6 w-6 text-blue-700" />
              </div>
              <h3 className="text-xl font-bold">Advanced Analytics</h3>
              <p className="text-center text-gray-600">
                Gain insights into your productivity with comprehensive charts and reports.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="w-full py-12 md:py-24 lg:py-32 bg-blue-600 text-white">
        <div className="container grid items-center gap-6 px-4 md:px-6 lg:grid-cols-2 lg:gap-10">
          <div className="space-y-6">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
              Ready to boost your productivity?
            </h2>
            <p className="max-w-[600px] md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
              Join thousands of users who are managing their tasks more efficiently with Tempo.
            </p>
          </div>
          <div className="flex flex-col gap-2 min-[400px]:flex-row justify-center lg:justify-end">
            <Button size="lg" variant="secondary" asChild>
              <Link href="/signup">Sign Up Free</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="w-full py-6 md:py-12 border-t">
        <div className="container flex flex-col items-center justify-center gap-4 px-4 md:px-6 md:flex-row md:justify-between text-center md:text-left">
          <div className="text-sm text-gray-500">
            © {new Date().getFullYear()} Tempo. All rights reserved.
          </div>
          <div className="flex gap-4">
            <Link href="#" className="text-sm text-gray-500 hover:text-blue-600">
              Terms
            </Link>
            <Link href="#" className="text-sm text-gray-500 hover:text-blue-600">
              Privacy
            </Link>
            <Link href="#" className="text-sm text-gray-500 hover:text-blue-600">
              Contact
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}