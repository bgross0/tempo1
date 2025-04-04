'use client';

import { DragEvent, useState } from 'react';
import { Task } from '@/types/database';
import TaskCard from '@/components/dashboard/TaskCard';
// Already using database Task type, no conversion needed

interface KanbanColumnProps {
  title: string;
  tasks: Task[];
  columnId: string;
  onDrop: (taskId: string, columnId: string) => void;
  onTaskClick: (task: Task) => void;
}

function KanbanColumn({
  title,
  tasks,
  columnId,
  onDrop,
  onTaskClick
}: KanbanColumnProps) {
  const [isOver, setIsOver] = useState(false);
  
  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsOver(true);
  };
  
  const handleDragLeave = () => {
    setIsOver(false);
  };
  
  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsOver(false);
    const taskId = e.dataTransfer.getData('taskId');
    if (taskId) {
      onDrop(taskId, columnId);
    }
  };
  
  return (
    <div 
      className={`bg-gray-50 dark:bg-gray-800 rounded-lg p-4 flex flex-col h-full ${
        isOver ? 'border-2 border-blue-500 dark:border-blue-400' : ''
      }`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      aria-label={`${title} column`}
    >
      <div className="flex justify-between items-center mb-3">
        <h3 className="font-medium">{title}</h3>
        <span className="text-gray-500 text-sm">{tasks.length}</span>
      </div>
      <div className="space-y-3 overflow-y-auto flex-grow">
        {tasks.map(task => (
          <div 
            key={task.id} 
            draggable
            onDragStart={(e) => {
              e.dataTransfer.setData('taskId', task.id);
            }}
            onClick={() => onTaskClick(task)}
            className="cursor-pointer"
            aria-label={`Task: ${task.name}`}
          >
            <TaskCard task={task} />
          </div>
        ))}
      </div>
    </div>
  );
}

interface KanbanViewProps {
  tasks: Task[];
  onTaskClick: (task: Task) => void;
  onStatusChange: (taskId: string, completed: boolean, newStatus?: string) => void;
}

export function KanbanView({ tasks, onTaskClick, onStatusChange }: KanbanViewProps) {
  // Group tasks by status
  const todoTasks = tasks.filter(task => !task.completed && task.status !== 'in-progress');
  const inProgressTasks = tasks.filter(task => !task.completed && task.status === 'in-progress');
  const completedTasks = tasks.filter(task => task.completed);
  
  const handleDrop = async (taskId: string, columnId: string) => {
    // Find the task
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;
    
    let completed = task.completed;
    
    // Update completion status based on the column
    if (columnId === 'completed') {
      completed = true;
    } else {
      completed = false;
    }
    
    try {
      // First update the task locally
      const updatedTask = {
        ...task,
        status: columnId as 'todo' | 'in-progress' | 'completed',
        completed
      };
      
      // For an API update, we need to call our function from the parent component
      // This will trigger a database update
      
      // Note: We shouldn't actually modify the tasks array directly
      // as React props should be treated as immutable
      // Instead, we'll just pass the right information to the parent
      
      // Call the parent handler to update the UI and database
      // We pass the columnId (representing the new status) to make it clear
      // which column the task was dropped into
      onStatusChange(taskId, completed, columnId);
      
      console.log(`Task ${taskId} moved to ${columnId} column. Status and completion updated.`);
    } catch (error) {
      console.error('Error updating task status:', error);
      // Errors will be handled by the parent component
    }
  };
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 h-[calc(100vh-200px)]">
      <KanbanColumn
        title="To Do"
        tasks={todoTasks}
        columnId="todo"
        onDrop={handleDrop}
        onTaskClick={onTaskClick}
      />
      <KanbanColumn
        title="In Progress"
        tasks={inProgressTasks}
        columnId="in-progress"
        onDrop={handleDrop}
        onTaskClick={onTaskClick}
      />
      <KanbanColumn
        title="Completed"
        tasks={completedTasks}
        columnId="completed"
        onDrop={handleDrop}
        onTaskClick={onTaskClick}
      />
    </div>
  );
}