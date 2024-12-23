import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';


export async function POST(req: NextRequest) {
  try {

    const { pathname } = new URL(req.url);
    const pathSegments = pathname.split('/');
    const instructor_id = pathSegments[pathSegments.length - 1];
    
    const { star } = await req.json();

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
    
        
    const response = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/users/rate/instructor`, 
      { targetId: instructor_id, rating:star },
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
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
