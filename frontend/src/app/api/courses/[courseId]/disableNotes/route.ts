import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';
import { cookies } from 'next/headers';

const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:3000'; // Replace with your backend's base URL

export async function PATCH(req: NextRequest, res: NextResponse) {
  try {

    console.log("in route **********");  
    const { pathname } = new URL(req.url);
    const pathSegments = pathname.split('/'); // Split the path into segments
    const course_id = pathSegments[pathSegments.length - 2];

    console.log({ course_id });

    const cookieStore = await cookies();
    const tokenCookie = cookieStore.get('token');
    console.log({ tokenCookie });

    if (!tokenCookie) {
      return new Response('Unauthorized', { status: 401 });
    }
    // Validate chat_id and content
    if (!course_id) {
      return NextResponse.json({ error: 'chat_id is required in the URL' }, { status: 400 });
    }


    const response = await axios.patch(
      `${process.env.NEXT_PUBLIC_API_URL}/courses/${course_id}/disableNotes`,
      {},
      {
        headers: {
          Authorization: `Bearer ${tokenCookie.value}`, 
        },
      }
    );
    console.log({ response });
    // Parse the response from the backend
    const data = await response.data;

    if (response.status !== 200) {
      console.error(`Backend error: ${data.message}`);
      return NextResponse.json({ error: data.message || 'Error adding message' }, { status: 500 });
    }

    // Return the successful response to the client
    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    console.error('Error in addMessage handler:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
