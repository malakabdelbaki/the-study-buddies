// '/app/api/auth/logout/route.ts'
'use server';

import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function POST() {
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

    // Call the backend API to log the user out
    const response = await fetch('http://localhost:3001/api/auth/logout', {
      method: 'POST',
      headers: {
        //'Content-Type': 'application/json',
        Authorization: `Bearer ${tokenCookie.value}`
      },
    });

    if (response.ok) {
      // Clear the auth token cookie in the frontend
      const res = NextResponse.json({ message: 'Logged out successfully' });
      res.cookies.set('token', '', { maxAge: 0 }); // Expire the cookie immediately
      
      return res;
    }

    return NextResponse.json({ message: 'Logout failed' }, { status: 500 });
  } catch (error) {
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
