# TaskJet - Internal Testing Guide

## Overview

TaskJet is a modern task management application designed to help users organize their tasks, projects, and schedule efficiently. This guide provides instructions for internal testers to help identify bugs, usability issues, and suggest improvements.

## Getting Started

### Access

Visit the testing deployment at: [TaskJet Testing Environment](https://taskjet-staging.vercel.app)

### Account Setup

1. Click "Sign Up" to create a new account
2. Use your email or sign in with Google/GitHub
3. Complete your profile information

## Core Features to Test

### Authentication

- [ ] Sign up with email
- [ ] Log in with email
- [ ] Password reset
- [ ] Social authentication (Google, GitHub)
- [ ] Logout

### Task Management

- [ ] Create a new task with all fields using the task dialog
- [ ] Edit an existing task through the edit button
- [ ] Test form validation by submitting invalid task data
- [ ] Complete/uncomplete tasks using the checkbox
- [ ] Delete tasks and verify they're removed immediately
- [ ] Filter tasks by completion status (active/completed/overdue)
- [ ] Filter tasks by priority (high/medium/low)
- [ ] Toggle between grid and list views
- [ ] Test task dialog opens and closes correctly
- [ ] Verify that duration and chunk size fields accept only numbers
- [ ] Test the hard deadline checkbox functionality
- [ ] Verify session validation works when creating/editing tasks
- [ ] Verify toast notifications appear for task operations
- [ ] Test task form cancel button functionality
- [ ] Verify real-time updates (open the app in two browsers to test)

### Project Management

- [ ] Create a new project
- [ ] Add tasks to a project
- [ ] Edit project details
- [ ] Mark project as complete
- [ ] Delete a project
- [ ] Verify real-time updates of project status

### Calendar View

- [ ] View tasks on calendar
- [ ] Navigate between months
- [ ] Verify that task updates reflect in calendar

### Error Handling (New)

- [ ] Verify error boundaries contain errors and provide recovery options
- [ ] Test error recovery by intentionally causing component failures
- [ ] Verify that errors in one component don't crash the entire application
- [ ] Check that error messages are user-friendly and provide clear next steps

## Developer Testing

### Running Tests

TaskJet includes three types of tests:

1. **Unit Tests**: Test individual functions and components
   ```bash
   npm run test:unit
   ```

2. **Integration Tests**: Test interactions between components
   ```bash
   npm run test:integration
   ```

3. **End-to-End Tests**: Test complete user flows through the application
   ```bash
   npm run test:e2e
   ```

### Test Coverage

- Unit tests: Core business logic and components
- Integration tests: Component interactions, data flow, state management
- E2E tests: Complete user journeys through the application

## Known Limitations

- Project selection in task form is not yet implemented
- Tag management in task form is not yet implemented
- Task sorting functionality is incomplete
- Smart scheduling algorithm is not yet implemented
- Mobile responsiveness may have issues on some devices
- Social authentication might not work on all environments
- No offline functionality yet

## Reporting Issues

Please use the following format when reporting issues:

```
Feature: [Task Management, Authentication, etc.]
Issue Type: [Bug, UX Issue, Feature Request]
Description: [Detailed description of the issue]
Steps to Reproduce: 
1. 
2.
3.
Expected Result:
Actual Result:
Screenshots: [If applicable]
Device/Browser: [Your device and browser information]
```

Send all feedback to: testing@taskjet.com or use the GitHub issue template.

## Feedback Priorities

We're particularly interested in feedback on:

1. Authentication flow (ease of use, any issues)
2. Real-time functionality (do updates appear promptly?)
3. Overall app responsiveness and performance
4. Task and project management workflows (intuitive? missing features?)
5. User interface and experience
6. Error handling (do error messages make sense? is recovery intuitive?)

Thank you for helping us improve TaskJet!

## Recent Improvements

### Task Management Implementation (April 2, 2025)
We've fully implemented the task management functionality:
- Complete task creation/editing dialog with form validation
- Task filtering by status and priority
- Grid and list views for tasks
- Task completion toggling
- Session validation and refresh for authenticated operations
- Real-time updates for task changes
- Consistent UI using shadcn/ui components
- Toast notifications for all task operations

### Error Boundaries Implementation
We've added React Error Boundaries throughout the application to improve resilience. Now if a component crashes, the error is contained, and users can:
- See a helpful error message
- Try to recover with a "Retry" button
- Continue using the rest of the application

### Integration Tests
We've implemented comprehensive integration tests to verify that components work correctly together. These tests cover:
- Authentication flows
- Task list interactions
- Calendar functionality
- Error boundary recovery
