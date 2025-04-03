// src/lib/supabase.ts
import { createClient } from '@supabase/supabase-js';
import { Database } from '@/types/supabase';

// Environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Check if environment variables are properly set
if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Supabase environment variables are missing!');
}

// Create a standard Supabase client with proper configuration
// Using the recommended Supabase client setup from the docs
export const supabase = createClient<Database>(
  supabaseUrl || '',
  supabaseAnonKey || '',
  {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true,
      flowType: 'pkce'
    }
  }
);

// Create an authenticated Supabase client using the official pattern
export const getAuthenticatedClient = async () => {
  try {
    // Get the current session using the standard client
    const { data: { session }, error } = await supabase.auth.getSession();
    
    if (error) {
      console.error('Error getting session:', error.message);
      throw error;
    }
    
    if (!session) {
      console.error('No active session found');
      throw new Error('Authentication required');
    }
    
    // Create a new client with the session token included in headers
    return createClient<Database>(
      supabaseUrl || '',
      supabaseAnonKey || '',
      {
        global: {
          headers: {
            Authorization: `Bearer ${session.access_token}`
          }
        },
        auth: {
          // Use same auth settings as main client for consistency
          autoRefreshToken: true,
          persistSession: true
        }
      }
    );
  } catch (error) {
    console.error('Failed to get authenticated client:', error);
    throw error;
  }
};

// Helper to check if session exists in browser storage
export const getAuthStorageState = () => {
  try {
    // Try to get session from localStorage
    if (typeof window !== 'undefined') {
      const authData = localStorage.getItem('taskjet-auth-storage');
      console.log('Auth storage exists:', !!authData);
      return !!authData;
    }
    return false;
  } catch (e) {
    console.error('Error checking auth storage:', e);
    return false;
  }
};
