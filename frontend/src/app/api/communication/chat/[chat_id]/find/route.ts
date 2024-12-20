import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import axios from 'axios';
import { NextRequest } from 'next/server';

export async function GET(req: NextRequest ) {
  try {

    const { pathname } = new URL(req.url);
    const pathSegments = pathname.split('/');
    const chat_id = pathSegments[pathSegments.length - 2];
    console.log("in chat/chatid ", chat_id)

    if (!chat_id) {
      return new Response('Bad Request: Missing chat ID', { status: 400 });
    }

    // Get token from cookies
    const cookieStore = await cookies();
    const tokenCookie = cookieStore.get('token');
    
    if (!tokenCookie) {
      return new Response('Unauthorized', { status: 401 });
    }

    const response = await axios.get(`http://localhost:3000/api/chat/${chat_id}`, {
      headers: {
        Authorization: `Bearer ${tokenCookie.value}`,
      },
    });
    console.log(response)

    if(response.status !== 200) {
      return new NextResponse('Internal Server Error', { status: 500 });
    }

    // Return the response as JSON
    return NextResponse.json(response.data);
  } catch (error: any) {
    console.error('Error fetching potential participants:', error);

    const errorMessage = error.response?.data?.message || 'Internal Server Error';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
