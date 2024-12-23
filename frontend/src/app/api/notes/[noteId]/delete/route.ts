// pages/api/addParticipant.ts
import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';
import { cookies } from 'next/headers';


export async function DELETE(req: NextRequest) {
  try {
    const { pathname } = new URL(req.url);
    const pathSegments = pathname.split('/'); 
    const note_id = pathSegments[pathSegments.length - 2];

    if (!note_id) {
      return NextResponse.json({ message: 'note_id is required in the URL' }, { status: 400 });
    }

    const cookieStore = await cookies();
    const tokenCookie = cookieStore.get('token');

    if (!tokenCookie) {
      return NextResponse.json({ message: 'Authorization token is missing' }, { status: 401 });
    }

    const response = await axios.delete(
      `${process.env.NEXT_PUBLIC_API_URL}/note/${note_id}`,
      {
        headers: {
          Authorization: `Bearer ${tokenCookie.value}`, 
        },
      }
    );

    const data = await response.data;

    if (response.status !== 200) {
      return NextResponse.json({ message: data.message || 'Error deleting forum' }, { status: response.status });
    }

    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    return NextResponse.json({ message: error}, { status: 500 });
  }
}
