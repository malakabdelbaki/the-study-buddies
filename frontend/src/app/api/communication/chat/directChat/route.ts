// pages/api/createDirectChat.ts
import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';
import { cookies } from 'next/headers';

const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:3000'; // Replace with the actual base URL of your backend

export async function POST(req: NextRequest) {
  try {
    // Extract the request body

    const { chatName, course_id, receiver_id } = await req.json();

    // Validate the incoming data
    if (!course_id || !receiver_id) {
      return NextResponse.json({ message: 'course_id and receiver_id are required' }, { status: 400 });
    }

    // Get the token from the cookies
    const cookieStore = await cookies();
    const tokenCookie = cookieStore.get('token');
    console.log({ tokenCookie });
    if(!tokenCookie) {
      return new Response('Unauthorized', { status: 401 });
    }
    const response = await axios.post(`${API_BASE_URL}/api/chat/direct`, 
      { chatName, course_id, receiver_id },
      {
        headers: {
          Authorization: `Bearer ${tokenCookie.value}`, 
        },
      }
    );

    // Parse the response from the backend
    const data = await response.data;
    console.log('Response from /api/chat/direct:', data);

    if (response.status !== 201 && response.status !== 200) {
      return NextResponse.json({ message: data.message || 'Error creating direct chat' }, { status: response.status });
    }

    console.log('Direct chat created:', data);
    // Return the successful response to the client
    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    console.error('Error in createDirectChat handler:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
