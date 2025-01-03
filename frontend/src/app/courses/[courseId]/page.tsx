
'use client';

import React, { useEffect, useState } from 'react';
import { Module } from '@/types/Module';
import { Course } from '@/types/Course';
import { User } from '@/types/User';
import { useParams } from 'next/navigation';
import { getUser } from "@/app/utils/GetUserId";
import Link from "next/link";
import { Role } from "@/enums/role.enum";
import { decodeToken } from "@/app/utils/decodeToken";

const CourseDetails = ({ params }: { params: Promise<{ courseId: string }> }) => {
  const [course, setCourse] = useState<Course>();
  const [instructor, setInstructor] = useState<User>();
  const [IsEnroll,setIsEnroll] = useState<boolean>(); 
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);


  const [students, setStudents] = useState<User[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { courseId } = useParams<{ courseId: string }>();
    const [ userRole, setUserRole ] = useState<Role | null>(null);  


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


  const fetchStudents = async () => {
    try {
      setError(null); // Reset error message
      if (User?.userRole === 'student') {
        throw new Error('Access denied: Only instructors or admins can view the student list.');
      }

    
      const { courseId } = await params; // Extract courseId from params
      console.log(courseId)

      const response = await fetch(`/api/courses/students/${courseId}`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${document.cookie.split('token=')[1]}`,
        },
      });
      

      if (!response.ok) {
        throw new Error('Failed to fetch students');
      }

      const data = await response.json();
      setStudents(data);
    } catch (err: any) {
      setError(err.message);
      setStudents(null); // Clear any previously fetched students
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
          <span className="font-semibold">Key Words:</span> {course.key_words?.join(', ')}
        </p>
        <p className="text-lg text-gray-700 mb-4">
          <span className="font-semibold">Number of Modules:</span> {course.modules?.length || 0}
        </p>

        <div className="mb-4">
          <h2 className="text-xl font-semibold text-gray-800">Instructor Information:</h2>
          <p>Name: {instructor?.name}</p>
          <p>Email: {instructor?.email}</p>
        </div>

        <p className="text-lg text-gray-700 mb-4">
          <span className="font-semibold">Rating:</span> {course.ratings?.keys?.length || 0} / 5
        </p>
        <p className="text-lg text-gray-700 mb-6">
          <span className="font-semibold">Number of Students:</span> {course.students?.length}
        </p>

        {message && (
          <p className={`text-lg font-semibold mb-4 ${message.includes("Successfully") ? "text-green-600" : "text-red-600"}`}>
            {message}
          </p>
        )}

        {(User?.userRole === 'admin') && (
        <button
          onClick={fetchStudents}
          className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors mb-4"
        >
          View Students
        </button>
      )}

        {error && <p className="text-red-500 text-lg">{error}</p>}

                  {students && (
            <div className="mt-4">
              <h3 className="text-lg font-bold">Students Enrolled:</h3>
              <ul className="list-disc list-inside">
                {students.map((student) => (
                  <li key={student._id}>
                    <p><strong>Name:</strong> {student.name}</p>
                    <p><strong>Email:</strong> {student.email}</p>
                    <p><strong>Role:</strong> {student.role}</p>
                    <p><strong>Average Grade In Course:</strong> {student.averageGrade}</p>
                  </li>
                ))}
              </ul>
            </div>
          )}
                {(User?.userRole==='student')?
                 ( !IsEnroll ? (
  
                <button
                    onClick={handleEnroll}
                    disabled={loading}
                    className={`bg-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors ${
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
                  )): (instructor?._id === course.instructor_id?._id) && <div>
                    <Link href={`/InstrCourses/${course?._id}`} className="text-blue-500 hover:underline text-lg font-semibold ml-2">
                        Go to your courses
                    </Link>
                    </div>
            }
    </div>
    </div>)
};


export default CourseDetails;