# TaskJet Architecture Overview

## 1. High-Level Architecture

TaskJet follows a modern web application architecture with a clear separation of concerns:

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│                 │     │                 │     │                 │
│  Client Layer   │ ←→  │  Service Layer  │ ←→  │   Data Layer    │
│  (Next.js App)  │     │ (API + Supabase)│     │ (PostgreSQL DB) │
│                 │     │                 │     │                 │
└─────────────────┘     └─────────────────┘     └─────────────────┘
```

### Client Layer
- Next.js application with App Router
- Mix of Server and Client Components
- Tailwind CSS with shadcn/ui for styling
- Client-side state management with Zustand and React Context

### Service Layer
- Supabase client for direct database operations
- Next.js API routes for complex operations
- Supabase Edge Functions for serverless processing
- Authentication and authorization handling

### Data Layer
- PostgreSQL database (managed by Supabase)
- Row Level Security (RLS) policies
- Real-time subscriptions
- Supabase Storage for file management

## 2. Component Hierarchy

TaskJet's UI is organized in a hierarchical component structure:

```
┌─ AppShell ──────────────────────────────────────────────────┐
│                                                              │
│  ┌─ Header ─────────────────────────────────────────────┐   │
│  │ Logo | Navigation | UserMenu                         │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                              │
│  ┌─ Layout ─────────────────────────────────────────────┐   │
│  │                                                       │   │
│  │  ┌─ Sidebar ─────┐   ┌─ MainContent ──────────────┐  │   │
│  │  │               │   │                            │  │   │
│  │  │ Navigation    │   │ ┌─ Page-specific UI ────┐  │  │   │
│  │  │ Links         │   │ │                       │  │  │   │
│  │  │               │   │ │ - DashboardView       │  │  │   │
│  │  │ Project       │   │ │ - CalendarView        │  │  │   │
│  │  │ List          │   │ │ - TaskListView        │  │  │   │
│  │  │               │   │ │ - ProjectsView        │  │  │   │
│  │  │ Tags          │   │ │ - AnalyticsView       │  │  │   │
│  │  │               │   │ │ - SettingsView        │  │  │   │
│  │  │               │   │ │                       │  │  │   │
│  │  │               │   │ └───────────────────────┘  │  │   │
│  │  │               │   │                            │  │   │
│  │  └───────────────┘   └────────────────────────────┘  │   │
│  │                                                       │   │
│  └───────────────────────────────────────────────────────┘   │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

### Main Views
- **DashboardView**: Overview with upcoming tasks, events, and project status
- **CalendarView**: Day, week, and month calendar views
- **TaskListView**: List-based task management with filtering and sorting
- **ProjectsView**: Project management dashboard
- **AnalyticsView**: Productivity metrics and visualizations
- **SettingsView**: User preferences and configuration

## 3. Data Flow Architecture

TaskJet uses a combination of server-side and client-side data fetching patterns:

### Server-Side Data Flow
1. **Server Components** fetch data directly from Supabase during server rendering
2. Results are passed to client components as props
3. HTML is rendered on the server and sent to the client

```
┌────────────┐     ┌────────────┐     ┌────────────┐     ┌────────────┐
│            │     │            │     │            │     │            │
│  Browser   │ ──> │  Next.js   │ ──> │  Supabase  │ ──> │ PostgreSQL │
│  Request   │     │  Server    │     │   Client   │     │  Database  │
│            │     │            │     │            │     │            │
└────────────┘     └────────────┘     └────────────┘     └────────────┘
                          │                                     │
                          │                                     │
                          ▼                                     ▼
                   ┌────────────┐                       ┌────────────┐
                   │            │                       │            │
                   │   Server   │ <───────────────────> │    Data    │
                   │ Components │                       │  Response  │
                   │            │                       │            │
                   └────────────┘                       └────────────┘
                          │
                          │
                          ▼
                   ┌────────────┐
                   │            │
                   │   HTML     │
                   │  Response  │
                   │            │
                   └────────────┘
                          │
                          │
                          ▼
                   ┌────────────┐
                   │            │
                   │  Browser   │
                   │  Render    │
                   │            │
                   └────────────┘
```

### Client-Side Data Flow
1. **Client Components** fetch data using SWR hooks
2. SWR manages caching, revalidation, and error handling
3. UI updates reactively as data changes

```
┌────────────┐     ┌────────────┐     ┌────────────┐     ┌────────────┐
│            │     │            │     │            │     │            │
│   Client   │ ──> │  SWR Hook  │ ──> │  Supabase  │ ──> │ PostgreSQL │
│ Component  │     │   fetcher  │     │   Client   │     │  Database  │
│            │     │            │     │            │     │            │
└────────────┘     └────────────┘     └────────────┘     └────────────┘
      ▲                   │                                     │
      │                   │                                     │
      │                   ▼                                     ▼
      │            ┌────────────┐                       ┌────────────┐
      │            │            │                       │            │
      └────────────│    Data    │ <───────────────────> │    Data    │
                   │   Cache    │                       │  Response  │
                   │            │                       │            │
                   └────────────┘                       └────────────┘
```

