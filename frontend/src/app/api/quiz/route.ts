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

    // // Extract module ID from the URL
    // const urlParams = new URLSearchParams(window.location.search);
    // const moduleId = urlParams.get("moduleId");
    // if (!moduleId) throw new Error("Module ID not found in URL");

    // External call to create a new quiz
    const response = await axios.post(
      `${process.env.EXTERNAL_API_URL || 'http://localhost:3000/api'}/quizzes`,{
        module_id: "675f733844d8ccdfb2bb820d",
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
