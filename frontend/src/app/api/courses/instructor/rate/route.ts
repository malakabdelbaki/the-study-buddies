import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { NextRequest } from 'next/server';
import axios from 'axios';

// POST: Rate an instructor
export async function POST(req: NextRequest) {
  try {
    const { targetId, rating } = await req.json();
    console.log("lllll",targetId,rating)
    if (!targetId || rating === undefined) {
      return new NextResponse('Bad Request: Missing targetId or rating', { status: 400 });
    }

    const response = await axios.post(`http://localhost:3000/api/users/rate/instructor`, 
      { targetId, rating },
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

