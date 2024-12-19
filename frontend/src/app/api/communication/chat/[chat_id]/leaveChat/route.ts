import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';
import { cookies } from 'next/headers';

const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:3000'; // Backend's base URL

export async function PATCH(req: NextRequest) {
  try {
    // Extract chat_id from the query
    const { pathname } = new URL(req.url);
    const pathSegments = pathname.split('/'); // Split the path into segments
    const chat_id = pathSegments[pathSegments.length - 2];

    // Validate chat_id
    if (!chat_id) {
      return NextResponse.json({ message: 'chat_id is required in the URL' }, { status: 400 });
    }
    const cookieStore = await cookies();
    const tokenCookie = cookieStore.get('token');
    console.log({ tokenCookie });

    if (!tokenCookie) {
      return new Response('Unauthorized', { status: 401 });
    }

    // Send the PATCH request to the backend
    const response = await axios.patch(`${API_BASE_URL}/api/chat/leave/${chat_id}`, {}, {
      headers: {
        Authorization: `Bearer ${tokenCookie.value}`, 
      },
    });

    // Parse the response from the backend
    const data = await response.data;

    if (response && response.status !== 200) {
      return NextResponse.json({ message: data.message || 'Error leaving chat' }, { status: response.status });
    }

    // Return the successful response to the client
    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    console.error('Error in leaveChat API route:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
