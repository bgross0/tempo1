/**
 * Auth State Persistence Helper
 * 
 * This module improves auth state persistence between page reloads
 * to prevent flicker and improve the user experience without 
 * changing existing auth functionality.
 */

import { User, Session } from '@supabase/supabase-js';

// Storage key for auth state persistence
const AUTH_STORAGE_KEY = 'tempo-auth-state';

// Type for persisted auth data
export interface PersistedAuthState {
  user: User | null;
  timestamp: number;
}

/**
 * Store user state in local storage to reduce flicker
 * This doesn't replace supabase auth, just supplements it
 */
export function persistAuthState(user: User | null): void {
  try {
    if (typeof window !== 'undefined') {
      const authState: PersistedAuthState = {
        user,
        timestamp: Date.now(),
      };
      
      // Store auth state in local storage
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(authState));
      
      // Also set a cookie that middleware can check
      // This allows middleware to detect auth state even when localStorage is not accessible
      if (user) {
        // Set a simple presence cookie with 7 day expiry
        document.cookie = 'tempo-auth-state=1; path=/; max-age=604800; SameSite=Strict';
      } else {
        // Clear the cookie if user is null
        document.cookie = 'tempo-auth-state=; path=/; max-age=0';
      }
    }
  } catch (error) {
    console.warn('Could not persist auth state:', error);
  }
}

/**
 * Get persisted auth state from storage
 * Used to restore user state while full auth is being checked
 */
export function getPersistedAuthState(): PersistedAuthState | null {
  try {
    if (typeof window !== 'undefined') {
      const storedState = localStorage.getItem(AUTH_STORAGE_KEY);
      
      if (storedState) {
        try {
          const authState = JSON.parse(storedState) as PersistedAuthState;
          
          // Validate the persisted state has the required fields
          if (!authState || !authState.timestamp || typeof authState.timestamp !== 'number') {
            console.warn('Invalid or corrupt persisted auth state, clearing');
            clearPersistedAuthState();
            return null;
          }
          
          // Only return if it's recent (less than 15 minutes old to be much more conservative)
          const FIFTEEN_MINUTES = 15 * 60 * 1000;
          if (Date.now() - authState.timestamp < FIFTEEN_MINUTES && authState.user) {
            // Additional validation of user object
            if (!authState.user.id || !authState.user.email) {
              console.warn('Invalid user object in persisted auth state, clearing');
              clearPersistedAuthState();
              return null;
            }
            return authState;
          } else {
            // Clear expired state
            clearPersistedAuthState();
          }
        } catch (parseError) {
          console.warn('Error parsing persisted auth state:', parseError);
          clearPersistedAuthState();
          return null;
        }
      }
    }
    
    return null;
  } catch (error) {
    console.warn('Could not retrieve persisted auth state:', error);
    clearPersistedAuthState();
    return null;
  }
}

/**
 * Clear persisted auth state
 * Should be called on logout
 */
export function clearPersistedAuthState(): void {
  try {
    if (typeof window !== 'undefined') {
      // Clear localStorage
      localStorage.removeItem(AUTH_STORAGE_KEY);
      
      // Clear the auth cookie
      document.cookie = 'tempo-auth-state=; path=/; max-age=0';
    }
  } catch (error) {
    console.warn('Could not clear persisted auth state:', error);
  }
}

/**
 * Helper to check if auth state is in sync
 * Compares persisted user with current user
 */
export function isAuthStateSynced(currentUser: User | null): boolean {
  try {
    const persistedState = getPersistedAuthState();
    
    if (!persistedState) {
      return currentUser === null;
    }
    
    // Both null is synced
    if (!persistedState.user && !currentUser) {
      return true;
    }
    
    // One null, one not null is not synced
    if (!persistedState.user || !currentUser) {
      return false;
    }
    
    // Compare user IDs
    return persistedState.user.id === currentUser.id;
  } catch (error) {
    console.warn('Error checking auth state sync:', error);
    return false;
  }
}