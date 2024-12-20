import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import axios from 'axios';
import { NextRequest } from 'next/server';
import jwt from 'jsonwebtoken';
import { Role } from '../../../../../../backend/src/enums/role.enum';
export async function GET(req: NextRequest ) {
  try {

    // Get token from cookies
    const cookieStore = await cookies();
    const tokenCookie = cookieStore.get('token');
    
    if (!tokenCookie) {
      return new Response('Unauthorized', { status: 401 });
    }
    const decodedToken = jwt.decode(tokenCookie.value);
    const userId = (decodedToken as any)?.userid;
    const userRole = (decodedToken as any)?.role;
    if(userRole !== Role.Instructor) {
      return new Response('Unauthorized', { status: 401 });
    }

    const response = await axios.get(`http://localhost:3000/api/forum/instructor/${userId}`, {
      headers: {
        Authorization: `Bearer ${tokenCookie.value}`,
      },
    });

    if(response.status !== 200) {
      return new NextResponse('Internal Server Error', { status: 500 });
    }

    return NextResponse.json(response.data);
  } catch (error: any) {
    console.error('Error fetching potential participants:', error);

    const errorMessage = error.response?.data?.message || 'Internal Server Error';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
