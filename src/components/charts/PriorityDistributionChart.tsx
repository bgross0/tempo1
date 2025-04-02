'use client';

import { useMemo } from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Task } from '@/types/database';

interface PriorityDistributionChartProps {
  tasks: Task[];
}

export const PriorityDistributionChart = ({ tasks }: PriorityDistributionChartProps) => {
  const chartData = useMemo(() => {
    const highPriorityTasks = tasks.filter(task => task.priority === 'high').length;
    const mediumPriorityTasks = tasks.filter(task => task.priority === 'medium').length;
    const lowPriorityTasks = tasks.filter(task => task.priority === 'low').length;
    
    return [
      { name: 'High', value: highPriorityTasks, color: '#EF4444' },
      { name: 'Medium', value: mediumPriorityTasks, color: '#F59E0B' },
      { name: 'Low', value: lowPriorityTasks, color: '#10B981' },
    ].filter(item => item.value > 0); // Only include priorities with tasks
  }, [tasks]);

  const COLORS = ['#EF4444', '#F59E0B', '#10B981'];
  
  // Custom tooltip
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="p-2 bg-white rounded-md shadow-md border border-gray-200">
          <p className="font-medium">{`${payload[0].name}: ${payload[0].value} tasks`}</p>
          <p className="text-xs text-gray-500">
            {`${Math.round((payload[0].value / tasks.length) * 100)}% of total`}
          </p>
        </div>
      );
    }
    return null;
  };
  
  // Custom legend
  const CustomLegend = ({ payload }: any) => {
    return (
      <ul className="flex flex-col gap-2 text-xs">
        {payload.map((entry: any, index: number) => (
          <li key={`item-${index}`} className="flex items-center">
            <div
              className="w-3 h-3 mr-2 rounded-full"
              style={{ backgroundColor: entry.color }}
            />
            <span className="text-gray-700">{entry.value} ({chartData[index].value} tasks)</span>
          </li>
        ))}
      </ul>
    );
  };

  return (
    <ResponsiveContainer width="100%" height="100%">
      {chartData.length > 0 ? (
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={80}
            paddingAngle={5}
            dataKey="value"
            labelLine={false}
            label={({ name, value, percent }) => `${Math.round(percent * 100)}%`}
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          <Legend content={<CustomLegend />} verticalAlign="middle" align="right" layout="vertical" />
        </PieChart>
      ) : (
        <div className="flex items-center justify-center h-full">
          <p className="text-gray-500">No tasks available</p>
        </div>
      )}
    </ResponsiveContainer>
  );
};

export default PriorityDistributionChart;
