import * as z from 'zod';

// Project form validation schema
export const projectSchema = z.object({
  name: z.string().min(1, 'Project name is required'),
  description: z.string().nullable().optional(),
  start_date: z.string({
    required_error: 'Start date is required',
  }),
  due_date: z.string({
    required_error: 'Due date is required',
  }),
  priority: z.enum(['high', 'medium', 'low']),
  tags: z.array(z.string()).default([]),
}).refine(data => {
  // Check that due date is not before start date
  return new Date(data.due_date) >= new Date(data.start_date);
}, {
  message: 'Due date must be after start date',
  path: ['due_date'],
});

// Infer the TypeScript type from the schema
export type ProjectFormValues = z.infer<typeof projectSchema>;