### Real-time Data Flow
1. **Supabase Realtime** listens for database changes
2. Client subscribes to relevant channels
3. UI automatically updates when changes occur

```
┌────────────┐     ┌────────────┐     ┌────────────┐
│            │     │            │     │            │
│ PostgreSQL │ ──> │  Supabase  │ ──> │   Client   │
│  Database  │     │  Realtime  │     │ Components │
│            │     │            │     │            │
└────────────┘     └────────────┘     └────────────┘
      │                   │                  ▲
      │                   │                  │
      ▼                   ▼                  │
┌────────────┐     ┌────────────┐     ┌────────────┐
│            │     │            │     │            │
│   Change   │ ──> │  WebSocket │ ──> │    React   │
│   Event    │     │  Channel   │     │   State    │
│            │     │            │     │            │
└────────────┘     └────────────┘     └────────────┘
```

## 4. State Management Architecture

TaskJet uses a hybrid state management approach:

### Global State (Zustand)
- User preferences
- UI state (sidebar collapsed, current view)
- Application settings

```javascript
// Store definition
const useAppStore = create((set) => ({
  sidebarCollapsed: false,
  currentView: 'dashboard',
  setSidebarCollapsed: (collapsed) => set({ sidebarCollapsed: collapsed }),
  setCurrentView: (view) => set({ currentView: view }),
}));

// Usage in components
const { sidebarCollapsed, setSidebarCollapsed } = useAppStore();
```

### Server State (SWR)
- Remote data (tasks, projects, events)
- Caching and revalidation
- Optimistic updates

```javascript
// Data fetching hook
const useTasks = (filters) => {
  const { data, error, mutate } = useSWR(
    ['tasks', filters],
    () => fetchTasks(filters)
  );
  
  return {
    tasks: data,
    isLoading: !error && !data,
    isError: error,
    mutate
  };
};

// Usage in components
const { tasks, isLoading } = useTasks({ completed: false });
```

### Local Component State (React)
- Form input values
- UI component states (expanded/collapsed)
- Temporary UI state

```javascript
// Local component state
const [isExpanded, setIsExpanded] = useState(false);
```

## 5. Authentication Flow

TaskJet uses Supabase Auth for authentication:

1. **Login Flow**
```
┌────────────┐     ┌────────────┐     ┌────────────┐
│            │     │            │     │            │
│   Login    │ ──> │  Supabase  │ ──> │  Validate  │
│    Form    │     │    Auth    │     │ Credentials│
│            │     │            │     │            │
└────────────┘     └────────────┘     └────────────┘
                          │                  │
                          │                  │
                          ▼                  ▼
                   ┌────────────┐     ┌────────────┐
                   │            │     │            │
                   │  Generate  │ <── │   User     │
                   │    JWT     │     │  Found     │
                   │            │     │            │
                   └────────────┘     └────────────┘
                          │
                          │
                          ▼
                   ┌────────────┐
                   │            │
                   │   Store    │
                   │   Token    │
                   │            │
                   └────────────┘
                          │
                          │
                          ▼
                   ┌────────────┐
                   │            │
                   │  Redirect  │
                   │ Dashboard  │
                   │            │
                   └────────────┘
```

2. **Session Management**
- JWT stored in local storage
- Automatic token refresh
- Session persistence across page reloads

3. **Protected Routes**
- Next.js middleware for route protection
- Redirect to login if not authenticated
- Role-based access control for future team features

## 6. Database Structure

TaskJet's database is built on PostgreSQL with the following structure:

```
┌───────────────┐       ┌───────────────┐
│               │       │               │
│     Users     │       │    Projects   │
│               │       │               │
└───────┬───────┘       └───────┬───────┘
        │                       │
        │ 1:N                   │ 1:N
        ▼                       ▼
┌───────────────┐       ┌───────────────┐
│               │       │               │
│     Tasks     │◄──────┤ Project_Tasks │
│               │       │               │
└───────┬───────┘       └───────────────┘
        │
        │ 1:N
        ▼
┌───────────────┐       ┌───────────────┐
│               │       │               │
│ Scheduled_    │       │    Events     │
│ Blocks        │       │               │
│               │       │               │
└───────────────┘       └───────────────┘
```

## 7. API Architecture

TaskJet provides several types of APIs:

### RESTful API Endpoints (Next.js API Routes)
- Standard CRUD operations
- Complex business logic operations
- Batch operations

```
/api/tasks              # GET, POST
/api/tasks/:id          # GET, PUT, DELETE
/api/projects           # GET, POST
/api/projects/:id       # GET, PUT, DELETE
/api/events             # GET, POST
/api/events/:id         # GET, PUT, DELETE
/api/analytics/summary  # GET
```

