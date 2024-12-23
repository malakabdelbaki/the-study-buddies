import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import axios from 'axios';
import jwt from 'jsonwebtoken';
import { Role } from 'src/enums/role.enum';

export async function GET() {
  try {
      const cookieStore = await cookies();
      const tokenCookie = cookieStore.get('token');  
      if (!tokenCookie) {
        return new Response('Unauthorized', { status: 401 });
      }
    
      const decodedToken = jwt.decode(tokenCookie.value);
      
      if (!decodedToken) {
        console.log("Decoded token is invalid");
        return new Response('Invalid Token', { status: 401 });
      }
      
      const userId = (decodedToken as any)?.userid; 
      const userRole = (decodedToken as any)?.role; 

      console.log({ token: tokenCookie.value, decodedToken, userId, userRole });

    const endpoint =
      userRole === Role.Student
        ? `http://localhost:${process.env.NEXT_PUBLIC_PORT}/api/users/${userId}/courses/enrolled`
        : `http://localhost:${process.env.NEXT_PUBLIC_PORT}/api/users/${userId}/courses`;

    const response = await axios.get(endpoint, {
      headers: {
        Authorization: `Bearer ${tokenCookie.value}`,
    },
  });

    return NextResponse.json(response.data);
  } catch (error) {
    const errorMessage = 'Internal Server Error';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
