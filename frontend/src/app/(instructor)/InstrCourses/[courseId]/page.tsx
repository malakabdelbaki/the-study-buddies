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
  const [instructor, setInstructor] = useState<{id: string, role: string}>();
  const [isEditing, setIsEditing] = useState(false);
  const [editedCourse, setEditedCourse] = useState<Course>({} as Course);
  const [newKeyword, setNewKeyword] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [newModule, setNewModule] = useState<Module>({
    title:'', content:'', quiz_type:'', quiz_length:0, module_difficulty:''});
  const [canDisableNotes, setCanDisableNotes] = useState<boolean | null>(null);
  const router = useRouter();
  const [students, setStudents] = useState<User[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const enableNotes = async () => {
    try {
      let {courseId} = await params;

      await fetch(`/api/courses/${courseId}/enableNotes`, { method: 'PATCH' });
      const updatedCourse = await fetchCourseById();
      setCourse(updatedCourse);
    } catch (err) {
      console.error("Failed to enable notes:", err);
    }
  };
  const handleAnnouncementRedirect = () => {
    if (course?._id) {
      router.push(`/announcement?courseId=${course._id}`);
    }
  };

  const disableNotes = async () => {
    try {
      let courseId = await params;

      await fetch(`/api/courses/${courseId}/disableNotes`, { method: 'PATCH' });
      const updatedCourse = await fetchCourseById();
      setCourse(updatedCourse);
    } catch (err) {
      console.error("Failed to disable notes:", err);
    }
  };

  const fetchStudents = async () => {
    try {
      setError(null); // Reset error message
      if (instructor?.role === 'student') {
        throw new Error('Access denied: Only instructors or admins can view the student list.');
      }

    
      const { courseId } = await params; // Extract courseId from params
      console.log(courseId)

      const response = await fetch(`/api/courses/students/${courseId}`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${document.cookie.split('token=')[1]}`,
        },
      });
      

      if (!response.ok) {
        throw new Error('Failed to fetch students');
      }

      const data = await response.json();
      setStudents(data);
    } catch (err: any) {
      setError(err.message);
      setStudents(null); // Clear any previously fetched students
    }
  };

  const checkCanDisableNotes = async () => {
    try {
      let {courseId} = await params;

      const response = await fetch(`/api/notes/course/${courseId}/canDisableNotes`);
      const data = await response.json();
      setCanDisableNotes(data);
    } catch (err) {
      console.error("Failed to check if notes can be disabled:", err);
    }
  };

  const handleInputChangeForm = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setNewModule({
      ...newModule,
      [e.target.name]: e.target.value,
    });
  };

  const handleAddModule = async () => {
    let {courseId} = await params;
    newModule.course_id = courseId;
    const response = await fetch(`/api/courses/${courseId}/modules`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(newModule),
    });
    if (response.ok) {
      await fetchCourseModules();
      setNewModule({title:"", content:'', quiz_type:'', quiz_length:0, module_difficulty:''});
      setShowForm(false);
    }
  };

  const handleEditClick = () => {
    setIsEditing(true);
  };

  const handleSaveClick = async () => {
    //handleKeywordChange()
    let {courseId} = await params;
    console.log(editedCourse)
    const response = await fetch(`/api/courses/${courseId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(editedCourse),
    });
    if (response.ok) {
      setIsEditing(false);
      await fetchCourseById();
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setEditedCourse({ ...editedCourse, [name]: value });
    // setNewModule({
    //   ...newModule,
    //   [e.target.name]: e.target.value,
    // });
  };

  const handleKeywordChange = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const updatedKeywords = [...(editedCourse.key_words || [])];
    updatedKeywords[index] = e.target.value;
    setEditedCourse({ ...editedCourse, key_words: updatedKeywords });
  };

  const addKeywordField = () => {
    setEditedCourse({
      ...editedCourse,
      key_words: [...(editedCourse.key_words || []), newKeyword],
    });
    setNewKeyword('');
  };

  const fetchCourseById = async () => {
    let {courseId} = await params;
    const response = await fetch(`/api/courses/${courseId}`);
    console.log(response);
    if (response.ok) {
      const courseData = await response.json();
      setCourse(courseData);
      setEditedCourse(courseData);
      return courseData;
    }
  };

  const fetchCourseModules = async () => {
    let {courseId} = await params;

    const response = await fetch(`/api/courses/${courseId}/modules`);
    if (response.ok) {
      const modulesData = await response.json();
      setModules(modulesData);
    }
  };

  useEffect(() => {
    async function loadCourse() {
      try {
        await fetchCourseById();
        await fetchCourseModules();
        const instructorResponse = await fetch('/api/auth/me');
        if (instructorResponse.ok) {
          const instructorData = await instructorResponse.json();
          setInstructor(instructorData);
        }
        await checkCanDisableNotes();
      } catch (err) {
        console.log(err);
      }
    }
    loadCourse();
  }, [params]);

  const handleDeleteKeyword = (index: number) => {
    if (!editedCourse) return;

    const updatedKeywords = editedCourse?.key_words?.filter((_, ind) => ind !== index);
    setEditedCourse({ ...editedCourse, key_words: updatedKeywords });
  };

  const handleDelete = async () => {
    let {courseId} = await params;
    const response = await fetch(`/api/courses/${courseId}`, {
      method: 'DELETE',
    });
    if (response.ok) {
      alert('Course deleted successfully');
      // Redirect to courses page or handle as needed
    } else {
      alert('Failed to delete course');
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
          course?.title
        )}
      </h1>

      <div className="mt-6">
{course?.isNoteEnabled && canDisableNotes && (
  <button
    onClick={disableNotes}
    className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
  >
    Disable Notes
  </button>
)}

{course?.isNoteEnabled && !canDisableNotes && (
  <p className="text-gray-600">Notes cannot be disabled for this course.</p>
)}

{!course?.isNoteEnabled && (
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
      course?.description
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
      course?.category
    )}
  </div>


  {/* Difficulty Level */}
  <div className="text-lg text-gray-700 mb-4">
    <span className="font-semibold">Difficulty Level:</span>{" "}
    {isEditing ? (
      <select
      name="difficulty_level"
      value={editedCourse.difficulty_level}
      onChange={handleInputChange}
      className="border p-2 rounded w-full mb-2"
    >
      <option value="">Select Difficulty</option>
      <option value="Advenced">Advenced</option>
      <option value="Intermediate">Intermediate</option>
      <option value="Easy">Easy</option>
    </select>
    ) : (
      course?.difficulty_level
    )}
  </div>

  {/* Key Words */}
  <div className="text-lg text-gray-700 mb-4">
    <span className="font-semibold">Key Words:</span>{" "}
    {isEditing ? (
      <>
        <div className="flex flex-wrap gap-2 mb-4">
          {editedCourse?.key_words?.map((keyword, index) => (
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
        {course?.key_words?.map((keyword, index) => (
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
    {course?.modules?.length || 0}
  </div>

  <div className="text-lg text-gray-700 mb-4">
    <span className="font-semibold">Is Deleted ?</span>{" "}
    {course?.is_deleted? "YES":"NO"}
  </div>

  {/* Rating */}
  <div className="text-lg text-gray-700 mb-4">
     <p>Ratings:  {course?.ratings?.values
    ? (Array.from(course.ratings.values()).reduce((sum, value) => sum + value, 0) /
       Array.from(course.ratings.values()).length).toFixed(2)
    : 0} / 5</p>
  </div>

  {/* Number of Students */}
  <div className="text-lg text-gray-700 mb-6">
    <span className="font-semibold">Number of Students:</span>{" "}
    {course?.students?.length}
  </div>

  {(
        <button
          onClick={fetchStudents}
          className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors mb-4"
        >
          View Students
        </button>
      )}

        {error && <p className="text-red-500 text-lg">{error}</p>}

                  {students && (
            <div className="mt-4">
              <h3 className="text-lg font-bold">Students Enrolled:</h3>
              <ul className="list-disc list-inside">
                {students.map((student) => (
                  <li key={student._id}>
                    <p><strong>Name:</strong> {student.name}</p>
                    <p><strong>Email:</strong> {student.email}</p>
                    <p><strong>Role:</strong> {student.role}</p>
                    <p><strong>Average Grade In Course:</strong> {student.averageGrade}</p>
                  </li>
                ))}
              </ul>
            </div>
    )}

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
            <ModuleCard key={index} module={module}  course={course as Course} />
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
              <option value="no-quiz">no-Quiz</option>

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
      {course?._id && course.title && (
        <ForumPreview courseId={course._id} courseTitle={course?.title} />
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
