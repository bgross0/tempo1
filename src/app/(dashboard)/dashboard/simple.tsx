'use client';

export default function SimpleDashboardPage() {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Simple Dashboard</h1>
      <p className="mb-4">This is a minimal dashboard page for testing.</p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="border rounded-lg p-4 shadow">
          <h2 className="font-bold mb-2">Tasks</h2>
          <p>No tasks found.</p>
        </div>
        
        <div className="border rounded-lg p-4 shadow">
          <h2 className="font-bold mb-2">Projects</h2>
          <p>No projects found.</p>
        </div>
      </div>
      
      <div className="mt-4">
        <a href="/" className="text-blue-500 hover:underline">
          Back to Home
        </a>
      </div>
    </div>
  );
}