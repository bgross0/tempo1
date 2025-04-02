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

  useEffect(() => {
    // Get initial session with better error handling
    const getInitialSession = async () => {
      try {
        // First try to refresh the session to ensure we have the latest
        await supabase.auth.refreshSession();
        
        // Then get the current session
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Error getting initial session:', error.message);
          setIsLoading(false);
          return;
        }
        
        if (data.session) {
          console.log('Initial session loaded for:', data.session.user.email);
          setSession(data.session);
          setUser(data.session.user);
        } else {
          console.log('No initial session found');
        }
      } catch (err) {
        console.error('Unexpected error during session check:', err);
      } finally {
        setIsLoading(false);
      }
    };
    
    getInitialSession();

    // Listen for auth changes with improved logging
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event);
        
        if (session) {
          console.log('New session for:', session.user.email);
          setSession(session);
          setUser(session.user);
          
          // For sign_in events, we want to refresh the page to ensure
          // all components have the latest session data
          if (event === 'SIGNED_IN') {
            console.log('User signed in, refreshing session state');
          }
        } else {
          console.log('Session ended');
          setSession(null);
          setUser(null);
          
          // For sign_out events, redirect to login
          if (event === 'SIGNED_OUT') {
            console.log('User signed out, redirecting to login');
            window.location.href = '/login';
          }
        }
      }
    );

    return () => {
      console.log('Unsubscribing from auth state changes');
      subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    const response = await supabase.auth.signInWithPassword({ email, password });
    return response;
  };

  const signUp = async (email: string, password: string) => {
    const response = await supabase.auth.signUp({ email, password });
    return response;
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('Error signing out:', error.message);
    } else {
      // Make sure to clear the state
      setUser(null);
      setSession(null);
      
      // Redirect to login page after a small delay
      setTimeout(() => {
        window.location.href = '/login';
      }, 500);
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
