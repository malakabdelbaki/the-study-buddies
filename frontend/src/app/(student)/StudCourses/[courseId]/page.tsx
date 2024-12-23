"use client";

import React, { useEffect, useState } from "react";
import { Module } from "@/types/Module";
import { Course } from "@/types/Course";
import { User } from "@/types/User";
import {
  fetchCourseModules,
  fetchCourseById,
  rateCourse,
  rateInstructor,
  fetchStudent,
} from "../../../api/courses/student/courseRoute";
import ModuleCard from "../../../../components/course/general/moduleCard";

const CourseDetails = ({ params }: { params: { courseId: string } }) => {
  
  const [course, setCourse] = useState<Course | null>(null);
  const [modules, setModules] = useState<Module[]>([]);
  const [instructor, setInstructor] = useState<User | null>(null);
  const [student, setStudent] = useState<{ id: string; role: string } | null>(null);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [instructorRating, setInstructorRating] = useState<number>(0);
  const [courseRating, setCourseRating] = useState<number>(0);

  // Handle rating
  const handleRatingClick = async (type: "instructor" | "course", star: number) => {
    if (type === "instructor" && instructor) {
      setInstructorRating(star);
      const response = await rateInstructor({ targetId: instructor._id, rating: star });
      console.log("Instructor Rating Response:", response);
    } else if (type === "course" && course) {
      setCourseRating(star);
      const response = await rateCourse(course._id as string, star);
      console.log("Course Rating Response:", response);
    }
  };

  useEffect(() => {
    const loadCourseDetails = async () => {
      try {
        // Fetch course, student, and instructor details
        const { courseId } = await params;
        const fetchedCourse = await fetchCourseById(courseId);
        const fetchedStudent = await fetchStudent() as {id:string,role:string};

        if (fetchedCourse && fetchedStudent) {
          setCourse(fetchedCourse);
          setStudent(fetchedStudent );

          if (fetchedCourse.instructor_id) {
            setInstructor(fetchedCourse.instructor_id);
          }

          if (fetchedCourse.students.includes(fetchedStudent.id)) {
            setIsEnrolled(true);
            const fetchedModules = await fetchCourseModules(courseId);
            setModules(fetchedModules);
          }
        }
      } catch (error) {
        console.error("Error loading course details:", error);
      }
    };

    loadCourseDetails();
  }, [params]);

  if (!course) {
    return <p className="text-center text-lg">Loading course details...</p>;
  }

  return (
    <div className="course-details p-6 max-w-4xl mx-auto">
      <h1 className="text-4xl font-bold mb-4 text-center text-gray-800">{course.title}</h1>

      <div className="bg-white shadow-md rounded-lg p-6">
        <div className="text-lg text-gray-700 mb-4">
          <span className="font-semibold">Description:</span> {course.description}
        </div>
        <div className="text-lg text-gray-700 mb-4">
          <span className="font-semibold">Category:</span> {course.category}
        </div>
        <div className="text-lg text-gray-700 mb-4">
          <span className="font-semibold">Difficulty Level:</span> {course.difficulty_level}
        </div>
        <div className="text-lg text-gray-700 mb-4">
          <span className="font-semibold">Key Words:</span>
          <div className="flex flex-wrap gap-2">
            {course.key_words?.map((keyword, index) => (
              <span key={index} className="bg-blue-100 text-blue-800 rounded px-3 py-1">
                {keyword}
              </span>
            ))}
          </div>
        </div>
        <div className="text-lg text-gray-700 mb-4">
          <span className="font-semibold">Number of Modules:</span> {course.modules?.length || 0}
        </div>
        <div className="text-lg text-gray-700 mb-4">
          <p>
            Ratings:{" "}
            {course.ratings
                  ? (
                      Object.values(course.ratings).reduce((sum, value) => sum + value, 0) /
                      Object.values(course.ratings).length
                    ).toFixed(2)
                  : 0}

            / 5
          </p>
        </div>
        <div className="text-lg text-gray-700 mb-6">
          <span className="font-semibold">Number of Students:</span> {course.students?.length}
        </div>

        {instructor && (
          <div className="text-lg text-gray-700 mb-6">
            <span className="font-semibold">Instructor Name:</span> {instructor.name}
            <br />
            <span className="font-semibold">Instructor Email:</span> {instructor.email}
          </div>
        )}

        {isEnrolled && (
          <>
            <div className="text-lg text-gray-700 mb-4">
              <span className="font-semibold">Rate this Instructor:</span>
              <div className="flex items-center space-x-2 mt-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onClick={() => handleRatingClick("instructor", star)}
                    className={`text-2xl ${
                      instructorRating >= star ? "text-yellow-500" : "text-gray-400"
                    } hover:text-yellow-500`}
                  >
                    ★
                  </button>
                ))}
              </div>
            </div>

            <div className="text-lg text-gray-700 mb-4">
              <span className="font-semibold">Rate this Course:</span>
              <div className="flex items-center space-x-2 mt-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onClick={() => handleRatingClick("course", star)}
                    className={`text-2xl ${
                      courseRating >= star ? "text-yellow-500" : "text-gray-400"
                    } hover:text-yellow-500`}
                  >
                    ★
                  </button>
                ))}
              </div>
            </div>
          </>
        )}
      </div>

      {isEnrolled && (
        <div className="modules-section mt-8">
          <h2 className="text-3xl font-bold text-gray-800 mb-6 text-center">Modules</h2>
          <div className="grid grid-cols-1 gap-6">
            {modules.map((module, index) => (
              <ModuleCard key={index} module={module} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default CourseDetails;
 