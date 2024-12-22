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

// POST: Submit quiz response
export async function POST(req: Request, { params }: { params: { quiz_id: string } }) {
  try {
    // Extract quiz_id from the URL params
    const { quiz_id } = params;

    if (!quiz_id) {
      return NextResponse.json(
        { error: 'Missing required field: quiz_id' },
        { status: 400 }
      );
    }

    // Extract user information from the token
    const { userId, token } = await getUserFromToken();

    // Parse the request body
    const body = await req.json();
    const userChocies  = body.user_answers;
    
    console.log("*********************** in router userChocies" , userChocies)
    console.log("*********************** in router body" , body)
    console.log("*********************** in router body" , body.user_answers)



    if (!userChocies) {
      return NextResponse.json(
        { error: 'Missing required field: user_answers' },
        { status: 400 }
      );
    }
    const user_answers = Object.entries(userChocies).map(([key, value]) => {
      return { [key]: value };
    });
    console.log("*********************** in router")
    console.log("*********************** in router user id" , userId)
    console.log("*********************** in router answer" , user_answers)


    // Make an external API call to submit the quiz response
    const apiUrl = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api'}/quizzes/${quiz_id}/submit`;
    const response = await axios.post(
      apiUrl,
      {
        user_id: userId,
        user_answers:user_answers,
      },
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    // Return the response from the external API
    return NextResponse.json(response.data);
  } catch (error: any) {
    console.error('Error submitting quiz response:', error);

    if (error.response) {
      // Handle external API errors
      return NextResponse.json(
        { error: error.response.data },
        { status: error.response.status }
      );
    }

    // Handle other errors
    return NextResponse.json(
      { error: error.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}