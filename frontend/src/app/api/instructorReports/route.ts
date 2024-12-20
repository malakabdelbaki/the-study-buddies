import { NextResponse } from 'next/server';
import axios from 'axios';

const backendUrl = 'http://localhost:3000/api/performance';

export async function GET(req: Request) {
  try {
    // Hardcoded instructor ID
    const instructorId = '6763f0bdca036ffcb163bf70'; // Replace with the valid ID

    console.log('Instructor ID:', instructorId);
    console.log('Backend URL:', `${backendUrl}/instructor/${instructorId}`);


// Parse the request URL for `downloadType` and `format`
const url = new URL(req.url);
const downloadType = url.searchParams.get('downloadType');
const format = url.searchParams.get('format') || 'json';

if (downloadType) {
  // Handle file download request
  const downloadUrl = `${backendUrl}/download-${downloadType}/${instructorId}?format=${format}`;
  const response = await axios.get(downloadUrl, {
    responseType: 'arraybuffer', // Ensure correct handling of binary data
  });

  return new NextResponse(response.data, {
    headers: {
      'Content-Type': response.headers['content-type'],
      'Content-Disposition': response.headers['content-disposition'] || '',
    },
  });
}


    
    // Fetch reports from the backend
    const [analyticsResponse, quizResultsResponse, contentEffectivenessResponse] = await Promise.all([
      axios.get(`${backendUrl}/instructor/${instructorId}`),
      axios.get(`${backendUrl}/quiz-results/${instructorId}`),
      axios.get(`${backendUrl}/content-effectiveness/${instructorId}`),
    ]);

    return NextResponse.json({
      analytics: analyticsResponse.data,
      quizResults: quizResultsResponse.data,
      contentEffectiveness: contentEffectivenessResponse.data,
    });
  } catch (error: any) {
    console.error('Error fetching reports:', error.message);
    return NextResponse.json(
      { error: 'Failed to fetch instructor reports' },
      { status: error.response?.status || 500 }
    );
  }
}
