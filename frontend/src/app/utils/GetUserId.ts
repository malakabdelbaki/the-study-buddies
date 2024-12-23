'use server';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';

export async function getUser() {
  try {
     const cookieStore = await cookies();
     const tokenCookie = cookieStore.get('token');  
     console.log(tokenCookie);

     if (!tokenCookie) {
       console.error("Token cookie is missing or invalid");
     }
   
     // Decode the token to extract user details
     const decodedToken = tokenCookie ? jwt.decode(tokenCookie.value) : null;
     console.log(decodedToken);
     if (!decodedToken) {
       console.error("Failed to decode token");
     }
   
    const userId = (decodedToken as any).userid;
    const userRole = (decodedToken as any).role;
    return { userId, userRole };
  } catch (error) {
    const errorMessage = 'Internal Server Error';
  } 
}
