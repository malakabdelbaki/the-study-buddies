"use client";

import React, { useState, useEffect } from "react";
import { Course } from "@/types/Course";
import CourseCard from "@/components/course/general/courseCard";
import { fetchCourses, fetchStudent } from "../../api/courses/student/courseRoute";
import { useAuthorization } from "@/hooks/useAuthorization";


const StudentCoursesPage = () => {
  useAuthorization(['student'])
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [coursescompleted,setCoursesCompleted] = useState<Course[]>([]);
  const [coursesinprogress,setCoursesInProgress] = useState<Course[]>([]);
  const [student, setStudent] = useState<{id:string,role:string}>();

  useEffect(() => {
    async function loadCourses() {
      try {
        const gett = await fetchCourses({ filters: {} });
        const std = await fetchStudent();
        setStudent(std as {id:string,role:string});

        const complete = await fetch(`/api/courses/student/${(std as any)._id}`, {
          method: "GET",
        }).then((res) => res.json());
        

        const completedCourses = gett.filter((course: Course) =>
          complete.includes(course._id?.toString())
        );
        const notYetCompletedCourses = gett.filter(
          (course: Course) => !complete.includes(course._id?.toString())
        );
        
        setCoursesCompleted(completedCourses);
        setCoursesInProgress(notYetCompletedCourses);
        setCourses(gett);
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

      {!loading && coursesinprogress.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {courses.map((c) => (
            <CourseCard key={c._id} course={c} user={{ role: "student" }} />
          ))}
        </div>
      )}
    _____________________________________________________
    {!loading && coursescompleted.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {courses.map((c) => (
            <CourseCard key={c._id} course={c} user={{ role: "student" }} />
          ))}
        </div>
      )}

    </div>
  );
};

export default StudentCoursesPage;
