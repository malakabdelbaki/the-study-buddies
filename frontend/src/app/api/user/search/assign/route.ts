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
    token: tokenCookie.value,
  };
};

// Get all courses taught by a specific instructor
export async function GET(req: Request) {
  try {
    const { userId ,role, token } = await getUserFromToken();
    // const url = new URL(req.url);
    // const instructorId = url.searchParams.get('instructorId');

    // if (!instructorId || instructorId.trim() === '') {
    //   return NextResponse.json(
    //     { error: 'Instructor ID cannot be empty' },
    //     { status: 400 }
    //   );
    // }

    // External call to the backend service to get courses taught by the instructor
    const response = await axios.get(
      `http://localhost:3000/api/users/${userId}/courses`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    console.log("HERE"+response.data)

    const courses = response.data;

    return NextResponse.json(courses);
  } catch (error: any) {
    console.error('Error fetching courses:', error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// Assign students to a course (Admin or Instructor)
export async function PUT(req: Request) {
  try {
    const { role, token } = await getUserFromToken();
    // const url = new URL(req.url);
    // const courseId = url.pathname.split('/')[4]; // Extract courseId from the URL

    const { searchParams } = new URL(req.url);
    const courseId = searchParams.get('courseId');

    console.log(courseId)


    // Extract student IDs from request body
    const body = await req.json();
    const studentIds = body.studentIds;
    console.log(studentIds)

    if (!studentIds || !Array.isArray(studentIds) || studentIds.length === 0) {
      return NextResponse.json(
        { error: 'Student IDs must be provided as a non-empty array' },
        { status: 400 }
      );
    }

    // External call to the backend service to assign students to the course
    const response = await axios.put(
      `http://localhost:3000/api/users/courses/${courseId}/assign-students`,
      { studentIds },
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    const updatedCourse = response.data;

    return NextResponse.json(updatedCourse);
  } catch (error: any) {
    console.error('Error assigning students to course:', error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
