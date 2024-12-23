import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import axios from 'axios';
import jwt from 'jsonwebtoken';

export async function GET(req: Request) {
  try {
  
    // Get token from cookies
    const cookieStore = await cookies();
    const tokenCookie = cookieStore.get('token');
    if (!tokenCookie) {
      return new Response('Unauthorized', { status: 401 });
    }

    const decodedToken = jwt.decode(tokenCookie.value);
    const userid = (decodedToken as any)?.userid;

    // Make the request to the API with the course_id
    const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/users/${userid}/courses/enrolled`, {
      headers: {
        Authorization: `Bearer ${tokenCookie.value}`,
      },
    });

    console.log('Response from server potential participants:', response.data);

    // Return the response as JSON
    return NextResponse.json(response.data);
  } catch (error: any) {
    console.error('Error fetching potential participants:', error);

    const errorMessage = error.response?.data?.message || 'Internal Server Error';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
