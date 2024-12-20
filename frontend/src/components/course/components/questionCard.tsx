import { Question } from '@/types/Question';
import React, { useState } from 'react';

type QuestionCardProps = {
  Onequestion: Question;
  onUpdate: (updatedQuestion: Question) => void;
};

const QuestionCard: React.FC<QuestionCardProps> = ({ Onequestion, onUpdate }) => {
  const [isEditing, setIsEditing] = useState(false);

  // Initialize options with a default value if undefined
  const [editedQuestion, setEditedQuestion] = useState<Question>({
    ...Onequestion,
    options: Onequestion.options as Record<string,string> || { a: '', b: '', c: '', d: '' },
  });

  const handleInputChange = (field: keyof Question, value: string) => {
    setEditedQuestion((prev) => ({ ...prev, [field]: value }));
  };

  const handleOptionChange = (key: string, value: string) => {
    setEditedQuestion((prev) => ({
      ...prev,
      options: { ...prev.options, [key]: value },
    }));
  };

//   const handleAddOption = () => {
//     const newKey = String.fromCharCode(97 + Object.keys(editedQuestion.options).length); // 'a', 'b', 'c', etc.
//     setEditedQuestion((prev) => ({
//       ...prev,
//       options: { ...prev.options, [newKey]: '' },
//     }));
//   };

//   const handleRemoveOption = (key: string) => {
//     const { [key]: _, ...remainingOptions } = editedQuestion.options;
//     setEditedQuestion((prev) => ({
//       ...prev,
//       options: remainingOptions,
//     }));
//   };

  const handleSave = () => {
    onUpdate(editedQuestion);
    setIsEditing(false);
  };

  return (
    <div className="border p-4 mb-4 rounded">
      {isEditing ? (
        <>
          <input
            type="text"
            value={editedQuestion.question}
            onChange={(e) => handleInputChange('question', e.target.value)}
            className="border p-2 w-full mb-2"
            placeholder="Enter question"
          />
          <div className="mb-2">
            <label className="font-bold block mb-1">Question Type:</label>
            <select
              value={editedQuestion.question_type}
              onChange={(e) => handleInputChange('question_type', e.target.value)}
              className="border p-2 w-full"
            >
              <option value="mcq">MCQ</option>
              <option value="trueFalse">True/False</option>
            </select>
          </div>

          {editedQuestion.question_type === 'mcq' && (
            <div>
              <label className="font-bold block mb-1">Options:</label>
              {Object.entries(editedQuestion.options || {}).map(([key, value]) => (
                <div key={key} className="flex items-center mb-2">
                  <input
                    type="text"
                    value={value}
                    onChange={(e) => handleOptionChange(key, e.target.value)}
                    placeholder={`Option ${key.toUpperCase()}`}
                    className="border p-2 flex-grow mr-2"
                  />
                  {/* <button
                    onClick={() => handleRemoveOption(key)}
                    className="bg-red-500 text-white px-2 py-1"
                  >
                    Remove
                  </button> */}
                </div>
              ))}
              {/* <button
                onClick={handleAddOption}
                className="bg-blue-500 text-white px-4 py-2 mt-2"
              >
                Add Option
              </button> */}
            </div>
          )}

          <div className="mb-2">
            <label className="font-bold block mb-1">Correct Answer:</label>
            <input
              type="text"
              value={editedQuestion.correct_answer}
              onChange={(e) => handleInputChange('correct_answer', e.target.value)}
              className="border p-2 w-full"
              placeholder="Enter correct answer"
            />
          </div>

          <button
            onClick={handleSave}
            className="bg-green-500 text-white px-4 py-2 mr-2"
          >
            Save
          </button>
          <button
            onClick={() => setIsEditing(false)}
            className="bg-gray-500 text-white px-4 py-2"
          >
            Cancel
          </button>
        </>
      ) : (
        <>
          <h3 className="text-xl font-bold mb-2">{Onequestion.question}</h3>
          <p className="mb-2">
            <span className="font-bold">Type:</span> {Onequestion.question_type}
          </p>
          {Onequestion.question_type === 'mcq' && (
            <ul className="mb-2">
              {Object.entries(Onequestion.options || {}).map(([key, value]) => (
                <li key={key}>
                  <span className="font-bold">{key.toUpperCase()}:</span> {value}
                </li>
              ))}
            </ul>
          )}
          <p className="mb-2">
            <span className="font-bold">Correct Answer:</span> {Onequestion.correct_answer}
          </p>
          <button
            onClick={() => setIsEditing(true)}
            className="bg-blue-500 text-white px-4 py-2"
          >
            Edit
          </button>
        </>
      )}
    </div>
  );
};

export default QuestionCard;
