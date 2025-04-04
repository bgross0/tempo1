// src/lib/supabase-test.ts
import { supabase, getAuthenticatedClient } from './supabase';

// Function to test Supabase database access
export async function testSupabaseConnection() {
  try {
    console.log('Testing Supabase connection...');
    
    // Test unauthenticated connection
    const { data: publicData, error: publicError } = await supabase
      .from('tasks')
      .select('id')
      .limit(1);
      
    console.log('Public connection test:', 
      publicError ? `Error: ${publicError.message}` : 'Success (unexpectedly)');
    
    // Test authenticated connection
    try {
      const authedClient = await getAuthenticatedClient();
      const { data: authedData, error: authedError } = await authedClient
        .from('tasks')
        .select('id')
        .limit(1);
        
      console.log('Authenticated connection test:', 
        authedError ? `Error: ${authedError.message}` : `Success, found ${authedData?.length} tasks`);
    } catch (authError) {
      console.error('Authentication error:', authError);
    }
    
    // Test projects table
    try {
      const authedClient = await getAuthenticatedClient();
      const { data: projectsData, error: projectsError } = await authedClient
        .from('projects')
        .select('id')
        .limit(1);
        
      console.log('Projects table test:', 
        projectsError ? `Error: ${projectsError.message}` : `Success, found ${projectsData?.length} projects`);
    } catch (projectsError) {
      console.error('Projects table error:', projectsError);
    }
    
    // Test database schema
    try {
      const authedClient = await getAuthenticatedClient();
      const { data: schemaData, error: schemaError } = await authedClient.rpc(
        'test_column_exists', 
        { table_name: 'tasks', column_name: 'status' }
      );
      
      if (schemaError) {
        // Function might not exist, try a direct query instead
        const { data: columnData, error: columnError } = await authedClient.from('information_schema.columns')
          .select('column_name')
          .eq('table_name', 'tasks')
          .eq('column_name', 'status');
          
        console.log('Status column test:', 
          columnError ? `Error: ${columnError.message}` : 
          (columnData && columnData.length > 0) ? 'Status column exists' : 'Status column does NOT exist');
      } else {
        console.log('Schema test result:', schemaData);
      }
    } catch (e) {
      console.error('Schema test error:', e);
    }
  } catch (e) {
    console.error('Overall connection test error:', e);
  }
}