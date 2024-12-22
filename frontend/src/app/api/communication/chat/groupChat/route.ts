// pages/api/createGroupChat.ts

import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';
import { cookies } from 'next/headers';
const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:3000'; // Replace with the actual base URL of your backend

export async function POST(req: NextRequest) {
  try {
    const { chatName, course_id, participants, visibility } = await req.json();

    if (!chatName || !course_id || !Array.isArray(participants) || !visibility) {
      return NextResponse.json({ message: 'Invalid request body' }, { status: 400 });
    }

    const cookieStore = await cookies();
    const tokenCookie = cookieStore.get('token');
    console.log({ tokenCookie });

    if (!tokenCookie) {
      return new Response('Unauthorized', { status: 401 });
    }
    console.log('Creating group chat:', { chatName, course_id, participants, visibility }); 
    const response = await axios.post(`${API_BASE_URL}/api/chat/group`, 
    {
      chatName, 
      course_id, 
      participants, 
      visibility
    }, 
    {
      headers: {
        Authorization: `Bearer ${tokenCookie.value}`, 
      }
    });

    const data = await response.data;

    if (response && response.status !== 200 && response.status !== 201) {
      return NextResponse.json({ message: data.message || 'Error creating group chat' }, { status: response.status });
    }

   
    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    console.error('Error in createGroupChat handler:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
