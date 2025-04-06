-- Create a stored procedure for minimal task creation to avoid type issues
CREATE OR REPLACE FUNCTION public.create_minimal_task(
  p_user_id UUID,
  p_name TEXT,
  p_description TEXT,
  p_due_date DATE,
  p_priority TEXT,
  p_duration INTEGER,
  p_hard_deadline BOOLEAN,
  p_status TEXT
) RETURNS SETOF tasks AS $$
DECLARE
  new_task_id UUID;
  task_record tasks%ROWTYPE;
BEGIN
  -- Insert the new task
  INSERT INTO public.tasks (
    id,
    user_id, 
    name, 
    description, 
    due_date, 
    priority, 
    duration, 
    hard_deadline,
    status,
    completed,
    tags,
    created_at,
    updated_at
  ) VALUES (
    uuid_generate_v4(),
    p_user_id,
    p_name,
    p_description,
    p_due_date,
    p_priority,
    p_duration,
    p_hard_deadline,
    p_status,
    FALSE,
    '{}',
    NOW(),
    NOW()
  ) RETURNING id INTO new_task_id;
  
  -- Return the created task
  FOR task_record IN 
    SELECT * FROM public.tasks WHERE id = new_task_id
  LOOP
    RETURN NEXT task_record;
  END LOOP;
  
  RETURN;
END;
$$ LANGUAGE plpgsql;

-- Grant access to the function
GRANT EXECUTE ON FUNCTION public.create_minimal_task TO authenticated;
GRANT EXECUTE ON FUNCTION public.create_minimal_task TO service_role;