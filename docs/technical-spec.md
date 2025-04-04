# Tempo Technical Specification

## 1. Overview and Purpose

Tempo is a modern task management application designed to help users organize tasks, manage projects, schedule events, and track productivity metrics. Built with Next.js and Supabase, it offers real-time synchronization across devices, intelligent task scheduling, and comprehensive productivity analytics.

## 2. Technology Stack

### Frontend
- **Framework**: Next.js 14 (React framework with App Router)
- **Styling**: Tailwind CSS with shadcn/ui component library
- **State Management**: React Context API and Zustand
- **Forms**: React Hook Form with Zod validation
- **Data Fetching**: SWR for client-side, Next.js Server Components for server-side

### Backend
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Storage**: Supabase Storage
- **Real-time Updates**: Supabase Realtime
- **Edge Functions**: Supabase Edge Functions for serverless operations

### DevOps
- **Hosting**: Vercel
- **CI/CD**: GitHub Actions
- **Monitoring**: Vercel Analytics
- **Error Tracking**: Sentry

## 3. System Architecture

Tempo follows a hybrid architecture combining server-side rendering, static generation, and client-side rendering:

1. **Server Components**: Used for data-fetching and initial rendering
2. **Client Components**: Used for interactive elements and state management
3. **API Layer**: Next.js API routes for custom endpoints
4. **Database Layer**: Supabase for data persistence and real-time capabilities

The application uses a feature-based folder structure:
```
src/
├── app/                    # Next.js App Router
│   ├── (auth)/             # Authentication routes
│   ├── (dashboard)/        # Protected dashboard routes
│   ├── api/                # API routes
│   └── ...
├── components/             # Shared components
│   ├── ui/                 # UI components (shadcn)
│   ├── forms/              # Form components
│   └── ...
├── features/               # Feature-specific components
│   ├── tasks/              # Task management
│   ├── projects/           # Project management
│   ├── calendar/           # Calendar views
│   ├── analytics/          # Analytics components
│   └── ...
├── lib/                    # Utility functions
├── hooks/                  # Custom React hooks
├── styles/                 # Global styles
└── types/                  # TypeScript type definitions
```

## 4. Database Schema

### Supabase Tables

#### Users
- `id`: UUID (primary key)
- `email`: String
- `name`: String
- `avatar_url`: String
- `created_at`: Timestamp
- `settings`: JSONB

#### Tasks
- `id`: UUID (primary key)
- `user_id`: UUID (foreign key)
- `project_id`: UUID (foreign key, nullable)
- `name`: String
- `description`: Text
- `start_date`: Date (nullable)
- `start_time`: Time (nullable)
- `due_date`: Date
- `due_time`: Time (nullable)
- `priority`: Enum ('high', 'medium', 'low')
- `duration`: Integer (minutes)
- `chunk_size`: Integer (minutes, nullable)
- `hard_deadline`: Boolean
- `completed`: Boolean
- `completed_at`: Timestamp (nullable)
- `tags`: Array
- `created_at`: Timestamp
- `updated_at`: Timestamp
- `scheduled_blocks`: JSONB

#### Projects
- `id`: UUID (primary key)
- `user_id`: UUID (foreign key)
- `name`: String
- `description`: Text
- `start_date`: Date
- `due_date`: Date
- `priority`: Enum ('high', 'medium', 'low')
- `completed`: Boolean
- `completed_at`: Timestamp (nullable)
- `tags`: Array
- `created_at`: Timestamp
- `updated_at`: Timestamp

#### Events
- `id`: UUID (primary key)
- `user_id`: UUID (foreign key)
- `name`: String
- `description`: Text
- `start_date`: Date
- `start_time`: Time
- `end_date`: Date
- `end_time`: Time
- `location`: String
- `recurring`: Enum ('none', 'daily', 'weekly', 'monthly')
- `tags`: Array
- `created_at`: Timestamp
- `updated_at`: Timestamp

### Database Relationships
- Users have many Tasks, Projects, and Events
- Projects have many Tasks
- RLS (Row Level Security) ensures users can only access their own data

## 5. API Design

