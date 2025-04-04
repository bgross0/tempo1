import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Simplest middleware implementation that just passes through all requests
export function middleware(req: NextRequest) {
  // Just continue the request without modifications
  return NextResponse.next();
}

// Matcher configuration - include routes that need middlewares
// Currently empty to minimize chance of errors
export const config = {
  matcher: [
    // Add specific routes here if needed later
    // Example: '/dashboard/:path*'
  ],
};