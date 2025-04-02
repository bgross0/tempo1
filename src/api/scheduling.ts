// src/api/scheduling.ts
import { createClient } from '@supabase/supabase-js';
import { Router } from 'express';

const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

const router = Router();

/**
 * Manually trigger task scheduling for a user
 * POST /api/scheduling/schedule
 */
router.post('/schedule', async (req, res) => {
  try {
    const { user_id } = req.body;
    
    if (!user_id) {
      return res.status(400).json({ error: 'User ID is required' });
    }
    
    // Call the manually_schedule_tasks stored procedure
    const { data, error } = await supabase.rpc('manually_schedule_tasks', {
      user_id_param: user_id
    });
    
    if (error) {
      console.error('Error triggering task scheduling:', error);
      return res.status(500).json({ error: error.message });
    }
    
    return res.status(200).json({ 
      success: true, 
      message: 'Tasks scheduled successfully' 
    });
  } catch (err) {
    console.error('Unexpected error in scheduling endpoint:', err);
    return res.status(500).json({ 
      error: 'An unexpected error occurred while scheduling tasks' 
    });
  }
});

/**
 * Get scheduled blocks for a specific user
 * GET /api/scheduling/blocks?user_id=xxx&start_date=yyyy-mm-dd&end_date=yyyy-mm-dd
 */
router.get('/blocks', async (req, res) => {
  try {
    const { user_id, start_date, end_date } = req.query;
    
    if (!user_id) {
      return res.status(400).json({ error: 'User ID is required' });
    }
    
    // Build our query to get scheduled blocks for user's tasks
    let query = supabase
      .from('scheduled_blocks')
      .select(`
        id,
        task_id,
        date,
        start_minute,
        duration,
        start_time,
        end_time,
        tasks:task_id (
          name,
          description,
          priority,
          project_id,
          user_id
        )
      `)
      .filter('tasks.user_id', 'eq', user_id);
    
    // Add date range filter if provided
    if (start_date) {
      query = query.gte('date', start_date);
    }
    
    if (end_date) {
      query = query.lte('date', end_date);
    }
    
    const { data, error } = await query;
    
    if (error) {
      console.error('Error fetching scheduled blocks:', error);
      return res.status(500).json({ error: error.message });
    }
    
    return res.status(200).json({ data });
  } catch (err) {
    console.error('Unexpected error in fetching scheduled blocks:', err);
    return res.status(500).json({ 
      error: 'An unexpected error occurred while fetching scheduled blocks' 
    });
  }
});

/**
 * Get scheduling statistics for a user
 * GET /api/scheduling/stats?user_id=xxx
 */
router.get('/stats', async (req, res) => {
  try {
    const { user_id } = req.query;
    
    if (!user_id) {
      return res.status(400).json({ error: 'User ID is required' });
    }
    
    // Get task completion statistics
    const { data: tasks, error: tasksError } = await supabase
      .from('tasks')
      .select('id, completed, duration')
      .eq('user_id', user_id);
    
    if (tasksError) {
      console.error('Error fetching tasks for stats:', tasksError);
      return res.status(500).json({ error: tasksError.message });
    }
    
    // Get scheduled blocks statistics
    const { data: scheduledBlocks, error: blocksError } = await supabase
      .from('scheduled_blocks')
      .select(`
        id,
        task_id,
        date,
        duration,
        tasks:task_id (
          user_id
        )
      `)
      .filter('tasks.user_id', 'eq', user_id);
    
    if (blocksError) {
      console.error('Error fetching scheduled blocks for stats:', blocksError);
      return res.status(500).json({ error: blocksError.message });
    }
    
    // Calculate statistics
    const totalTasks = tasks?.length || 0;
    const completedTasks = tasks?.filter(t => t.completed).length || 0;
    const completionRate = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;
    
    const totalScheduledMinutes = scheduledBlocks?.reduce((sum, block) => sum + (block.duration || 0), 0) || 0;
    const totalTaskMinutes = tasks?.reduce((sum, task) => sum + (task.duration || 0), 0) || 0;
    
    // Group blocks by date to see distribution
    const blocksByDate = {};
    scheduledBlocks?.forEach(block => {
      if (!blocksByDate[block.date]) {
        blocksByDate[block.date] = 0;
      }
      blocksByDate[block.date] += block.duration || 0;
    });
    
    return res.status(200).json({
      data: {
        taskStats: {
          total: totalTasks,
          completed: completedTasks,
          completionRate: parseFloat(completionRate.toFixed(2))
        },
        schedulingStats: {
          totalMinutesScheduled: totalScheduledMinutes,
          totalTaskMinutes: totalTaskMinutes,
          scheduledPercentage: totalTaskMinutes > 0 ? 
            parseFloat(((totalScheduledMinutes / totalTaskMinutes) * 100).toFixed(2)) : 0,
          dailyDistribution: blocksByDate
        }
      }
    });
  } catch (err) {
    console.error('Unexpected error in scheduling stats endpoint:', err);
    return res.status(500).json({ 
      error: 'An unexpected error occurred while fetching scheduling statistics' 
    });
  }
});

export default router;