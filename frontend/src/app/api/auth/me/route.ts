import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import axios from 'axios';

export async function GET(req: Request) {
  try {
    const cookieStore = await cookies();
    const tokenCookie = cookieStore.get('token');
    console.log("Token cookie:", tokenCookie);

    if (!tokenCookie) {
      return new Response('Unauthorized', { status: 401 });
    }


    // Call the external endpoint and pass token
    const response = await axios.get('http://localhost:3000/api/users/me', {
      headers: {
        Authorization: `Bearer ${tokenCookie.value}`,
      },
    });

    console.log('Response from server:', response.data);
    return NextResponse.json(response.data);
  } catch (error) {
    console.error("Error encountered:", error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