### Direct Supabase Access
- Simple CRUD operations from the client
- Real-time subscriptions
- File uploads

```javascript
// Example of direct Supabase access
const { data, error } = await supabase
  .from('tasks')
  .select('*')
  .eq('user_id', userId);
```

### Serverless Functions (Supabase Edge Functions)
- Task scheduling algorithm
- Notification processing
- Background jobs

## 8. Deployment Architecture

TaskJet is deployed on Vercel with the following architecture:

```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│                        Internet                             │
│                                                             │
└───────────────────────────┬─────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│                     Vercel Edge Network                     │
│                                                             │
└───────────────────────────┬─────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│                      Vercel Platform                        │
│                                                             │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐     │
│  │             │    │             │    │             │     │
│  │  Next.js    │    │   API       │    │  Static     │     │
│  │  Server     │    │   Routes    │    │  Assets     │     │
│  │             │    │             │    │             │     │
│  └─────────────┘    └─────────────┘    └─────────────┘     │
│                                                             │
└───────────────────────────┬─────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│                      Supabase Platform                      │
│                                                             │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐     │
│  │             │    │             │    │             │     │
│  │ PostgreSQL  │    │   Auth      │    │   Storage   │     │
│  │  Database   │    │   Service   │    │   Service   │     │
│  │             │    │             │    │             │     │
│  └─────────────┘    └─────────────┘    └─────────────┘     │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

## 9. Security Architecture

TaskJet implements multiple layers of security:

### Authentication Security
- PKCE flow for OAuth providers
- Email verification
- Password policies
- Multi-factor authentication (MFA)

### Data Security
- Row Level Security (RLS) in Supabase
- Input validation and sanitization
- Prepared statements for SQL queries
- Secure password hashing

### Application Security
- CSRF protection
- XSS prevention
- Content Security Policy
- Rate limiting
- HTTPS enforcement

## 10. Performance Architecture

TaskJet is built for performance:

### Frontend Performance
- Next.js Static Generation where possible
- Dynamic imports for code splitting
- Image optimization with next/image
- Incremental Static Regeneration for static pages

### Backend Performance
- Query optimization with PostgreSQL indexes
- Connection pooling
- Caching strategies for expensive operations
- Efficient batch operations

### Network Performance
- Edge caching on Vercel
- API response compression
- Minimized bundle sizes
- Cache-Control headers

## 11. Scalability Architecture

TaskJet is designed to scale:

### Horizontal Scaling
- Stateless application design
- Serverless architecture on Vercel
- Database connection pooling

### Vertical Scaling
- PostgreSQL performance tuning
- Resource optimization
- Efficient query patterns

### Data Partitioning
- User-based data isolation
- Potential for future sharding

## 12. Feature Implementation Architecture

### Task Scheduling System
The task scheduling algorithm is a core feature:

```
┌───────────────┐     ┌───────────────┐     ┌───────────────┐
│               │     │               │     │               │
│  User Inputs  │ ──> │  Scheduling   │ ──> │ Scheduled     │
│  & Preferences│     │  Algorithm    │     │ Task Blocks   │
│               │     │               │     │               │
└───────────────┘     └───────────────┘     └───────────────┘
                             │
          ┌─────────────────┴──────────────┐
          │                                │
          ▼                                ▼
┌───────────────┐                 ┌───────────────┐
│               │                 │               │
│ Priority-based│                 │ Deadline-based│
│  Scheduling   │                 │  Scheduling   │
│               │                 │               │
└───────────────┘                 └───────────────┘
```

The algorithm considers:
- Task priorities
- Due dates
- User working hours
- Existing commitments
- Task dependencies
- Time-of-day preferences

### Analytics System
The analytics system processes user activity:

```
┌───────────────┐     ┌───────────────┐     ┌───────────────┐
│               │     │               │     │               │
│   User Data   │ ──> │  Analytics    │ ──> │  Metrics &    │
│  (Tasks, etc.)│     │  Processing   │     │  Insights     │
│               │     │               │     │               │
└───────────────┘     └───────────────┘     └───────────────┘
                             │
          ┌─────────────────┴──────────────┐
          │                                │
          ▼                                ▼
┌───────────────┐                 ┌───────────────┐
│               │                 │               │
│  Productivity │                 │   Time        │
│  Metrics      │                 │   Allocation  │
│               │                 │               │
└───────────────┘                 └───────────────┘
```

## 13. Future Architecture Considerations

### Scaling for Teams
- Team workspaces with shared projects
- Role-based permissions
- Activity feeds and collaboration features

### AI Integration
- Smart task suggestions
- Predictive scheduling
- Natural language processing for task creation

### Mobile Application
- React Native implementation
- Offline-first architecture
- Push notification system

### Integration Ecosystem
- API-first approach for third-party integrations
- Webhooks for external system communication
- Calendar sync with Google, Outlook, etc.
