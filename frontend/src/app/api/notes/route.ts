import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import axios from 'axios';

export async function GET(req: NextRequest) {
  try {
    const cookieStore = await cookies();
    const tokenCookie = cookieStore.get('token');

    if (!tokenCookie) {
      return new Response('Unauthorized', { status: 401 });
    }

    const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/note`, {
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


export async function POST(req: NextRequest) {
  try {
   
    const { course_id , module_id, content, title} = await req.json();

    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;

    if (!token) {
      return new Response('Unauthorized', { status: 401 });
    }

    const response = await axios.post(
      `${process.env.NEXT_PUBLIC_API_URL}/note`,
      { course_id, module_id, content, title },
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

