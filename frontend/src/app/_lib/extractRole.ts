import { getCookie } from 'cookies-next';
import jwt from 'jsonwebtoken';

export function getUserRoleFromToken() {
   const tokenCookie = getCookie('token');

  if (!tokenCookie) {
    return new Response('Unauthorized', { status: 401 });
  }

  const decodedToken = jwt.decode(tokenCookie as string);

  if (!decodedToken) {
    console.log("Decoded token is invalid");
    return new Response('Invalid Token', { status: 401 });
  }

  //const userId = (decodedToken as any)?.userid;
  const userRole = (decodedToken as any)?.role;
  //console.log(userId);
  console.log(userRole);
  return userRole;
}
