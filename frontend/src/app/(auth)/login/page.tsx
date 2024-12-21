//this file contains client-side
//allows user to enter their creds, submit login form, trigger login server action

'use client'; //marker: code runs on client side (enables: react hooks, browser apis, client-side interactivity)
import { useActionState, useState } from "react"; //useActionState: helps manage submissions
//useState: manages local state of email and pass inputs
import { useRouter } from "next/navigation"; //allows page to redirect after sucessful login
//import axiosInstance from "@/app/utils/axiosInstance"; 
import login from "./login.server"; //handles login logic
import { extractToken } from "@/app/_lib/tokenExtract";

export default function LoginPage() {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const router = useRouter();
  const [formState, setFormState] = useState<{ message: string | null }>({ message: null });
  const [userRole, setUserRole] = useState<string | null>(null);
  const [userId, setUserId] = useState<any>(null);  // Add a state to store userId as well
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      // Make the POST request to the login API endpoint
      const response = await fetch('/api/auth/login', { //go to proxy server, inside route
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (response.ok) {
        const data = await response.json(); // Parse JSON data from the response
        setFormState({ message: 'Login successful!' });

        //------------------redirection
        const tokenData = await extractToken();
        
        if (tokenData instanceof Response) {
          // If the result is a Response (Unauthorized or Invalid Token)
          console.log(tokenData.statusText); // You can handle the response here
          return;
        }

        // Otherwise, destructure userId and userRole from the returned object
        const { userId, userRole } = tokenData;
        setUserRole(userRole);
        setUserId(userId);

        if (userRole == "admin") {
          router.push('/AdminHome');
        } else if (userRole == "instructor") {
          router.push('/InstrHome');
        } else {
          router.push('/StudHome');
        }

        //----------------------

      } else {
        const errorData = await response.json();
        setFormState({ message: errorData.error || 'Login failed. Please try again.' });
      }
    } catch (error) {
      setFormState({ message: 'An error occurred. Please try again.' });
    }
  };
  
  return (
    <form onSubmit={handleSubmit}>
      <h1>Login</h1>
      <input
      name="email"
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
      />
      <input
      name='password'
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
      />
      <p>{formState.message}</p>
      <button type="submit">Login</button>
    </form>
  );
}