"use client";

import React, { useState, useEffect } from "react";
import { Module } from "@/types/Module";
import { addQuestionToModule, fetchModuleResources, fetchQuestionBank, getModule, updateModule, updateQuestionInModule } from "@/app/api/courses/instructor/moduleRoute";
import AddQuestionForm from "@/components/course/instructor/QuestionInput";
import { Question } from "@/types/Question";
import QuestionCard from "@/components/course/instructor/questionCard";

const ModuleDetails = ({ params }: { params: Promise<{ moduleId: string }> }) => {
  const [module, setModule] = useState<Module>();
  const [isEditing, setIsEditing] = useState(false);
  const [editedModule, setEditedModule] = useState<Module>();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [resources, setResources] = useState([]);
  const [newQuestion, setNewQuestion] = useState({ content: "" });
  const [newResource, setNewResource] = useState<File | null>(null);

  useEffect(() => {
    async function loadModule() {
      const { moduleId } = await params;
      const fetchedModule = await getModule(moduleId);
      const fetchedQuestions = await fetchQuestionBank(moduleId);
      const fetchedResources = await fetchModuleResources(moduleId);

      setModule(fetchedModule);
      //setEditedModule(fetchedModule);
      setQuestions(fetchedQuestions);
      console.log(questions);
      setResources(fetchedResources);
    }

    loadModule();
  }, []);

  const handleSaveModule = async () => {
    if (editedModule) {
      const { moduleId } = await params;
      await updateModule(moduleId, editedModule);
      setModule(await getModule(moduleId));
      setIsEditing(false);
    }
  };

  const handleAddQuestion = async () => {
    const { moduleId } = await params;
    await addQuestionToModule({ ...newQuestion, module_id:moduleId });
    setQuestions(await fetchQuestionBank(moduleId));
    setNewQuestion({ content: "" });
  };

  const handleUpdateQuestion = (updatedQuestion: Question) => {
    setQuestions((prev) =>
      prev.map((q) => (q._id === updatedQuestion._id ? updatedQuestion : q))
    );
  };

  const handleAddResource = async () => {
    if (newResource) {
      const { moduleId } = await params;
      const formData = new FormData();
      formData.append("file", newResource);
      formData.append("moduleId", moduleId);
      await addResourceToModule(formData);
      setResources(await fetchModuleResources(moduleId));
      setNewResource(null);
    }
  };

  if (!module) {
    return <p>Loading module details...</p>;
  }

  return (
    <div className="module-details p-6 max-w-4xl mx-auto">
      <h1 className="text-4xl font-bold mb-4 text-center">
        {isEditing ? (
          <input
            type="text"
            value={editedModule?.title || ""}
            onChange={(e) => setEditedModule({ ...editedModule, title: e.target.value })}
            className="text-center"
          />
        ) : (
          module.title
        )}
      </h1>

      <div className="bg-white shadow-md rounded-lg p-6">
        <div className="mb-4">
          <label>Quiz Type:</label>
          {isEditing ? (
            <input
              type="text"
              value={editedModule?.quiz_type || ""}
              onChange={(e) => setEditedModule({ ...editedModule, quiz_type: e.target.value })}
            />
          ) : (
            <p>{module.quiz_type}</p>
          )}
        </div>
        <div className="mb-4">
          <label>Quiz Length:</label>
          {isEditing ? (
            <input
              type="number"
              value={editedModule?.quiz_length || 0}
              onChange={(e) => setEditedModule({ ...editedModule, quiz_length: +e.target.value })}
            />
          ) : (
            <p>{module.quiz_length}</p>
          )}
        </div>
        <div className="mb-4">
          <label>Content:</label>
          {isEditing ? (
            <textarea
              value={editedModule?.content || ""}
              onChange={(e) => setEditedModule({ ...editedModule, content: e.target.value })}
            />
          ) : (
            <p>{module.content}</p>
          )}
        </div>

        <div className="mb-4">
          <p>Ratings: {module.ratings?.size || 0}</p>
        </div>
        <div className="mb-4">
          <p>Number of Resources: {resources.length}</p>
        </div>
        <div className="mb-4">
          <p>Number of Questions: {questions.length}</p>
        </div>

        {isEditing ? (
          <button onClick={handleSaveModule} className="bg-green-500 text-white px-4 py-2">
            Save
          </button>
        ) : (
          <button onClick={() => setIsEditing(true)} className="bg-blue-500 text-white px-4 py-2">
            Edit
          </button>
        )}
      </div>



      {/* ______________________________________________Questions ____________________________________*/}
      
      
      
      
      <div className="questions mt-6">
      <div>
      <h2 className="text-3xl font-bold mb-4">Questions</h2>
        {/* {questions.map((q) => (
         <QuestionCard
          key={q._id}
          Onequestion={q}
          onUpdate={handleUpdateQuestion}
        />
      ))} */}
    </div>
        
         <AddQuestionForm
          moduleId={module._id as string}
          InstructorId={module.instructor_id as string}  
        />
      </div>

      {/* Resources */}
      <div className="resources mt-6">
        <h2 className="text-3xl font-bold mb-4">Resources</h2>
        {resources.map((res: any) => (
          <div key={res.id} className="mb-4">
            <a href={res.url} target="_blank" className="text-blue-500 underline">
              {res.name}
            </a>
          </div>
        ))}
        <div className="add-resource">
          <input
            type="file"
            onChange={(e) => setNewResource(e.target.files?.[0] || null)}
            className="mb-2"
          />
          <button onClick={handleAddResource} className="bg-green-500 text-white px-4 py-2">
            Upload Resource
          </button>
        </div>
      </div>
    </div>
  );
};

export default ModuleDetails;
function addResourceToModule(formData: FormData) {
    throw new Error("Function not implemented.");
}

