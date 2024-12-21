"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

type Question = {
  _id: string;
  module_id: string; // Foreign key to the Module schema
  instructor_id: string; // Reference to the instructor who created it
  question: string;
  options: Record<string, string>; // Matches the Record<string, string> format
  correct_answer: string;
  difficulty_level: string;
  question_type: string;
};

const QuizPage = () => {
  const [quiz, setQuiz] = useState<any>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const [userChoices, setUserChoices] = useState<Record<string, string>>({});

  const handleChoice = (questionId: string, choice: string) => {
    setUserChoices((prev) => ({
      ...prev,
      [questionId]: choice, // Update or set the choice for the specific question ID
    }));
  };

  const handleSubmit = async (quiz_id: string , user_answers:Record<string, string>) => {
    console.log("clicked submit")
    console.log("quiz id ", quiz_id)
    console.log("user answers  ", user_answers)
  
    try {
      const response = await fetch(`/api/quiz/${quiz_id}/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_answers: user_answers,
        }),
      });
    
      if (!response.ok) {
        const errorData = await response.json();
        console.error("Submission error response:", errorData);
        throw new Error(errorData.error || "Failed to submit quiz");
      }
    
      const responseData = await response.json();
    
      // Redirect to /quiz/submit and pass data via query parameters
      router.push(`/quiz/submit?data=${encodeURIComponent(JSON.stringify(responseData))}`);
    } catch (error) {
      console.error("Error submitting quiz:", error);
    }
  };

  useEffect(() => {
    const fetchQuiz = async () => {
      try {
        // Fetch the quiz data from the API
        const response = await fetch("/api/quiz", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
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

  console.log("in pages before loading", quiz);

  if (loading) return <div>Loading...</div>;
  if (error) return <div className="text-red-500">Error: {error}</div>;
  if (!quiz) return <div>No quiz found</div>;
  console.log("in pages after loading", quiz);

  console.log("user answer", userChoices);
  console.log("quiz questions", quiz.questions);
  console.log("quiz questions", quiz.questions[1]._id);

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">{quiz.title}</h1>
      <p className="mb-4">Quiz Type: {quiz.quiz_type}</p>
      <div className="space-y-4">
        {quiz.questions?.length > 0 ? (
          quiz.questions.map((question: Question) => (
            <div key={question._id} className="border p-4 rounded">
              <h2 className="font-medium mb-2">
                {question._id}. {question.question}
              </h2>
              <ul className="space-y-2">
                {Object.keys(question.options).length > 0 ? (
                  Object.keys(question.options).map((key: string, idx: number) => (
                    <li key={`${question._id}-${key}`}>
                      <button
                        className={`px-4 py-2 border rounded w-full text-left hover:bg-gray-100 ${
                          userChoices[question._id] === key ? "bg-blue-100" : ""
                        }`}
                        onClick={() => handleChoice(question._id, key)}
                      >
                        {key}. {question.options[key]}
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
      {/* Submit Button */}
      <div className="mt-8">
        <button
          className="px-6 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          onClick={() => handleSubmit(quiz.quiz_id, userChoices)}
        >
          Submit
        </button>
      </div>
    </div>
  );
};

export default QuizPage;
