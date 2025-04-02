// src/pages/api/tasks/index.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '@/lib/supabase';
import { getTasks, createTask } from '@/lib/tasks';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Get user session
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  
  const userId = session.user.id;
  
  try {
    if (req.method === 'GET') {
      const tasks = await getTasks(userId);
      return res.status(200).json(tasks);
    } else if (req.method === 'POST') {
      const taskData = {
        ...req.body,
        userId
      };
      
      const newTask = await createTask(taskData);
      return res.status(201).json(newTask);
    } else {
      res.setHeader('Allow', ['GET', 'POST']);
      return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
    }
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
}