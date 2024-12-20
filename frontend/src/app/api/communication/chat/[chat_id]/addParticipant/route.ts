import axios from 'axios';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:3000'; // Backend's base URL

export async function PATCH(req: NextRequest) {
  try {
    // Extract chat_id from query and participants from the body
    const { pathname } = new URL(req.url);
    const pathSegments = pathname.split('/'); // Split the path into segments
    const chat_id = pathSegments[pathSegments.length - 2];
    const { participants } = await req.json();

    console.log('chat_id:', chat_id); 
    console.log('participants:', participants);

    if (!chat_id) {
      return NextResponse.json({ message: 'chat_id is required in the URL' }, { status: 400 });
    }

    if (!Array.isArray(participants) || participants.length === 0) {
      return NextResponse.json({ message: 'participants must be a non-empty array' }, { status: 400 });
    }

    const cookieStore = await cookies();
    const tokenCookie = cookieStore.get('token');

    if (!tokenCookie) {
      return new Response('Unauthorized', { status: 401 });
    }
    console.log('Adding participants to chat:', tokenCookie.value, chat_id, participants);

    // Send the PATCH request to the backend
    const response = await axios.patch(`${API_BASE_URL}/api/chat/add-participant/${chat_id}`, {
       participants
    },{
      headers: {
        Authorization: `Bearer ${tokenCookie.value}`, // Authorization header
      }
    });
  
    
    // Handle backend response
    const data = response.data;
    console.log('Response from /api/chat/add-participant:', data);

    if (response.status !== 200 && response.status !== 201) {
      return NextResponse.json({ message: data.message || 'Error adding participants to the chat' }, { status: response.status });
    }

    // Return success response
    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    console.error('Error in addParticipant API route:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
