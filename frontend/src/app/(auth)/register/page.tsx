'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
//import axiosInstance from '@/app/utils/axiosInstance';
let backend_url = "http://localhost:3001";
import axios from 'axios';

export default function RegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('');
  const [formState, setFormState] = useState<{ message: string | null }>({ message: null });
  const router = useRouter();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
        const response = await fetch('/api/auth/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, email, password, role }),
        });

        if (response.ok) {
            setFormState({ message: 'Registration successful!' });
            router.push('/about'); // Redirect on success
        } else {
            const errorData = await response.json();
            setFormState({ message: errorData.error || 'Registration failed' });
        }
    } catch (error) {
        setFormState({ message: 'An error occurred. Please try again.' });
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