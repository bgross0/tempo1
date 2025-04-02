// src/pages/api/tasks/[id].ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '@/lib/supabase';
import { updateTask, deleteTask } from '@/lib/tasks';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Get user session
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  
  const userId = session.user.id;
  const taskId = req.query.id as string;
  
  try {
    if (req.method === 'PUT') {
      const taskData = {
        ...req.body,
        id: taskId,
        userId
      };
      
      const updatedTask = await updateTask(taskData);
      return res.status(200).json(updatedTask);
    } else if (req.method === 'DELETE') {
      await deleteTask(userId, taskId);
      return res.status(200).json({ success: true });
    } else {
      res.setHeader('Allow', ['PUT', 'DELETE']);
      return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
    }
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
}