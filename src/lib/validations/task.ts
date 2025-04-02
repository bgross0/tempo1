import { z } from "zod";

export const taskSchema = z.object({
  name: z.string().min(1, "Task name is required"),
  description: z.string().optional(),
  start_date: z.string().optional().nullable(),
  start_time: z.string().optional().nullable(),
  due_date: z.string().min(1, "Due date is required"),
  due_time: z.string().optional().nullable(),
  priority: z.enum(["high", "medium", "low"]),
  duration: z.number().min(0).optional().nullable(),
  chunk_size: z.number().min(0).optional().nullable(),
  hard_deadline: z.boolean().default(false),
  project_id: z.string().optional().nullable(),
  tags: z.array(z.string()).default([]),
});

export type TaskFormValues = z.infer<typeof taskSchema>;
