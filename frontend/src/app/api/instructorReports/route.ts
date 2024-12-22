

// import { NextResponse } from 'next/server';
// import axios from 'axios';
// import jwt from 'jsonwebtoken';
// import { cookies } from 'next/headers';

// const backendUrl = 'http://localhost:3000/api/performance';

// export async function GET(req: Request) {
//   try {
//     // Hardcoded instructor ID
//     const instructorId = '6763f0bdca036ffcb163bf70'; // Replace with the valid ID
//     console.log('Instructor ID:', instructorId);
//     console.log('Backend URL:', `${backendUrl}/instructor/${instructorId}`);


// // Parse the request URL for `downloadType` and `format`
// const url = new URL(req.url);
// const downloadType = url.searchParams.get('downloadType');
// const format = url.searchParams.get('format') || 'json';

// if (downloadType) {
//   // Handle file download request
//   const downloadUrl = `${backendUrl}/download-${downloadType}/${instructorId}?format=${format}`;
//   const response = await axios.get(downloadUrl, {
//     responseType: 'arraybuffer', // Ensure correct handling of binary data
//   });

//   return new NextResponse(response.data, {
//     headers: {
//       'Content-Type': response.headers['content-type'],
//       'Content-Disposition': response.headers['content-disposition'] || '',
//     },
//   });
// }


    
//     // Fetch reports from the backend
//     const [analyticsResponse, quizResultsResponse, contentEffectivenessResponse] = await Promise.all([
//       axios.get(`${backendUrl}/instructor/${instructorId}`),
//       axios.get(`${backendUrl}/quiz-results/${instructorId}`),
//       axios.get(`${backendUrl}/content-effectiveness/${instructorId}`),
//     ]);

//     return NextResponse.json({
//       analytics: analyticsResponse.data,
//       quizResults: quizResultsResponse.data,
//       contentEffectiveness: contentEffectivenessResponse.data,
//     });
//   } catch (error: any) {
//     console.error('Error fetching reports:', error.message);
//     return NextResponse.json(
//       { error: 'Failed to fetch instructor reports' },
//       { status: error.response?.status || 500 }
//     );
//   }
// }


'use server';

import { NextResponse } from 'next/server';
import axios from 'axios';
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';

const backendUrl = 'http://localhost:3000/api/performance';

export async function GET(req: Request) {
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

    const instructorId = (decodedToken as any)?.userid;  //typo fixed 
    const userRole = (decodedToken as any)?.role;

    console.log('Decoded Token:', decodedToken);
    console.log('Extracted Instructor ID:', instructorId);
    console.log('Extracted User Role:', userRole);

    // Check if user has the instructor role
    if (!instructorId || userRole !== 'instructor') {
      console.error('Forbidden: User is not an instructor');
      return new Response('Forbidden: Not an instructor', { status: 403 });
    }

    console.log('Instructor ID:', instructorId);
    console.log('Backend URL:', `${backendUrl}/instructor/${instructorId}`);



    ////////////////////
// Check for download type and format in query params
const url = new URL(req.url);
const downloadType = url.searchParams.get('downloadType'); // e.g., analytics, quiz-results, content-effectiveness
const format = url.searchParams.get('format') || 'json'; // Default to json

if (downloadType) {
  // Validate download type
  if (!['analytics', 'quiz-results', 'content-effectiveness'].includes(downloadType)) {
    console.error('Invalid download type:', downloadType);
    return new Response('Invalid download type', { status: 400 });
  }

  // Handle individual report download
  const downloadUrl = `${backendUrl}/download-${downloadType}/${instructorId}?format=${format}`;
  console.log('Download URL:', downloadUrl);

  const response = await axios.get(downloadUrl, {
    headers: { Authorization: `Bearer ${tokenCookie.value}` },
    responseType: 'arraybuffer', // Handle binary data for downloads
  });

  return new NextResponse(response.data, {
    headers: {
      'Content-Type': response.headers['content-type'],
      'Content-Disposition': response.headers['content-disposition'] || '',
    },
  });
}
/////////////////////////////



    // Fetch reports from the backend
    const [analyticsResponse, quizResultsResponse, contentEffectivenessResponse] = await Promise.all([
      axios.get(`${backendUrl}/instructor/${instructorId}`, {
        headers: { Authorization: `Bearer ${tokenCookie.value}` }, // Include token
      }),
      axios.get(`${backendUrl}/quiz-results/${instructorId}`, {
        headers: { Authorization: `Bearer ${tokenCookie.value}` }, // Include token
      }),
      axios.get(`${backendUrl}/content-effectiveness/${instructorId}`, {
        headers: { Authorization: `Bearer ${tokenCookie.value}` }, // Include token
      }),
    ]);


    return NextResponse.json({
      analytics: analyticsResponse.data,
      quizResults: quizResultsResponse.data,
      contentEffectiveness: contentEffectivenessResponse.data,
    });
  } catch (error: any) {
    console.error('Error fetching instructor reports:', error.message);

    if (axios.isAxiosError(error) && error.response) {
      return NextResponse.json(
        { error: error.response.data.message || 'Server error' },
        { status: error.response.status }
      );
    }

    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
