import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import { 
  getPersistedAuthState, 
  persistAuthState, 
  clearPersistedAuthState 
} from '@/lib/auth-persistence';

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
  // Check if there's persisted state, but be suspicious of it until server-verified
  const persistedAuth = getPersistedAuthState();
  
  // Force immediate verification with the server - don't trust persisted state blindly
  const [needsVerification, setNeedsVerification] = useState<boolean>(!!persistedAuth?.user);
  
  // Initialize state - default to logged out until server verification
  // IMPORTANT: We ONLY hydrate from persisted state during server verification
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  
  // Always start with loading=true until we verify with the server
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isInitialized, setIsInitialized] = useState<boolean>(false);

  // Using the battle-tested approach for session management
  useEffect(() => {
    console.log('=========== AUTH CONTEXT INITIALIZATION ===========');
    let mounted = true;
    
    // Get initial session - this happens only once on component mount
    const getInitialSession = async () => {
      try {
        if (!isInitialized) {
          // Always set loading to true during server verification
          setIsLoading(true);
          
          // Get the session from Supabase - this is the source of truth
          console.log('Getting initial session from server...');
          const { data, error } = await supabase.auth.getSession();
          
          if (error) {
            console.error('Error getting initial session:', error.message);
            // On error, clear any potentially corrupted local state
            setUser(null);
            setSession(null);
            clearPersistedAuthState();
            if (mounted) setIsLoading(false);
            return;
          }
          
          // Set initial state if component still mounted
          if (mounted) {
            if (data.session) {
              console.log('Server session found for user:', data.session.user.email);
              
              // Set state from verified server data
              setSession(data.session);
              setUser(data.session.user);
              
              // Persist verified auth state to reduce flicker on future page reloads
              persistAuthState(data.session.user);
            } else {
              console.log('No server session found');
              
              // Important: Make sure we always clear state when server has no session
              setSession(null);
              setUser(null);
              
              // Clear any incorrect persisted auth state
              clearPersistedAuthState();
            }
            
            // Mark initialization as complete
            setIsInitialized(true);
            setNeedsVerification(false);
            
            // Now that we have the real auth state from the server, we can set loading to false
            setIsLoading(false);
          }
        }
      } catch (err) {
        console.error('Unexpected error during session check:', err);
        
        if (mounted) {
          // On any error, clear state and mark as not loading
          setUser(null);
          setSession(null);
          clearPersistedAuthState();
          setIsLoading(false);
        }
      }
    };
    
    // Immediately invoke the session check
    getInitialSession();
    
    // Set up auth state change listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, currentSession) => {
        console.log('Auth state changed:', event);
        
        if (mounted) {
          // Set loading during important auth events
          if (event === 'SIGNED_IN' || event === 'SIGNED_UP' || event === 'SIGNED_OUT') {
            setIsLoading(true);
          }
          
          if (currentSession) {
            console.log('Session in auth state change for:', currentSession.user.email);
            setSession(currentSession); 
            setUser(currentSession.user);
            
            // Persist auth state to reduce flicker on page reloads
            persistAuthState(currentSession.user);
          } else {
            console.log('No session in auth state change');
            setSession(null);
            setUser(null);
            
            // Clear persisted auth state
            clearPersistedAuthState();
          }
          
          // Always set loading to false after state has been updated
          setIsLoading(false);
        }
      }
    );
    
    // Cleanup on unmount
    return () => {
      console.log('Unmounting AuthContext...');
      mounted = false;
      subscription.unsubscribe();
    };
  }, [isInitialized]); // Only depend on isInitialized to prevent unnecessary re-runs

  // Authentication methods following the official Supabase patterns
  const signIn = async (email: string, password: string) => {
    console.log('Signing in with email/password');
    setIsLoading(true);
    
    try {
      const response = await supabase.auth.signInWithPassword({ 
        email, 
        password 
      });
      
      return response;
    } catch (error) {
      console.error('Error during sign in:', error);
      setIsLoading(false);
      throw error;
    }
  };

  const signUp = async (email: string, password: string) => {
    console.log('Signing up with email/password');
    setIsLoading(true);
    
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
      setIsLoading(false);
      throw error;
    }
  };

  const signOut = async () => {
    console.log('Signing out');
    setIsLoading(true);
    
    try {
      // Clear persisted auth state first
      clearPersistedAuthState();
      
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
      setIsLoading(false);
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