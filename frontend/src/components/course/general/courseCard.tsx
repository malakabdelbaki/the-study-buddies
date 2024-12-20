// app/courses/components/CourseCard.tsx
import React from "react";
import Link from "next/link";
import { User } from "@/types/User";
import { Course } from "@/types/Course";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";

const CourseCard = ({ course, user }: { course: Course; user: { id?: string; role?: string } | null}) => {
  let inst_info = course.instructor_id as unknown as User;

  return (
    <Card className="w-full max-w-md mx-auto">
      {/* Card Header */}
      <CardHeader>
        <CardTitle>{course.title}</CardTitle>
        <CardDescription>{course.description}</CardDescription>
      </CardHeader>

      {/* Card Content */}
      <CardContent>
        <p>
          <strong>Category:</strong> {course.category}
        </p>
        <p>
          <strong>Level:</strong> {course.difficulty_level}
        </p>
        <p>
          <strong>Modules:</strong> {course.modules?.length || 0}
        </p>
        <p>
          <strong>Instructor:</strong> {inst_info?.name || "Unknown"}
        </p>
        {course.key_words&&course.key_words?.length > 0 && (
          <div>
            <strong>Keywords:</strong>
            <ul className="list-disc list-inside">
              {course.key_words.map((word, index) => (
                <li key={index}>{word}</li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>

      {/* Card Footer */}
      <CardFooter className="justify-between">
        <Link
          href={ (user?.role==='instructor')?`InstrCourses/${course._id}`: `courses/${course._id}`}
          className="text-blue-500 hover:underline"
        >
          View Course Details
        </Link>
      </CardFooter>
    </Card>
  );
};

export default CourseCard;
