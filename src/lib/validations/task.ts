import * as z from 'zod';

// Task form validation schema
export const taskSchema = z.object({
  name: z.string().min(1, 'Task name is required'),
  description: z.string().nullable().optional(),
  start_date: z.string().nullable().optional(),
  start_time: z.string().nullable().optional(),
  due_date: z.string({
    required_error: 'Due date is required',
  }),
  due_time: z.string().nullable().optional(),
  priority: z.enum(['high', 'medium', 'low']),
  duration: z.number().nullable().optional(),
  chunk_size: z.number().nullable().optional(),
  hard_deadline: z.boolean().default(false),
  project_id: z.string().nullable().optional(),
  tags: z.array(z.string()).default([]),
});

// Infer the TypeScript type from the schema
export type TaskFormValues = z.infer<typeof taskSchema>;
