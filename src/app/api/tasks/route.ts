import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';

/**
 * Get all tasks or create a new task
 * GET/POST /api/tasks
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

    // Get query parameters for filtering
    const { searchParams } = new URL(req.url);
    const completed = searchParams.get('completed');
    const priority = searchParams.get('priority');
    const project_id = searchParams.get('project_id');
    
    // Build Supabase query
    let query = supabase.from('tasks')
      .select('*')
      .eq('user_id', session.user.id);
    
    // Apply filters if present
    if (completed !== null) {
      query = query.eq('completed', completed === 'true');
    }
    
    if (priority) {
      query = query.eq('priority', priority);
    }
    
    if (project_id) {
      query = query.eq('project_id', project_id);
    }
    
    // Execute query
    const { data, error } = await query.order('due_date', { ascending: true });
    
    if (error) {
      console.error('Error fetching tasks:', error);
      return NextResponse.json(
        { error: 'Database error' },
        { status: 500 }
      );
    }
    
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error in tasks API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * Create a new task
 * POST /api/tasks
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
    const taskData = await req.json();
    
    // Ensure user_id is set to the authenticated user
    taskData.user_id = session.user.id;
    
    // Insert task into database
    const { data, error } = await supabase
      .from('tasks')
      .insert(taskData)
      .select();
    
    if (error) {
      console.error('Error creating task:', error);
      return NextResponse.json(
        { error: 'Database error' },
        { status: 500 }
      );
    }
    
    return NextResponse.json(data[0], { status: 201 });
  } catch (error) {
    console.error('Error in tasks API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}