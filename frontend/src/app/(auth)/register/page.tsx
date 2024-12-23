'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator'; 

export default function RegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('');
  const [formState, setFormState] = useState<{ message: string | null; status: 'success' | 'error' | null }>({ message: null, status: null });
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
            setFormState({ message: 'Registration successful!', status: 'success' });

            const loginResponse = await fetch('/api/auth/login', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ email, password }),
            });
            
            //------------------redirection

            if (loginResponse.ok) {
              const data = await loginResponse.json();

              // Assuming the login response contains user data and token
              const { token, userRole } = data;

              // You can store the token in a cookie or localStorage
              localStorage.setItem('token', token);

              // Handle redirection based on user role
              if (userRole === "admin") {
                  router.push('/AdminHome');
              } else if (userRole === "instructor") {
                  router.push('/InstrHome');
              } else {
                  router.push('/StudHome');
              }
       
        } else {
            const errorData = await response.json();
            setFormState({ message: errorData.error || 'Registration failed', status: 'error' });
        }
      }
    } catch (error:any) {
      if (error.response.data?.message) {
        setFormState({ message: error.response.data.message, status: 'error' });
      } else {
        setFormState({ message: 'Unexpected error. Please try again.', status: 'error' });
    }
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
        <h1 className="text-2xl font-bold text-gray-800">Create an Account</h1>
        <p className="text-sm text-gray-600">
          Join us to continue your learning journey.
        </p>
      </div>
      <Separator />
      <form onSubmit={handleRegister} className="space-y-4">
        <div className="space-y-2">
          <div>
            <Label htmlFor="name" className="text-sm text-gray-700">
              Name
            </Label>
            <Input
              id="name"
              name="name"
              type="text"
              placeholder="Enter your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="text-gray-900"
            />
          </div>
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
          <div>
            <Label htmlFor="role" className="text-sm text-gray-700">
              Role
            </Label>
            <select
            value={role}
            onChange={(e) => setRole(e.target.value)}
            required
            className="p-2 border rounded-md w-full text-gray-700"
          >
            <option value="" disabled selected hidden className="text-gray-500">
              Please choose a role
            </option>
            <option value="student">Student</option>
            <option value="instructor">Instructor</option>
          </select>
          </div>
        </div>
        {formState.message && (
          <Alert
            variant={formState.status === 'success' ? 'default' : 'destructive'}
            className={`p-4 rounded-md ${formState.status === 'success' ? 'bg-green-200 border-green-400 text-green-800' : 'bg-red-200 border-red-400 text-red-800'}`}
          >
            <AlertTitle className="font-semibold">{formState.status === 'success' ? 'Success!' : 'Warning!'}</AlertTitle>
            <AlertDescription>{formState.message}</AlertDescription>
          </Alert>
        )}
        <Button type="submit" className="w-full bg-blue-800 hover:bg-blue-900 text-white">
          Register
        </Button>
      </form>
      <p className="text-sm text-center text-gray-600">
        Already have an account?{" "}
        <a href="/login" className="text-blue-700 hover:underline">
          Login here
        </a>
      </p>
    </Card>
  </div>
);
}