import jwt from 'jsonwebtoken';  // assuming you're using the 'jsonwebtoken' library
import { getCookie } from 'cookies-next';  // use cookies-next to get cookies on the client side

export async function extractToken() {
  // Use getCookie to access the 'token' cookie on the client side
  const tokenCookie = getCookie('token');

  if (!tokenCookie) {
    return new Response('Unauthorized', { status: 401 });
  }

  const decodedToken = jwt.decode(tokenCookie as string);

  if (!decodedToken) {
    console.log("Decoded token is invalid");
    return new Response('Invalid Token', { status: 401 });
  }

  const userId = (decodedToken as any)?.userid;
  const userRole = (decodedToken as any)?.role;
  console.log(userId);
  console.log(userRole);
  return { userId, userRole };
}

















// import jwt from 'jsonwebtoken';  // assuming you're using the 'jsonwebtoken' library
// import { cookies } from 'next/headers';

// export async function extractToken() {
//   const cookieStore = await cookies();
//   const tokenCookie = cookieStore.get('token');

//   if (!tokenCookie) {
//     return new Response('Unauthorized', { status: 401 });
//   }

//   const decodedToken = jwt.decode(tokenCookie.value);

//   if (!decodedToken) {
//     console.log("Decoded token is invalid");
//     return new Response('Invalid Token', { status: 401 });
//   }

//   // Extract userId and role from the decoded token
//   const userId = (decodedToken as any)?.userId;
//   const userRole = (decodedToken as any)?.role;

//   // Return both userId and userRole
//   return { userId, userRole };
// }
