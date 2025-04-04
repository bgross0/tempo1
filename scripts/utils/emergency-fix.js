/**
 * Emergency fix for auth persistence issues
 * Run this script to clear all auth-related data
 */
// State indicating if we're running in a browser environment
const isBrowser = typeof window !== 'undefined' && typeof document !== 'undefined';

// List of auth-related localStorage keys to clear
const localStorageKeysToRemove = [
  'tempo-auth-state',
  'supabase-auth-token',
  'supabase.auth.token',
  'tempo-auth-storage',
  'sb-auth-data'
];

// List of auth-related cookies to clear
const cookiesToRemove = [
  'tempo-auth-state',
  'supabase-auth-token',
  'sb-auth-token',
  'sb-refresh-token'
];

// Clear localStorage items
function clearLocalStorage() {
  if (isBrowser) {
    try {
      console.log('Clearing localStorage items...');
      
      // Try to clear specific keys first
      localStorageKeysToRemove.forEach(key => {
        try {
          localStorage.removeItem(key);
          console.log(`Removed localStorage key: ${key}`);
        } catch (err) {
          console.error(`Error removing ${key} from localStorage:`, err);
        }
      });
      
      console.log('LocalStorage cleared successfully.');
    } catch (err) {
      console.error('Error clearing localStorage:', err);
    }
  }
}

// Clear cookies
function clearCookies() {
  if (isBrowser) {
    try {
      console.log('Clearing cookies...');
      
      cookiesToRemove.forEach(cookieName => {
        try {
          // Clear with path=/
          document.cookie = `${cookieName}=; path=/; max-age=0; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
          // Also try with secure and SameSite flags
          document.cookie = `${cookieName}=; path=/; max-age=0; expires=Thu, 01 Jan 1970 00:00:00 GMT; secure; SameSite=Strict`;
          console.log(`Removed cookie: ${cookieName}`);
        } catch (err) {
          console.error(`Error removing cookie ${cookieName}:`, err);
        }
      });
      
      console.log('Cookies cleared successfully.');
    } catch (err) {
      console.error('Error clearing cookies:', err);
    }
  }
}

// Function to run when the script loads
function clearAuthState() {
  clearLocalStorage();
  clearCookies();
  
  console.log('Auth state clearing complete!');
  console.log('You should now be able to use the login page normally.');
}

// Run immediately
clearAuthState();

// Add to window object for easy access from console
if (isBrowser) {
  window.clearAuthState = clearAuthState;
  console.log('You can run window.clearAuthState() from the console to clear auth state again.');
}

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { clearAuthState };
}