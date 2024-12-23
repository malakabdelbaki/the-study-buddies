"use client";

import React, { useEffect, useState } from "react";

import { Module } from "@/types/Module";
import { Course } from "@/types/Course";
import { User } from "@/types/User";
import { fetchCourseModules,fetchCourseById, fetchInstructor, updateCourse, deleteCourse } from "../../../api/courses/instructor/courseRoute";
import ModuleCard from "../../../../components/course/general/moduleCard";
import { createModule } from "../../../api/courses/instructor/moduleRoute";
import { Types } from "mongoose";
import ForumPreview from "@/components/forum/ForumPreview";
import { useAuthorization } from "@/hooks/useAuthorization";
import { useRouter } from "next/navigation";

const CourseDetails = ({ params }: { params: Promise<{ courseId: string }> }) => {
  useAuthorization(['instructor'])
  const [course, setCourse] = useState<Course>();
  const [modules, setModules] = useState<Module[]>();
  const [Instructor,setInstructor] = useState<{id:string,role:string}>();
  const [isEditing, setIsEditing] = useState(false);
  const [editedCourse, setEditedCourse] = useState(() => ({
    ...course,
    key_words: course?.key_words || [], // Make sure key_words is always an array
  }));  
  const [newKeyword, setNewKeyword] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [newModule, setNewModule] = useState<Module>({title:'',content:'',quiz_type:'',quiz_length:0,module_difficulty:''});
  const [canDisableNotes, setCanDisableNotes] = useState<boolean | null>(null);
  const router = useRouter();

  const enableNotes = async () => {
    try {
      const { courseId } = await params;
      await fetch(`/api/courses/${courseId}/enableNotes`, { method: 'PATCH' });
      const updatedCourse = await fetchCourseById(courseId);
      setCourse(updatedCourse);
    } catch (err) {
      console.error("Failed to enable notes:", err);
    }
  };

  const disableNotes = async () => {
    try {
      const { courseId } = await params;
      await fetch(`/api/courses/${courseId}/disableNotes`, { method: 'PATCH' });
      const updatedCourse = await fetchCourseById(courseId);
      setCourse(updatedCourse);
    } catch (err) {
      console.error("Failed to disable notes:", err);
    }
  };

  const checkCanDisableNotes = async () => {
    try {
      console.log("Checking if notes can be disabled...");
      const { courseId } = await params;
      console.log(courseId);
      const response = await fetch(`/api/notes/course/${courseId}/canDisableNotes`);
      const data = await response.json();
      console.log(data);
      setCanDisableNotes(data);
    } catch (err) {
      console.error("Failed to check if notes can be enabled:", err);
    }
  };

  const handleInputChangeForm = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setNewModule({
      ...newModule,
      [e.target.name]: e.target.value,
    });
  };

  const handleAddModule = async () => {
      const {courseId} = await params;
      const data = await createModule({...newModule,course_id:courseId}); // Call the parent-provided function to add the module
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
        const course = await fetchCourseById(courseId);
        const modules = await fetchCourseModules(courseId);
        const instructor = await fetchInstructor();
        setInstructor(instructor as {id:string,role:string});
        setModules(modules);
        setCourse(course);
        setEditedCourse(course);
      await checkCanDisableNotes();
    } catch (err) {
        console.log(err);
      }
    }
    loadCourse();
  }, []);

  if (!course || !canDisableNotes) {
    return <p className="text-center text-lg">Loading course details...</p>;
  }

  function handleDeleteKeyword(index: number): void {
    if (!editedCourse) return; // Handle case where editedCourse might be undefined
    const updatedKeywords = editedCourse.key_words.filter((_, ind) => ind !== index);
    setEditedCourse({ ...editedCourse, key_words: updatedKeywords });
  }

  const handleDelete = async ()=>{
    const response = await deleteCourse(course._id as string);
    alert (response);
  }
  const handleAnnouncementRedirect = () => {
    if (course?._id) {
      router.push(`/announcement?courseId=${course._id}`);
    }
  };

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

      <div className="mt-6">
{course.isNoteEnabled && canDisableNotes && (
  <button
    onClick={disableNotes}
    className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
  >
    Disable Notes
  </button>
)}

{course.isNoteEnabled && !canDisableNotes && (
  <p className="text-gray-600">Notes cannot be disabled for this course.</p>
)}

