import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';

export async function GET() {
  try {
    // Await cookies() to access the cookies
    const cookieStore = await cookies();
    const tokenCookie = cookieStore.get('token');

    if (!tokenCookie) {
      console.error('Token is missing from cookies');
      return new Response('Unauthorized: No token provided', { status: 401 });
    }

    const token = tokenCookie.value;

    // Decode the token
    const decoded = jwt.decode(token);

    if (!decoded || typeof decoded !== 'object') {
      console.error('Failed to decode token');
      return new Response('Invalid token', { status: 401 });
    }

    const { userid, role } = decoded;

    return NextResponse.json({ userid, role });
  } catch (error) {
    console.error('Error decoding token:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
