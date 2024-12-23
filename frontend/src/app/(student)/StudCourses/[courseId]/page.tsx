"use client";

import React, { useEffect, useState } from "react";

import { Module } from "@/types/Module";
import { Course } from "@/types/Course";
import { User } from "@/types/User";
import { fetchCourseModules,fetchCourseById, rateCourse, rateInstructor, fetchStudent } from "../../../api/courses/student/courseRoute";
import ModuleCard from "../../../../components/course/general/moduleCard";
import ForumPreview from "@/components/forum/ForumPreview";
import { createModule } from "../../../api/courses/instructor/moduleRoute";
import { Types } from "mongoose";
import { Role } from "@/enums/role.enum";
import { decodeToken } from "@/app/utils/decodeToken";

const CourseDetails = ({ params }: { params: Promise<{ courseId: string }> }) => {
  const [course, setCourse] = useState<Course>();
  const [modules, setModules] = useState<Module[]>();
  const [Instructor,setInstructor] = useState<User>();
  const [Student,setStudent] = useState<User>();
  const [IsEnroll,setIsEnroll] =useState<boolean>(false);
  const [editedCourse, setEditedCourse] = useState(() => ({
    ...course,
    key_words: course?.key_words || [], // Make sure key_words is always an array
  }));  
  const [InstructorRating, setInstructorRating] = useState<number>(0);
  const [CourseRating, setCourseRating] = useState<number>(0);
 const [userId, setUserId] = useState<string | null>(null);

  async function handleRatingClick(what:string,star: number) {
    if (what===Role.Instructor){
      setInstructorRating(star);
        let response = await rateInstructor({targetId:course?.instructor_id?._id as string,rating:star} );
        console.log(response);
    }
    else {
      setCourseRating(star);
      let response = await rateCourse(course?._id as string,star);
      console.log(response);
    }
  }
  useEffect(() => {
    const token = document.cookie
      .split("; ")
      .find((row) => row.startsWith("token="))?.split("=")[1];

    if (token) {
      const userId = decodeToken(token)?.userid;
      setUserId(userId);
    }}, []);

  useEffect(() => {
    async function loadCourse() {
      try {
        const { courseId } = await params;
        let course = await fetchCourseById(courseId);
        if(course.students.includes(userId)){
          console.log('enrolled');
           let modules = await fetchCourseModules(courseId);
           console.log(modules);
           setModules(modules);
           setIsEnroll(true);
        }

        let student = await fetchStudent() as {id:string,role:string};
        //let instructor = await get();
       setInstructor(course.instructor_id );
        setCourse(course);
        setEditedCourse(course);
        

        let rateins = Instructor?.ratings?.get(student.id);
        if(rateins)setInstructorRating(rateins)

        let ratecourse = course?.ratings?.get(courseId);
        if(ratecourse)setInstructorRating(ratecourse)
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
        {(
          course.title
        )}
      </h1>

      <div className="bg-white shadow-md rounded-lg p-6">
  {/* Description */}
  <div className="text-lg text-gray-700 mb-4">
    <span className="font-semibold">Description:</span>{" "}
    {(
      course.description
    )}
  </div>

  {/* Category */}
  <div className="text-lg text-gray-700 mb-4">
    <span className="font-semibold">Category:</span>{" "}
    { (
      course.category
    )}
  </div>

  {/* Difficulty Level */}
  <div className="text-lg text-gray-700 mb-4">
    <span className="font-semibold">Difficulty Level:</span>{" "}
    {(
      course.difficulty_level
    )}
  </div>

  {/* Key Words */}
  <div className="text-lg text-gray-700 mb-4">
    <span className="font-semibold">Key Words:</span>{" "}
    { (
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

  {/* Instructor Info */}
  <div className="text-lg text-gray-700 mb-6">
    <span className="font-semibold">Instructor Name:</span>{" "}
    {Instructor?.name}
    <span className="font-semibold">Instructor Email:</span>{" "}
    {Instructor?.email}
    {IsEnroll &&
    <div className="text-lg text-gray-700 mb-4">
          <span className="font-semibold">Rate this Instructor:</span>
          <div className="flex items-center space-x-2 mt-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                onClick={() => handleRatingClick('instructor',star)}
                className={`text-2xl ${
                  InstructorRating >= star ? "text-yellow-500" : "text-gray-400"
                } hover:text-yellow-500`}
              >
                ★
              </button>
            ))}
          </div>
      </div>
      }
  </div>
      {IsEnroll &&
     <div className="text-lg text-gray-700 mb-4">
          <span className="font-semibold">Rate this course:</span>
          <div className="flex items-center space-x-2 mt-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                onClick={() => handleRatingClick('course',star)}
                className={`text-2xl ${
                  CourseRating >= star ? "text-yellow-500" : "text-gray-400"
                } hover:text-yellow-500`}
              >
                ★
              </button>
            ))}
          </div>
      </div>    
      }
      </div>

  {/* __________________________________ModulesPart_______________________________________ */}
  {IsEnroll&&
    <div className="modules-section mt-8">
        <h2 className="text-3xl font-bold text-gray-800 mb-6 text-center">Modules</h2>

        <div className="grid grid-cols-1 gap-6">
          {modules?.map((module, index) => (
            <ModuleCard key={index} module={module} course={course} />
          ))}
        </div>
    </div>
}

    <div className="modules-section mt-8">
      <h2 className="text-3xl font-bold text-gray-800 mb-6 text-center">Forum</h2>
      {course._id && course.title && (
        <ForumPreview courseId={course._id} courseTitle={course.title} />
      )}

    </div>
    </div>

);
};

export default CourseDetails;
