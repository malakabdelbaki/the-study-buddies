//i think it's redundant :/
// 'use server';

// import { cookies } from 'next/headers';
// import { redirect } from 'next/navigation';

// export default async function logout() {
//   const cookieStore = await cookies(); // Add 'await' here to resolve the promise

//   // Remove the authentication token by clearing the cookie
//   cookieStore.delete('auth_token'); // Name of the cookie you set earlier
  
//   console.log('User logged out. Cookie cleared.');

//   // Redirect the user to the login page
//   redirect('/login');
// }



// 'use server';
// import { redirect } from 'next/navigation';

// export default async function logout() {
//   // Creating a response object for setting cookies
//   const response = new Response(null, {
//     status: 302, // Redirect status code
//     headers: {
//       // Clear the cookie by setting it to an empty value and expiring it
//       'Set-Cookie': 'CookieFromServer=; Max-Age=0; Path=/; HttpOnly; SameSite=Strict',
//       Location: '/login', // Redirect to login page
//     },
//   });

//   // Return the response to trigger the cookie deletion and redirect
//   return response;
// }


// // 'use server';
// // import { cookies } from 'next/headers';

// // export default async function logout() {
// //     const cookieStore = cookies();
// //     cookieStore.delete('CookieFromServer'); // Clear JWT //see why this doesn't work ://
// //     return { message: 'Logged out successfully' };
// // }