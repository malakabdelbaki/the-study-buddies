// pages/api/addParticipant.ts
import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';
import { cookies } from 'next/headers';

const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:3000'; // Replace with your backend's base URL

export async function PATCH(req: NextRequest) {
  try {
    const { pathname } = new URL(req.url);
    const pathSegments = pathname.split('/'); 
    const note_id = pathSegments[pathSegments.length - 2];

    const {title, content } = await req.json();

    if (!note_id) {
      return NextResponse.json({ message: 'note_id is required in the URL' }, { status: 400 });
    }

    const cookieStore = await cookies();
    const tokenCookie = cookieStore.get('token');

    if (!tokenCookie) {
      return NextResponse.json({ message: 'Authorization token is missing' }, { status: 401 });
    }
    console.log("in notes route **********",note_id,title,content);
    const response = await axios.patch(
      `${process.env.NEXT_PUBLIC_API_URL}/note/${note_id}`,
      {
        title, content      
      },
      {
        headers: {
          Authorization: `Bearer ${tokenCookie.value}`, // Authorization header
        },
      }
    );
    const data = await response.data;
    console.log("in notes route **********",data);

    if (response.status !== 200) {
      return NextResponse.json({ message: data.message || 'Error updating forum' }, { status: response.status });
    }

    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
