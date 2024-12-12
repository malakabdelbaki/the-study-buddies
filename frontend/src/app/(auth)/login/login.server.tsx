//this file contains the server-side action that handles a login request!
//authenticate user, set cookie (if applicable), redirects the user (if login success)

'use server' //marker: server-side action
import axiosInstance from "@/app/utils/axiosInstance"; //send HTTP reqs to backend server
import { redirect } from "next/navigation";
import { cookies } from "next/headers"; //allows server to interact with cookies
let backend_url = "http://localhost:3001"; //discuss?

export default async function login(prevState:any,formData:FormData){
    const cookieStrore=await cookies()
    console.log(formData.get('email'))
    try{
    const response = await axiosInstance.post(`${backend_url}/auth/login`, { //send login cred to backend for auth
      email:formData.get('email'),
      password: formData.get('password')
      });
      if(response.status != 201){

        console.log(response)
        return{'message':'error'}

    }
    //if login successful:

     // console.log(response.headers["set-cookie"]![0].split(';')[1].split('=')[1]);
      let token=response.headers["set-cookie"]![0].split(';')[0].split('=')[1] //extract auth token from set-cookie header
      let maxAge=parseInt(response.headers["set-cookie"]![0].split(';')[1].split('=')[1]) //extract expiration time

    //token is stored as CookieFromServer with security flags
    //using .set() sets the CookieFromServer with the token and maxAge extracted
      cookieStrore.set('CookieFromServer',token,{secure:true,httpOnly:true,sameSite:true,maxAge})
      redirect('/about');} //after sucessful login user is redirected to about
      
    //Error handeling: (might improve)!!
      catch(error: any){
        console.log('Full error:', error);
console.log('hi',error.response?.data?.message)
let m=error.response.data.message
return {message:m}
      }
}

//Personal Note: should logging be added here?
//bas la2 i don't think so cuz it's handled in the backend 