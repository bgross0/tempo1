# CLAUDE.md - Coding Guidelines

## Build/Lint/Test Commands
- Dev server: `npm run dev`
- Build: `npm run build`
- Lint: `npm run lint`
- Format: `npm run format`
- Unit tests: `npm test` or `npm run test:watch`
- Single test: `npx jest path/to/test-file.test.ts`
- E2E tests: `npx cypress run` or single test: `npx cypress run --spec "cypress/e2e/fileName.spec.cy.ts"`
- Interactive E2E: `npx cypress open`

## Project Structure
- **Next.js App Router**: Routes in src/app, feature-based organization
- **Components**: UI components (shadcn/ui), feature-specific (tasks, projects, calendar)
- **Backend**: Supabase for database, auth, and realtime updates

## Code Style Guidelines
- **Formatting**: 2-space indentation, single quotes, semicolons, trailing commas
- **Imports**: Group by: React hooks/components → external libraries → internal components → types/utilities
- **Components**: Client components use 'use client' directive with explicit TypeScript interfaces
- **Types**: PascalCase for interfaces (with Props suffix for components)
- **Naming**: PascalCase for components, camelCase for hooks/functions/variables, kebab-case for files
- **Error Handling**: Try/catch for async operations with consistent error logging
- **API Pattern**: SWR for data fetching, Supabase for backend operations
- **State Management**: React hooks for local state, Zustand for global state