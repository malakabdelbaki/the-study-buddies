"use client";


import React, { useState, useEffect } from "react";
import { Module } from "@/types/Module";
import { addQuestionToModule, deleteModuleResource, deleteQuestionFromModule, fetchModuleResources, fetchQuestionBank, getModule, updateModule, updateQuestionInModule, updateResourceMetadata } from "@/app/api/courses/instructor/moduleRoute";
import AddQuestionForm from "@/components/course/instructor/QuestionInput";
import { Question } from "@/types/Question";
import QuestionCard from "@/components/course/instructor/questionCard";
import AddResourceForm from "@/components/course/instructor/ResourceInput";
import ResourceCard from "@/components/course/instructor/resourceCard";
import { Resource } from "@/types/Resource";


const ModuleDetails = ({ params }: { params: Promise<{ moduleId: string }> }) => {
  const [module, setModule] = useState<Module>();
  const [isEditing, setIsEditing] = useState(false);
  const [editedModule, setEditedModule] = useState<Module>();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [resources, setResources] = useState<Resource[]>([]);



  useEffect(() => {
    async function loadModule() {
      const { moduleId } = await params;
      const fetchedModule = await getModule(moduleId);
      const fetchedQuestions = await fetchQuestionBank(moduleId);
      const fetchedResources = await fetchModuleResources(moduleId);


      setModule(fetchedModule);
      //setEditedModule(fetchedModule);
      setQuestions(fetchedQuestions as Question[]);
      console.log(questions);

      const sortedResources = fetchedResources.sort((a: { updatedAt: string | number | Date; }, b: { updatedAt: string | number | Date; }) => {
        const dateA = new Date(a.updatedAt).getTime();
        const dateB = new Date(b.updatedAt).getTime();
        return dateB - dateA; // Descending order (most recent first)
      });

      setResources(sortedResources);
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



  const handleUpdateQuestion =async (updatedQuestion: Question) => {
    let updated = await updateQuestionInModule(updatedQuestion._id as string,updatedQuestion);
    setQuestions((prev) =>
      prev.map((q) => (q._id === updatedQuestion._id ? updatedQuestion : q))
    );
  };


  const handleUpdateResource = async (updatedResource: any) => {
    let updated = await updateResourceMetadata(updatedResource._id,updatedResource);
    console.log(updated);
    setResources((prev) =>
      prev.map((resource) =>
        resource._id === updatedResource._id ? updatedResource : resource
      )
    );

  };

  const handleDeleteResource = async (resourceId: string) => {
    let deleted = await deleteModuleResource(resourceId);
    console.log(deleted);
    setResources((prev) => prev.filter((resource) => resource._id !== resourceId));
  };

  const handleDeleteQuestion = async (questionId: string) => {
    let deleted = await deleteQuestionFromModule(questionId);
    console.log(deleted);
    setQuestions((prev) => prev.filter((ques) => ques._id !== questionId));
  };


  if (!module) {
    return <p>Loading module details...</p>;
  }


  return (
    <div className="module-details p-6 max-w-4xl mx-auto bg-gray-100 shadow-lg rounded-lg">
    <h1 className="text-4xl font-bold mb-6 text-center text-blue-600">
      {isEditing ? (
        <input
          type="text"
          value={editedModule?.title || ""}
          onChange={(e) => setEditedModule({ ...editedModule, title: e.target.value })}
          className="text-center border border-gray-300 rounded px-2 py-1 w-full focus:outline-none focus:ring focus:ring-blue-300"
        />
      ) : (
        module.title
      )}
    </h1>
  
    <div className="bg-white shadow-md rounded-lg p-6 mb-6">
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700">Quiz Type:</label>
        {isEditing ? (
          <input
            type="text"
            value={editedModule?.quiz_type || ""}
            onChange={(e) => setEditedModule({ ...editedModule, quiz_type: e.target.value })}
            className="border border-gray-300 rounded px-2 py-1 w-full focus:outline-none focus:ring focus:ring-blue-300"
          />
        ) : (
          <p className="text-gray-800">{module.quiz_type}</p>
        )}
      </div>
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700">Quiz Length:</label>
        {isEditing ? (
          <input
            type="number"
            value={editedModule?.quiz_length || 0}
            onChange={(e) => setEditedModule({ ...editedModule, quiz_length: +e.target.value })}
            className="border border-gray-300 rounded px-2 py-1 w-full focus:outline-none focus:ring focus:ring-blue-300"
          />
        ) : (
          <p className="text-gray-800">{module.quiz_length}</p>
        )}
      </div>
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700">Content:</label>
        {isEditing ? (
          <textarea
            value={editedModule?.content || ""}
            onChange={(e) => setEditedModule({ ...editedModule, content: e.target.value })}
            className="border border-gray-300 rounded px-2 py-1 w-full focus:outline-none focus:ring focus:ring-blue-300"
          />
        ) : (
          <p className="text-gray-800">{module.content}</p>
        )}
      </div>
  
      <div className="mb-4 text-sm text-gray-600">
        <p>Ratings:  {module.ratings?.values
    ? (Array.from(module.ratings.values()).reduce((sum, value) => sum + value, 0) /
       Array.from(module.ratings.values()).length).toFixed(2)
    : 0} / 5</p>
      </div>
      <div className="mb-4 text-sm text-gray-600">
        <p>Number of Resources: {resources.length}</p>
      </div>
      <div className="mb-4 text-sm text-gray-600">
        <p>Number of Questions: {questions.length}</p>
      </div>
  
      
    </div>
  
    {/* Questions Section */}
    <div className="questions mt-6">
      <div>
        <h2 className="text-3xl font-bold mb-4 text-gray-800">Questions</h2>
        {questions.map((q) => (
          <QuestionCard key={q._id} Onequestion={q} onUpdate={handleUpdateQuestion} onDelete={handleDeleteQuestion} />
        ))}
      </div>
    </div>
  
    {/* Resources Section */}
    <div className="resources mt-6">
      <h2 className="text-3xl font-bold mb-4 text-gray-800">Resources</h2>
      {resources.map((res: any) => (
        <ResourceCard key={res._id} onDelete={handleDeleteResource} onUpdate={handleUpdateResource} resource={res} />
      ))}
     
    </div>
  </div>
  )  
};


export default ModuleDetails;
