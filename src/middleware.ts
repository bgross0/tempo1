import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';

export async function middleware(req: NextRequest) {
  console.log('Middleware running for path:', req.nextUrl.pathname);
  
  // Create a response object that we'll modify and return
  const res = NextResponse.next();
  
  // Skip middleware for static assets and API routes
  if (
    req.nextUrl.pathname.startsWith('/_next') ||
    req.nextUrl.pathname.startsWith('/static') ||
    req.nextUrl.pathname.startsWith('/api') ||
    req.nextUrl.pathname.startsWith('/simple-login') ||
    req.nextUrl.pathname.startsWith('/simple-dashboard')
  ) {
    return res;
  }
  
  try {
    // Create a Supabase client for server-side auth
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name) {
            return req.cookies.get(name)?.value;
          },
          set(name, value, options) {
            res.cookies.set({
              name, 
              value,
              ...options
            });
          },
          remove(name, options) {
            res.cookies.delete({
              name,
              ...options
            });
          },
        },
      }
    );

    // IMPORTANT: Get the session
    const { data } = await supabase.auth.getSession();
    const session = data?.session;

    // Define protected and auth routes
    const isAuthRoute = req.nextUrl.pathname.startsWith('/login') || 
                      req.nextUrl.pathname.startsWith('/signup') ||
                      req.nextUrl.pathname.startsWith('/reset-password');
                      
    const isProtectedRoute = req.nextUrl.pathname.startsWith('/dashboard') || 
                           req.nextUrl.pathname.startsWith('/tasks') ||
                           req.nextUrl.pathname.startsWith('/projects') ||
                           req.nextUrl.pathname.startsWith('/calendar') ||
                           req.nextUrl.pathname.startsWith('/analytics') ||
                           req.nextUrl.pathname.startsWith('/settings');

    // For protected routes, redirect to login if no session
    if (isProtectedRoute && !session) {
      console.log('No session - redirecting to login');
      const redirectUrl = new URL('/login', req.url);
      redirectUrl.searchParams.set('redirectTo', req.nextUrl.pathname);
      return NextResponse.redirect(redirectUrl);
    }

    // For auth routes, redirect to dashboard if already logged in
    if (isAuthRoute && session) {
      console.log('Already logged in - redirecting to dashboard');
      const redirectTo = req.nextUrl.searchParams.get('redirectTo') || '/dashboard';
      const redirectUrl = new URL(redirectTo, req.url);
      return NextResponse.redirect(redirectUrl);
    }

    return res;
  } catch (error) {
    console.error('Middleware error:', error);
    // If middleware fails, continue the request
    return res;
  }
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