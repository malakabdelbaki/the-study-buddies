"use client";

import React, { useEffect, useState } from "react";
import getCourseDetails from "../../api/courses/general/getCourseDetails";
import { Module } from "@/types/Module";
import { Course } from "@/types/Course";
import { User } from "@/types/User";
import { getUser } from "@/app/utils/GetUserId";
import Link from "next/link";

const CourseDetails = ({ params }: { params: Promise<{ courseId: string }> }) => {
  const [course, setCourse] = useState<Course>();
  const [Instructor,setInstructor] = useState<User>();
  const [IsEnroll,setIsEnroll] = useState<boolean>();
  const [IsInstructor,setIsInstructor] = useState<boolean>();
  const [User,setUser] = useState<{userId?:string,userRole?:string}>()
  useEffect(() => {
    async function loadCourse() {
      try {
        const { courseId } = await params;
        const response = await fetch(`/api/courses/${courseId}`);
        console.log(response);
        if (!response.ok) {
          return 'no data';
        }
          const course = await response.json();
          setCourse(course);
        
        
        let user = await getUser();
        setUser(user);
        setIsInstructor(user?.userRole ==='instructor')


        const instructor = course?.instructor_id;
        setInstructor(instructor as unknown as User);       
        setIsEnroll(course.students?.includes(user?.userId as string));
        setCourse(course);
        setInstructor(instructor as unknown as User);
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
        {course.title}
      </h1>

      <div className="bg-white shadow-md rounded-lg p-6">
        <p className="text-lg text-gray-700 mb-4">
          <span className="font-semibold">Description:</span> {course.description}
        </p>
        <p className="text-lg text-gray-700 mb-4">
          <span className="font-semibold">Category:</span> {course.category}
        </p>
        <p className="text-lg text-gray-700 mb-4">
          <span className="font-semibold">Difficulty Level:</span>{" "}
          {course.difficulty_level}
        </p>
        <p className="text-lg text-gray-700 mb-4">
          <span className="font-semibold">Key Words:</span> {course.key_words?.join(", ")}
        </p>
        <p className="text-lg text-gray-700 mb-4">
          <span className="font-semibold">Number of Modules:</span>{" "}
          {course.modules?.length || 0}
        </p>
        

        <div className="mb-4">
          <h2 className="text-xl font-semibold text-gray-800">Instructor Information:</h2>
          <p>Name: {Instructor?.name}</p>
          <p>Email : {Instructor?.email}</p>
        </div>

        <p className="text-lg text-gray-700 mb-4">
          <span className="font-semibold">Rating:</span> {course.ratings?.keys?.length} / 5
        </p>
        <p className="text-lg text-gray-700 mb-6">
          <span className="font-semibold">Number of Students:</span> {course.students?.length}
        </p>
        {!IsInstructor && 
          <div>
            {!IsEnroll &&
            <button className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors">
              Enroll in this Course
            </button>
            }
            {IsEnroll && (
              <div>
              <span className="font-semibold">You are already in this course</span> {course.students?.length}
              <Link href="/StudCourses" className="text-blue-500 hover:underline text-lg font-semibold">go to your courses</Link>
              </div>
            )}
            </div>
          }
          {
            IsInstructor && User?.userId === course.instructor_id?._id && 
            <div>
                <Link href={`/InstrCourses/${course._id}`} className="text-blue-500 hover:underline text-lg font-semibold">go to your courses</Link>
              </div>
          }
      </div>
    </div>
  );
};

export default CourseDetails;
