/**
 * Application route configuration
 * Defines all routes in the application for consistent navigation
 */

export const routes = {
  // Public routes
  public: {
    home: '/',
    login: '/login',
    signup: '/signup',
    resetPassword: '/reset-password',
    updatePassword: '/update-password',
    verifyEmail: '/verify-email',
  },
  
  // Dashboard routes (protected)
  dashboard: {
    home: '/dashboard',
    tasks: '/tasks',
    projects: '/projects',
    calendar: '/calendar',
    analytics: '/analytics',
    settings: '/settings',
  },
  
  // Task routes
  tasks: {
    list: '/tasks',
    create: '/tasks?create=true',
    edit: (id: string) => `/tasks/${id}/edit`,
    view: (id: string) => `/tasks/${id}`,
    filter: (filter: string) => `/tasks?filter=${filter}`,
  },
  
  // Project routes
  projects: {
    list: '/projects',
    create: '/projects?create=true',
    edit: (id: string) => `/projects/${id}/edit`,
    view: (id: string) => `/projects/${id}`,
    tasks: (id: string) => `/projects/${id}/tasks`,
  },
  
  // Settings routes
  settings: {
    profile: '/settings/profile',
    account: '/settings/account',
    notifications: '/settings/notifications',
    appearance: '/settings/appearance',
  },
  
  // API routes
  api: {
    tasks: '/api/tasks',
    projects: '/api/projects',
    users: '/api/users',
    analytics: '/api/analytics',
  }
};
