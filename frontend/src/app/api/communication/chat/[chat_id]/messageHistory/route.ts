import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import axios from 'axios';

export async function GET(req: NextRequest) {
  try {
    const cookieStore = await cookies();
    const tokenCookie = cookieStore.get('token');

    if (!tokenCookie) {
      return new Response(JSON.stringify({ error: 'Unauthorized: Token missing' }), { status: 401 });
    }

    const { pathname} = new URL(req.url);
    const pathSegments = pathname.split('/');
    const chat_id  = pathSegments[pathSegments.length - 2];

    if (!chat_id) {
      return new Response(JSON.stringify({ error: 'Chat ID is required' }), { status: 400 });
    }

    const backendBaseUrl = process.env.BACKEND_BASE_URL || 'http://localhost:3000';

    const response = await axios.get(`${backendBaseUrl}/api/chat/history/${chat_id}`, {
      headers: {
        Authorization: `Bearer ${tokenCookie.value}`,
      },
    });
    console.log('Chat history:', response.data);

    return NextResponse.json(response.data);
  } catch (error: any) {
    console.error('Error encountered:', error.message);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
