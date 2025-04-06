import * as z from 'zod';

// Helper regex for time validation (HH:MM format)
const timeRegex = /^([0-1][0-9]|2[0-3]):[0-5][0-9]$/;

// Validate and normalize time strings for PostgreSQL compatibility
const timeValidator = z.union([
  z.string().regex(timeRegex, 'Time must be in 24-hour format (HH:MM)'),
  z.null()
]).nullable().transform(val => {
  // If null/undefined/empty string, return null (which PostgreSQL can handle)
  if (!val) return null;
  // Otherwise ensure it's in PostgreSQL-compatible format - add seconds
  return `${val}:00`;  // Convert HH:MM to HH:MM:00 for PostgreSQL TIME type
});

// Date validator to ensure proper ISO format for PostgreSQL
const dateValidator = z.union([
  z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format'),
  z.null()
]).nullable().transform(val => {
  // If null/undefined/empty string, return null
  if (!val) return null;
  // Otherwise ensure it's a valid date string
  return val;
});

// Task form validation schema with improved type handling
export const taskSchema = z.object({
  name: z.string().min(1, 'Task name is required'),
  description: z.string().nullable().optional().transform(val => val || null),
  start_date: dateValidator,
  start_time: timeValidator,
  due_date: z.string({
    required_error: 'Due date is required',
  }).regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format'),
  due_time: timeValidator,
  priority: z.enum(['high', 'medium', 'low']),
  duration: z.number().min(1, 'Duration is required').default(30),
  chunk_size: z.number().nullable().optional().transform(val => val || null),
  hard_deadline: z.boolean().default(false),
  project_id: z.string().nullable().optional().transform(val => val || null),
  tags: z.array(z.string()).default([]),
  status: z.enum(['todo', 'in-progress', 'completed']).default('todo'),
}).transform(data => {
  // Final normalization to ensure all fields meet database expectations
  return {
    ...data,
    description: data.description || null,
    start_date: data.start_date,
    start_time: data.start_time,
    due_time: data.due_time,
    chunk_size: data.chunk_size || null,
    project_id: data.project_id || null,
  };
});

// Infer the TypeScript type from the schema
export type TaskFormValues = z.infer<typeof taskSchema>;
