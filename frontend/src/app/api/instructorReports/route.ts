import { NextResponse } from 'next/server';
import axios from 'axios';

const backendUrl = 'http://localhost:3000/api/performance';

export async function GET(req: Request) {
  try {
    // Hardcoded instructor ID
    const instructorId = '6763f0bdca036ffcb163bf70'; // Replace with the valid ID

    console.log('Instructor ID:', instructorId);
    console.log('Backend URL:', `${backendUrl}/instructor/${instructorId}`);

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
