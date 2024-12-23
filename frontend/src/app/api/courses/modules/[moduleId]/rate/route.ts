import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';


export async function POST(req: NextRequest) {
  try {
    const { pathname } = new URL(req.url);
    const pathSegments = pathname.split('/');
    const moduleId = pathSegments[pathSegments.length - 2];

    const { rating } = await req.json();

    if (!moduleId) {
      return NextResponse.json({ message: 'moduleId is required' }, { status: 400 });
    }

    const cookieStore = await cookies();
    const tokenCookie = cookieStore.get('token');
    if(!tokenCookie) {
      return new Response('Unauthorized', { status: 401 });
    }
    
    const decodedToken = jwt.decode(tokenCookie.value);
          
    if (!decodedToken) {
      console.log("Decoded token is invalid");
      return new Response('Invalid Token', { status: 401 });
    }
    
    const userId = (decodedToken as any)?.userid; 
    const id = moduleId;
    
    const response = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/modules/${id}/rate`, 
      { ratingbody: rating },
      {
        headers: {
          Authorization: `Bearer ${tokenCookie.value}`, 
        },
      }
    );

    const data = await response.data;

    if (response.status !== 201 && response.status !== 200) {
      return NextResponse.json({ message: data.message || 'Error creating forum' }, { status: response.status });
    }

    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    console.error('Error in createForum handler:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
