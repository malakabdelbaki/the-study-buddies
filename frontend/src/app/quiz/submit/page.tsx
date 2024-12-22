// "use client";

// import { useSearchParams } from 'next/navigation';

// type Answer = {
//     _id: string;
//     question_id: string; // Foreign key to the Module schema
//     selectedAnswer: string; // Reference to the instructor who created it
//     isCorrect: string;
//   };

//   type Question = {
//     _id: string;
//     module_id: string; // Foreign key to the Module schema
//     instructor_id: string; // Reference to the instructor who created it
//     question: string;
//     options: Record<string, string>; // Matches the Record<string, string> format
//     correct_answer: string;
//     difficulty_level: string;
//     question_type: string;
//   };


// const QuizSubmitPage = () => {
//   const searchParams = useSearchParams();
//   const data = searchParams.get('data');

//   const responseData = data && typeof data === 'string' ? JSON.parse(data) : null;

//   // Function to determine conditional text based on score
//   const getFeedbackMessage = (score: number) => {
//     if (score < 30) {
//       return "Don't be discouraged! Take some time to review the module and give the quiz another shot. You've got this!";
//     } else if (score < 50) {
//       return "You're on the right path, but there’s room for improvement. Review the content and don't hesitate to ask for help through fourms and chats.";
//     } else if (score < 80) {
//       return "Great effort! With a little more practice, you'll master the concepts. Keep up the hard work!";
//     } else if (score <= 100) {
//       return "Fantastic job! Keep it up and continue to shine!";
//     }
//     return "Invalid score.";
//   };

// return (
//     <div className="p-8 max-w-2xl mx-auto">
//       <h1 className="text-2xl font-bold mb-4">Quiz Submission Result</h1>
//       {responseData ? (
//         <div className="space-y-4">
//           {/* General Quiz Info */}
//           <div className="border p-4 rounded">
//             <h2 className="text-xl font-medium mb-2">Quiz Details</h2>
//             <p>
//               <strong>Quiz ID:</strong> {responseData.quiz_id}
//             </p>
//             <p>
//               <strong>User ID:</strong> {responseData.user_id}
//             </p>
//             <p>
//               <strong>Score:</strong> {responseData.score}
//             </p>
//             <p className="mt-4 text-lg font-semibold">
//               {getFeedbackMessage(responseData.score)}
//             </p>
//           </div>

//           {/* Individual Question Results */}
//           <h2 className="text-xl font-medium mb-4">Question Results</h2>
//           {responseData.answers.length > 0 ? (
//             responseData.answers.map((answer: Answer) => {
//               // Find the matching question for the current answer
//               const question: Question | undefined = responseData.questions.find(
//                 (q: Question) => q._id.toString() === answer.question_id.toString()
//               );

//               return (
//                 <div key={answer._id} className="border p-4 rounded">
//                   <h3 className="font-medium mb-2">
//                     {question ? question.question : "Question not found"}
//                   </h3>
//                   {question && (
//                     <ul className="space-y-2 mb-2">
//                       {question.options &&
//                         Object.entries(question.options).map(([key, value]) => (
//                           <li
//                             key={key}
//                             className={`px-4 py-2 border rounded w-full text-left ${
//                               answer.selectedAnswer === key
//                                 ? "bg-blue-100"
//                                 : ""
//                             }`}
//                           >
//                             {key}. {value as string}
//                           </li>
//                         ))}
//                     </ul>
//                   )}
//                   <p className="mb-2">
//                     <strong>Selected Answer:</strong> {answer.selectedAnswer}
//                   </p>
//                   <p className="mb-2">
//                     <strong>Correct Answer:</strong>{" "}
//                     {question ? question.correct_answer : "Unknown"}
//                   </p>
//                   <p className="mb-2">
//                     <strong>Correct:</strong>{" "}
//                     <span
//                       className={`font-bold ${
//                         answer.isCorrect ? "text-green-600" : "text-red-600"
//                       }`}
//                     >
//                       {answer.isCorrect ? "Yes" : "No"}
//                     </span>
//                   </p>
//                 </div>
//               );
//             })
//           ) : (
//             <p>No answers available.</p>
//           )}
//         </div>
//       ) : (
//         <p>Loading submission results...</p>
//       )}
//     </div>
//   );
// };

// export default QuizSubmitPage;

/////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////

"use client";

import { useSearchParams } from "next/navigation";

type Answer = {
  _id: string;
  question_id: string;
  selectedAnswer: string;
  isCorrect: string;
};

type Question = {
  _id: string;
  module_id: string;
  instructor_id: string;
  question: string;
  options: Record<string, string>;
  correct_answer: string;
  difficulty_level: string;
  question_type: string;
};

const QuizSubmitPage = () => {
  const searchParams = useSearchParams();
  const data = searchParams.get("data");

  const responseData = data && typeof data === "string" ? JSON.parse(data) : null;

  const getFeedbackMessage = (score: number) => {
    if (score < 30) {
      return "Don't be discouraged! Take some time to review the module and give the quiz another shot. You've got this!";
    } else if (score < 50) {
      return "You're on the right path, but there’s room for improvement. Review the content and don't hesitate to ask for help through forums and chats.";
    } else if (score < 80) {
      return "Great effort! With a little more practice, you'll master the concepts. Keep up the hard work!";
    } else if (score <= 100) {
      return "Fantastic job! Keep it up and continue to shine!";
    }
    return "Invalid score.";
  };

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Quiz Submission Result</h1>
      {responseData ? (
        <div className="space-y-4">
          <div className="border p-4 rounded">
            <h2 className="text-xl font-medium mb-2">Quiz Details</h2>
            <p>
              <strong>Quiz title:</strong> {responseData.quiz_title}
            </p>
            <p>
              <strong>Student:</strong> {responseData.user_name}
            </p>
            <p>
              <strong>Score:</strong> {responseData.score}
            </p>
            <p className="mt-4 text-lg font-semibold">
              {getFeedbackMessage(responseData.score)}
            </p>
          </div>

          <h2 className="text-xl font-medium mb-4">Question Results</h2>
          {responseData.answers.length > 0 ? (
            responseData.answers.map((answer: Answer) => {
              const question: Question | undefined = responseData.questions.find(
                (q: Question) => q._id.toString() === answer.question_id.toString()
              );

              return (
                <div key={answer._id} className="border p-4 rounded">
                  <h3 className="font-medium mb-2">
                    {question ? question.question : "Question not found"}
                  </h3>
                  {question && (
                    <ul className="space-y-2 mb-2">
                      {Object.entries(question.options).map(([key, value]) => {
                        const isCorrectAnswer = key === question.correct_answer;
                        const isSelectedAnswer = key === answer.selectedAnswer;

                        return (
                          <li
                            key={key}
                            className={`px-4 py-2 border rounded w-full text-left ${
                              isCorrectAnswer
                                ? "bg-green-100 border-green-600"
                                : isSelectedAnswer && !answer.isCorrect
                                ? "bg-red-100 border-red-600"
                                : ""
                            }`}
                          >
                            {key}. {value}
                          </li>
                        );
                      })}
                    </ul>
                  )}
                  <p className="mb-2">
                    <strong>Selected Answer:</strong> {answer.selectedAnswer}
                  </p>
                  <p className="mb-2">
                    <strong>Correct Answer:</strong>{" "}
                    {question ? question.correct_answer : "Unknown"}
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
              );
            })
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
