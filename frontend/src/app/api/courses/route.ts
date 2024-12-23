import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import axios from 'axios';
import jwt from 'jsonwebtoken';
import { Role } from 'src/enums/role.enum';
import { Course } from '@/types/Course';



export async function GET() {
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
      
      const userId = (decodedToken as any)?.userid; 
      const userRole = (decodedToken as any)?.role; 

      console.log({ token: tokenCookie.value, decodedToken, userId, userRole });

    const endpoint =
      userRole === Role.Student
        ? `http://localhost:${process.env.NEXT_PUBLIC_PORT}/api/users/${userId}/courses/enrolled`
        : `http://localhost:${process.env.NEXT_PUBLIC_PORT}/api/courses`;

    
    const response = await axios.get(endpoint, {
      headers: {
        Authorization: `Bearer ${tokenCookie.value}`,
    },
  });
    console.log(response.data);
    let ret = response.data;
    if (userRole.Role==='instructor'){
      ret = ret.filter((course:Course)=>course.instructor_id?._id===userId);
    }   
    return NextResponse.json(ret);
  } catch (error) {
    const errorMessage = 'Internal Server Error';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}



// Helper function to get user from token
async function getUserFromToken() {
  const cookieStore = await cookies();
  const tokenCookie = cookieStore.get('token');

  if (!tokenCookie) {
    return null;
  }

  const decodedToken = jwt.decode(tokenCookie.value);

  if (!decodedToken) {
    return null;
  }

  return {
    id: (decodedToken as any)?.userid,
    role: (decodedToken as any)?.role
  };
}


// POST: Rate a course
// export async function POST(req: NextRequest) {
//   try {
//     const { courseId, rating } = await req.json();

//     if (!courseId || rating === undefined) {
//       return new NextResponse('Bad Request: Missing courseId or rating', { status: 400 });
//     }

//     const response = await axios.post(`http://localhost:3000/api/courses/${courseId}/rate`, 
//       { rating },
//       {
//         headers: {
//           Authorization: `Bearer ${(await cookies()).get('token')?.value}`,
//         },
//       }
//     );

//     return NextResponse.json(response.data);
//   } catch (error: any) {
//     console.error('Error rating course:', error.message);
//     return NextResponse.json({ error: error.message }, { status: 500 });
//   }
// }


export async function POST(req: NextRequest) {
  try {
    const data = await req.text(); // if it's text/plain or application/json
    const parsed_data = JSON.parse(data);
    const newCourse = {
      category:parsed_data.category,
      difficulty_level:parsed_data.difficulty_level,
      title:parsed_data.title,
      isNote_enabled:parsed_data.isNote_enabled,
    }
   
    const response = await axios.post(`http://localhost:3000/api/courses`, 
      newCourse,
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
