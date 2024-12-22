

//this file contains the server-side action that handles a login request!
//authenticate user, set cookie (if applicable), redirects the user (if login success)

'use server'; //marker: server-side action
import axiosInstance from "@/app/utils/axiosInstance"; //send HTTP reqs to backend server
import { redirect } from "next/navigation";
import { cookies } from "next/headers"; //allows server to interact with cookies
import { Course } from "@/types/Course";

export default async function getCourses({filters}:
  {filters:{category?:string,difficulty?:string,instructor?:string,key_word?:string,title?:string}})
   : Promise<Course[] | { message: string; }>{
    try{

      const params = new URLSearchParams({
      category: filters.category || "",
      title: filters.title || "",
      key_word:filters.key_word || "",
      difficulty:filters.difficulty || "",
      instructor:filters.instructor|| ""
       });
    const response = await axiosInstance.get(`courses?${params}`);
      console.log(response)
      if(response.status != 200){

        console.log(response)
        return{'message':'error'}

      }
      return response.data;
    } //after sucessful login user is redirected to about
    //Error handeling: (might improve)!!
      catch(error: any){
        console.log('Full error:', error);
        console.log('hi',error.response)
        let m = error.response;
        return {message:m}
      }
}