// pages/api/addParticipant.ts
import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';
import { cookies } from 'next/headers';

const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:3000'; // Replace with your backend's base URL

export async function PATCH(req: NextRequest) {
  try {
    // Extract chat_id from the query and participants from the body
    const { pathname } = new URL(req.url);
    const pathSegments = pathname.split('/'); // Split the path into segments
    const chat_id = pathSegments[pathSegments.length - 2];
    const { name } = await req.json();

    // Validate chat_id and participants
    if (!chat_id) {
      return NextResponse.json({ message: 'chat_id is required in the URL' }, { status: 400 });
    }

    const cookieStore = await cookies();
    const tokenCookie = cookieStore.get('token');


    // Send the PATCH request to the backend
    if (!tokenCookie) {
      return NextResponse.json({ message: 'Authorization token is missing' }, { status: 401 });
    }

    console.log('Updating chat name:', { chat_id, name });
    const response = await axios.patch(
      `${API_BASE_URL}/api/chat/update-name/${chat_id}`,
      {
        chatName: name,
      },
      {
        headers: {
          Authorization: `Bearer ${tokenCookie.value}`, // Authorization header
        },
      }
    );
    // Parse the response from the backend
    const data = await response.data;
    console.log('Response from /api/chat/update-name:', data);

    if (response.status !== 200) {
      return NextResponse.json({ message: data.message || 'Error updating name' }, { status: response.status });
    }

    // Return the successful response to the client
    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    console.error('Error in addParticipant handler:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
