import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import axios from 'axios';
import axiosInstance from '@/app/utils/axiosInstance';

// Helper to decode JWT and extract user info
const getUserFromToken = async () => {
  const cookieStore = await cookies();
  const tokenCookie = cookieStore.get('token');

  if (!tokenCookie) throw new Error('Unauthorized');
  const decodedToken = jwt.decode(tokenCookie.value);

  if (!decodedToken) throw new Error('Invalid Token');

  return {
    userId: (decodedToken as any)?.userid,
    role: (decodedToken as any)?.role,
    token: tokenCookie.value, // Include the raw token for external requests
  };
};

// GET: Retrieve Enrolled Courses and their Progress
export async function GET(req: Request) {
  try {
    const { userId, token, role } = await getUserFromToken();

    // Step 1: Fetch enrolled courses for the student or any courses if the user is an admin or instructor
    let enrolledCoursesResponse;
      enrolledCoursesResponse = await axios.get(
        `http://localhost:${process.env.NEXT_PUBLIC_PORT}/api/users/${userId}/courses/enrolled`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      console.log(userId + enrolledCoursesResponse.data)

    const enrolledCourses = enrolledCoursesResponse.data;
    if (!enrolledCourses || enrolledCourses.length === 0) {
      return NextResponse.json({ error: 'No enrolled courses found' }, { status: 404 });
    }

    console.log(enrolledCourses)

    // Step 2: Fetch progress for each course
    const progressPromises = enrolledCourses.map(async (course: { id: string, title:string }) => {
      const progressResponse = await axios.get(
        `http://localhost:3000/api/users/courses/${course.id}/student/${userId}/progress`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
       // Log the response data to inspect its structure
       console.log('Progress Response:', progressResponse.data);

       // Extract completionPercentage from the progress data
       const completionPercentage = progressResponse.data.completionPercentage; // Update this if the structure is different
       
       console.log(completionPercentage);
       return {
         courseId: course.id,
         completionPercentage: completionPercentage ,  // Ensure fallback to 0 if no progress is available
       };
     });

    const progressData = await Promise.all(progressPromises);

    return NextResponse.json({ enrolledCourses, progressData });
  } catch (error: any) {
    console.error('Error fetching enrolled courses or progress:', error.message);
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}


export async function getCompletedCoursesOfStudent(userId: string) {
  try {
    const { data } = await axiosInstance.get(`/users/${userId}/courses/completed`);
    return data;
  } catch (error:any) {
    console.error('Error fetching course modules:', error.message);
    throw error;
  }
}


