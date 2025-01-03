// import axiosInstance from '@/utils/axiosInstance';
'use server';
import { cookies } from "next/headers";
import jwt from 'jsonwebtoken';
import { Course } from "@/types/Course";
import axiosInstance from "@/app/utils/axiosInstance";
import { getModule } from "../instructor/moduleRoute";
import { Role } from "@/enums/role.enum";
// Fetch all courses with optional filters
export async function fetchCourses(filters = {}) {
  try {
    const {_id,role} = await fetch('/api/auth/me').then((res) => res.json());
    
    if (role!==Role.Student) {
        return new Response('Not a student', { status: 401 });
    } 

    const queryParams = new URLSearchParams(filters).toString();
    const response = await fetch(`/courses/student/enrolledCourses?${queryParams}`);
    
    return response.json();

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

    return {id:userid,role:userRole};
  } catch (error:any) {
    console.error('Error fetching user:', error.message);
    throw error;
  }
}


// Rate a course
export async function rateCourse(courseId: string, rating: number) {
  try {
    console.log('tosend',courseId);
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
    console.log(tosend);
    const { data } = await axiosInstance.post(`/users/rate/instructor`, tosend);
    console.log('dddddd',data);
    return data;
  } catch (error:any) {
    console.error('Error rating course:', error);
    throw error;
  }
}
