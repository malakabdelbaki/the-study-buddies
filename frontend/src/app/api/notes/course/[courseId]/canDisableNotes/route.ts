import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import axios from 'axios';
import { NextRequest } from 'next/server';

export async function GET(req: NextRequest ) {
  try {

    const { pathname } = new URL(req.url);
    const pathSegments = pathname.split('/');
    const course_id = pathSegments[pathSegments.length - 2];
    console.log({ course_id });
    if (!course_id) {
      return new Response('Bad Request: Missing course ID', { status: 400 });
    }

    // Get token from cookies
    const cookieStore = await cookies();
    const tokenCookie = cookieStore.get('token');
    console.log({ tokenCookie });
    if (!tokenCookie) {
      return new Response('Unauthorized', { status: 401 });
    }

    const courseId = course_id;
    const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/note/course/${courseId}/canDisableNotes`, {
      headers: {
        Authorization: `Bearer ${tokenCookie.value}`,
      },
    });
    console.log({ response });

    if(response.status !== 200) {
      return new NextResponse('Internal Server Error', { status: 500 });
    }

    return NextResponse.json(response.data);
  } catch (error) {
    return NextResponse.json({ message: error }, { status: 500 });
  }
}
