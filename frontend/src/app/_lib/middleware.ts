import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(req: NextRequest) {
  // Check if the user has the 'auth_token' cookie
  const token = req.cookies.get('auth_token');

  // Define paths that require authentication
  const protectedPaths = ['/about', '/chat', '/course']; //example

  // If the path is protected and the token is missing, redirect to login
  if (protectedPaths.some((path) => req.nextUrl.pathname.startsWith(path)) && !token) {
    return NextResponse.redirect(new URL('/login', req.url));
  }

  // Allow the request to proceed
  return NextResponse.next();
}

// Apply the middleware to protected routes only
export const config = {
  matcher: ['/about/:path*', '/chat/:path*', '/course/:path*'], // Adjust paths as needed
};
