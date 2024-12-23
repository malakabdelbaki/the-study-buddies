import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';

const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:3000'; // Replace with the actual base URL of your backend

export async function POST(req: NextRequest) {
  try {
    const { courseId } = await req.json();

    if (!courseId) {
      return NextResponse.json({ message: 'courseId is required' }, { status: 400 });
    }

    const cookieStore = await cookies();
    const tokenCookie = cookieStore.get('token');
    if(!tokenCookie) {
      return new Response('Unauthorized', { status: 401 });
    }
    
    
    const response = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/users/enroll`, 
      {  courseId },
      {
        headers: {
          Authorization: `Bearer ${tokenCookie.value}`, 
        },
      }
    );

    const data = await response.data;

    if (response.status !== 201 && response.status !== 200) {
      return NextResponse.json({ message: data.message || 'Error ' }, { status: response.status });
    }

    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
