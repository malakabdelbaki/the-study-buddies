import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import axios from 'axios';
import { NextRequest } from 'next/server';

export async function GET(req: NextRequest ) {
  try {

    const { pathname } = new URL(req.url);
    const pathSegments = pathname.split('/');
    const forum_id = pathSegments[pathSegments.length - 3];

    const query = req.nextUrl.searchParams.get('query');
    console.log('query:', query);

    if (!forum_id) {
      return new Response('Bad Request: Missing forum ID', { status: 400 });
    }

    // Get token from cookies
    const cookieStore = await cookies();
    const tokenCookie = cookieStore.get('token');
    
    if (!tokenCookie) {
      return new Response('Unauthorized', { status: 401 });
    }

    const params = query ? new URLSearchParams([['query', query]]) : undefined;
console.log('params:', params);
console.log('forum_id:', forum_id);
    const response = await axios.get(`http://localhost:3000/api/threads/search/${forum_id}`,
    {
      params,
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
