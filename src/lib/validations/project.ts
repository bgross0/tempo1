import { z } from "zod";

export const projectSchema = z.object({
  name: z.string().min(1, "Project name is required"),
  description: z.string().optional(),
  start_date: z.string().min(1, "Start date is required"),
  due_date: z.string().min(1, "Due date is required"),
  priority: z.enum(["high", "medium", "low"]),
  tags: z.array(z.string()).default([]),
});

export type ProjectFormValues = z.infer<typeof projectSchema>;
