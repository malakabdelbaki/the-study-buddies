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