{!course.isNoteEnabled && (
  <button
    onClick={enableNotes}
    className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
  >
    Enable Notes
  </button>
)}

      </div>

      <div className="bg-white shadow-md rounded-lg p-6">
  {/* Description */}
  <div className="text-lg text-gray-700 mb-4">
    <span className="font-semibold">Description:</span>{" "}
    {isEditing ? (
      <textarea
        name="description"
        value={editedCourse?.description || ""}
        onChange={handleInputChange}
        className="w-full"
      />
    ) : (
      course.description
    )}
  </div>

  {/* Category */}
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


  {/* Difficulty Level */}
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

  {/* Key Words */}
  <div className="text-lg text-gray-700 mb-4">
    <span className="font-semibold">Key Words:</span>{" "}
    {isEditing ? (
      <>
        <div className="flex flex-wrap gap-2 mb-4">
          {editedCourse.key_words.map((keyword, index) => (
            <div
              key={index}
              className="flex items-center bg-blue-100 text-blue-800 rounded px-3 py-1"
            >
              <span>{keyword}</span>
              <button
                onClick={() => handleDeleteKeyword(index)}
                className="ml-2 text-red-600 hover:text-red-800"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
        <div className="flex items-center space-x-2">
          <input
            type="text"
            value={newKeyword}
            onChange={(e) => setNewKeyword(e.target.value)}
            placeholder="Add new keyword"
            className="p-2 border rounded w-full"
          />
          <button
            onClick={addKeywordField}
            className="bg-blue-500 text-white px-4 py-2 rounded"
          >
            Add
          </button>
        </div>
      </>
    ) : (
      <div className="flex flex-wrap gap-2">
        {course.key_words?.map((keyword, index) => (
          <span
            key={index}
            className="bg-blue-100 text-blue-800 rounded px-3 py-1"
          >
            {keyword}
          </span>
        ))}
      </div>
    )}
  </div>

  {/* Number of Modules */}
  <div className="text-lg text-gray-700 mb-4">
    <span className="font-semibold">Number of Modules:</span>{" "}
    {course.modules?.length || 0}
  </div>

  <div className="text-lg text-gray-700 mb-4">
    <span className="font-semibold">Is Deleted ?</span>{" "}
    {course.is_deleted? "YES":"NO"}
  </div>

  {/* Rating */}
  <div className="text-lg text-gray-700 mb-4">
     <p>Ratings:  {course.ratings?.values
    ? (Array.from(course.ratings.values()).reduce((sum, value) => sum + value, 0) /
       Array.from(course.ratings.values()).length).toFixed(2)
    : 0} / 5</p>
  </div>

  {/* Number of Students */}
  <div className="text-lg text-gray-700 mb-6">
    <span className="font-semibold">Number of Students:</span>{" "}
    {course.students?.length}
  </div>

  {/* Save and Edit Buttons */}
  <div className="flex space-x-4">
    {isEditing ? (
      <button
        onClick={handleSaveClick}
        className="bg-green-500 text-white px-4 py-2 rounded"
      >
        Save
      </button>
    ) : (
      <div>
        <button
          onClick={handleEditClick}
          className="bg-blue-500 text-white px-4 py-2 rounded"
        >
          Edit
        </button>
          <button onClick={handleDelete} className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
          Delete
      </button>
     </div>
    )}
  </div>
</div>




  {/* __________________________________ModulesPart_______________________________________ */}

    <div className="modules-section mt-8">
        <h2 className="text-3xl font-bold text-gray-800 mb-6 text-center">Modules</h2>

        <div className="grid grid-cols-1 gap-6">
          {modules?.map((module, index) => (
            <ModuleCard key={index} module={module}  course={course} />
          ))}
        </div>
    </div>

       
   {/* _____________________________New Module Form____________________________________ */}



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

<div className="divider my-8">
        <hr className="border-gray-300" />
      </div>

      <h1 className="text-center text-3xl font-semibold text-gray-800 my-4">Announcement</h1>

      <div className="text-center">
        <button
          onClick={handleAnnouncementRedirect}
          className="bg-black text-white text-sm px-4 py-2 rounded-md hover:bg-gray-800"
        >
          Go to Announcements
        </button>
      </div>
       </div>

    </div>

);
};

export default CourseDetails;
