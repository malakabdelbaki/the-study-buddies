"use client";

import React, { useActionState, useEffect, useState } from "react";
import courseServer from "./api/courseServer";
import getCourses from "./api/getCourses";
import { Course } from "@/types/Course";
import CourseCard from "./components/courseCard";

const CoursesPage = () => {
  const [title, setTitle] = useState<string>("");
  const [category, setCategory] = useState<string>("");
  const [difficulty_level, setDifficulty_level] = useState<string>("");
  const [courses,setCourses]= useState<Course[]>([])
  const [state, formAction] = useActionState(courseServer, { message: "" });

  

  useEffect(() => {
    async function LoadCourses(){
      try{
        let gett = await getCourses({filters:{}});
        console.log(gett);
        setCourses(gett as Course[])
      }
      catch(err){
        console.log(err);
      }
    }
    
    LoadCourses(); // Fetch courses on component mount
  },[]);
  
  return (
    <div className="courses-page">

      <h1>All Courses</h1>
      <div>
        <ul>
        {courses.map((c) =><CourseCard  key={c._id} course={c}  />)}
        </ul>
      </div>
      <div>
      <form action={formAction}>
        <h2>Create a New Course</h2>
        <input
          name="title"
          type="text"
          placeholder="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
        <input
          name="category"
          type="text"
          placeholder="Category"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          required
        />
        <input
          name="difficulty_level"
          type="text"
          placeholder="Difficulty Level"
          value={difficulty_level}
          onChange={(e) => setDifficulty_level(e.target.value)}
          required
        />
        <button type="submit">Create a New Course</button>
        {state?.message && <p>{state.message}</p>}
      </form>
      <div>
        {title}, {category},{difficulty_level}
      </div>
    </div>
    </div>
  );
};

export default CoursesPage;
function handleClick() {
  throw new Error("Function not implemented.");
}

