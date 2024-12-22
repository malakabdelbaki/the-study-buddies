import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';

const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:3000'; // Replace with the actual base URL of your backend

export async function POST(req: NextRequest) {
  try {
    const { course_id, content } = await req.json();
    console.log('Request body:', { course_id, content });
    if (!course_id) {
      return NextResponse.json({ message: 'course_id is required' }, { status: 400 });
    }

    console.log('Creating announcement:', { course_id, content });

    const cookieStore = await cookies();
    const tokenCookie = cookieStore.get('token');

    console.log('Token cookie:', tokenCookie);
    if(!tokenCookie) {
      return new Response('Unauthorized', { status: 401 });
    }
    
    const decodedToken = jwt.decode(tokenCookie.value);
          
    if (!decodedToken) {
      console.log("Decoded token is invalid");
      return new Response('Invalid Token', { status: 401 });
    }
    
    const userId = (decodedToken as any)?.userid; 
    console.log('Decoded token:', decodedToken, 'User ID:', userId);
    const response = await axios.post(`${API_BASE_URL}/api/announcement`, 
      { course_id, content, instructor_id: userId },
      {
        headers: {
          Authorization: `Bearer ${tokenCookie?.value}`, 
        },
      }
    );

    const data = await response.data;
    console.log('Response:', response.status, data);

    if (response.status !== 201 && response.status !== 200) {
      return NextResponse.json({ message: data.message || 'Error creating forum' }, { status: response.status });
    }

    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    console.error('Error in createForum handler:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}