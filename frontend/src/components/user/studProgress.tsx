'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import ProgressBar from "@/components/ui/ProgressBar";

interface CourseProgress {
  courseId: string;
  courseTitle: string; // Add courseTitle field
  progress: number; 
}

const EnrolledCoursesClient = () => {
  const [courses, setCourses] = useState<CourseProgress[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');

  // Fetch courses and progress data
  useEffect(() => {
    async function fetchCourses() {
      try {
        const response = await fetch('/api/user/home', { method: 'GET' }); // Update with the correct API route
        if (!response.ok) throw new Error('Failed to fetch courses or progress.');
        const data = await response.json();
        setCourses(data.enrolledCourses.map((course: any, index: number) => ({
          courseId: course.id,
          courseTitle: course.title, // Add courseTitle field here
          progress: data.progressData[index]?.completionPercentage || 0, // Use completionPercentage
        })));
      } catch (err) {
        setError('Error loading courses or progress.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    fetchCourses();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>Enrolled Courses</CardTitle>
          <CardDescription>View your enrolled courses and progress</CardDescription>
        </CardHeader>
        <CardContent>
          {courses.length === 0 ? (
            <p>No enrolled courses found.</p>
          ) : (
            courses.map((course) => (
              <div key={course.courseId} className="mb-6">
                <h3 className="text-lg font-semibold">{course.courseTitle}</h3> {/* Use courseTitle */}
                <ProgressBar value={course.progress} max={100} />
                <p className="text-sm text-gray-500">{course.progress}% completed</p>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default EnrolledCoursesClient;
