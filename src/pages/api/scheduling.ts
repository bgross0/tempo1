// src/pages/api/scheduling.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '@/lib/supabase';
import { getTasks, updateTask } from '@/lib/tasks';
import { scheduleAllTasks } from '@/lib/scheduling';
import { Task } from '@/types';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Get user session
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  
  const userId = session.user.id;
  
  try {
    if (req.method === 'POST') {
      // Get user settings
      const { data: userData } = await supabase
        .from('users')
        .select('settings')
        .eq('id', userId)
        .single();
        
      if (!userData) {
        return res.status(404).json({ error: 'User settings not found' });
      }
      
      // Get all tasks
      const tasks = await getTasks(userId);
      
      // Schedule tasks
      const scheduledTasks = scheduleAllTasks(tasks, userData.settings);
      
      // Update tasks with new scheduled blocks
      for (const task of scheduledTasks) {
        if (task.scheduledBlocks && task.scheduledBlocks.length > 0) {
          await updateTask(task);
        }
      }
      
      return res.status(200).json({ success: true, tasksScheduled: scheduledTasks.length });
    } else {
      res.setHeader('Allow', ['POST']);
      return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
    }
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
}