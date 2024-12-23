"use client";

import React, { useState, useEffect } from "react";
import { Course } from "@/types/Course";
import CourseCard from "@/components/course/general/courseCard";
import { useAuthorization } from "@/hooks/useAuthorization";

type Token = {
  id: string;
  role: string;
};

const StudentCoursesPage = () => {
  useAuthorization(["student"]);

  const [coursesInProgress, setCoursesInProgress] = useState<Course[]>([]);
  const [coursesCompleted, setCoursesCompleted] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadCourses() {
      try {
        // Fetch completed courses
        const responseCompleted = await fetch(`/api/courses/student/completedCourses`,{
          method: 'GET',
        });
        if (!responseCompleted.ok) {
          throw new Error(
            `Error fetching completed courses: ${responseCompleted.status} ${responseCompleted.statusText}`
          );
        }
        const completedCoursesData: Course[] = await responseCompleted.json();
        setCoursesCompleted(completedCoursesData);

        // Fetch enrolled courses
        const responseEnrolled = await fetch(`/api/courses/student/enrolledCourses`,{
          method: 'GET',
        });
        if (!responseEnrolled.ok) {
          throw new Error(
            `Error fetching enrolled courses: ${responseEnrolled.status} ${responseEnrolled.statusText}`
          );
        }
        const enrolledCoursesData: Course[] = await responseEnrolled.json();

        // Filter "In-Progress Courses" by excluding "Completed Courses"
        const inProgressCourses = enrolledCoursesData.filter(
          (enrolledCourse) =>
            !completedCoursesData.some(
              (completedCourse) => completedCourse._id === enrolledCourse._id
            )
        );

        setCoursesInProgress(inProgressCourses);
      } catch (err: any) {
        console.error(err);
        setError(`Failed to load courses. ${err.message}`);
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

      {!loading && coursesInProgress.length === 0 && coursesCompleted.length === 0 && (
        <p className="text-center text-gray-500">No courses available.</p>
      )}

      {/* In-Progress Courses */}
      <div>
        <p className="text-xl font-semibold mb-4">In-Progress Courses:</p>
        {!loading && coursesInProgress.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {coursesInProgress.map((course) => (
              <CourseCard
                key={course._id}
                course={course}
                user={{ role: "student" }}
                explore={false}
              />
            ))}
          </div>
        ) : (
          <p className="text-gray-500">No in-progress courses.</p>
        )}
      </div>

      <br />

      {/* Completed Courses */}
      <div>
        <p className="text-xl font-semibold mb-4">Completed Courses:</p>
        {!loading && coursesCompleted.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {coursesCompleted.map((course) => {
  console.log(course._id); // Log each course ID
  return (
    <CourseCard
      key={course._id}
      course={course}
      user={{ role: "student" }}
      explore={false}
    />
  );
})}

          </div>
        ) : (
          <p className="text-gray-500">No completed courses.</p>
        )}
      </div>
    </div>
  );
};

export default StudentCoursesPage;
