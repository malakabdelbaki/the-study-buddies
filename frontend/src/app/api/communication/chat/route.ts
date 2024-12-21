import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import axios from 'axios';

export async function GET(req: Request) {
  try {
    const cookieStore = await cookies();
    const tokenCookie = cookieStore.get('token');

    if (!tokenCookie) {
      return new Response('Unauthorized', { status: 401 });
    }

    const decodedToken = jwt.decode(tokenCookie.value);

    if (!decodedToken) {
      console.log("Decoded token is invalid");
      return new Response('Invalid Token', { status: 401 });
    }

    const userid = (decodedToken as any)?.userId; 
    const userRole = (decodedToken as any)?.role; 


    // Call the external endpoint and pass token
    const response = await axios.get(`http://localhost:${process.env.NEXT_PUBLIC_PORT}/api/chat`, {
      headers: {
        Authorization: `Bearer ${tokenCookie.value}`,
      },
    });


    return NextResponse.json(response.data);
  } catch (error) {
    console.error("Error encountered:", error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}


export async function POST(req: Request, { params }: { params: { chat_id: string } }) {
  try {
    const { chat_id } = await params;
    const { content } = await req.json();
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;

    if (!token) {
      return new Response('Unauthorized', { status: 401 });
    }

    const response = await axios.post(
      `http://localhost:3000/api/chat/add-message/${chat_id}`,
      { content },
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    return NextResponse.json(response.data);
  } catch (error: any) {
    console.error('Error sending message:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

