

// import { NextResponse } from 'next/server';
// import { NextRequest } from 'next/server';

// export async function middleware(req: NextRequest) {
//   console.log("Middleware is running!");

//   // Check the URL path for debugging purposes
//   console.log("Requested Path:", req.nextUrl.pathname);

//   // Always redirect to the login page for testing
//   return NextResponse.redirect(new URL('/login', req.url));
// }

// export const config = {
//   matcher: ['/*'],  // Apply to all paths for testing
// };













// // middleware.ts
// 'use server';
// import { NextResponse } from 'next/server';
// import jwt from 'jsonwebtoken';
// import { cookies } from 'next/headers';
// import { NextRequest } from 'next/server';
// import { useRouter } from 'next/navigation';
// import React from 'react';

// // Paths that require authentication/authorization
// const restrictedPaths = ['/log', '/logs'];

// export async function middleware(req: NextRequest) {
//   console.log('Middleware is running');
//   const router = useRouter(); // For redirecting
//   router.push('/login');
//   const url = new URL(req.url);

//   // Check if the current path is restricted
//   if (restrictedPaths.some((path) => url.pathname.startsWith(path))) {
//     const cookieStore = await cookies();
//     const tokenCookie = cookieStore.get('token');

//     // Check if the token exists
//     if (!tokenCookie) {
//       // If no token, redirect to the login page
//       return NextResponse.redirect(new URL('/login', url));
//     }

//     try {
//       const decodedToken = jwt.decode(tokenCookie.value);

//       // Check if the token is valid and contains necessary data
//       if (!decodedToken) {
//         console.log("Decoded token is invalid");
//         return NextResponse.redirect(new URL('/login', url));
//       }

//       const userRole = (decodedToken as any)?.role;

//       // Optionally, check if the user has the required role (e.g., admin)
//       if (userRole !== 'admin') {
//         console.log("User does not have the required role");
//         return NextResponse.redirect(new URL('/login', url)); // Or a "Forbidden" page
//       }
//     } catch (error) {
//       // If there’s an error decoding the token, redirect to login
//       console.log('Token decode error:', error);
//       return NextResponse.redirect(new URL('/login', url));
//     }
//   }

//   // Continue to the requested page if authentication passes
//   return NextResponse.next();
// }

// // Optional: Define which paths the middleware applies to
// export const config = {
//   matcher: ['/log', '/logs'], // Specify paths to apply the middleware to
// };
