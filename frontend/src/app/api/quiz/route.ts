import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { decode } from 'jsonwebtoken';
import axios from 'axios';

// Helper to decode JWT and extract user info
const getUserFromToken = async () => {
  const cookieStore = await cookies();
  const tokenCookie = cookieStore.get('token');

  if (!tokenCookie) throw new Error('Unauthorized');
  const decodedToken = decode(tokenCookie.value);

  if (!decodedToken || (decodedToken as any)?.exp * 1000 < Date.now()) {
    throw new Error('Token Expired');
  }

  return {
    userId: (decodedToken as any)?.userid,
    role: (decodedToken as any)?.role,
    token: tokenCookie.value, // Include the raw token for external requests
  };
};

// Post: Create a new quiz
export async function POST(req: Request) {
  try {
    const { userId, token, role } = await getUserFromToken();

    // Optional: Check user role for authorization
    if (role !== 'student') {
      throw new Error('Unauthorized: Insufficient permissions');
    }

    // Parse the request body
    const body = await req.json();
    const module_id  = body.module_id;  
    console.log("in quiz route **********",module_id);

    if (!module_id) {
      return NextResponse.json(
        { error: 'Missing required field: module_id' },
        { status: 400 }
      );
    }

    // External call to create a new quiz
    const response = await axios.post(
      `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api'}/quizzes`,{
        module_id: module_id,
        user_id: userId
      },
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    console.log("in route **********",response.data);
    return NextResponse.json(response.data);
  } catch (error: any) {
    console.error('Error creating quiz:', error.message);

    if (error.response) {
      // External API error
      return NextResponse.json({ error: error.response.data }, { status: error.response.status });
    }

    return NextResponse.json({ error: error.message }, { status: 401 });
  }
}
