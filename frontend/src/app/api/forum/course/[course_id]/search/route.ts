import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import axios from 'axios';
import { NextRequest } from 'next/server';

export async function GET(req: NextRequest ) {
  try {

    const { pathname } = new URL(req.url);
    const pathSegments = pathname.split('/');
    const course_id = pathSegments[pathSegments.length - 2];

    const query = req.nextUrl.searchParams.get('query');
    console.log('query:', query);

    if (!course_id) {
      return new Response('Bad Request: Missing course ID', { status: 400 });
    }

    const cookieStore = await cookies();
    const tokenCookie = cookieStore.get('token');
    
    if (!tokenCookie) {
      return new Response('Unauthorized', { status: 401 });
    }

    const params = query ? new URLSearchParams([['query', query]]) : undefined;

    const response = await axios.get(`http://localhost:3000/api/forum/course/${course_id}/search`, {
      params: params,
      
      headers: {
        Authorization: `Bearer ${tokenCookie.value}`,
      },
    });

    if(response.status !== 200) {
      return new NextResponse('Internal Server Error', { status: 500 });
    }

    return NextResponse.json(response.data);
  } catch (error: any) {
    console.error('Error fetching potential participants:', error);

    const errorMessage = error.response?.data?.message || 'Internal Server Error';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
