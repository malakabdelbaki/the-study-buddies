'use server'
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

// GET: Retrieve all course titles taught by a specific instructor
export async function GET() {
  try {
    const { userId,token } = await getUserFromToken();

    const coursesResponse = await axios.get(
        `http://localhost:3000/api/users/${userId}/courses`, 
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      )

    // Returning the course titles
    return NextResponse.json(coursesResponse.data);
  } catch (error: any) {
    console.error('Error fetching courses by instructor:', error.message);
    return NextResponse.json({ error: error.message }, { status: 404 });
  }
}
