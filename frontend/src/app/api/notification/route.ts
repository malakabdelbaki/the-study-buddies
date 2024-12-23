import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import axios from 'axios';

export async function GET() {
  try {
    const cookieStore = await cookies();
    const tokenCookie = cookieStore.get('token');

    if (!tokenCookie) {
      return new Response('Unauthorized', { status: 401 });
    }

    const decodedToken = jwt.decode(tokenCookie.value);

    if (!decodedToken) {
      console.log("Decoded token is invalid");
      return new Response('Invalid Token', { status: 401 });
    }
    const userId = (decodedToken as any).userid;

    // Call the external endpoint and pass token
    const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/notification/${userId}`, {
      headers: {
        Authorization: `Bearer ${tokenCookie.value}`,
      },
    });

     console.log(response.data, +"HEREEEE")
    return NextResponse.json(response.data);
  } catch (error) {
    console.error("Error encountered:", error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

