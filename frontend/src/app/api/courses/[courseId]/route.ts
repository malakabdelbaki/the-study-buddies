import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { NextRequest } from 'next/server';
import axios from 'axios';

// GET: Fetch a single course by ID
export async function GET(req: NextRequest) {
  try {
    const { pathname } = new URL(req.url);
    const pathSegments = pathname.split('/');
    const course_id = pathSegments[pathSegments.length - 1];
    if (!course_id) {
      return new Response('Bad Request: Missing course_id', { status: 400 });
    }
    const response = await axios.get(`http://localhost:3000/api/courses/${course_id}`, {
      headers: {
        Authorization: `Bearer ${(await cookies()).get('token')?.value}`,
      },
    });
    console.log('okkk',response.data);
    return NextResponse.json(response.data);
  } catch (error: any) {
    console.error('Error fetching course:', error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
    try {
      const { pathname } = new URL(req.url);
      const pathSegments = pathname.split('/');
      const course_id = pathSegments[pathSegments.length - 1];
      
      const update_data = await req.text(); // if it's text/plain or application/json
    const parsed_data = JSON.parse(update_data); // Ensure it's properly parsed if JSON
    console.log('Update data:', parsed_data);
    const godata = {
        description:parsed_data.description,
        title:parsed_data.title,
        key_words:parsed_data.key_words,
        category:parsed_data.category,
        difficulty_level:parsed_data.difficulty_level,
        is_deleted:parsed_data.is_deleted,
        // isNoteEnabled:parsed_data.isNoteEnabled,
        students:parsed_data.students,
        modules:parsed_data.modules
    }
      if (!course_id) {
        return new Response('Bad Request: Missing course_id', { status: 400 });
      }
      const response = await axios.patch(`http://localhost:3000/api/courses/${course_id}`, godata,{
        headers: {
          Authorization: `Bearer ${(await cookies()).get('token')?.value}`,
        },
      });
      console.log('okkk',response.data);
      return NextResponse.json(response.data);
    } catch (error: any) {
      console.error('Error fetching course:', error.message);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
  }


  export async function DELETE(req: NextRequest) {
    try {
      const { pathname } = new URL(req.url);
      const pathSegments = pathname.split('/');
      const courseId = pathSegments[pathSegments.length - 1];
  
      if (!courseId  === undefined) {
        return new NextResponse('Bad Request: Missing courseId or rating', { status: 400 });
      }
  
      const response = await axios.delete(`http://localhost:3000/api/courses/${courseId}`, 
        {
          headers: {
            Authorization: `Bearer ${(await cookies()).get('token')?.value}`,
          },
        }
      );
  
      return NextResponse.json(response.data);
    } catch (error: any) {
      console.error('Error rating course:', error.message);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
  }
  
  