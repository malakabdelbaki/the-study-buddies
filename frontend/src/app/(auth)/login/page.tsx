//this file contains client-side
//allows user to enter their creds, submit login form, trigger login server action

'use client'; //marker: code runs on client side (enables: react hooks, browser apis, client-side interactivity)
import { useActionState, useState } from "react"; //useActionState: helps manage submissions
//useState: manages local state of email and pass inputs
import { useRouter } from "next/navigation"; //allows page to redirect after sucessful login
//import axiosInstance from "@/app/utils/axiosInstance"; 
import login from "./login.server"; //handles login logic
import { extractToken } from "@/app/_lib/tokenExtract";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
//import { mascot } from "src/media/eLearningMascot-Photoroom.png"

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
      console.log(process.env.NEXT_PUBLIC_PORT);
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
    } catch (error:any) {
      if (error.response.data?.message) {
        setFormState({ message: error.response.data.message });
    } else {
        setFormState({ message: 'Unexpected error. Please try again.' });
    }
      // setFormState({ message: 'An error occurred. Please try again.' });
      
    }
  };
  
  return (
    <div className="flex items-center justify-center h-screen bg-gradient-to-b from-blue-800 to-blue-400">
      <Card className="w-full max-w-md p-6 space-y-6 bg-white shadow-lg rounded-md">
        <div className="text-center">
          <img
            src="/path-to-your-logo/owl-logo.png"
            alt="Logo"
            className="w-16 h-16 mx-auto mb-3"
          />
          <h1 className="text-2xl font-bold text-gray-800">Welcome Back!</h1>
          <p className="text-sm text-gray-600">
            Let’s continue your learning journey. Login to access your account.
          </p>
        </div>
        <Separator />
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <div>
              <Label htmlFor="email" className="text-sm text-gray-700">
                Email Address
              </Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="text-gray-900"
              />
            </div>
            <div>
              <Label htmlFor="password" className="text-sm text-gray-700">
                Password
              </Label>
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="text-gray-900"
              />
            </div>
          </div>
          <p className="text-sm text-red-500 text-center">{formState.message}</p>
          <Button type="submit" className="w-full bg-blue-800 hover:bg-blue-900 text-white">
            Login
          </Button>
        </form>
        <p className="text-sm text-center text-gray-600">
          Don't have an account?{" "}
          <a href="/register" className="text-blue-700 hover:underline">
            Sign up here
          </a>
        </p>
      </Card>
    </div>
  );
}