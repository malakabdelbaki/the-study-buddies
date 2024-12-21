"use client";

import React, { useState, useEffect } from "react";
import courseServer from "../api/courses/general/createCourse";
import getCourses from "../api/courses/general/getCourses";
import { Course } from "@/types/Course";
import CourseCard from "../../components/course/general/courseCard";

const CoursesPage = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadCourses() {
      try {
        let gett = await getCourses({ filters: {} });
        setCourses(gett as Course[]);
      } catch (err) {
        setError("Failed to load courses.");
      } finally {
        setLoading(false);
      }
    }
    loadCourses();
  }, []);

  return (
    <div className="courses-page p-6 max-w-7xl mx-auto">
      <h1 className="text-4xl font-bold text-gray-800 text-center mb-4">
        All Courses
      </h1>
      <p className="text-lg text-gray-600 text-center mb-12">
        Browse through our collection of amazing courses and start learning
        today!
      </p>

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
            <CourseCard key={c._id} course={c} user={null}/>
          ))}
        </div>
      )}
    </div>
  );
};

export default CoursesPage;



{/* <div>
      <form action={formAction}>
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
        {state?.message && <p>{state.message}</p>}
      </form>
      <div>
        {title}, {category},{difficulty_level}
      </div>
    </div> */}

