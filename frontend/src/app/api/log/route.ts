'use server';

import { NextResponse } from 'next/server';
import axios from 'axios';
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';

export async function GET(req: Request) {
  try {

    const cookieStore = await cookies();
    const tokenCookie = cookieStore.get('token');

    if (!tokenCookie) {
      return new Response('Unauthorized', { status: 401 });
    }

    const decodedToken = jwt.decode(tokenCookie.value);

    if (!decodedToken) {
      console.log("Decoded token is invalid");
      return new Response('Invalid Token', { status: 401 });
    }

    const userid = (decodedToken as any)?.userId; 
    const userRole = (decodedToken as any)?.role;

    // // Role-based authorization check
    // if (userRole !== 'admin') {
    //   // If the user is not an admin, deny access
    //   return new Response('Forbidden: You do not have the required permissions', { status: 403 });
    // }

    const url = `http://localhost:${process.env.NEXT_PUBLIC_PORT}/api/logs`; // Backend URL for logs API
    const params = new URL(req.url).searchParams;

    // Passing query params (level, limit)
    const { data } = await axios.get(url, { //i want to actually create better filters!!
      params: {
        level: params.get('level') || '',
        limit: params.get('limit') || 50,
      },
      //withCredentials: true, // Include cookies in the request
      headers: {
        Authorization: `Bearer ${tokenCookie.value}`,
      },
    });

    return NextResponse.json(data); // Return the logs data
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      return NextResponse.json(
        { error: error.response.data.message || 'Server error' },
        { status: error.response.status }
      );
    }
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}