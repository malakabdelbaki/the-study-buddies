"use client";

import React, { useEffect, useState } from "react";
import getCourseDetails from "../../api/courses/general/getCourseDetails";
import { Module } from "@/types/Module";
import { Course } from "@/types/Course";
import { User } from "@/types/User";
import { getUser } from "@/app/utils/GetUserId";
import Link from "next/link";
import { Role } from "@/enums/role.enum";
import { decodeToken } from "@/app/utils/decodeToken";

const CourseDetails = ({ params }: { params: Promise<{ courseId: string }> }) => {
  const [course, setCourse] = useState<Course>();
  const [modules, setModules] = useState<Module[]>();
  const [Instructor,setInstructor] = useState<User>();
  const [IsEnroll,setIsEnroll] = useState<boolean>();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [ userRole, setUserRole ] = useState<Role | null>(null);  


  useEffect(() => {
    async function loadCourse() {
      try {
        const { courseId } = await params;
        const course = (await getCourseDetails(courseId)) as Course;
        let user = await getUser();
        const instructor = course.instructor_id;

        setCourse(course);
        setInstructor(instructor as unknown as User);
        setModules(course.modules?.map(module => module as unknown as Module) || []);
        setIsEnroll(course.students?.includes(user?.userId as string));
      } catch (err) {
        console.log(err);
      }
    }
    loadCourse();
  }, []);

  useEffect(() => {
      const token = document.cookie
        .split("; ")
        .find((row) => row.startsWith("token="))?.split("=")[1];
  
      if (token) {
        const role = decodeToken(token)?.role;
        setUserRole(role);
      }}, []);
       
  const handleEnroll = async () => {
    if (!course) return;

    setLoading(true);
    try {
      const response = await fetch("/api/user/enroll", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ courseId: course._id }),
      });

      if (response.ok) {
        setIsEnroll(true);
        setMessage("Successfully enrolled in the course!");
      } else {
        const error = await response.json();
        setMessage(error.message || "Failed to enroll in the course.");
      }
    } catch (err) {
      setMessage("An error occurred while enrolling in the course.");
    } finally {
      setLoading(false);
    }
  };


  if (!course) {
    return <p className="text-center text-lg">Loading course details...</p>;
  }

   return (
    <div className="course-details p-6 max-w-4xl mx-auto">
      <h1 className="text-4xl font-bold mb-4 text-center text-gray-800">{course.title}</h1>

      <div className="bg-white shadow-md rounded-lg p-6">
        <p className="text-lg text-gray-700 mb-4">
          <span className="font-semibold">Description:</span> {course.description}
        </p>
        <p className="text-lg text-gray-700 mb-4">
          <span className="font-semibold">Category:</span> {course.category}
        </p>
        <p className="text-lg text-gray-700 mb-4">
          <span className="font-semibold">Difficulty Level:</span> {course.difficulty_level}
        </p>
        <p className="text-lg text-gray-700 mb-4">
          <span className="font-semibold">Key Words:</span> {course.key_words?.join(", ")}
        </p>
        <p className="text-lg text-gray-700 mb-4">
          <span className="font-semibold">Number of Modules:</span> {course.modules?.length || 0}
        </p>

        <div className="mb-4">
          <h2 className="text-xl font-semibold text-gray-800">Instructor Information:</h2>
          <p>Name: {Instructor?.name}</p>
          <p>Email: {Instructor?.email}</p>
        </div>

        <p className="text-lg text-gray-700 mb-4">
          <span className="font-semibold">Rating:</span> {course.ratings?.keys?.length} / 5
        </p>
        <p className="text-lg text-gray-700 mb-6">
          <span className="font-semibold">Number of Students:</span> {course.students?.length}
        </p>

        {message && (
          <p className={`text-lg font-semibold mb-4 ${message.includes("Successfully") ? "text-green-600" : "text-red-600"}`}>
            {message}
          </p>
        )}

       { userRole==Role.Student && (
        <div>
        {!IsEnroll ? (
          <button
            onClick={handleEnroll}
            disabled={loading}
            className={`bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors ${
              loading ? "opacity-50 cursor-not-allowed" : ""
            }`}
          >
            {loading ? "Enrolling..." : "Enroll in this Course"}
          </button>
        ) : (
          <div>
            <span className="font-semibold text-green-700">You are already enrolled in this course.</span>
            <Link href="/StudCourses" className="text-blue-500 hover:underline text-lg font-semibold ml-2">
              Go to your courses
            </Link>
          </div>
        )}
      </div>
      )}
      </div>
    </div>
  );
};

export default CourseDetails;