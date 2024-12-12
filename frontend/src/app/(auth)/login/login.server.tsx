//this file contains the server-side action that handles a login request!
//authenticate user, set cookie (if applicable), redirects the user (if login success)

'use server'; //marker: server-side action
import axiosInstance from "@/app/utils/axiosInstance"; //send HTTP reqs to backend server
import { redirect } from "next/navigation";
import { cookies } from "next/headers"; //allows server to interact with cookies

export default async function login(prevState:any,formData:FormData){
    const cookieStore=await cookies()
    console.log(formData.get('email'))
    try{
    const response = await axiosInstance.post(`auth/login`, { //send login cred to backend for auth
      email:formData.get('email'),
      password: formData.get('password')
      });
      console.log(response)
      if(response.status != 201){

        console.log(response)
        return{'message':'error'}

      }
    //if login successful:

     // console.log(response.headers["set-cookie"]![0].split(';')[1].split('=')[1]);
    //   let token=response.headers["set-cookie"]![0].split(';')[0].split('=')[1] //extract auth token from set-cookie header
    //   let maxAge=parseInt(response.headers["set-cookie"]![0].split(';')[1].split('=')[1]) //extract expiration time
    //   console.log('token:',token)
    //   console.log('maxAge:',maxAge)
    // //token is stored as CookieFromServer with security flags
    // //using .set() sets the CookieFromServer with the token and maxAge extracted
    // await cookieStore.set('CookieFromServer',token,{secure:true,httpOnly:true,sameSite:true,maxAge})

    //   redirect('/about');

    const setCookieHeader = response.headers["set-cookie"]
    if (setCookieHeader && Array.isArray(setCookieHeader) && setCookieHeader.length > 0) {
      const [tokenPart, maxAgePart] = setCookieHeader[0].split(';')
      const token = tokenPart.split('=')[1]
      const maxAge = parseInt(maxAgePart.split('=')[1])

      console.log('token:', token)
      console.log('maxAge:', maxAge)

      // Set the cookie
      cookieStore.set('CookieFromServer', token, {
        secure: true,
        httpOnly: true,
        sameSite: 'strict',
        maxAge: maxAge
      })

      // Return success instead of redirecting
      return { success: true, message: 'Login successful' }
    } else {
      return { success: false, message: 'Invalid server response' }
    }
    } //after sucessful login user is redirected to about
    //Error handeling: (might improve)!!
      catch(error: any){
        console.log('Full error:', error);
        console.log('hi',error.response)
        let m = error.response;
        return {message:m}
      }
}