### REST API
Tempo uses Next.js API routes to handle specific operations:

- `/api/tasks`: CRUD operations for tasks
- `/api/projects`: CRUD operations for projects
- `/api/events`: CRUD operations for events
- `/api/analytics`: Endpoints for analytics data
- `/api/settings`: User settings management

### Supabase Direct Access
For many operations, components will interact with Supabase directly:

- Real-time updates
- Authentication
- Basic CRUD operations
- File uploads

## 6. Authentication and Authorization

### Authentication Methods
- Email/Password
- Google OAuth
- GitHub OAuth
- Microsoft OAuth

### Authorization
- Row Level Security (RLS) policies in Supabase
- JWT validation for API routes
- Middleware for route protection
- Role-based access for future team features

## 7. Component Structure

### Core Components

#### UI Components
- `Button`, `Input`, `Select`, etc. (shadcn/ui)
- `Card`, `Dialog`, `Drawer`, etc.
- `Calendar`, `DatePicker`, `TimePicker`

#### Layout Components
- `AppShell`: Main application layout
- `Sidebar`: Navigation sidebar
- `Header`: App header with user menu
- `PageContainer`: Standard page wrapper

#### Task Components
- `TaskList`: List of tasks with filtering
- `TaskCard`: Individual task display
- `TaskForm`: Create/edit task
- `TaskDetails`: Detailed task view

#### Project Components
- `ProjectList`: List of projects
- `ProjectCard`: Individual project display
- `ProjectForm`: Create/edit project
- `ProjectDetails`: Detailed project view

#### Calendar Components
- `CalendarView`: Main calendar component
- `DayView`, `WeekView`, `MonthView`: Different calendar views
- `EventCard`: Calendar event display
- `EventForm`: Create/edit events

#### Analytics Components
- `AnalyticsDashboard`: Main analytics view
- `TaskCompletionChart`: Visualize task completion
- `ProductivityScore`: Display productivity metrics
- `TimeAllocationChart`: Time spent visualization

## 8. State Management

### Global State
- **Zustand**: For application-wide state
  - User preferences
  - UI state
  - Current view settings

### Server State
- **SWR**: For data fetching with caching and revalidation
  - Tasks, projects, events data
  - Analytics data

### Form State
- **React Hook Form**: For form handling
  - Validation with Zod
  - Form submission

### Local Component State
- **React useState/useReducer**: For component-specific state

## 9. Routing

Tempo uses Next.js App Router with the following routes:

- `/`: Landing page
- `/login`, `/signup`: Authentication
- `/dashboard`: Main dashboard
- `/calendar`: Calendar view
- `/tasks`: Task management
- `/projects`: Project management
- `/analytics`: Productivity analytics
- `/settings`: User settings

## 10. Styling Approach

- **Tailwind CSS**: Utility-first CSS framework
- **shadcn/ui**: Component library built on Tailwind
- **CSS Variables**: For theming and dark mode
- **CSS Modules**: For component-specific styles when needed

## 11. Testing Strategy

- **Unit Tests**: Jest + React Testing Library
- **Component Tests**: Storybook
- **Integration Tests**: Cypress
- **E2E Tests**: Playwright
- **API Tests**: Supertest

## 12. Deployment Pipeline

- **Development**: Local development environment
- **Staging**: Vercel preview deployments
- **Production**: Vercel production deployment
- **CI/CD**: GitHub Actions for automated testing and deployment

## 13. Performance Optimization

- **Code Splitting**: Automatic with Next.js
- **Image Optimization**: Next.js Image component
- **Server Components**: For data-heavy pages
- **Edge Functions**: For performance-critical operations
- **Caching**: SWR and Next.js caching strategies

## 14. Accessibility

- WCAG 2.1 AA compliance
- Keyboard navigation
- Screen reader support
- Color contrast requirements
- Focus management

## 15. Internationalization

- Next.js built-in i18n
- Language detection and selection
- Right-to-left (RTL) support

## 16. Security Measures

- CSRF protection
- XSS prevention
- Input validation
- Content Security Policy
- Rate limiting
- SQL injection prevention (handled by Supabase)
