"use client";

import React, { useEffect, useState } from "react";

import { Module } from "@/types/Module";
import { Course } from "@/types/Course";
import { User } from "@/types/User";
import { fetchCourseModules,fetchCourseById, fetchInstructor, updateCourse } from "../../../api/courses/instructor/courseRoute";
import ModuleCard from "../../../../components/course/general/moduleCard";
import { createModule } from "../../../api/courses/instructor/moduleRoute";
import { Types } from "mongoose";
import ForumPreview from "@/components/forum/ForumPreview";

const CourseDetails = ({ params }: { params: Promise<{ courseId: string }> }) => {
  const [course, setCourse] = useState<Course>();
  const [modules, setModules] = useState<Module[]>();
  const [Instructor,setInstructor] = useState<{id:string,role:string}>();
  const [isEditing, setIsEditing] = useState(false);
  const [editedCourse, setEditedCourse] = useState(() => ({
    ...course,
    key_words: course?.key_words || [], // Make sure key_words is always an array
  }));  const [newKeyword, setNewKeyword] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [newModule, setNewModule] = useState<Module>({title:'',content:'',quiz_type:'',quiz_length:0,module_difficulty:''});

  const handleInputChangeForm = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setNewModule({
      ...newModule,
      [e.target.name]: e.target.value,
    });
  };

  const handleAddModule = async () => {
      const {courseId} = await params;
      let data = await createModule({...newModule,course_id:courseId}); // Call the parent-provided function to add the module
      setModules(await fetchCourseModules(courseId));
      setNewModule({title:"",content:''}); // Reset form
      setShowForm(false); // Hide the form
      console.log(data);
  };



  const handleEditClick = () => {
    setIsEditing(true);
  };

  const handleSaveClick = async () => {
    // Call the API to save the updated course
    const {courseId} = await params;
    updateCourse(courseId,editedCourse);
    setIsEditing(false);
    setCourse( await fetchCourseById(courseId));
  };

  const handleInputChange = (e:any) => {
    const { name, value } = e.target;
    setEditedCourse({ ...editedCourse, [name]: value });
  };

  const handleKeywordChange = (e:any, index:any) => {
    const updatedKeywords = [...editedCourse?.key_words];
    updatedKeywords[index] = e.target.value;
    setEditedCourse({ ...editedCourse, key_words: updatedKeywords });
  };

  const addKeywordField = () => {
    setEditedCourse({
      ...editedCourse,
      key_words: [...(editedCourse.key_words || []), newKeyword], // Handle undefined case
    });
    setNewKeyword('');
  };


  useEffect(() => {
    async function loadCourse() {
      try {
        const { courseId } = await params;
        let course = await fetchCourseById(courseId);
        let modules = await fetchCourseModules(courseId);
        let instructor = await fetchInstructor();
        setInstructor(instructor as {id:string,role:string});
        setModules(modules);
        setCourse(course);
    } catch (err) {
        console.log(err);
      }
    }
    loadCourse();
  }, []);

  if (!course) {
    return <p className="text-center text-lg">Loading course details...</p>;
  }

  return (
    <div className="course-details p-6 max-w-4xl mx-auto">
      <h1 className="text-4xl font-bold mb-4 text-center text-gray-800">
        {isEditing ? (
          <input
            type="text"
            name="title"
            value={editedCourse?.title}
            onChange={handleInputChange}
            className="text-4xl font-bold text-center w-full mb-4"
          />
        ) : (
          course.title
        )}
      </h1>

      <div className="bg-white shadow-md rounded-lg p-6">
    <div className="text-lg text-gray-700 mb-4">
      <span className="font-semibold">Description:</span>{" "}
      {isEditing ? (
        <textarea
          name="description"
          value={editedCourse?.description || ''} // Fallback to empty string if description is undefined
          onChange={handleInputChange}
          className="w-full"
        />
      ) : (
        course.description
      )}
    </div>

    <div className="text-lg text-gray-700 mb-4">
      <span className="font-semibold">Category:</span>{" "}
      {isEditing ? (
        <input
          type="text"
          name="category"
          value={editedCourse?.category}
          onChange={handleInputChange}
          className="w-full"
        />
      ) : (
        course.category
      )}
    </div>

    <div className="text-lg text-gray-700 mb-4">
      <span className="font-semibold">Difficulty Level:</span>{" "}
      {isEditing ? (
        <input
          type="text"
          name="difficulty_level"
          value={editedCourse?.difficulty_level}
          onChange={handleInputChange}
          className="w-full"
        />
      ) : (
        course.difficulty_level
      )}
    </div>

    <div className="text-lg text-gray-700 mb-4">
      <span className="font-semibold">Key Words:</span>{" "}
      {isEditing ? (
        <>
          {editedCourse.key_words.map((keyword, index) => (
            <div key={index} className="mb-2">
              <input
                type="text"
                value={keyword}
                onChange={(e) => handleKeywordChange(e, index)}
                className="w-full mb-2"
              />
            </div>
          ))}
          <div className="flex items-center space-x-2">
            <input
              type="text"
              value={newKeyword}
              onChange={(e) => setNewKeyword(e.target.value)}
              placeholder="Add new keyword"
              className="p-2 border rounded"
            />
            <button
              onClick={addKeywordField}
              className="bg-blue-500 text-white px-4 py-2 rounded"
            >
              Add Keyword
            </button>
          </div>
        </>
      ) : (
        course.key_words?.join(", ")
      )}
    </div>

    <div className="text-lg text-gray-700 mb-4">
      <span className="font-semibold">Number of Modules:</span>{" "}
      {course.modules?.length || 0}
    </div>

    <div className="text-lg text-gray-700 mb-4">
      <span className="font-semibold">Rating:</span>{" "}
      {course.ratings?.keys?.length} / 5
    </div>

    <div className="text-lg text-gray-700 mb-6">
      <span className="font-semibold">Number of Students:</span> {course.students?.length}
    </div>

    <div className="flex space-x-4">
      {isEditing ? (
        <button onClick={handleSaveClick} className="bg-green-500 text-white px-4 py-2 rounded">
          Save
        </button>
      ) : (
        <button onClick={handleEditClick} className="bg-blue-500 text-white px-4 py-2 rounded">
          Edit
        </button>
      )}
    </div>
  </div>



  {/* __________________________________ModulesPart_______________________________________ */}

    <div className="modules-section mt-8">
        <h2 className="text-3xl font-bold text-gray-800 mb-6 text-center">Modules</h2>

        <div className="grid grid-cols-1 gap-6">
          {modules?.map((module, index) => (
            <ModuleCard key={index} module={module} />
          ))}
        </div>
    </div>

       
        {/* ____________________________New Module Form____________________________________ */}



      <div className="p-4 border rounded shadow">
        {!showForm ? (
          <button
            onClick={() => setShowForm(true)}
            className="text-2xl font-bold text-green-500"
          >
            +
          </button>
        ) : (
          <div>
            <h3>Add a New Module</h3>
            <input
              type="text"
              name="title"
              placeholder="Module Title"
              value={newModule?.title}
              onChange={handleInputChangeForm}
              className="border p-2 rounded w-full mb-2"
            />

            <input
              type="text"
              name="content"
              placeholder="Module Content"
              value={newModule?.content}
              onChange={handleInputChangeForm}
              className="border p-2 rounded w-full mb-2"
            />

            <input
              type="number"
              name="quiz_length"
              placeholder="Quiz Length"
              value={newModule?.quiz_length}
              onChange={handleInputChangeForm}
              className="border p-2 rounded w-full mb-2"
            />


            <select
              name="quiz_type"
              value={newModule?.quiz_type}
              onChange={handleInputChangeForm}
              className="border p-2 rounded w-full mb-2"
            >
              <option value="">Select Quiz Type</option>
              <option value="mcq">MCQ</option>
              <option value="mixed">mixed</option>
              <option value="true/false">True/False</option>
            </select>

            <select
              name="module_difficulty"
              value={newModule?.module_difficulty}
              onChange={handleInputChangeForm}
              className="border p-2 rounded w-full mb-2"
            >
              <option value="">Select Difficulty</option>
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
            </select>


            

            <button
              onClick={handleAddModule}
              className="bg-blue-500 text-white px-4 py-2 rounded"
            >
              Add Module
            </button>
          </div>
        )}
      </div>
  
      <div className="modules-section mt-8">
      <h2 className="text-3xl font-bold text-gray-800 mb-6 text-center">Forum</h2>
      {course._id && course.title && (
        <ForumPreview courseId={course._id} courseTitle={course.title} />
      )}

       </div>

    </div>

);
};

export default CourseDetails;
