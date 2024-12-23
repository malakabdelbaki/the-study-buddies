'use server'; //marker: server-side action
import axiosInstance from "@/app/utils/axiosInstance"; //send HTTP reqs to backend server
import { Course } from "@/types/Course";

export default async function getCourses(courseId : string)
   : Promise<Course | { message: string; }>{
    try{

    const response = await axiosInstance.get(`courses/${courseId}`);
      console.log(response.data)
      if(response.status != 200){

        return{'message':'error'}

      }
      return response.data;
    } //after sucessful login user is redirected to about
    //Error handeling: (might improve)!!
      catch(error: any){
        console.log('ERROR',error.response)
        const m = error.response.message;
        return {message:m}
      }
}