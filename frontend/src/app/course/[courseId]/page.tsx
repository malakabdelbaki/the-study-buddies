"use client";

import axiosInstance from "@/app/utils/axiosInstance";
import React, { useActionState, useEffect, useState } from "react";
import getCourseDetails from "./getCourseDetails";
import { Module } from "@/types/Module";
import { Course } from "@/types/Course";

const CourseDetails =  ({ params }: { params: Promise<{ courseId: string }>}) => {
    const [course,setCourse]= useState<Course>();
    const [modules,setModules] = useState<Module[]>(); 
    useEffect(()=>{
        async function LoadCourse(){
        try{
            const { courseId } = await params;
            const course = await getCourseDetails(courseId) as Course;
            setCourse(course);
            let mods : Module[] =[];
            course.modules?.forEach((module)=>{
                mods.push(module  as unknown as Module)
                console.log((module  as unknown as Module).title)
            }
            )

            setModules(course.modules as unknown as Module[]);
            console.log(mods);
        }
        catch(err){
            console.log(err);
        }
        }
        LoadCourse();
    },[])

    try {
  
      return (
        <div>
            {course  && <div>
            <h1>{course.title}</h1>
            <p>Category: {course.category}</p>
            <p>Difficulty Level: {course.difficulty_level}</p>
            <p>Description: {course.description}</p>
            
            </div>
            }
            {!course && <p>loading</p>}
        </div>
      );
    } catch (error) {
      return <p>Failed to load course details. Please try again later.</p>;
    }
};
  
export default CourseDetails;

