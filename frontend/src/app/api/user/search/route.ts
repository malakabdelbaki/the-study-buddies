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

// Search Users
export async function GET(req: Request) {
  try {
    const { role, token } = await getUserFromToken();
    const url = new URL(req.url);
    const searchTerm = url.searchParams.get('searchTerm');

    if (!searchTerm || searchTerm.trim() === '') {
      return NextResponse.json(
        { error: 'Search term cannot be empty' },
        { status: 400 }
      );
    }

    // Prepare query based on the role
    const query = {
      searchTerm,
      ...(role === 'student' && { excludeStudents: true }), // Add restriction for students
    };

    // External call to the backend service to get users
    const response = await axios.get('http://localhost:3000/api/users/search', {
      params: query,
      headers: { Authorization: `Bearer ${token}` },
    });

    const users = response.data;

    for (const user of users) {
      if (user.role === 'instructor') {
        // Fetch taught courses for instructors
        try {
          const coursesResponse = await axios.get(
            `http://localhost:3000/api/users/${user._id}/courses`, 
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          );
          // Extract course titles
          user.taughtCourses = coursesResponse.data.map(
            (course: any) => course.title
          );
        } catch (error) {
          console.error('Error fetching taught courses:');
          user.taughtCourses = [];
        }
      } else if (user.role === 'student') {
        // Fetch enrolled courses for students
        try {
          const enrolledResponse = await axios.get(
            `http://localhost:3000/api/users/${user._id}/courses/enrolled`,
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          );
          console.log(enrolledResponse.data);

          user.enrolledCourses = enrolledResponse.data.map(
            (course: any) => course.title
          );
          console.log(user.enrolledCourses);

        } catch (error) {
          console.error('Error fetching enrolled courses:');
          user.enrolledCourses = [];
        }

        // Fetch completed courses for students
        try {
          const completedResponse = await axios.get(
            `http://localhost:3000/api/users/${user._id}/courses/completed`,
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          );
          user.completedCourses = completedResponse.data.map(
            (course: any) => course.title
          );
        } catch (error) {
          console.error('Error fetching completed courses:');
          user.completedCourses = [];
        }
      }
    }

    return NextResponse.json(users);
  } catch (error: any) {
    console.error('Error searching users:', error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// DELETE: Delete User Account
export async function DELETE(req: Request) {
  try {
    const { role, token } = await getUserFromToken();

    // Extract userId from the request URL params
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');
    console.log(userId)
    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    // Perform the deletion
    const response = await axios.delete(`http://localhost:3000/api/users/${userId}`,
      { headers: { Authorization: `Bearer ${token}` } }
    );

    console.log('User deleted:', response.data);

    return NextResponse.json({ success: true, data: response.data });
  } catch (error: any) {
    console.error('Error deleting user:', error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

