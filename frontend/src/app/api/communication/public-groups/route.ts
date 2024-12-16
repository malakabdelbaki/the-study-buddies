import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import axios from 'axios';

export async function GET(req: Request) {
  console.log("Public groups route");
  try {
   const cookieStore = await cookies();
   const tokenCookie = cookieStore.get('token');  
    if (!tokenCookie) {
      return new Response('Unauthorized', { status: 401 });
    }

    const response = await axios.get('http://localhost:3000/api/chat/publicGroups', {
      headers: {
        Authorization: `Bearer ${tokenCookie.value}`,
      },
    });

    console.log('Response from server public chat:', response.data);
    return NextResponse.json(response.data);
  } catch (error) {
    const errorMessage = 'Internal Server Error';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
