// // _lib/cookies.ts
// import { cookies } from 'next/headers';
// export const setServerCookie = (name: string, value: string, options: object) => {
//   cookies().set(name, value, options);
// };
// export const getServerCookie = (name: string) => {
//   return cookies().get(name)?.value;
// };

// // _lib/cookies.ts
// import { NextResponse } from 'next/server';

// // Function to set a cookie on the server
// export const setServerCookie = (name: string, value: string, options: Record<string, any>) => {
//   // Default options for cookies
//   const defaultOptions = {
//     path: '/', // Ensure the cookie is available across the entire site
//     httpOnly: true, // Make cookie inaccessible to JavaScript
//     sameSite: 'Strict', // CSRF protection
//     ...options, // Merge user-provided options
//   };

//   // Generate the cookie string
//   const cookieString = `${name}=${value}; Max-Age=${defaultOptions.maxAge || 60 * 60 * 24}; Path=${defaultOptions.path}; HttpOnly=${defaultOptions.httpOnly ? 'HttpOnly' : ''}; SameSite=${defaultOptions.sameSite}`;

//   // Return a response object with the Set-Cookie header to set the cookie
//   const response = NextResponse.next(); // Use NextResponse to generate the response object
//   response.headers.set('Set-Cookie', cookieString);

//   return response;
// };

// // Function to get a cookie value from the request headers
// export const getServerCookie = (name: string) => {
//   const cookie = cookies().get(name); // Retrieve the cookie from the request headers
//   return cookie ? cookie.value : null;
// };
