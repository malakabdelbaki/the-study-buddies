"use client";

import React, { useState, useEffect } from "react";
// import courseServer from "./api/courseServer";
// import getCourses from "./api/getCourses";
import { Course } from "@/types/Course";
import CourseCard from "@/components/course/general/courseCard";
import { createCourse, fetchCourses, fetchInstructor } from "../../api/courses/instructor/courseRoute";


// import CourseCard from "./components/courseCard";

const CoursesPage = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [title,setTitle] = useState<string>('');
  const [difficulty_level,setDifficulty_level] = useState<string>('');
  const [category,setCategory] = useState<string>('');
  const [user,setUser] = useState<{id?:string,role?:string}>({});
  const [formState, setFormState] = useState<{ message: string | null }>({ message: null });
  
  const handleSubmit = async (e:any) => {
    e.preventDefault();

    try {
      // Prepare the course data
      const courseData = {
        title,
        category,
        difficulty_level,
      };

      // Call the createCourse function
      const response = await createCourse(courseData);

      // Handle success
      console.log('Course created successfully:', response);
      alert('Course created successfully!');
      let gett = await fetchCourses({ filters: {} }); 
      setCourses(gett);
      // Optionally reset the form
      setTitle('');
      setCategory('');
      setDifficulty_level('');
    } catch (error) {
      // Handle error
      console.error('Error creating course:', error);
      alert('Failed to create the course.');
    }
  };
  


  useEffect(() => {
    async function loadCourses() {
      try {
        let gett = await fetchCourses({ filters: {} }); 
        setCourses(gett);
      } catch (err) {
        setError("Failed to load courses.");
      } finally {
        setLoading(false);
      }
    }

    async function getInstructor(){ 
      let user = await fetchInstructor();
      setUser(user as {id:string,role:string});
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
            <CourseCard key={c._id} course={c} user={user}/>
          ))}
        </div>
      )}


{/* _________.___New Course Form__________________-- */}




 <div>
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
    </div>
  </div>
  );
};

export default CoursesPage;
