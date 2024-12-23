import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';

export async function POST(req: NextRequest) {
  try {
    const { pathname } = new URL(req.url);
    const pathSegments = pathname.split('/');
    const courseId = pathSegments[pathSegments.length - 2];

    const { rating } = await req.json();

    if (!courseId) {
      return NextResponse.json({ message: 'courseId is required' }, { status: 400 });
    }

    if (typeof rating !== 'number' || rating < 1 || rating > 5) {
      return NextResponse.json({ message: 'Rating must be a number between 1 and 5' }, { status: 400 });
    }

    const cookieStore = await cookies();
    const tokenCookie = cookieStore.get('token');

    if (!tokenCookie) {
      return new Response('Unauthorized', { status: 401 });
    }

    const decodedToken = jwt.decode(tokenCookie.value);

    if (!decodedToken) {
      return new Response('Invalid Token', { status: 401 });
    }

    const userId = (decodedToken as any)?.userid;

    const response = await axios.post(
      `${process.env.NEXT_PUBLIC_API_URL}/courses/${courseId}/rate`,
      { rating },
      {
        headers: {
          Authorization: `Bearer ${tokenCookie.value}`,
        },
      }
    );

    const data = response.data;

    if (response.status !== 200 && response.status !== 201) {
      return NextResponse.json({ message: data.message || 'Error rating course' }, { status: response.status });
    }

    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    console.error('Error rating course:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
