"use client";


import React, { useState, useEffect } from "react";
import { Module } from "@/types/Module";
import { fetchModuleResources, getModule, rateModule } from "@/app/api/courses/instructor/moduleRoute";
import fetchCourse from "@/app/api/courses/general/getCourseDetails";
import { Question } from "@/types/Question";
import ResourceCard from "@/components/course/instructor/resourceCard";
import { Resource } from "@/types/Resource";
import { useRouter } from "next/navigation";
import { Course } from "@/types/Course";
import { Button } from "@/components/ui/button"; // Adjust the import path as necessary

import { useAuthorization } from "@/hooks/useAuthorization";


const ModuleDetails = ({ params }: { params: Promise<{ moduleId: string, courseId:string }> }) => {
  useAuthorization(['student'])
  const router = useRouter();
  const [module, setModule] = useState<Module>();
  const [course, setCourse] = useState<Course>();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [resources, setResources] = useState<Resource[]>([]);
  const [ModuleRating, setModuleRating] = useState<number>(0);

  useEffect(() => {
    async function handleNotes() {
      const courseId = await params.then((p) => p.courseId);
      const moduleId = await params.then((p) => p.moduleId);
      const course = await fetchCourse(courseId);
      if ('message' in course) {
        console.error(course.message);
      } else {
        setCourse(course);
      }
    }
    handleNotes();
  }, []);
  
  const handleRedirectToNotes = () => {
    router.push(`/notes?courseId=${course?._id}&moduleId=${module?._id}`);
  };

  useEffect(() => {
    async function loadModule() {
      const { moduleId } = await params;
      const fetchedModule = await getModule(moduleId);
      const fetchedResources = await fetchModuleResources(moduleId);


      setModule(fetchedModule);
      //setEditedModule(fetchedModule);
     

      const sortedResources = fetchedResources.sort((a: { updatedAt: string | number | Date; }, b: { updatedAt: string | number | Date; }) => {
        const dateA = new Date(a.updatedAt).getTime();
        const dateB = new Date(b.updatedAt).getTime();
        return dateB - dateA; // Descending order (most recent first)
      });

      setResources(sortedResources);
    }


    loadModule();
  }, []);


  async function handleRatingClick(star: number) {
      const {moduleId} = await params
      setModuleRating(star);
      const response = await rateModule(moduleId,star);
      console.log(response);
    
  }


  // StudCourses/675f733844d8ccdfb2bb820a/modules/675f733844d8ccdfb2bb820d
  const handelTakeQuiz = async () => {
    console.log("take quiz clicked")
    console.log("module id ", module);
    
    try{
      const response = await fetch(`/api/quiz`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          module_id: module?._id,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Quiz error response:", errorData);
        throw new Error(errorData.error || "Failed to submit quiz");
      }
    
      const responseData = await response.json();
    
      // Redirect to /quiz/submit and pass data via query parameters
      router.push(`/quiz?data=${encodeURIComponent(JSON.stringify(responseData))}`);
    } catch (error) {
      console.error("Error taking quiz:", error);
    }

  }



  if (!module) {
    return <p>Loading module details...</p>;
  }


  return (
    <div className="module-details p-6 max-w-4xl mx-auto bg-gray-100 shadow-lg rounded-lg">
    <h1 className="text-4xl font-bold mb-6 text-center text-blue-600">
      {(
        module.title
      )}
    </h1>
  
    <div className="bg-white shadow-md rounded-lg p-6 mb-6">
    <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700">Difficulty Level : </label>
        {(
          <p className="text-gray-800">{module.quiz_type}</p>
        )}
      </div>
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700">Quiz Type:</label>
        { (
          <p className="text-gray-800">{module.quiz_type}</p>
        )}
      </div>
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700">Quiz Length:</label>
        { (
          <p className="text-gray-800">{module.quiz_length}</p>
        )}
      </div>
      
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700">Content:</label>
        { (
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
       {/* Rating */}
     <div className="text-lg text-gray-700 mb-4">
          <span className="font-semibold">Rate this course:</span>
          <div className="flex items-center space-x-2 mt-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                onClick={() => handleRatingClick(star)}
                className={`text-2xl ${
                  ModuleRating >= star ? "text-yellow-500" : "text-gray-400"
                } hover:text-yellow-500`}
              >
                ★
              </button>
            ))}
          </div>
      </div>
      <div className="mb-4 text-sm text-gray-600">
      <button
        className="px-6 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        onClick={() => handelTakeQuiz()}
      >
        Take Quiz
      </button>
      </div>
      
    </div>
  
  
    {course?.isNoteEnabled && (
        <Button
          className="mt-4 bg-baby-blue text-navy"
          onClick={handleRedirectToNotes}
        >
          Go to Notes
        </Button>
      )}

    {/* Resources Section */}
    <div className="resources mt-6">
      <h2 className="text-3xl font-bold mb-4 text-gray-800">Resources</h2>
      {resources.map((res: any) => (
        <ResourceCard key={res._id} userRole='student' onDelete={()=>{}} onUpdate={()=>{}} resource={res} />
      ))}
     
    </div>
  </div>
  )  
};


export default ModuleDetails;
