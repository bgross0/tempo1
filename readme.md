# Tempo

Tempo is a powerful task management application designed for individuals and teams who need a robust, intuitive solution for organizing tasks, managing projects, scheduling events, and tracking productivity.

## Features

### Task Management
- **Smart Scheduling**: Automatically schedules tasks based on priority, deadlines, and your working hours
- **Task Chunking**: Breaks down large tasks into manageable time blocks
- **Priority Levels**: High, medium, and low priorities with visual indicators
- **Task Dialog**: Intuitive task creation and editing via modal dialog
- **Task Filtering**: Filter tasks by completion status, priority, and due date
- **Multiple Views**: Toggle between grid and list views for tasks
- **Hard Deadlines**: Mark tasks that must be completed by their due date
- **Flexible Scheduling**: Optional start dates/times and due times for precise planning
- **Batch Operations**: Complete, prioritize, or delete multiple tasks at once
- **Drag and Drop**: Intuitive task rescheduling with drag and drop in calendar views

### Calendar Views
- **Day View**: Detailed hour-by-hour view of your schedule
- **Week View**: Weekly overview with time slots for each day
- **Month View**: Monthly overview with condensed task and event display
- **Mini Calendar**: Quick date navigation in the sidebar

### Project Management
- **Project Dashboard**: Visual overview of all projects with progress indicators
- **Task Assignment**: Group tasks under specific projects
- **Progress Tracking**: Real-time project completion percentage based on completed tasks
- **Deadline Monitoring**: Visual indicators for approaching deadlines

### Event Management
- **Calendar Events**: Create and manage one-time or recurring events
- **Event Details**: Store location, description, and other relevant information
- **Multi-day Events**: Support for events spanning multiple days
- **Recurring Events**: Daily, weekly, or monthly recurrence patterns

### Analytics
- **Productivity Score**: Calculated based on task completion and priorities
- **Task Completion Rate**: Percentage of tasks completed over time
- **Time Allocation**: Breakdown of how time is spent across different categories
- **Project Progress**: Visual status of all active projects

### Additional Features
- **Real-time Sync**: Changes automatically sync across all your devices
- **Offline Support**: Continue working even when offline
- **Dark Mode**: Easy on the eyes, day or night
- **Keyboard Shortcuts**: For power users to increase efficiency
- **Responsive Design**: Works on desktop, tablet, and mobile

## Tech Stack

- **Frontend**: Next.js 14, React, Tailwind CSS, shadcn/ui
- **Backend**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Hosting**: Vercel

## Getting Started

### Prerequisites

- Node.js 18.17.0 or later
- npm or yarn
- Supabase account

### Installation

1. Clone the repository
```bash
git clone https://github.com/yourusername/tempo.git
cd tempo
```

2. Install dependencies
```bash
npm install
# or
yarn install
```

3. Set up environment variables
Create a `.env.local` file in the root directory with the following variables:
```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

4. Run the development server
```bash
npm run dev
# or
yarn dev
```

5. Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

### Environment Setup

For a complete development environment, you'll need:

1. **Supabase Project**: Create a new project in the [Supabase Dashboard](https://app.supabase.io/).
2. **Database Setup**: Run the SQL scripts in the `supabase/migrations` folder to set up the database schema.
3. **Authentication**: Configure authentication providers in the Supabase dashboard.

## Project Structure

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

## Development Workflow

### Code Style

This project uses ESLint and Prettier for code formatting:

```bash
# Lint the codebase
npm run lint

# Format code with Prettier
npm run format
```

### Testing

Tempo uses a comprehensive testing strategy:

#### Unit Tests
```bash
# Run unit tests
npm run test

# Run tests in watch mode
npm run test:watch
```

#### End-to-End Testing with Cypress
The project includes comprehensive E2E tests covering all major features:

```bash
# Open Cypress test runner in interactive mode
npm run cypress:open

# Run all Cypress tests headlessly
npm run cypress:run
```

Our E2E test suite covers:
- Authentication flows (signup, login, logout, password reset)
- Task management (create, edit, delete, complete)
- Project management (create, edit, delete, mark complete)
- Calendar functionality (day/week/month views, event creation)
- Analytics dashboard (charts and metrics)

To run specific test suites:
```bash
# Run only authentication tests
npm run cypress:run -- --spec "cypress/e2e/auth.spec.cy.ts"

# Run only task management tests
npm run cypress:run -- --spec "cypress/e2e/tasks.spec.cy.ts"
```

For CI/CD environments, use:
```bash
# Run E2E tests in CI mode
npm run cypress:ci
```

### Building for Production

```bash
# Create a production build
npm run build

# Start the production server
npm run start
```

## Deployment

Tempo is configured for deployment on Vercel:

1. Connect your GitHub repository to Vercel:
   ```bash
   # Install Vercel CLI if you haven't already
   npm install -g vercel

   # Login to Vercel
   vercel login

   # Deploy the project (from the root directory)
   vercel
   ```

2. Configure environment variables in the Vercel dashboard:
   - `NEXT_PUBLIC_SUPABASE_URL`: Your Supabase project URL
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Your Supabase anonymous key

3. Set up production deployment:
   ```bash
   # Deploy to production
   vercel --prod
   ```

4. Alternatively, set up GitHub integration for automatic deployments:
   - Connect your GitHub repository in the Vercel dashboard
   - Configure build settings to match your project
   - Set up environment variables
   - Enable automatic deployments on push to main branch

## Testing Guide

For internal testers, please refer to the [Testing Guide](./docs/testing-guide.md) to help identify issues and provide feedback.

### Internal Testing Checklist:

1. Authentication flow completeness
2. Real-time data synchronization
3. Task and project CRUD operations
4. Calendar view functionality
5. Responsive design on various devices
6. Dark mode functionality
7. Smart scheduling algorithm accuracy
8. Analytics dashboard data integrity

We appreciate your feedback to help improve Tempo!

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

Please make sure your code follows the project's style guidelines and includes appropriate tests.

## License

Distributed under the MIT License. See `LICENSE` for more information.

## Acknowledgements

- [Next.js](https://nextjs.org/)
- [React](https://reactjs.org/)
- [Supabase](https://supabase.io/)
- [Tailwind CSS](https://tailwindcss.com/)
- [shadcn/ui](https://ui.shadcn.com/)
- [SWR](https://swr.vercel.app/)
- [Vercel](https://vercel.com/)
- [Cypress](https://www.cypress.io/)
