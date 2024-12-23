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

    console.log("in notes route **********",tokenCookie.value);
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
   
    const { courseId , moduleId, content, title} = await req.json();

    console.log("in notes route **********",courseId,moduleId,content,title); 
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;

    console.log("in notes route **********",token);
    if (!token) {
      return new Response('Unauthorized', { status: 401 });
    }

    const response = await axios.post(
      `${process.env.NEXT_PUBLIC_API_URL}/note`,
      { courseId, moduleId, content, title },
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    console.log("in notes route **********",response.data); 

    return NextResponse.json(response.data);
  } catch (error: any) {
    console.error('Error sending message:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

