import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createServerClient, type CookieOptions } from '@supabase/ssr';

// This is the recommended middleware implementation from the Supabase docs
// https://supabase.com/docs/guides/auth/auth-helpers/nextjs#middleware-route-protection

export async function middleware(req: NextRequest) {
  console.log('==================== MIDDLEWARE ====================');
  console.log('Request URL:', req.url);
  console.log('Request path:', req.nextUrl.pathname);
  console.log('Referrer:', req.headers.get('referer') || 'none');
  console.log('Cookie count:', req.cookies.size);
  
  // Debug cookie contents
  if (req.cookies.size > 0) {
    console.log('Cookies:');
    req.cookies.getAll().forEach(cookie => {
      console.log(`- ${cookie.name}: ${cookie.value ? 'present' : 'empty'}`);
    });
  }
  
  // Create a response object that we'll modify and return
  let res = NextResponse.next();
  
  // Skip middleware for static assets, API routes, and other special paths
  if (
    req.nextUrl.pathname.startsWith('/_next') ||
    req.nextUrl.pathname.startsWith('/static') ||
    req.nextUrl.pathname.startsWith('/api') ||
    req.nextUrl.pathname.startsWith('/simple-login') ||
    req.nextUrl.pathname.startsWith('/simple-dashboard')
  ) {
    console.log('Path excluded from middleware checks');
    return res;
  }
  
  // Special handling for repeated redirects
  const redirectParam = req.nextUrl.searchParams.get('mw_redirect');
  if (redirectParam) {
    const redirectCount = parseInt(redirectParam, 10) || 0;
    
    if (redirectCount > 2) {
      console.log('⚠️ PREVENTING REDIRECT LOOP - redirectCount:', redirectCount);
      // Allow the request through to prevent infinite loops
      return res;
    }
  }
  
  // Create a Supabase client using the recommended pattern from docs
  console.log('Creating Supabase server client...');
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          const cookie = req.cookies.get(name);
          const value = cookie?.value;
          console.log(`Cookie get "${name}":`, value ? 'present' : 'not present');
          return value;
        },
        set(name: string, value: string, options: CookieOptions) {
          console.log(`Cookie set "${name}":`, value ? 'has value' : 'empty');
          
          // This is the correct pattern from Supabase docs
          req.cookies.set({
            name,
            value,
            ...options,
          });
          
          // Update the response cookies
          res = NextResponse.next({
            request: {
              headers: req.headers,
            },
          });
          
          res.cookies.set({
            name,
            value,
            ...options,
          });
        },
        remove(name: string, options: CookieOptions) {
          console.log(`Cookie remove "${name}"`);
          
          req.cookies.delete({
            name,
            ...options,
          });
          
          // Update the response cookies
          res = NextResponse.next({
            request: {
              headers: req.headers,
            },
          });
          
          res.cookies.delete({
            name,
            ...options,
          });
        },
      },
    }
  );

  // Get the session using the Supabase client
  console.log('Calling supabase.auth.getSession()...');
  const { data, error } = await supabase.auth.getSession();
  
  if (error) {
    console.error('⚠️ Error getting session in middleware:', error.message);
    // Continue without redirects on error
    return res;
  }
  
  const session = data.session;
  
  // Log detailed session information
  console.log('Session exists:', !!session);
  if (session) {
    console.log('Session user:', session.user.email);
    console.log('Session expires:', new Date(session.expires_at * 1000).toISOString());
  }

  // Define auth routes that redirect to dashboard if authenticated
  const isAuthRoute = 
    req.nextUrl.pathname === '/login' || 
    req.nextUrl.pathname === '/signup' || 
    req.nextUrl.pathname === '/reset-password';
                    
  // Define protected routes that require authentication
  const isProtectedRoute = 
    req.nextUrl.pathname.startsWith('/dashboard') || 
    req.nextUrl.pathname.startsWith('/tasks') ||
    req.nextUrl.pathname.startsWith('/projects') ||
    req.nextUrl.pathname.startsWith('/calendar') ||
    req.nextUrl.pathname.startsWith('/analytics') ||
    req.nextUrl.pathname.startsWith('/settings');

  // Information about the type of route
  console.log('Route type:', 
    isAuthRoute ? 'AUTH ROUTE' : 
    isProtectedRoute ? 'PROTECTED ROUTE' : 
    'PUBLIC ROUTE'
  );

  // Add redirect tracking to URLs
  const addRedirectTracking = (url: URL) => {
    const currentCount = parseInt(req.nextUrl.searchParams.get('mw_redirect') || '0', 10);
    url.searchParams.set('mw_redirect', (currentCount + 1).toString());
    url.searchParams.set('from', req.nextUrl.pathname);
    url.searchParams.set('t', Date.now().toString());
    return url;
  };

  // TEMPORARY FIX: Disable protected route check to prevent redirect loops
  // Only redirecting auth routes with a session to dashboard
  
  // Comment out protected route check temporarily 
  /*
  if (isProtectedRoute && !session) {
    console.log('⚠️ Protected route without session - redirecting to login');
    const redirectUrl = new URL('/login', req.url);
    return NextResponse.redirect(addRedirectTracking(redirectUrl));
  }
  */
  
  // Only keep the auth route redirect active
  if (isAuthRoute && session) {
    console.log('⚠️ Auth route with active session - redirecting to dashboard');
    const redirectUrl = new URL('/dashboard', req.url);
    return NextResponse.redirect(addRedirectTracking(redirectUrl));
  }

  console.log('No redirects needed, continuing request');
  return res;
}

// Specify which routes the middleware should run on
export const config = {
  matcher: [
    /*
     * Match all request paths except for:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|_next/data|favicon.ico).*)',
  ],
};