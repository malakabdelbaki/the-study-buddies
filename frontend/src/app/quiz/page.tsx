// { user_id: "675f722a9d33c32a3f90d04c", module_id: "675f733844d8ccdfb2bb820d" }

//**********************************code that ask for the id's to be enterd works - calls another page to display quiz/quiz[id]****************************************** */

// "use client";

// import React, { useState } from "react";
// import { useRouter } from "next/navigation";

// const CreateQuizPage = () => {
//   const [moduleId, setModuleId] = useState("");
//   const [userId, setUserId] = useState("");
//   const [error, setError] = useState("");
//   const [successMessage, setSuccessMessage] = useState("");
//   const [loading, setLoading] = useState(false);
//   const router = useRouter();

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     setError("");
//     setSuccessMessage("");
//     setLoading(true);

//     if (!moduleId || !userId) {
//       setError("Module ID and User ID are required.");
//       setLoading(false);
//       return;
//     }

//     try {
//       const response = await fetch("/api/quiz", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ module_id: "675f733844d8ccdfb2bb820d", user_id: "675f722a9d33c32a3f90d04c" }),
//       });

//       if (!response.ok) {
//         const errorData = await response.json();
//         throw new Error(errorData.error || "Failed to create quiz");
//       }

//       const quiz = await response.json();
//       setSuccessMessage("Quiz created successfully!");

//       // Redirect to the quiz details page or handle the quiz object
//       setTimeout(() => {
//         router.push(`/quiz/${quiz._id}`); // Replace with the correct path if needed
//       }, 2000);
//     } catch (err: any) {
//       setError(err.message);
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="p-8 max-w-2xl mx-auto">
//       <h1 className="text-2xl font-bold mb-4">Create a New Quiz</h1>

//       <form onSubmit={handleSubmit} className="space-y-4">
//         <div>
//           <label htmlFor="moduleId" className="block font-medium mb-2">
//             Module ID
//           </label>
//           <input
//             type="text"
//             id="moduleId"
//             value={moduleId}
//             onChange={(e) => setModuleId(e.target.value)}
//             className="w-full p-2 border border-gray-300 rounded"
//             required
//           />
//         </div>

//         <div>
//           <label htmlFor="userId" className="block font-medium mb-2">
//             User ID
//           </label>
//           <input
//             type="text"
//             id="userId"
//             value={userId}
//             onChange={(e) => setUserId(e.target.value)}
//             className="w-full p-2 border border-gray-300 rounded"
//             required
//           />
//         </div>

//         {error && <p className="text-red-500 text-sm">{error}</p>}
//         {successMessage && <p className="text-green-500 text-sm">{successMessage}</p>}

//         <button
//           type="submit"
//           className="px-4 py-2 bg-green-500 text-white rounded"
//           disabled={loading}
//         >
//           {loading ? "Creating..." : "Create Quiz"}
//         </button>
//       </form>
//     </div>
//   );
// };

// export default CreateQuizPage;












"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

type Question= {
  module_id: string;// Foreign key to the Module schema
  instructor_id: string; // Reference to the instructor who created it
  question: string;
  options: Record<string, string>; // Matches the Record<string, string> format
  correct_answer:string;
  difficulty_level: string;
  question_type: string;

};

const QuizPage = () => {
  const [quiz, setQuiz] = useState<any>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const router = useRouter();


  useEffect(() => {
    const fetchQuiz = async () => {
      try {
        // // Extract user ID from the token
        // const { userId, token, role } = await getUserFromToken();
        // if (!token) throw new Error("Unauthorized: Token not found");

        // const decodedToken = jwtDecode(token.split("=")[1]);
        // const userId = (decodedToken as any)?.userid;
        // if (!userId) throw new Error("Unauthorized: User ID not found in token");

        // // Extract module ID from the URL
        // const urlParams = new URLSearchParams(window.location.search);
        // const moduleId = urlParams.get("moduleId");
        // if (!moduleId) throw new Error("Module ID not found in URL");

        // Fetch the quiz data from the API
        const response = await fetch("/api/quiz", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ module_id: "675f733844d8ccdfb2bb820d", user_id: "675f722a9d33c32a3f90d04c" }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Failed to fetch quiz data");
        }

        const quizData = await response.json();
        setQuiz(quizData);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchQuiz();
  }, []);

  console.log("in pages before loading",quiz);

  if (loading) return <div>Loading...</div>;
  if (error) return <div className="text-red-500">Error: {error}</div>;
  if (!quiz) return <div>No quiz found</div>;
  console.log("in pages after loading",quiz);

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">{quiz.title}</h1>
      <p className="mb-4">Quiz Type: {quiz.quiz_type}</p>
      <div className="space-y-4">
        {quiz.questions?.length > 0 ? (
          quiz.questions.map((question: Question, index: number) => (
            <div key={index} className="border p-4 rounded">
              <h2 className="font-medium mb-2">{index + 1}. {question.question}</h2>
              <ul className="space-y-2">
                {Object.keys(question.options).length > 0 ? (
                  Object.keys(question.options).map((key: string, idx: number) => (
                    <li key={idx}>
                      <button className="px-4 py-2 border rounded w-full text-left hover:bg-gray-100">
                        {question.options[key]}
                      </button>
                    </li>
                  ))
                ) : (
                  <li>No options available</li>
                )}
              </ul>
            </div>
          ))
        ) : (
          <p>No questions available for this quiz.</p>
        )}
      </div>
    </div>
  );
};

export default QuizPage;


