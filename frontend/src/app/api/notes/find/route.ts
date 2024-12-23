import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import axios from 'axios';

export async function GET(req: NextRequest) {
  try {
    const cookieStore = await cookies();
    const tokenCookie = cookieStore.get('token');

    if (!tokenCookie) {
      return new Response('Unauthorized', { status: 401 });
    }

    console.log("in notes route **********",tokenCookie.value);
    const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/note`, {
      headers: {
        Authorization: `Bearer ${tokenCookie.value}`,
      },
    });


    return NextResponse.json(response.data);
  } catch (error) {
    console.error("Error encountered:", error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

