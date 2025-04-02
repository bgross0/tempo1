'use client';

import { useState } from 'react';
import { Plus, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useProjectsRealtime } from '@/hooks/api/useProjectsRealtime';
import ProjectCard from '@/components/projects/ProjectCard';
import ProjectDialog from '@/components/projects/ProjectDialog';

export default function ProjectsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const { projects } = useProjectsRealtime();
  
  // Filter projects based on search query
  const filteredProjects = projects.filter(project => {
    const lowercaseQuery = searchQuery.toLowerCase();
    return (
      project.name.toLowerCase().includes(lowercaseQuery) ||
      (project.description && project.description.toLowerCase().includes(lowercaseQuery))
    );
  });
  
  // Sort and categorize projects
  const activeProjects = filteredProjects.filter(project => !project.completed);
  const completedProjects = filteredProjects.filter(project => project.completed);
  
  return (
    <div className="p-4 md:p-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <h1 className="text-2xl font-bold">Projects</h1>
        
        <div className="flex flex-col sm:flex-row w-full md:w-auto gap-2">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
            <Input 
              placeholder="Search projects..." 
              className="pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          <Button onClick={() => setCreateDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            New Project
          </Button>
        </div>
      </div>
      
      <Tabs defaultValue="active" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="active" className="flex-1">
            Active ({activeProjects.length})
          </TabsTrigger>
          <TabsTrigger value="completed" className="flex-1">
            Completed ({completedProjects.length})
          </TabsTrigger>
          <TabsTrigger value="all" className="flex-1">
            All ({filteredProjects.length})
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="active" className="mt-0">
          {activeProjects.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              {searchQuery ? 'No active projects found matching your search.' : 'No active projects. Create your first project!'}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {activeProjects.map(project => (
                <ProjectCard key={project.id} project={project} />
              ))}
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="completed" className="mt-0">
          {completedProjects.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              {searchQuery ? 'No completed projects found matching your search.' : 'No completed projects yet.'}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {completedProjects.map(project => (
                <ProjectCard key={project.id} project={project} />
              ))}
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="all" className="mt-0">
          {filteredProjects.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              {searchQuery ? 'No projects found matching your search.' : 'No projects. Create your first project!'}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredProjects.map(project => (
                <ProjectCard key={project.id} project={project} />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
      
      {/* Create Project Dialog */}
      <ProjectDialog 
        open={createDialogOpen} 
        onOpenChange={setCreateDialogOpen} 
      />
    </div>
  );
}
