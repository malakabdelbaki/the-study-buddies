import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import axios from 'axios';

export async function GET(req: Request) {
  try {
    console.log("Participants route");
    const url = new URL(req.url);
    const pathSegments = url.pathname.split('/');
    const course_id = pathSegments[pathSegments.length - 1];

    console.log('Course ID:', course_id);
    if (!course_id) {
      return new Response('Bad Request: Missing course ID', { status: 400 });
    }

    // Get token from cookies
    const cookieStore = await cookies();
    const tokenCookie = cookieStore.get('token');
    console.log('Token cookie:', tokenCookie);
    if (!tokenCookie) {
      return new Response('Unauthorized', { status: 401 });
    }

    // Make the request to the API with the course_id
    const response = await axios.get(`http://localhost:3000/api/chat/potential-participants/${course_id}`, {
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
