import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { NextRequest } from 'next/server';
import axios from 'axios';

// GET: Fetch modules of a course by course ID
export async function GET(req: NextRequest, { params }: { params: { courseId: string } }) {
  try {
    const { courseId } = params;

    const response = await axios.get(`http://localhost:3000/api/courses/${courseId}/modules`, {
      headers: {
        Authorization: `Bearer ${(await cookies()).get('token')?.value}`,
      },
    });

    // Assuming you still want to fetch individual modules
    const modules = await Promise.all(
      response.data.map(async (moduleId: string) => {
        const moduleResponse = await axios.get(`http://localhost:3000/api/modules/${moduleId}`, {
          headers: {
            Authorization: `Bearer ${(await cookies()).get('token')?.value}`,
          },
        });
        return moduleResponse.data;
      })
    );

    return NextResponse.json(modules);
  } catch (error: any) {
    console.error('Error fetching course modules:', error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}



export async function POST(req: NextRequest) {
    try {
      const data = await req.text(); // if it's text/plain or application/json
      const parsed_data = JSON.parse(data);
      const newModule = {
        module_difficulty:parsed_data.module_difficulty,
        title:parsed_data.title,
        quiz_type:parsed_data.quiz_type,
        quiz_length:parsed_data.quiz_length,
        content:parsed_data.content,
        course_id:parsed_data.course_id
      }
     
      const response = await axios.post(`http://localhost:3000/api/modules`, 
        newModule,
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

  