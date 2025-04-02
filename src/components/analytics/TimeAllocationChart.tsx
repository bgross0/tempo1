'use client';

import { useMemo } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { Task, Project } from '@/types/database';

interface TimeAllocationChartProps {
  tasks: Task[];
  projects: Project[];
  period?: 'week' | 'month';
}

interface ChartData {
  name: string;
  value: number;
  color: string;
}

// Color palette for projects
const COLORS = [
  '#3B82F6', // blue
  '#10B981', // green
  '#F59E0B', // amber
  '#8B5CF6', // purple
  '#EC4899', // pink
  '#06B6D4', // cyan
  '#F97316', // orange
  '#6366F1', // indigo
];

export function TimeAllocationChart({ 
  tasks, 
  projects,
  period = 'week' 
}: TimeAllocationChartProps) {
  // Process data for chart
  const data = useMemo(() => {
    // Get completed tasks for the period
    const completedTasks = tasks.filter(task => task.completed);
    
    // Group tasks by project
    const tasksByProject: Record<string, number> = {};
    
    // First, initialize with 0 for all projects
    projects.forEach(project => {
      tasksByProject[project.id] = 0;
    });
    
    // Add "No Project" category
    tasksByProject['none'] = 0;
    
    // Sum up task durations by project
    completedTasks.forEach(task => {
      const projectId = task.project_id || 'none';
      
      // Add task duration to project total
      // Default to 30 min if no duration specified
      const duration = task.duration || 30;
      tasksByProject[projectId] = (tasksByProject[projectId] || 0) + duration;
    });
    
    // Convert to chart data format
    const chartData: ChartData[] = [];
    
    // Add projects with tasks
    projects.forEach((project, index) => {
      const duration = tasksByProject[project.id];
      if (duration > 0) {
        chartData.push({
          name: project.name,
          value: duration,
          color: COLORS[index % COLORS.length]
        });
      }
    });
    
    // Add "No Project" if it has tasks
    if (tasksByProject['none'] > 0) {
      chartData.push({
        name: 'No Project',
        value: tasksByProject['none'],
        color: '#94A3B8' // slate-400
      });
    }
    
    return chartData;
  }, [tasks, projects]);
  
  // Custom tooltip
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const { name, value } = payload[0].payload;
      const hours = Math.floor(value / 60);
      const minutes = value % 60;
      
      return (
        <div className="bg-white dark:bg-gray-800 p-2 border dark:border-gray-700 shadow-md rounded">
          <p className="text-sm font-medium">{name}</p>
          <p className="text-sm">
            {hours > 0 ? `${hours}h ` : ''}{minutes > 0 ? `${minutes}m` : ''}
          </p>
        </div>
      );
    }
    
    return null;
  };
  
  // Custom legend
  const CustomLegend = (props: any) => {
    const { payload } = props;
    
    return (
      <ul className="flex flex-wrap justify-center gap-x-4 gap-y-2 mt-2">
        {payload.map((entry: any, index: number) => (
          <li key={`legend-${index}`} className="flex items-center">
            <div
              className="w-3 h-3 rounded-full mr-1"
              style={{ backgroundColor: entry.color }}
            />
            <span className="text-xs">{entry.value}</span>
          </li>
        ))}
      </ul>
    );
  };
  
  // Calculate total time
  const totalMinutes = data.reduce((sum, item) => sum + item.value, 0);
  const totalHours = Math.floor(totalMinutes / 60);
  const remainingMinutes = totalMinutes % 60;
  
  return (
    <div className="w-full h-72 p-4 rounded-lg border dark:border-gray-700 bg-white dark:bg-gray-800">
      <div className="flex justify-between items-start mb-1">
        <h3 className="text-base font-medium">Time Allocation</h3>
        <div className="text-sm text-gray-500 dark:text-gray-400">
          Total: {totalHours}h {remainingMinutes}m
        </div>
      </div>
      
      {data.length === 0 ? (
        <div className="flex items-center justify-center h-[calc(100%-2rem)]">
          <p className="text-gray-500 dark:text-gray-400 text-sm">
            No completed tasks in this period
          </p>
        </div>
      ) : (
        <ResponsiveContainer width="100%" height="90%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={80}
              paddingAngle={1}
              dataKey="value"
              label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
              labelLine={false}
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            <Legend content={<CustomLegend />} />
          </PieChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
