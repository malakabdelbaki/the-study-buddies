import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';

const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:3000'; // Replace with the actual base URL of your backend

export async function POST(req: NextRequest) {
  try {
    const { title, description,  course_id } = await req.json();

    if (!course_id) {
      return NextResponse.json({ message: 'course_id is required' }, { status: 400 });
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
    
    const response = await axios.post(`${API_BASE_URL}/api/forum`, 
      {  title, description, course_id, created_by: userId },
      {
        headers: {
          Authorization: `Bearer ${tokenCookie.value}`, 
        },
      }
    );

    const data = await response.data;
    console.log('Response from /api/forum:', data);

    if (response.status !== 201 && response.status !== 200) {
      return NextResponse.json({ message: data.message || 'Error creating forum' }, { status: response.status });
    }

    console.log('forum created:', data);
    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    console.error('Error in createForum handler:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
