import React, { useState } from 'react';
import { addQuestionToModule } from '../../../app/api/courses/instructor/moduleRoute';
import { stringify } from 'querystring';

const AddQuestionForm = ({moduleId,InstructorId}:{moduleId:string,InstructorId:string}) => {
  const [newQuestion, setNewQuestion] = useState({
    question: '',
    question_type: 'mcq',
    options: {} as Record<string,string>,
    difficulty_level: 'easy',
    correct_answer: '',
    module_id:moduleId,
    instructor_id:InstructorId
  });

  // Handle input changes for text fields
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewQuestion((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Handle changes for select fields
  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    if(name==='difficulty_level'){
      setNewQuestion((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
    else{ 
      if (value==='mcq'){
        setNewQuestion((prev) => ({
          ...prev,
          [name]: value,
          options: {a:"",b:"",c:"",d:""}
        }));
      }
      else {
        setNewQuestion((prev) => ({
          ...prev,
          [name]: value,
          options: {a:"",b:""}
        }));
      }
    }
  };

  // Handle changes for options
  const handleOptionChange = (key: string, value: string) => {
    setNewQuestion((prev) => ({
      ...prev,
      options: {
        ...prev.options,
        [key]: value,
      },
    }));
    console.log(newQuestion);
  };

  const handleAddQuestion = async () => {
    console.log('New Question:', newQuestion);
    const ques = await addQuestionToModule(newQuestion);
    setNewQuestion({
      question: '',
      question_type: 'mcq',
      options: { a: '', b: '', c: '', d: '' },
      difficulty_level: 'easy',
      correct_answer: '',
      module_id:moduleId,
      instructor_id:InstructorId
    });
  };

  return (
    <div className="add-question">
        <h1>
            Add A New Question
        </h1>
      <div>
        <input
          type="text"
          name="question"
          value={newQuestion.question}
          onChange={handleInputChange}
          placeholder="New Question"
          className="border p-2 w-full mb-2"
        />

        {/* Question Type */}
        <select
          name="question_type"
          value={newQuestion.question_type}
          onChange={handleSelectChange}
          className="border p-2 w-full mb-2"
        >
          <option value="mcq">MCQ</option>
          <option value="true/false">True/False</option>
        </select>

        {/* Options */}
        {newQuestion.question_type === 'mcq' ? (
          <>
            {Object.keys(newQuestion.options).map((key) => (
              <input
                key={key}
                type="text"
                value={newQuestion.options[key]}
                onChange={(e) => handleOptionChange(key, e.target.value)}
                placeholder={`Option ${key.toUpperCase()}`}
                className="border p-2 w-full mb-2"
              />
            ))}
          </>
        ) : (
          <>
            <input
              type="text"
              value={newQuestion.options['a']}
              onChange={(e) => handleOptionChange('a', e.target.value)}
              placeholder="Option A"
              className="border p-2 w-full mb-2"
            />
            <input
              type="text"
              value={newQuestion.options['b']}
              onChange={(e) => handleOptionChange('b', e.target.value)}
              placeholder="Option B"
              className="border p-2 w-full mb-2"
            />
          </>
        )}

        {/* Difficulty Level */}
        <select
          name="difficulty_level"
          value={newQuestion.difficulty_level}
          onChange={handleSelectChange}
          className="border p-2 w-full mb-2"
        >
          <option value="easy">Easy</option>
          <option value="medium">Medium</option>
          <option value="hard">Hard</option>
        </select>

        {/* Correct Answer */}
        <input
          type="text"
          name="correct_answer"
          value={newQuestion.correct_answer}
          onChange={handleInputChange}
          placeholder="Correct Answer"
          className="border p-2 w-full mb-2"
        />

        {/* Add Question Button */}
        <button onClick={handleAddQuestion} className="bg-blue-500 text-white px-4 py-2">
          Add Question
        </button>
      </div>
    </div>
  );
};

export default AddQuestionForm;
