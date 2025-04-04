import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';

/**
 * Schedule task into time blocks
 * POST /api/scheduling
 */
export async function POST(req: NextRequest) {
  try {
    // Create a Supabase client
    const cookieStore = req.cookies;
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value;
          },
          set(name: string, value: string, options: any) {
            // This is used for setting cookies during SSR, not needed for API routes
          },
          remove(name: string, options: any) {
            // This is used for setting cookies during SSR, not needed for API routes
          },
        },
      }
    );
    
    // Check authentication
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Parse request body
    const body = await req.json();
    
    // Use the scheduling algorithm from lib/scheduling/scheduler.ts
    const { taskId, startDate, endDate, workingHoursStart, workingHoursEnd, existingEvents } = body;
    
    // Validate required parameters
    if (!taskId || !startDate || !endDate) {
      return NextResponse.json(
        { error: 'Missing required parameters: taskId, startDate, endDate' },
        { status: 400 }
      );
    }
    
    // Fetch the task
    const { data: task, error: taskError } = await supabase
      .from('tasks')
      .select('*')
      .eq('id', taskId)
      .eq('user_id', session.user.id)
      .single();
    
    if (taskError || !task) {
      return NextResponse.json(
        { error: 'Task not found or access denied' },
        { status: 404 }
      );
    }
    
    // Fetch all tasks for scheduling context
    const { data: tasks, error: tasksError } = await supabase
      .from('tasks')
      .select('*')
      .eq('user_id', session.user.id)
      .order('priority', { ascending: false })
      .order('due_date', { ascending: true });
    
    if (tasksError) {
      return NextResponse.json(
        { error: 'Failed to fetch tasks for scheduling' },
        { status: 500 }
      );
    }
    
    // Import the scheduling algorithm
    const { scheduleTasksForPeriod } = await import('@/lib/scheduling/scheduler');
    
    // Run the scheduling algorithm
    const schedule = scheduleTasksForPeriod({
      tasks: tasks || [],
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      workingHoursStart: workingHoursStart || 9,
      workingHoursEnd: workingHoursEnd || 17,
      existingEvents: existingEvents || []
    });
    
    // Extract the scheduled blocks for the specific task
    const taskBlocks = Object.keys(schedule)
      .flatMap(date => 
        schedule[date].filter(block => block.taskId === taskId)
      );
    
    // Update the task with the scheduled blocks
    const { error: updateError } = await supabase
      .from('tasks')
      .update({ scheduled_blocks: taskBlocks })
      .eq('id', taskId)
      .eq('user_id', session.user.id);
    
    if (updateError) {
      return NextResponse.json(
        { error: 'Failed to update task with scheduled blocks' },
        { status: 500 }
      );
    }
    
    return NextResponse.json({
      message: 'Task scheduled successfully',
      scheduleInfo: {
        taskId,
        scheduledAt: new Date().toISOString(),
        status: 'scheduled',
        blocks: taskBlocks
      }
    });
  } catch (error) {
    console.error('Error in scheduling API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * Get scheduled blocks
 * GET /api/scheduling/blocks
 */
export async function GET(req: NextRequest) {
  try {
    // Create a Supabase client
    const cookieStore = req.cookies;
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value;
          },
          set(name: string, value: string, options: any) {
            // This is used for setting cookies during SSR, not needed for API routes
          },
          remove(name: string, options: any) {
            // This is used for setting cookies during SSR, not needed for API routes
          },
        },
      }
    );
    
    // Check authentication
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get query parameters
    const { searchParams } = new URL(req.url);
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    
    // Validate parameters
    if (!startDate || !endDate) {
      return NextResponse.json(
        { error: 'Missing required parameters: startDate, endDate' },
        { status: 400 }
      );
    }
    
    // Fetch all tasks with scheduled blocks within the date range
    const { data: tasks, error: tasksError } = await supabase
      .from('tasks')
      .select('*')
      .eq('user_id', session.user.id)
      .not('scheduled_blocks', 'is', null);
    
    if (tasksError) {
      return NextResponse.json(
        { error: 'Failed to fetch tasks with scheduled blocks' },
        { status: 500 }
      );
    }
    
    // Filter blocks within the requested date range
    const startDateObj = new Date(startDate);
    const endDateObj = new Date(endDate);
    
    // Extract and format all blocks
    const allBlocks = tasks
      .flatMap(task => {
        const blocks = task.scheduled_blocks || [];
        // Add task information to each block
        return blocks.map((block: any) => ({
          ...block,
          taskName: task.name,
          taskId: task.id,
          priority: task.priority
        }));
      })
      // Filter blocks within date range
      .filter((block: any) => {
        const blockDate = new Date(block.date);
        return blockDate >= startDateObj && blockDate <= endDateObj;
      })
      // Sort by date and time
      .sort((a: any, b: any) => {
        // First sort by date
        const dateComparison = new Date(a.date).getTime() - new Date(b.date).getTime();
        if (dateComparison !== 0) return dateComparison;
        
        // Then by start time
        return a.startTime.localeCompare(b.startTime);
      });
    
    return NextResponse.json({
      message: 'Scheduled blocks retrieved',
      blocks: allBlocks,
      period: {
        startDate,
        endDate,
      }
    });
  } catch (error) {
    console.error('Error in scheduling API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}