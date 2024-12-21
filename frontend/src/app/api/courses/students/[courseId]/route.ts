import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import axios from 'axios';

// Helper to decode JWT and extract user info
const getUserFromToken = async () => {
  const cookieStore = await cookies();
  const tokenCookie = cookieStore.get('token');

  if (!tokenCookie) throw new Error('Unauthorized');
  const decodedToken = jwt.decode(tokenCookie.value);

  if (!decodedToken) throw new Error('Invalid Token');

  return {
    userId: (decodedToken as any)?.userid,
    role: (decodedToken as any)?.role,
    token: tokenCookie.value, // Include the raw token for external requests
  };
};

// GET: Retrieve all students in a specific course
export async function GET(req: Request) {
  try {
    const { token } = await getUserFromToken();
    const { pathname } = new URL(req.url);
    const pathSegments = pathname.split('/');
    const courseId = pathSegments[pathSegments.length - 1];

    if (!courseId) {
      return NextResponse.json(
        { error: 'Course ID is required' },
        { status: 400 }
      );
    }

    console.log(courseId)

    // External call to fetch students in the specified course
    const response = await axios.get(
      `http://localhost:3000/api/users/courses/${courseId}`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    console.log(response.data)


    // Return the list of students
    return NextResponse.json(response.data);
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      console.error('Axios error fetching students:', error.response?.data || 'No response data');
      return NextResponse.json(
        { error: error.response?.data || 'Error fetching students' },
        { status: error.response?.status || 500 }
      );
    } else if (error instanceof Error) {
      console.error('Error fetching students:', error.message);
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    } else {
      console.error('Unknown error fetching students:', error);
      return NextResponse.json(
        { error: 'Unknown error occurred' },
        { status: 500 }
      );
    }
  }
}
