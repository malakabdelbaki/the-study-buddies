import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { NextRequest } from 'next/server';
import axios from 'axios';

// POST: Rate an instructor
export async function POST(req: NextRequest) {
  try {
    const { pathname } = new URL(req.url);
    const pathSegments = pathname.split('/');
    const course_id = pathSegments[pathSegments.length - 1];
    
    const data = await req.text(); // if it's text/plain or application/json
    const rating = JSON.parse(data).rating;
    
    if (!course_id || rating === undefined) {
      return new NextResponse('Bad Request: Missing targetId or rating', { status: 400 });
    }

    const response = await axios.post(`http://localhost:3000/api/cousrse${course_id}/rate`, 
      {rating},
      {
        headers: {
          Authorization: `Bearer ${(await cookies()).get('token')?.value}`,
        },
      }
    );

    return NextResponse.json(response.data);
  } catch (error: any) {
    console.error('Error rating instructor:', error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

