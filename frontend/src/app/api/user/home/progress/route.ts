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

// GET: Retrieve a student's progress in a specific course by title and name
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const title = searchParams.get('title');  // Get the course title
    const name = searchParams.get('name');    // Get the student name
    if (!title || !name) {
      return NextResponse.json({ error: 'Both title and name are required' }, { status: 400 });
    }

    const { userId, token, role } = await getUserFromToken();

    // Check if the student is trying to view someone else's progress
    if (role === 'Student' && name !== (await getUserFromToken()).userId) {
      return NextResponse.json({ error: 'You can only access your own progress' }, { status: 403 });
    }

    // Make a request to the backend to get the progress based on title and name
    const progressResponse = await axios.get(
      `http://localhost:3000/api/users/progress?title=${title}&name=${name}`,
      { headers: { Authorization: `Bearer ${token}` } }
    );

    const progressData = progressResponse.data;

    return NextResponse.json(progressData);
  } catch (error: any) {
    console.error('Error fetching student progress:', error.message);
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}

// PUT: Update student progress in a specific course by title and name
export async function PUT(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const title = searchParams.get('title');  // Get the course title
    const name = searchParams.get('name');    // Get the student name

    console.log(title)
    console.log(name)



    if (!title || !name) {
      return NextResponse.json({ error: 'Both title and name are required' }, { status: 400 });
    }

    const { userId, token, role } = await getUserFromToken();

    // Only allow Admins or Instructors to update the progress
    if (role !== 'admin' && role !== 'instructor') {
      return NextResponse.json({ error: 'You do not have permission to update progress' }, { status: 403 });
    }

    // Parse the request body for completionPercentage
    const body = await req.json();
    const {completionPercentage } = body;
    console.log(completionPercentage)

    if (completionPercentage < 0 || completionPercentage > 100) {
      return NextResponse.json({ error: 'Completion percentage must be between 0 and 100' }, { status: 400 });
    }


    // Make a request to the backend to update the progress based on title and name
    const progressUpdateResponse = await axios.put(
      `http://localhost:3000/api/users/progress?title=${title}&name=${name}&completionPercentage&${completionPercentage}`,  // Backend endpoint for updating progress
      {
        title,
        name,
        completionPercentage
      },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    console.log(progressUpdateResponse.data)

    const updateResult = progressUpdateResponse.data;
    console.log(updateResult.data)

    return NextResponse.json({ message: updateResult });
  } catch (error: any) {
    console.error('Error updating student progress:', error.message);
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
