'use server'; //marker: server-side action
import axios from "axios";
import { cookies } from "next/headers"; //allows server to interact with cookies

export default async function register(formData:FormData){
    console.log(formData.get('email'))
    try{
    const response = await axios.post(`auth/register`, { //send login cred to backend for auth
      name:formData.get('name,'),  
      email:formData.get('email'),
      password: formData.get('password'),
      role: formData.get('role')
      });
      console.log(response)
      if(response.status != 201){

        console.log(response)
        return{'message':'error'}

      }

      // After successful registration, attempt to log in
    const loginResponse = await axios.post('auth/login', {
      email: formData.get('email'),
      password: formData.get('password')
    });

    // const setCookieHeader = response.headers["set-cookie"]
    // if (setCookieHeader && Array.isArray(setCookieHeader) && setCookieHeader.length > 0) {
    //   const [tokenPart, maxAgePart] = setCookieHeader[0].split(';')
    //   const token = tokenPart.split('=')[1]
    //   const maxAge = parseInt(maxAgePart.split('=')[1])

    //   console.log('token:', token)
    //   console.log('maxAge:', maxAge)

    //   // Set the cookie
    //   cookieStore.set('CookieFromServer', token, {
    //     secure: true,
    //     httpOnly: true,
    //     sameSite: 'strict',
    //     maxAge: maxAge
    //   })
    if (loginResponse.headers['set-cookie']){

    }
      // Return success instead of redirecting
      //return { success: true, message: 'Register successful' }
    // } else {
    //   return { success: false, message: 'Invalid server response' }
    // }
    } //after sucessful login user is redirected to about
    //Error handeling: (might improve)!!
      catch(error: any){
        console.log('Full error:', error);
        console.log('hi',error.response)
        const m = error.response;
        return {message:m} //i feel like this was sent bas idk why
      }
}