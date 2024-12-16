//this file contains client-side
//allows user to enter their creds, submit login form, trigger login server action

'use client'; //marker: code runs on client side (enables: react hooks, browser apis, client-side interactivity)
import { useActionState, useState } from "react"; //useActionState: helps manage submissions
//useState: manages local state of email and pass inputs
import { useRouter } from "next/navigation"; //allows page to redirect after sucessful login
import axiosInstance from "@/app/utils/axiosInstance"; 
import login from "./login.server"; //handles login logic

export default function LoginPage() {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const router = useRouter();
  const [formState, setFormState] = useState<{ message: string | null }>({ message: null });
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      // Make the POST request to the login API endpoint
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (response.ok) {
        const data = await response.json(); // Parse JSON data from the response
        setFormState({ message: 'Login successful!' });
        router.push('/about');
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