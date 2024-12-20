import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import axios from 'axios';

export async function GET(req: Request, { params }: { params: { chat_id: string } }) {
  try {
    const cookieStore = await cookies();
    const tokenCookie = cookieStore.get('token');

    if (!tokenCookie) {
      return new Response(JSON.stringify({ error: 'Unauthorized: Token missing' }), { status: 401 });
    }

    try {
      jwt.verify(tokenCookie.value, process.env.JWT_SECRET || 'your-secret-key');
    } catch (error) {
      return new Response(JSON.stringify({ error: 'Invalid Token' }), { status: 401 });
    }

    const { chat_id } = await params;

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
