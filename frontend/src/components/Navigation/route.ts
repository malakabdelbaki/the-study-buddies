// import { cookies } from 'next/headers';
// import jwt from 'jsonwebtoken';



// export const getUserFromToken = async () => {
//     const cookieStore = await cookies();
//     const tokenCookie = cookieStore.get('token');
  
//     if (!tokenCookie) throw new Error('Unauthorized');
//     const decodedToken = jwt.decode(tokenCookie.value);
  
//     if (!decodedToken) throw new Error('Invalid Token');
  
//     // Extract role from decoded token
//     const role = (decodedToken as any)?.role;
  
//     if (!role) throw new Error('Role not found in token');
  
//     return {
//       userId: (decodedToken as any)?.userid,
//       role: role,  // Extracted role
//       token: tokenCookie.value, // Include the raw token for external requests
//     };
//   };
  