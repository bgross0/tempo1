-- Add status column to tasks table
ALTER TABLE public.tasks ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'todo' CHECK (status IN ('todo', 'in-progress', 'completed'));

-- Backfill existing data to set status based on completion state
UPDATE public.tasks SET status = 'completed' WHERE completed = TRUE;