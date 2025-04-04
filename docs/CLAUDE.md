# CLAUDE.md - Coding Guidelines and Testing Guide

## Build/Lint/Test Commands
- Dev server: `npm run dev`
- Build: `npm run build`
- Lint: `npm run lint`
- Format: `npm run format`
- Unit tests: `npm test` or `npm run test:watch`
- Unit tests only: `npm run test:unit`
- Integration tests only: `npm run test:integration`
- Test coverage: `npm run test:coverage`
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

## Testing Guidelines

### Testing Structure
- Place tests in `__tests__` directories adjacent to the components they test
- Suffix test files with `.test.tsx` for unit tests and `.integration.test.tsx` for integration tests

### Unit Test Coverage
We have unit tests for the following component types:

1. UI Components:
   - Button
   - Checkbox
   - Input
   - Badge
   - Progress
   - Dialog
   - DropdownMenu

2. Feature Components:
   - ThemeToggle
   - TaskCard
   - TaskForm
   - MiniCalendar

3. Data Visualization:
   - ProductivityScore
   - PriorityDistributionChart

### Component Testing Patterns
1. Simple UI Components:
   - Test rendering and basic interactions
   - Verify proper classes and attributes are applied
   - Test different variations (size, color, etc.)

2. Interactive Components:
   - Test user interactions like clicks and form inputs
   - Verify state changes and proper function calls
   - Test error states and edge cases

3. Data-Driven Components:
   - Mock data fetching hooks and store functions
   - Test loading, success, and error states
   - Verify correct data display

### Jest Mocking
- Mock external dependencies with `jest.mock()`
- For complex hooks, use explicit mock implementations
- Prefer component isolation by mocking child components when needed

### Best Practices
- Focus on testing behavior, not implementation details
- Favor user-centric tests (what a user would see/do)
- Keep tests simple and focused on a single behavior
- Use test data that resembles real application data