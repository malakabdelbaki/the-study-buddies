"use client";

import React, { useState, useEffect } from "react";
// import courseServer from "./api/courseServer";
// import getCourses from "./api/getCourses";
import { Course } from "@/types/Course";
import CourseCard from "@/components/course/general/courseCard";
import { createCourse, fetchCourses, fetchInstructor } from "../../api/courses/instructor/courseRoute";
import { useAuthorization } from "@/hooks/useAuthorization";
import { Button } from "@/components/ui/button";


// import CourseCard from "./components/courseCard";

const CoursesPage = () => {
  useAuthorization(['instructor'])
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [title, setTitle] = useState<string>('');
  const [difficulty_level, setDifficulty_level] = useState<string>('');
  const [category, setCategory] = useState<string>('');
  const [user, setUser] = useState<{id?: string, role?: string}>({});
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [enableNotes, setEnableNotes] = useState<boolean>(true);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const courseData = {
        title,
        category,
        difficulty_level,
        isNote_enabled:enableNotes,
      };

      const response = await fetch('/api/courses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(courseData),
      });

      if (!response.ok) {
        throw new Error('Failed to create course');
      }

      alert('Course created successfully!');
      const coursesResponse = await fetch('/api/courses');
      const coursesData = await coursesResponse.json();
      setCourses(coursesData);

      setTitle('');
      setCategory('');
      setDifficulty_level('');
      setEnableNotes(true);
      setIsModalOpen(false);
    } catch (error) {
      console.error('Error creating course:', error);
      alert('Failed to create the course.');
    }
  };

  useEffect(() => {
    async function loadCourses() {
      try {
        const response = await fetch('/api/courses',{
          method: 'GET',
        });
        if (!response.ok) {
          throw new Error('Failed to fetch courses');
        }
        const coursesData = await response.json();
        setCourses(coursesData);
      } catch (err) {
        setError("Failed to load courses.");
      } finally {
        setLoading(false);
      }
    }

    async function getInstructor() {
      const response = await fetch('/api/auth/me');
      if (response.ok) {
        const userData = await response.json();
        setUser(userData);
      }
    }

    loadCourses();
    getInstructor();
  }, []);

  return (
    <div className="courses-page p-6 max-w-7xl mx-auto">
      <h1 className="text-4xl font-bold text-gray-800 text-center mb-4">
         My Courses
      </h1>
      {loading && (
        <div className="flex justify-center items-center">
          <p className="text-lg text-gray-500">Loading courses...</p>
        </div>
      )}
      {error && (
        <div className="text-red-700 bg-red-100 border border-red-300 p-4 rounded-md">
          {error}
        </div>
      )}

      {!loading && courses.length === 0 && (
        <p className="text-center text-gray-500">No courses available.</p>
      )}

      {!loading && courses.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {courses.map((c) => (
            <CourseCard key={c?._id} course={c} user={user}/>
          ))}
        </div>
      )}


{/* _________.___New Course Form__________________-- */}




 {/* <div>
    <form onSubmit={handleSubmit}>
      <h2>Create a New Course</h2>
      <input
        name="title"
        type="text"
        placeholder="Title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        required
      />
      <input
        name="category"
        type="text"
        placeholder="Category"
        value={category}
        onChange={(e) => setCategory(e.target.value)}
        required
      />
      <input
        name="difficulty_level"
        type="text"
        placeholder="Difficulty Level"
        value={difficulty_level}
        onChange={(e) => setDifficulty_level(e.target.value)}
        required
      />
      <button type="submit">Create a New Course</button>
    </form>
    </div> */}



<div className="text-center mt-6">
        <Button className="bg-blue-500 text-white px-4 py-2" onClick={() => setIsModalOpen(true)}>
          Create New Course
        </Button>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-md w-96">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Create New Course</h2>
            <form onSubmit={handleSubmit}>
              <input
                className="w-full mb-4 p-2 border rounded-lg"
                type="text"
                placeholder="Title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
              <input
                className="w-full mb-4 p-2 border rounded-lg"
                type="text"
                placeholder="Category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                required
              />
              {/* <input
                className="w-full mb-4 p-2 border rounded-lg"
                type="text"
                placeholder="Difficulty Level"
                value={difficulty_level}
                onChange={(e) => setDifficulty_level(e.target.value)}
                required
              /> */}
              <select
                className="w-full mb-4 p-2 border rounded-lg"
                value={difficulty_level}
                onChange={(e) => setDifficulty_level(e.target.value)}
                required
                   >
                <option value="Beginner">Beginner</option>
                <option value="Intermediate">Intermediate</option>
                <option value="Advanced">Advanced</option>
              </select>
              <div className="flex items-center mb-4">
                <input
                  type="checkbox"
                  id="enableNotes"
                  checked={enableNotes}
                  onChange={() => setEnableNotes(!enableNotes)}
                />
                <label htmlFor="enableNotes" className="ml-2">
                  Enable Notes
                </label>
              </div>
              <div className="flex justify-end space-x-4">
                <Button className="bg-gray-500 text-white" onClick={() => setIsModalOpen(false)}>
                  Cancel
                </Button>
                <Button className="bg-blue-500 text-white" type="submit">
                  Create
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
  </div>
  );
};

export default CoursesPage;
