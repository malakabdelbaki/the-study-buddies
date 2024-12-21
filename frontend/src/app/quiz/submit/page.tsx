// import { NextResponse } from 'next/server';
// import { cookies } from 'next/headers';
// import { decode } from 'jsonwebtoken';
// import axios from 'axios';

// // Helper to decode JWT and extract user info
// const getUserFromToken = async () => {
//   const cookieStore = await cookies();
//   const tokenCookie = cookieStore.get('token');

//   if (!tokenCookie) throw new Error('Unauthorized');
//   const decodedToken = decode(tokenCookie.value);

//   if (!decodedToken || (decodedToken as any)?.exp * 1000 < Date.now()) {
//     throw new Error('Token Expired');
//   }

//   return {
//     userId: (decodedToken as any)?.userid,
//     role: (decodedToken as any)?.role,
//     token: tokenCookie.value, // Include the raw token for external requests
//   };
// };

// // POST: Submit quiz response
// export async function POST(req: Request, { params }: { params: { quiz_id: string } }) {
//   try {
//     // Extract quiz_id from the URL params
//     const { quiz_id } = params;

//     if (!quiz_id) {
//       return NextResponse.json(
//         { error: 'Missing required field: quiz_id' },
//         { status: 400 }
//       );
//     }

//     // Extract user information from the token
//     const { userId, token } = await getUserFromToken();

//     // Parse the request body
//     const body = await req.json();
//     const { user_answers } = body;

//     if (!user_answers) {
//       return NextResponse.json(
//         { error: 'Missing required field: user_answers' },
//         { status: 400 }
//       );
//     }

//     // Make an external API call to submit the quiz response
//     const apiUrl = `${process.env.EXTERNAL_API_URL || 'http://localhost:3000/api'}/quizzes/${quiz_id}/submit`;
//     const response = await axios.post(
//       apiUrl,
//       {
//         user_id: userId,
//         user_answers,
//       },
//       {
//         headers: { Authorization: `Bearer ${token}` },
//       }
//     );

//     // Return the response from the external API
//     return NextResponse.json(response.data);
//   } catch (error: any) {
//     console.error('Error submitting quiz response:', error);

//     if (error.response) {
//       // Handle external API errors
//       return NextResponse.json(
//         { error: error.response.data },
//         { status: error.response.status }
//       );
//     }

//     // Handle other errors
//     return NextResponse.json(
//       { error: error.message || 'Internal Server Error' },
//       { status: 500 }
//     );
//   }
// }

"use client";

import { useSearchParams } from 'next/navigation';

type Answer = {
    _id: string;
    question_id: string; // Foreign key to the Module schema
    selectedAnswer: string; // Reference to the instructor who created it
    isCorrect: string;
  };


const QuizSubmitPage = () => {
  const searchParams = useSearchParams();
  const data = searchParams.get('data');

  const responseData = data && typeof data === 'string' ? JSON.parse(data) : null;

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Quiz Submission Result</h1>
      {responseData ? (
        <div className="space-y-4">
          {/* General Quiz Info */}
          <div className="border p-4 rounded">
            <h2 className="text-xl font-medium mb-2">Quiz Details</h2>
            <p>
              <strong>Quiz ID:</strong> {responseData.quiz_id}
            </p>
            <p>
              <strong>User ID:</strong> {responseData.user_id}
            </p>
            <p>
              <strong>Score:</strong> {responseData.score}
            </p>
            <p>
              <strong>Submitted At:</strong> {new Date(responseData.submittedAt).toLocaleString()}
            </p>
          </div>
  
          {/* Individual Answers */}
          <h2 className="text-xl font-medium mb-4">Answers</h2>
          {responseData.answers.length > 0 ? (
            responseData.answers.map((answer: Answer) => (
              <div key={answer._id} className="border p-4 rounded">
                <h3 className="font-medium mb-2">
                  Question ID: {answer.question_id}
                </h3>
                <p className="mb-2">
                  <strong>Selected Answer:</strong> {answer.selectedAnswer}
                </p>
                <p className="mb-2">
                  <strong>Correct:</strong>{" "}
                  <span
                    className={`font-bold ${
                      answer.isCorrect ? "text-green-600" : "text-red-600"
                    }`}
                  >
                    {answer.isCorrect ? "Yes" : "No"}
                  </span>
                </p>
              </div>
            ))
          ) : (
            <p>No answers available.</p>
          )}
        </div>
      ) : (
        <p>Loading submission results...</p>
      )}
    </div>
  );
  
};

export default QuizSubmitPage;
