// supabase/functions/send-task-reminders/index.ts
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const supabaseUrl = Deno.env.get('SUPABASE_URL') || ''
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''

serve(async (req) => {
  // Create a Supabase client with the service role key
  const supabase = createClient(supabaseUrl, supabaseServiceKey)

  // Get tasks due tomorrow
  const tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate() + 1)
  const tomorrowStr = tomorrow.toISOString().split('T')[0]

  const { data: tasks, error } = await supabase
    .from('tasks')
    .select(`
      id,
      name,
      due_date,
      user_id,
      profiles(email, settings)
    `)
    .eq('due_date', tomorrowStr)
    .eq('completed', false)

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { 'Content-Type': 'application/json' },
      status: 500,
    })
  }

  // Process each task and create notifications
  const notifications = []
  for (const task of tasks) {
    // Create a notification in the database
    const { data, error: notifError } = await supabase
      .from('notifications')
      .insert({
        user_id: task.user_id,
        type: 'task_reminder',
        title: 'Task Due Tomorrow',
        message: `Your task "${task.name}" is due tomorrow`,
        related_entity_id: task.id
      })
      .select()
      
    if (notifError) {
      console.error('Error creating notification:', notifError)
    } else {
      notifications.push(data)
    }
  }

  return new Response(JSON.stringify({ 
    success: true, 
    message: `Processed ${tasks.length} reminders, created ${notifications.length} notifications` 
  }), {
    headers: { 'Content-Type': 'application/json' },
  })
})