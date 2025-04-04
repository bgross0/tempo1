import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });
}

export function formatTime(time: string): string {
  // Format time from HH:MM:SS to h:mm a
  const [hours, minutes] = time.split(':');
  const h = parseInt(hours, 10);
  const m = minutes.padStart(2, '0');
  const ampm = h >= 12 ? 'PM' : 'AM';
  const hour = h % 12 || 12;
  return `${hour}:${m} ${ampm}`;
}

export function getPriorityColor(priority: string): string {
  switch (priority.toLowerCase()) {
    case 'high':
      return 'text-red-500';
    case 'medium':
      return 'text-yellow-500';
    case 'low':
      return 'text-green-500';
    default:
      return 'text-gray-500';
  }
}

export function calculateCompletionPercentage(completed: number, total: number): number {
  if (total === 0) return 0;
  return Math.round((completed / total) * 100);
}

/**
 * Utility function to normalize task objects from different sources
 * Handles both camelCase and snake_case property names
 */
export function normalizeTask(task: any) {
  // Create a new object with standardized properties
  return {
    id: task.id,
    name: task.name,
    description: task.description || null,
    startDate: task.startDate || task.start_date || null,
    startTime: task.startTime || task.start_time || null,
    dueDate: task.dueDate || task.due_date || null,
    dueTime: task.dueTime || task.due_time || null,
    priority: task.priority,
    projectId: task.projectId || task.project_id || null,
    duration: task.duration || null,
    chunkSize: task.chunkSize || task.chunk_size || null,
    hardDeadline: task.hardDeadline || task.hard_deadline || false,
    completed: task.completed || false,
    status: task.status || 'todo',
    tags: task.tags || [],
    createdAt: task.createdAt || task.created_at,
    scheduledBlocks: task.scheduledBlocks || task.scheduled_blocks || []
  };
}

/**
 * Utility function to normalize event objects from different sources
 * Handles both camelCase and snake_case property names
 */
export function normalizeEvent(event: any) {
  return {
    id: event.id,
    name: event.name,
    description: event.description || null,
    startDate: event.startDate || event.start_date || null,
    startTime: event.startTime || event.start_time || null,
    endDate: event.endDate || event.end_date || null,
    endTime: event.endTime || event.end_time || null,
    location: event.location || null,
    recurring: event.recurring || 'none',
    tags: event.tags || [],
    createdAt: event.createdAt || event.created_at
  };
}
