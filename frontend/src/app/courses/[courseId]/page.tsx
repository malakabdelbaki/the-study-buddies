"use client";

import React, { useEffect, useState } from "react";
import getCourseDetails from "../api/getCourseDetails";
import { Module } from "@/types/Module";
import { Course } from "@/types/Course";
import { User } from "@/types/User";

const CourseDetails = ({ params }: { params: Promise<{ courseId: string }> }) => {
  const [course, setCourse] = useState<Course>();
  const [modules, setModules] = useState<Module[]>();
  const [Instructor,setInstructor] = useState<User>();

  useEffect(() => {
    async function loadCourse() {
      try {
        const { courseId } = await params;
        let course = await getCourseDetails(courseId);
        const instructor = await fetch('/api/user/profile', {
          method: 'GET',
          cache: 'no-store',
        });
        
        course = course as Course;
        setCourse(course);
        setInstructor(instructor as unknown as User);
        let mods: Module[] = [];
        course.modules?.forEach((module) => {
          mods.push(module as unknown as Module);
        });
        setModules(mods);
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

        <button className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors">
          Enroll in this Course
        </button>
      </div>
    </div>
  );
};

export default CourseDetails;
