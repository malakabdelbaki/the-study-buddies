'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import axiosInstance from '@/app/utils/axiosInstance';
let backend_url = "http://localhost:3001";

export default function RegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const router = useRouter();
  const [role, setRole] = useState('');

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    try{ 
      console.log("hello1")
         const response = await axiosInstance.post(
        `${backend_url}/auth/register`,
        {
         email,
         password,
         name,
         //age:25, //default
         courses:[], //default no courses
          role,
        },
      );
      console.log("hello2")
      const { status, data } = response;
      if (status == 201) {
        // handleSuccess(message);
        // setSucessMessage("SignUp successfuly");
        setTimeout(() => {
            router.push('/login'); 
        }, 1000);
      } else {
        // setErrorMessage(message);
        console.log("hello3")
        // handleError(message);
      
    } 
    } catch (err: any) {
      console.error('Registration error:', err.response?.data || err.message);
      alert('Registration failed');
    }
  };

  return (
    <form onSubmit={handleRegister}>
      <h1>Register</h1>
      <input
        type="text"
        placeholder="Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        required
      />
      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
      />
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
      />

      <select
        value={role}
        onChange={(e) => setRole(e.target.value)}
        required
      >
        <option value="student">Student</option>
        <option value="instructor">Instructor</option>
      </select>

      <button type="submit">Register</button>
    </form>
  );
};