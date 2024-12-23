import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';
import { cookies } from 'next/headers';

export async function PATCH(req: NextRequest, res: NextResponse) {
  try {
      
    const { pathname } = new URL(req.url);
    const pathSegments = pathname.split('/'); // Split the path into segments
    const course_id = pathSegments[pathSegments.length - 2];

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
      `${process.env.NEXT_PUBLIC_API_URL}/courses/${course_id}/enableNotes`,
      {},
      {
        headers: {
          Authorization: `Bearer ${tokenCookie.value}`, 
        },
      }
    );
    
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
