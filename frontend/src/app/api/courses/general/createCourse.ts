// // app/courses/api/getCourses.ts

// import axiosInstance from "../../utils/axiosInstance";
// import { Course } from "../types/course";

// const getCourses = async(): Promise<Course[]> => {
//   // const params = new URLSearchParams({
//   //   search: searchQuery,
//   //   category: filters.category || "",
//   //   level: filters.level || "",
//   // });
//   console.log('dd');
//   try{
//     console.log("Posting a new course:");
//     const response = await axiosInstance.get('/courses');
//     console.log("Course posted successfully:", response.data);
//     return response.data; // Return the created course
//   }
//   catch(err){
//     console.log(err);
//     return [];
//   }
  
// };

// export default getCourses;


//this file contains the server-side action that handles a login request!
//authenticate user, set cookie (if applicable), redirects the user (if login success)

'use server'; //marker: server-side action
import axiosInstance from "@/app/utils/axiosInstance"; //send HTTP reqs to backend server
import { redirect } from "next/navigation";
import { cookies } from "next/headers"; //allows server to interact with cookies

export default async function courseServer(prevState:any,formData:FormData){
    try{
      console.log(formData.get('title'))
    const response = await axiosInstance.post(`courses`, { //send login cred to backend for auth
      title:formData.get('title'),
      category:formData.get('category'),
      difficulty_level: formData.get('difficulty_level')
      });
      console.log(response)
      if(response.status != 201){

        console.log(response)
        return{'message':'error'}

      }
    
    } //after sucessful login user is redirected to about
    //Error handeling: (might improve)!!
      catch(error: any){
        console.log('Full error:', error);
        console.log('hi',error.response)
        const m = error.response;
        return {message:m}
      }
}