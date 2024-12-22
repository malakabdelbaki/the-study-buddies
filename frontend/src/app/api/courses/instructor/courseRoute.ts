// import axiosInstance from '@/utils/axiosInstance';
'use server';
import axiosInstance from "@/app/utils/axiosInstance";
import { cookies } from "next/headers";
import jwt from 'jsonwebtoken';
import { Course } from "@/types/Course";
import { Module } from "@/types/Module";
import { getModule } from "./moduleRoute";
import { Types } from "mongoose";
// Fetch all courses with optional filters
export async function fetchCourses(filters = {}) {
  try {
    let { data } = await axiosInstance.get('/courses', {
      params: filters,
    });
    data = data as Course[];

    const cookieStore = await cookies();
    const tokenCookie = cookieStore.get('token');

    if (!tokenCookie) {
      return new Response('Unauthorized', { status: 401 });
    }

    const decodedToken = jwt.decode(tokenCookie.value);

    if (!decodedToken) {
      console.log("Decoded token is invalid");
      return new Response('Invalid Token', { status: 401 });
    }

    const userid = (decodedToken as any)?.userid; 
    const userRole = (decodedToken as any)?.role; 

    if (userRole!=='instructor'){
      console.log("not an instructor");
      return new Response('Not an instructor', { status: 401 });
    }
    
    data = data.filter((course:Course)=> course.instructor_id?._id.toString() === userid);
    return data;
  } catch (error:any) {
    console.error('Error fetching courses:', error.message);
    throw error;
  }
}



// Fetch a single course by ID
export async function fetchCourseById(courseId: string) {
  try {
    const { data } = await axiosInstance.get(`/courses/${courseId}`);
    return data;
  } catch (error:any) {
    console.error('Error fetching course:', error.message);
    throw error;
  }
}



// Create a new course
export async function createCourse(courseData: object) {
  try {
    const { data } = await axiosInstance.post('/courses', courseData);
    return data;
  } catch (error:any) {
    console.error('Error creating course:', error.message);
    throw error;
  }
}



// Update a course by ID
export async function updateCourse(courseId: string, updateData: Course ={}) {
  try {
    console.log('haa',updateData);
    let sent = {
      description:updateData.description,
      title:updateData.title,
      key_words:updateData.key_words,
      difficulty_level:updateData.difficulty_level,
      category:updateData.category
    }
    const { data } = await axiosInstance.patch(`/courses/${courseId}`, sent);
    return data;
  } catch (error:any) {
    console.error('Error updating course:', error.message);
    throw error;
  }
}



// Fetch modules of a course by course ID
export async function fetchCourseModules(courseId: string) {
  try {
    const { data } = await axiosInstance.get(`/courses/${courseId}/modules`);
    const modules = await Promise.all(
      data.map(async (module: Types.ObjectId) => {
        return await getModule(module.toString());
      })
    );
    console.log(modules);
    return modules;
  } catch (error:any) {
    console.error('Error fetching course modules:', error.message);
    throw error;
  }
}



// Delete a course by ID
export async function deleteCourse(courseId: string) {
  try {
    const { data } = await axiosInstance.delete(`/courses/${courseId}`);
    return data;
  } catch (error:any) {
    console.error('Error deleting course:', error.message);
    throw error;
  }
}


export async function fetchInstructor() {
  try {
    const cookieStore = await cookies();
    const tokenCookie = cookieStore.get('token');

    if (!tokenCookie) {
      return new Response('Unauthorized', { status: 401 });
    }

    const decodedToken = jwt.decode(tokenCookie.value);

    if (!decodedToken) {
      console.log("Decoded token is invalid");
      return new Response('Invalid Token', { status: 401 });
    }

    const userid = (decodedToken as any)?.userid; 
    const userRole = (decodedToken as any)?.role; 

    return {id:userid,role:userRole};
  } catch (error:any) {
    console.error('Error deleting course:', error.message);
    throw error;
  }
}

//the instructor can not rate a course !!

// // Rate a course
// export async function rateCourse(courseId: string, rating: number) {
//   try {
//     const { data } = await axiosInstance.post(`/courses/${courseId}/rate`, {
//       rating,
//     });
//     return data;
//   } catch (error:any) {
//     console.error('Error rating course:', error.message);
//     throw error;
//   }
// }
