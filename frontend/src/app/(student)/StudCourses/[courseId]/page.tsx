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
import ForumPreview from "@/components/forum/ForumPreview";
import { useAuthorization } from "@/hooks/useAuthorization";
import { Role } from "@/enums/role.enum";
import { decodeToken } from "@/app/utils/decodeToken";
import { useRouter } from "next/navigation";

const CourseDetails = ({ params }: { params: Promise<{ courseId: string }> }) => {
  useAuthorization(['student'])
  const [course, setCourse] = useState<Course>();
  const [modules, setModules] = useState<Module[]>();
  const [Instructor,setInstructor] = useState<User>();
  const [Student,setStudent] = useState<{id:string,role:string}>();
  const [IsEnroll,setIsEnroll] =useState<boolean>(false);
  const [editedCourse, setEditedCourse] = useState(() => ({
    ...course,
    key_words: course?.key_words || [], // Make sure key_words is always an array
  }));  
  const [instructorRating, setInstructorRating] = useState<number | null>(null);
  const [courseRating, setCourseRating] = useState<number | null>(null);
 const [userId, setUserId] = useState<string | null>(null);

  const router = useRouter();
  const handleAnnouncementRedirect = () => {
    if (course?._id) {
      router.push(`/announcement?courseId=${course._id}`);
    }
  };
  // Handle rating
  const handleRatingClick = async (type: "instructor" | "course", star: number) => {
    if (type === "instructor" && Instructor) {
      setInstructorRating(star);
      const response = await fetch(`/api/courses/instructor/rate`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify ({ targetId: Instructor?._id, rating: star })
        }
        );
        
  
      console.log("Instructor Rating Response:", response);
    } else if (type === "course" && course) {
      setCourseRating(star);
      const response = await fetch(`/api/courses/${course._id}/rate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rating: star }),
      }
      )
      console.log("Course Rating Response:", response);
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
    const loadCourseDetails = async () => {
      try {
        // Fetch course, student, and Instructor details
        const { courseId } = await params;
        const fetchedCourse = await fetchCourseById(courseId);
        const fetchedStudent = await fetchStudent() as {id: string, role: string};

        if (fetchedCourse && fetchedStudent) {
          setCourse(fetchedCourse);
          setStudent(fetchedStudent);

          if (fetchedCourse.instructor_id) {
            setInstructor(fetchedCourse.instructor_id);
          }

          if (fetchedCourse.students.includes(fetchedStudent.id)) {
            setIsEnroll(true);
            const response = await fetch(`/api/courses/${courseId}/modules`,{
              method: 'GET'
            })
            setModules(await response.json());
          }

          if (fetchedCourse && fetchedCourse.ratings) {
            const courseRatingsMap = new Map(Object.entries(fetchedCourse.ratings as Map<string,number>) );
            setCourseRating(courseRatingsMap.get(fetchedStudent.id) || null);
          }

          if (fetchedCourse.instructor_id && fetchedCourse.instructor_id.ratings) {
            const instructorRatingsMap = new Map(Object.entries(fetchedCourse.instructor_id.ratings as Map<string,number>));
            setInstructorRating(instructorRatingsMap.get(fetchedStudent.id) || null);
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
                  Object.values(course.ratings).reduce((sum, value) => sum + Number(value), 0) /
                  Object.values(course.ratings).length
                ).toFixed(2)
              : 0}
            / 5
          </p>
        </div>
        <div className="text-lg text-gray-700 mb-6">
          <span className="font-semibold">Number of Students:</span> {course.students?.length}
        </div>

        {Instructor && (
          <div className="text-lg text-gray-700 mb-6">
            <span className="font-semibold">Instructor Name:</span> {Instructor.name}
            <br />
            <span className="font-semibold">Instructor Email:</span> {Instructor.email}
          </div>
        )}

        {IsEnroll && (
          <>
            <div className="text-lg text-gray-700 mb-4">
              <span className="font-semibold">Rate this Instructor:</span>
              <div className="flex items-center space-x-2 mt-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onClick={() => handleRatingClick("instructor", star)}
                    className={`text-2xl ${
                      (instructorRating || 0) >= star ? "text-yellow-500" : "text-gray-400"
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
                      (courseRating || 0) >= star ? "text-yellow-500" : "text-gray-400"
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

  {/* __________________________________ModulesPart_______________________________________ */}
  {IsEnroll&&
    <div className="modules-section mt-8">
        <h2 className="text-3xl font-bold text-gray-800 mb-6 text-center">Modules</h2>

        {/* <div className="grid grid-cols-1 gap-6">
          {modules && modules?.map((module, index) => (
            <ModuleCard key={index} module={module} course={course} />
          ))}
        </div> */}
    </div>
}

    <div className="modules-section mt-8">
      <h2 className="text-3xl font-bold text-gray-800 mb-6 text-center">Forum</h2>
      {course._id && course.title && (
        <ForumPreview courseId={course._id} courseTitle={course.title} />
      )}

<div className="divider my-8">
        <hr className="border-gray-300" />
      </div>

      <h1 className="text-center text-3xl font-semibold text-gray-800 my-4">Announcement</h1>

      <div className="text-center">
        <button
          onClick={handleAnnouncementRedirect}
          className="bg-black text-white text-sm px-4 py-2 rounded-md hover:bg-gray-800"
        >
          Go to Announcements
        </button>
      </div>
       </div>

  </div>
);
};

export default CourseDetails;

