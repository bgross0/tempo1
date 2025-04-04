import React from 'react';
import { render, screen } from '@testing-library/react';
import { PriorityDistributionChart } from '../PriorityDistributionChart';
import { Task } from '@/types/database';

// Mock recharts to handle SVG rendering in tests
jest.mock('recharts', () => {
  const OriginalModule = jest.requireActual('recharts');
  
  return {
    ...OriginalModule,
    ResponsiveContainer: ({ children }: { children: React.ReactNode }) => (
      <div data-testid="responsive-container">{children}</div>
    ),
    PieChart: ({ children }: { children: React.ReactNode }) => (
      <div data-testid="pie-chart">{children}</div>
    ),
    Pie: ({ data, children }: { data: any[], children: React.ReactNode }) => (
      <div data-testid="pie">
        {data.map((item, index) => (
          <div key={index} data-testid={`pie-item-${item.name}`}>
            {item.name}: {item.value}
          </div>
        ))}
        {children}
      </div>
    ),
    Cell: () => <div data-testid="cell" />,
    Tooltip: () => <div data-testid="tooltip" />,
    Legend: () => <div data-testid="legend" />,
  };
});

describe('PriorityDistributionChart', () => {
  // Sample tasks with different priorities
  const sampleTasks: Task[] = [
    {
      id: 'task-1',
      user_id: 'user-1',
      name: 'High Priority Task 1',
      description: 'Description',
      priority: 'high',
      due_date: '2025-05-01',
      completed: false,
      created_at: '2025-04-01',
      updated_at: '2025-04-01',
      project_id: null,
      start_date: null,
      start_time: null,
      due_time: null,
      duration: 60,
      chunk_size: null,
      hard_deadline: false,
      completed_at: null,
      tags: [],
      scheduled_blocks: null
    },
    {
      id: 'task-2',
      user_id: 'user-1',
      name: 'High Priority Task 2',
      description: 'Description',
      priority: 'high',
      due_date: '2025-05-02',
      completed: false,
      created_at: '2025-04-01',
      updated_at: '2025-04-01',
      project_id: null,
      start_date: null,
      start_time: null,
      due_time: null,
      duration: 30,
      chunk_size: null,
      hard_deadline: false,
      completed_at: null,
      tags: [],
      scheduled_blocks: null
    },
    {
      id: 'task-3',
      user_id: 'user-1',
      name: 'Medium Priority Task',
      description: 'Description',
      priority: 'medium',
      due_date: '2025-05-03',
      completed: false,
      created_at: '2025-04-01',
      updated_at: '2025-04-01',
      project_id: null,
      start_date: null,
      start_time: null,
      due_time: null,
      duration: 45,
      chunk_size: null,
      hard_deadline: false,
      completed_at: null,
      tags: [],
      scheduled_blocks: null
    },
    {
      id: 'task-4',
      user_id: 'user-1',
      name: 'Low Priority Task',
      description: 'Description',
      priority: 'low',
      due_date: '2025-05-04',
      completed: false,
      created_at: '2025-04-01',
      updated_at: '2025-04-01',
      project_id: null,
      start_date: null,
      start_time: null,
      due_time: null,
      duration: 15,
      chunk_size: null,
      hard_deadline: false,
      completed_at: null,
      tags: [],
      scheduled_blocks: null
    }
  ];

  it('renders the chart with correct data', () => {
    render(<PriorityDistributionChart tasks={sampleTasks} />);
    
    // Check that the chart container is rendered
    expect(screen.getByTestId('responsive-container')).toBeInTheDocument();
    expect(screen.getByTestId('pie-chart')).toBeInTheDocument();
    expect(screen.getByTestId('pie')).toBeInTheDocument();
    
    // Check that all priority categories are displayed
    expect(screen.getByTestId('pie-item-High')).toBeInTheDocument();
    expect(screen.getByTestId('pie-item-Medium')).toBeInTheDocument();
    expect(screen.getByTestId('pie-item-Low')).toBeInTheDocument();
    
    // Check the counts for each priority
    expect(screen.getByTestId('pie-item-High').textContent).toContain('High: 2');
    expect(screen.getByTestId('pie-item-Medium').textContent).toContain('Medium: 1');
    expect(screen.getByTestId('pie-item-Low').textContent).toContain('Low: 1');
  });

  it('renders "No tasks available" message when tasks array is empty', () => {
    render(<PriorityDistributionChart tasks={[]} />);
    
    expect(screen.getByText('No tasks available')).toBeInTheDocument();
  });

  it('filters out priority categories with no tasks', () => {
    // Only high and medium priority tasks
    const tasksWithoutLow = sampleTasks.filter(task => task.priority !== 'low');
    
    render(<PriorityDistributionChart tasks={tasksWithoutLow} />);
    
    // Check that high and medium priorities are displayed
    expect(screen.getByTestId('pie-item-High')).toBeInTheDocument();
    expect(screen.getByTestId('pie-item-Medium')).toBeInTheDocument();
    
    // Check that low priority is not included
    expect(screen.queryByTestId('pie-item-Low')).not.toBeInTheDocument();
  });

  it('recalculates chart data when tasks prop changes', () => {
    const { rerender } = render(<PriorityDistributionChart tasks={sampleTasks} />);
    
    // Check initial rendering
    expect(screen.getByTestId('pie-item-High').textContent).toContain('High: 2');
    
    // Create a new task set with different priority distribution
    const updatedTasks = [
      ...sampleTasks,
      {
        id: 'task-5',
        user_id: 'user-1',
        name: 'New High Priority Task',
        description: 'Description',
        priority: 'high',
        due_date: '2025-05-05',
        completed: false,
        created_at: '2025-04-01',
        updated_at: '2025-04-01',
        project_id: null,
        start_date: null,
        start_time: null,
        due_time: null,
        duration: 60,
        chunk_size: null,
        hard_deadline: false,
        completed_at: null,
        tags: [],
        scheduled_blocks: null
      }
    ];
    
    // Re-render with updated tasks
    rerender(<PriorityDistributionChart tasks={updatedTasks} />);
    
    // Check that the counts are updated
    expect(screen.getByTestId('pie-item-High').textContent).toContain('High: 3');
  });
});