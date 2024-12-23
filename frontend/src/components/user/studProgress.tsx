'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen } from 'lucide-react'; // Import the BookOpen icon
import ProgressBar from "@/components/ui/ProgressBar";

interface CourseProgress {
  courseId: string;
  courseTitle: string;
  progress: number;
}

const EnrolledCoursesClient = () => {
  const [courses, setCourses] = useState<CourseProgress[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    async function fetchCourses() {
      try {
        const response = await fetch('/api/user/home', { method: 'GET' , headers: {
          Authorization: `Bearer ${document.cookie.split('token=')[1]}`,
        },});
        console.log(response.status)
        if (!response.ok) throw new Error('Failed to fetch courses or progress.');
        const data = await response.json();
        setCourses(data.enrolledCourses.map((course: any, index: number) => ({
          courseId: course.id,
          courseTitle: course.title,
          progress: data.progressData[index]?.completionPercentage || 0,
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
    <Card>
      <CardHeader>
        <CardTitle>Enrolled Courses</CardTitle>
        <CardDescription>View your enrolled courses and progress</CardDescription>
      </CardHeader>
      <CardContent>
        {courses.length === 0 ? (
          <p> No enrolled courses found.</p>
        ) : (
          courses.map((course) => (
            <div key={course.courseId} className="mb-6 flex items-center gap-4">
              {/* Icon next to the course title */}
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                <BookOpen className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h3 className="text-lg font-semibold">{course.courseTitle}</h3>
                <ProgressBar value={course.progress} max={100} />
                <p className="text-sm text-gray-500">{course.progress}% completed</p>
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
};

export default EnrolledCoursesClient;
