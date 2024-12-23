// import axiosInstance from '@/utils/axiosInstance';
'use server';
import { cookies } from "next/headers";
import jwt from 'jsonwebtoken';
import { Course } from "@/types/Course";
import { Module } from "@/types/Module";
import { Types } from "mongoose";
import axiosInstance from "@/app/utils/axiosInstance";
import { getModule } from "../instructor/moduleRoute";
// Fetch all courses with optional filters
export async function fetchCourses(filters = {}) {
  try {
    const {id,role} = await fetchStudent() as {id:any,role:any};

    if (role!=='student'){
        console.log("not a student");
        return new Response('Not a student', { status: 401 });
    } 

    let { data } = await axiosInstance.get(`users/${id}/courses/enrolled`, {
      params: filters,
    });
    console.log('go and return',data)
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
    console.log(data);
    return data;
  } catch (error:any) {
    console.error('Error fetching course:', error.message);
    throw error;
  }
}



// Fetch modules of a course by course ID
export async function fetchCourseModules(courseId: string) {
  try {
    const { data } = await axiosInstance.get(`/courses/${courseId}/modules`);
    const modules = await Promise.all(
      data.map(async (module: string) => {
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




export async function fetchStudent() {
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

    const ret ={id:userid,role:userRole};
    console.log("rrr",typeof ret,ret); 
    return ret;
  } catch (error:any) {
    console.error('Error fetching user:', error.message);
    throw error;
  }
}




// Rate a course
export async function rateCourse(courseId: string, rating: number) {
  try {
    const { data } = await axiosInstance.post(`/courses/${courseId}/rate`, {
      rating,
    });
    return data;
  } catch (error:any) {
    console.error('Error rating course:', error.message);
    throw error;
  }
}

export async function rateInstructor(tosend: {targetId: string, rating: number}) {
  try {
    const { data } = await axiosInstance.post(`/users/rate/instructor`, tosend);
    console.log(data);
    return data;
  } catch (error:any) {
    console.error('Error rating course:', error);
    throw error;
  }
}
