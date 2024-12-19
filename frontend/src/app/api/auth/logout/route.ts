// '/app/api/auth/logout/route.ts'
'use server';

import { NextResponse } from 'next/server';

export async function POST() {
  try {
    // Call the backend API to log the user out
    const response = await fetch('http://localhost:3001/api/auth/logout', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (response.ok) {
      // Clear the auth token cookie in the frontend
      const res = NextResponse.json({ message: 'Logged out successfully' });
      res.cookies.delete('token'); // Assuming 'token' is the cookie name
      
      return res;
    }

    return NextResponse.json({ message: 'Logout failed' }, { status: 500 });
  } catch (error) {
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
