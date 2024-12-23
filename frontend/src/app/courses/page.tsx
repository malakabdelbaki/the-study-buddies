"use client";

import React, { useState, useEffect } from "react";
import getCourses from "../api/courses/general/getCourses";
import { Course } from "@/types/Course";
import CourseCard from "../../components/course/general/courseCard";

const CoursesPage = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters state
  const [filters, setFilters] = useState({
    category: "",
    difficulty: "",
    title: "",
    instructor: "",
    key_word: "",

  });

  useEffect(() => {
    async function loadCourses() {
      setLoading(true);
      setError(null);
      try {
        const gett = await getCourses({ filters });
        setCourses(gett as Course[]);
      } catch (err) {
        setError("Failed to load courses.");
      } finally {
        setLoading(false);
      }
    }
    loadCourses();
  }, [filters]);

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  return (
    <div className="courses-page p-6 max-w-7xl mx-auto">
      <h1 className="text-4xl font-bold text-gray-800 text-center mb-4">
        All Courses
      </h1>
      <p className="text-lg text-gray-600 text-center mb-12">
        Browse through our collection of amazing courses and start learning today!
      </p>

      {/* Filters Section */}
      <div className="filters mb-6 p-5 bg-gray-100 rounded-md">
        <h2 className="text-2xl font-bold mb-4">Filters</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <input
            type="text"
            name="title"
            placeholder="Search by Title"
            value={filters.title}
            onChange={handleFilterChange}
            className="p-2 border border-gray-300 rounded-md"
          />
          <input
            type="text"
            name="instructor"
            placeholder="Search by Instructor Name"
            value={filters.instructor}
            onChange={handleFilterChange}
            className="p-2 border border-gray-300 rounded-md"
          />
           <input
            type="text"
            name="category"
            placeholder="Search by Category"
            value={filters.category}
            onChange={handleFilterChange}
            className="p-2 border border-gray-300 rounded-md"
          />
           <input
            type="text"
            name="key_word"
            placeholder="Search by a key word"
            value={filters.key_word}
            onChange={handleFilterChange}
            className="p-2 border border-gray-300 rounded-md"
          />
          <select
            name="difficulty"
            value={filters.difficulty}
            onChange={handleFilterChange}
            className="p-2 border border-gray-300 rounded-md"
          >
            <option value="">Select Difficulty</option>
            <option value="Beginner">Beginner</option>
            <option value="Intermediate">Intermediate</option>
            <option value="Advanced">Advanced</option>
          </select>
        </div>
      </div>

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
            <CourseCard key={c._id} course={c} user={null} explore={true}/>
          ))} 
        </div>
      )}
    </div>
  );
};

export default CoursesPage;

