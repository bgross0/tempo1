'use client';

import { ReactNode, useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { 
  Calendar, 
  CheckSquare, 
  Folder, 
  BarChart3, 
  Settings, 
  Menu, 
  X, 
  LogOut, 
  User, 
  Home, 
  Search,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/components/ui/use-toast';
import { ThemeToggle } from './ThemeToggle';
import { useAppStore } from '@/lib/store/app-store';
import { 
  Tooltip, 
  TooltipContent, 
  TooltipProvider, 
  TooltipTrigger 
} from '@/components/ui/tooltip';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { CommandPalette } from '@/components/command-palette';
import { KeyboardShortcutsDialog } from '@/components/keyboard-shortcuts-dialog';
import { useKeyboardShortcuts } from '@/lib/keyboard-shortcuts';

interface NavItemProps {
  href: string;
  icon: ReactNode;
  label: string;
}

function NavItem({ href, icon, label }: NavItemProps) {
  const pathname = usePathname();
  const isActive = pathname === href;
  const { sidebarCollapsed } = useAppStore();

  if (sidebarCollapsed) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Link 
              href={href}
              className={cn(
                "flex items-center justify-center rounded-lg p-2 transition-all",
                isActive 
                  ? "bg-blue-100 text-blue-900 dark:bg-blue-900 dark:bg-opacity-20 dark:text-blue-300" 
                  : "text-gray-600 dark:text-gray-300 hover:text-blue-900 dark:hover:text-blue-300 hover:bg-gray-100 dark:hover:bg-gray-800"
              )}
            >
              {icon}
            </Link>
          </TooltipTrigger>
          <TooltipContent side="right">
            {label}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return (
    <Link 
      href={href}
      className={cn(
        "flex items-center gap-3 rounded-lg px-3 py-2 transition-all",
        isActive 
          ? "bg-blue-100 text-blue-900 dark:bg-blue-900 dark:bg-opacity-20 dark:text-blue-300" 
          : "text-gray-600 dark:text-gray-300 hover:text-blue-900 dark:hover:text-blue-300 hover:bg-gray-100 dark:hover:bg-gray-800"
      )}
    >
      {icon}
      <span>{label}</span>
    </Link>
  );
}

export function DashboardLayout({ children }: { children: ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { 
    sidebarCollapsed, 
    setSidebarCollapsed,
    setCommandPaletteOpen 
  } = useAppStore();
  const { signOut, user } = useAuth();
  const pathname = usePathname();
  const { handleKeyDown } = useKeyboardShortcuts();

  
  // Register keyboard shortcuts
  useEffect(() => {
    const handleKeydownEvent = (e: globalThis.KeyboardEvent) => {
      handleKeyDown(e as unknown as KeyboardEvent);
    };
    
    window.addEventListener('keydown', handleKeydownEvent);
    return () => window.removeEventListener('keydown', handleKeydownEvent);
  }, [handleKeyDown]);

  const handleSignOut = async () => {
    try {
      await signOut();
      toast({
        title: "Signed out successfully",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error signing out",
        description: "Please try again",
      });
    }
  };

  // Format user's name for display
  const userName = user?.email?.split('@')[0] || 'User';
  const userInitial = userName.charAt(0).toUpperCase();

  const navItems = [
    { href: '/dashboard', icon: <Home className="h-5 w-5" />, label: 'Dashboard' },
    { href: '/tasks', icon: <CheckSquare className="h-5 w-5" />, label: 'Tasks' },
    { href: '/projects', icon: <Folder className="h-5 w-5" />, label: 'Projects' },
    { href: '/calendar', icon: <Calendar className="h-5 w-5" />, label: 'Calendar' },
    { href: '/analytics', icon: <BarChart3 className="h-5 w-5" />, label: 'Analytics' },
    { href: '/settings', icon: <Settings className="h-5 w-5" />, label: 'Settings' },
  ];

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar with collapsible support */}
      <div
        className={cn(
          "fixed inset-y-0 left-0 z-50 transform bg-white dark:bg-gray-800 transition-all duration-200 ease-in-out lg:static lg:translate-x-0",
          sidebarCollapsed ? "w-16" : "w-64",
          sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        <div className="flex h-full flex-col">
          {/* Sidebar header with logo and collapse toggle */}
          <div className="flex h-16 items-center justify-between px-4 border-b dark:border-gray-700">
            <Link href="/dashboard" className="flex items-center gap-2">
              <Image 
                src="/images/logo.png" 
                alt="Tempo Logo" 
                width={96}
                height={96}
                className="h-8 w-auto" 
              />
            </Link>
            <div className="flex items-center">
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                className="hidden lg:flex"
              >
                {sidebarCollapsed ? (
                  <ChevronRight className="h-5 w-5" />
                ) : (
                  <ChevronLeft className="h-5 w-5" />
                )}
              </Button>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => setSidebarOpen(false)}
                className="lg:hidden"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
          </div>

          {/* User info with responsive layout */}
          <div className={cn(
            "flex items-center gap-3 px-4 py-3 border-b dark:border-gray-700",
            sidebarCollapsed && "justify-center px-2"
          )}>
            <div className="shrink-0">
              <Avatar className="h-10 w-10">
                <AvatarFallback className="bg-blue-600 text-white">{userInitial}</AvatarFallback>
                {/* User from context doesn't have avatar_url */}
                <AvatarImage src={`https://avatar.vercel.sh/${user?.email || 'user'}`} alt={userName} />
              </Avatar>
            </div>
            {!sidebarCollapsed && (
              <div className="overflow-hidden">
                <p className="font-medium truncate">{userName}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{user?.email}</p>
              </div>
            )}
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto p-4">
            <ul className="space-y-2">
              {navItems.map((item) => (
                <li key={item.href}>
                  <NavItem {...item} />
                </li>
              ))}
            </ul>
          </nav>

          {/* Sidebar footer */}
          <div className="border-t dark:border-gray-700 p-4">
            <Button
              variant="outline"
              className={cn(
                "w-full", 
                sidebarCollapsed ? "justify-center p-2" : "justify-start gap-2"
              )}
              onClick={handleSignOut}
            >
              <LogOut className="h-4 w-4" />
              {!sidebarCollapsed && <span>Sign out</span>}
            </Button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Top header */}
        <header className="flex h-16 items-center justify-between border-b dark:border-gray-700 bg-white dark:bg-gray-800 px-4">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden"
          >
            <Menu className="h-5 w-5" />
          </Button>

          {/* Search on medium+ screens */}
          <div className="hidden md:flex items-center relative mx-auto max-w-md w-full">
            <button
              onClick={() => setCommandPaletteOpen(true)}
              className="w-full inline-flex items-center rounded-md border border-input bg-transparent px-4 py-2 text-sm text-muted-foreground shadow-sm transition-colors hover:bg-accent hover:text-accent-foreground h-9"
            >
              <Search className="mr-2 h-4 w-4" />
              <span>Search or use commands...</span>
              <kbd className="pointer-events-none absolute right-1.5 top-1.5 hidden h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100 sm:flex">
                <span className="text-xs">⌘</span>K
              </kbd>
            </button>
          </div>
          
          {/* Command button on small screens */}
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => setCommandPaletteOpen(true)}
            className="md:hidden"
          >
            <Search className="h-5 w-5" />
          </Button>

          <div className="flex items-center gap-2">
            <KeyboardShortcutsDialog />
            <ThemeToggle />
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto">
          <div className="container py-6 px-4 md:px-6">
            {children}
          </div>
        </main>
      </div>
      
      {/* Add the command palette component */}
      <CommandPalette />
    </div>
  );
}
