'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuthorization } from "@/hooks/useAuthorization";
import { BookOpen } from 'lucide-react';
import Link from "next/link";
import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import axios from 'axios';
import { Course } from '@/types/Course';  
import StudentProgressCard from "@/components/user/InstAdstudProgress"

export default function InstructorHomePage() {
  useAuthorization(['instructor']);

  // State to hold course objects
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        // Assuming the API is available at this endpoint
        const response = await axios.get('/api/user'); // Adjust this URL to the correct one that returns courses
        setCourses(response.data); // Set the courses to state
      } catch (err: any) {
        setError('Failed to fetch courses');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchCourses(); // Fetch courses when the component mounts
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-4xl font-bold">Welcome back, Instructor</h1>
          <p className="text-xl text-muted-foreground mt-2">Here's an overview of your teaching activities</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <Card>
          <CardHeader>
            {/* Make the title clickable */}
            <Link href="/InstrCourses">
              <CardTitle className="cursor-pointer text-primary hover:underline">
                My Courses
              </CardTitle>
            </Link>
            <CardDescription>Courses you're currently teaching</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {courses.length > 0 ? (
                courses.map((course, index) => (
                  <div key={course._id} className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                      <BookOpen className="w-6 h-6 text-primary" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold">{course.title}</h3> {/* Display course title */}
                      <p className="text-sm text-muted-foreground">{course.description}</p> {/* Optional description */}
                    </div>
                    <Badge variant="outline">Active</Badge>
                  </div>
                ))
              ) : (
                <div>No courses found</div>
              )}
            </div>
            <Button asChild className="w-full mt-4">
              <Link href="/InstrCourses">Manage Courses</Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Student Progress Overview</CardTitle>
          </CardHeader>
          <CardContent>
           <StudentProgressCard/>
          </CardContent>
        </Card>
      </div>

      <div className="mt-8 flex justify-between items-center">
        <Button asChild>
          <Link href="/instructorReport">View Detailed Reports</Link>
        </Button>
      </div>
    </div>
  );
}
