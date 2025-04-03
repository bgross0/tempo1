import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';

type AuthContextType = {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<{
    error: Error | null;
    data: { user: User | null; session: Session | null };
  }>;
  signUp: (email: string, password: string) => Promise<{
    error: Error | null;
    data: { user: User | null; session: Session | null };
  }>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Using the minimal proven approach for session management
  useEffect(() => {
    console.log('=========== AUTH CONTEXT INITIALIZATION ===========');
    let mounted = true;
    
    // Get initial session
    const getInitialSession = async () => {
      try {
        setIsLoading(true);
        
        // Get the session - NO refresh before this to avoid state issues
        console.log('Getting initial session...');
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Error getting initial session:', error.message);
          return;
        }
        
        // Set initial state if component still mounted
        if (mounted) {
          if (data.session) {
            console.log('Initial session found for user:', data.session.user.email);
            setSession(data.session);
            setUser(data.session.user);
          } else {
            console.log('No initial session found');
            setSession(null);
            setUser(null);
          }
        }
      } catch (err) {
        console.error('Unexpected error during session check:', err);
      } finally {
        if (mounted) setIsLoading(false);
      }
    };
    
    getInitialSession();
    
    // Set up auth listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, currentSession) => {
        console.log('Auth state changed:', event);
        
        if (mounted) {
          if (currentSession) {
            console.log('Session in auth state change for:', currentSession.user.email);
            setSession(currentSession); 
            setUser(currentSession.user);
          } else {
            console.log('No session in auth state change');
            setSession(null);
            setUser(null);
          }
        }
      }
    );
    
    // Cleanup
    return () => {
      console.log('Unmounting AuthContext...');
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  // Authentication methods following the official Supabase patterns
  const signIn = async (email: string, password: string) => {
    console.log('Signing in with email/password');
    
    try {
      const response = await supabase.auth.signInWithPassword({ 
        email, 
        password 
      });
      
      return response;
    } catch (error) {
      console.error('Error during sign in:', error);
      throw error;
    }
  };

  const signUp = async (email: string, password: string) => {
    console.log('Signing up with email/password');
    
    try {
      const response = await supabase.auth.signUp({ 
        email, 
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`
        }
      });
      
      return response;
    } catch (error) {
      console.error('Error during sign up:', error);
      throw error;
    }
  };

  const signOut = async () => {
    console.log('Signing out');
    
    try {
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error('Error signing out:', error.message);
        throw error;
      }
      
      // Clear state immediately for better UX
      setUser(null);
      setSession(null);
      
      // Let middleware handle the redirect
      window.location.href = '/login';
    } catch (error) {
      console.error('Error during sign out:', error);
      throw error;
    }
  };

  const value = {
    user,
    session,
    isLoading,
    signIn,
    signUp,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
