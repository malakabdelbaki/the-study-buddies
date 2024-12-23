// import { NextResponse } from 'next/server';
// import { cookies } from 'next/headers';
// import jwt from 'jsonwebtoken';
// import axios from 'axios';

// export async function GET(req: Request) {
//   try {
//     // Access cookies to retrieve the JWT token
//     const cookieStore = cookies();
//     const tokenCookie = (await cookieStore).get('token');

//     if (!tokenCookie) {
//       return new Response('Unauthorized: Token not found', { status: 401 });
//     }

//     // Decode the JWT token
//     const decodedToken = jwt.decode(tokenCookie.value);

//     if (!decodedToken) {
//       console.error("Decoded token is invalid");
//       return new Response('Invalid Token', { status: 401 });
//     }

//     if (!decodedToken || (decodedToken as any)?.role !== 'student') {
//       console.error('Access forbidden: Only students are allowed.');
//       return new Response('Forbidden: Only students can access this endpoint', { status: 403 });
//     }

//     const studentId = (decodedToken as any)?.userId;
//     const userRole = (decodedToken as any)?.role;

//     if (!studentId || userRole !== 'student') {
//       return new Response('Forbidden: Only students can access this endpoint', { status: 403 });
//     }

   
    
    
//     // Call the backend endpoint for the student dashboard
//     const response = await axios.get(
//       //`${process.env.NEXT_PUBLIC_API_URL}/performance/student/${studentId}`,
//      `http://localhost:3000/api/performance/student/${studentId}`,
//       {
//         withCredentials: true, // Ensures cookies are sent
//         headers: {
//           Authorization: `Bearer ${tokenCookie.value}`,
//         },
//       }
//     );
//     console.log('Token being sent:', tokenCookie.value);


//   //   // Return the backend response to the frontend
//   //   return NextResponse.json(response.data);
//   // } catch (error: any) {
//   //   console.error("Error encountered:", error.message);
//   //   return NextResponse.json(
//   //     { error: error.response?.data?.message || 'Internal Server Error' },
//   //     { status: error.response?.status || 500 }
//   //   );
//   // }
//   // Return the backend response
//   return new Response(JSON.stringify(response.data), { status: 200 });
// } catch (error: any) {
//   console.error('Error encountered:', error.message);
//   return new Response(
//     JSON.stringify({
//       error: error.response?.data?.message || 'Internal Server Error',
//     }),
//     { status: error.response?.status || 500 }
//   );
// }
// }




// export async function GET(req: Request) {
//   try {
//     // Skip token check
//     console.log('Skipping token verification for now...');

//     // Call the backend endpoint for the student dashboard
//     const response = await axios.get(
//       `http://localhost:3000/performance/student/675d476b122e0911dd5fcc11`
//     );

//     console.log('Response:', response.data);

//     return new Response(JSON.stringify(response.data), { status: 200 });
//   } catch (error: any) {
//     console.error('Error encountered:', error.message);
//     return new Response(
//       JSON.stringify({
//         error: error.response?.data?.message || 'Internal Server Error',
//       }),
//       { status: error.response?.status || 500 }
//     );
//   }
// }





// export async function GET(req: Request) {
//   try {
//     const studentId = '67458e188dad400e774a54d4'; // Hardcoded student ID for testing

//     console.log(`Calling backend with studentId: ${studentId}`);

//     // Call the backend endpoint directly
//     const response = await axios.get(
//       `http://localhost:3000/api/performance/student/${studentId}`
//     );

//     // Return the backend response
//     return NextResponse.json(response.data);
//   } catch (error: any) {
//     console.error('Error fetching student performance:', error.message);
//     return NextResponse.json(
//       { error: 'Failed to fetch student performance' },
//       { status: 500 }
//     );
//   }
// }

'use server';

import { NextResponse } from 'next/server';
import axios from 'axios';
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';

const backendUrl = 'http://localhost:3000/api/performance';

export async function GET() {
  try {
    // Extract token from cookies
    const cookieStore = await cookies();
    const tokenCookie = cookieStore.get('token');

    if (!tokenCookie) {
      console.error('Token is missing from cookies');
      return new Response('Unauthorized: No token provided', { status: 401 });
    }

    // Decode the token
    const decodedToken = jwt.decode(tokenCookie.value);

    if (!decodedToken) {
      console.error('Failed to decode token:', tokenCookie.value);
      return new Response('Invalid token', { status: 401 });
    }

    const studentId = (decodedToken as any)?.userid;
    const userRole = (decodedToken as any)?.role;

    console.log('Decoded Token:', decodedToken);
    console.log('Extracted Student ID:', studentId);
    console.log('Extracted User Role:', userRole);

    // Check if user has the student role
    if (!studentId || userRole !== 'student') {
      console.error('Forbidden: User is not a student');
      return new Response('Forbidden: Not a student', { status: 403 });
    }

    console.log(`Calling backend with studentId: ${studentId}`);

    // Call the backend endpoint directly
    const response = await axios.get(
      `${backendUrl}/student/${studentId}`,
      {
        headers: { Authorization: `Bearer ${tokenCookie.value}` }, // Include token
      }
    );

    // Return the backend response
    return NextResponse.json(response.data);
  } catch (error: any) {
    console.error('Error fetching student performance:', error.message);

    if (axios.isAxiosError(error) && error.response) {
      return NextResponse.json(
        { error: error.response.data.message || 'Server error' },
        { status: error.response.status }
      );
    }

    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
