import * as z from 'zod';

// Event form validation schema
export const eventSchema = z.object({
  name: z.string().min(1, 'Event name is required'),
  description: z.string().nullable().optional(),
  start_date: z.string({
    required_error: 'Start date is required',
  }),
  start_time: z.string({
    required_error: 'Start time is required',
  }),
  end_date: z.string({
    required_error: 'End date is required',
  }),
  end_time: z.string({
    required_error: 'End time is required',
  }),
  location: z.string().nullable().optional(),
  recurring: z.enum(['none', 'daily', 'weekly', 'monthly']).default('none'),
  tags: z.array(z.string()).default([]),
}).refine(data => {
  // If same day, check that end time is after start time
  if (data.start_date === data.end_date) {
    return data.end_time > data.start_time;
  }
  // If different days, any time is fine
  return true;
}, {
  message: 'End time must be after start time on the same day',
  path: ['end_time'],
}).refine(data => {
  // Check that end date is not before start date
  return new Date(data.end_date) >= new Date(data.start_date);
}, {
  message: 'End date must be on or after start date',
  path: ['end_date'],
});

// Infer the TypeScript type from the schema
export type EventFormValues = z.infer<typeof eventSchema>;
