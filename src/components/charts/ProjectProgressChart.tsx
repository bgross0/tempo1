'use client';

import { useMemo } from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  LabelList,
  Cell
} from 'recharts';
import { Project, Task } from '@/types/database';

interface ProjectProgressChartProps {
  projects: Project[];
  tasks: Task[];
}

export const ProjectProgressChart = ({ projects, tasks }: ProjectProgressChartProps) => {
  const chartData = useMemo(() => {
    // Display only active projects (up to 6)
    const activeProjects = projects
      .filter(project => !project.completed)
      .slice(0, 6);
    
    return activeProjects.map(project => {
      // Get all tasks for this project
      const projectTasks = tasks.filter(task => task.project_id === project.id);
      const totalTasks = projectTasks.length;
      const completedTasks = projectTasks.filter(task => task.completed).length;
      
      // Calculate completion percentage
      const completionPercentage = totalTasks > 0 
        ? Math.round((completedTasks / totalTasks) * 100) 
        : 0;
      
      // Determine status color
      let statusColor;
      if (completionPercentage === 100) {
        statusColor = '#10B981'; // Green
      } else if (completionPercentage >= 50) {
        statusColor = '#3B82F6'; // Blue
      } else if (completionPercentage >= 25) {
        statusColor = '#F59E0B'; // Yellow
      } else {
        statusColor = '#EF4444'; // Red
      }
      
      return {
        name: project.name,
        completion: completionPercentage,
        tasks: `${completedTasks}/${totalTasks}`,
        color: statusColor
      };
    });
  }, [projects, tasks]);

  // Custom tooltip
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="p-3 bg-white rounded-md shadow-md border border-gray-200">
          <p className="text-sm font-medium">{label}</p>
          <p className="text-xs text-gray-600 mt-1">
            <span className="font-semibold">{payload[0].value}%</span> complete
          </p>
          <p className="text-xs text-gray-600">
            Tasks: {payload[0].payload.tasks}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <ResponsiveContainer width="100%" height="100%">
      {chartData.length > 0 ? (
        <BarChart
          data={chartData}
          layout="vertical"
          margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} opacity={0.1} />
          <XAxis 
            type="number" 
            domain={[0, 100]}
            tick={{ fontSize: 12, fill: '#6B7280' }}
            tickLine={false}
            axisLine={{ stroke: '#E5E7EB' }}
          />
          <YAxis 
            dataKey="name" 
            type="category"
            width={120}
            tick={{ fontSize: 12, fill: '#6B7280' }}
            tickLine={false}
            axisLine={{ stroke: '#E5E7EB' }}
          />
          <Tooltip content={<CustomTooltip />} />
          <Bar dataKey="completion" barSize={20} radius={[0, 4, 4, 0]}>
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
            <LabelList 
              dataKey="completion" 
              position="right" 
              formatter={(value: number) => `${value}%`}
              style={{ fill: '#6B7280', fontSize: 12 }}
            />
          </Bar>
        </BarChart>
      ) : (
        <div className="flex items-center justify-center h-full">
          <p className="text-gray-500">No active projects</p>
        </div>
      )}
    </ResponsiveContainer>
  );
};

export default ProjectProgressChart;
