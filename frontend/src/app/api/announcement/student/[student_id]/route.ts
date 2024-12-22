import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import axios from 'axios';
import { NextRequest } from 'next/server';

export async function GET(req: NextRequest ) {
  try {

    const { pathname } = new URL(req.url);
    const pathSegments = pathname.split('/');
    const student_id = pathSegments[pathSegments.length - 1];

    if (!student_id) {
      return new Response('Bad Request: Missing student_id', { status: 400 });
    }

    const cookieStore = await cookies();
    const tokenCookie = cookieStore.get('token');
    
    if (!tokenCookie) {
      return new Response('Unauthorized', { status: 401 });
    }

    const response = await axios.get(`http://localhost:3000/api/announcement/student/${student_id}`, {
      headers: {
        Authorization: `Bearer ${tokenCookie.value}`,
      },
    });

    if(response.status !== 200) {
      return new NextResponse('Internal Server Error', { status: 500 });
    }

    return NextResponse.json(response.data);
  } catch (error: any) {
    console.error('Error fetching announcements', error);

    const errorMessage = error.response?.data?.message || 'Internal Server Error';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
