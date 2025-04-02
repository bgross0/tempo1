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

- [ ] Create a new task with all fields
- [ ] Edit an existing task
- [ ] Complete/uncomplete tasks
- [ ] Delete tasks
- [ ] Filter tasks by various criteria
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

## Known Limitations

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

Thank you for helping us improve TaskJet!
