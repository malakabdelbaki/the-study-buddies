"use client";

import React, { useState, useEffect } from "react";
import { Course } from "@/types/Course";
import CourseCard from "@/components/course/general/courseCard";
import { fetchCourses, fetchStudent } from "../../api/courses/student/courseRoute";
import { User } from "@/types/User";
import { useAuthorization } from "@/hooks/useAuthorization";


type token = {
  id:string;
  role:string;
}
const StudentCoursesPage = () => {
  useAuthorization(['student'])
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [coursescompleted,setCoursesCompleted] = useState<Course[]>([]);
  const [coursesinprogress,setCoursesInProgress] = useState<Course[]>([]);
  const [student,setStudent] = useState<token | undefined>();

  useEffect(() => {
    async function loadCourses() {
      try {
        const gett = await fetchCourses({ filters: {} });
        //console.log(gett);
        const std = await fetchStudent()  ; // Fetch student
      //console.log("Fetched student:", std);

      // Set the student state
      const complete = await getCompletedCoursesOfStudent((std as { id: string; role: string }).id);
        const completedCourses = complete;
        const notYetCompletedCourses = gett.filter(
          (course: Course) => !complete.some((completedCourse: Course) => completedCourse._id === course._id)
        );
       
        setCoursesCompleted(completedCourses);
        setCoursesInProgress(notYetCompletedCourses);
        setCourses(gett);
      } catch (err:any) {
        setError("Failed to load courses."+err.message);
      } finally {
        setLoading(false);
      }
    }

    async function getStudent(){
      const {id,role} = await fetchStudent() as token;
      setStudent({id,role});
      //onsole.log(studen);
    }
    

    loadCourses();
    getStudent();

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
      <div>
        <p>In-Progress Courses :</p>
      {!loading && coursesinprogress.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {courses.map((c) => (
            <CourseCard key={c._id} course={c} user={{ role: "student" }} explore={false}/>
          ))}
        </div>
      )}
      </div>
        <p>_______________________________________________________________</p>
        <div>
          <p>Completed Courses :</p>
          {!loading && coursescompleted.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                {courses.map((c) => (
                  <CourseCard key={c._id} course={c} user={{ role: "student" }}explore={false} />
                ))}
              </div>
            )}
        </div>
    </div>
  );
};

export default StudentCoursesPage;
