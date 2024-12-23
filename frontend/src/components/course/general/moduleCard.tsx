'use client';
import { Card, CardContent, CardFooter, CardTitle } from "@/components/ui/card";
import { Course } from "@/types/Course";
import { Module } from "@/types/Module";
import Link from "next/link";
import { useRouter } from "next/navigation"; 
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { decodeToken } from "@/app/utils/decodeToken";
import { Role } from "@/enums/role.enum";

const ModuleCard = ({ module, course }:{module:Module, course:Course}) => {

  const [userRole, setUserRole] = useState<Role | null>(null);
  const router = useRouter();
  const handleRedirectToNotes = () => {
    console.log("Redirecting to notes");  
    console.log(course._id);
    console.log(module._id);
    router.push(`/notes?courseId=${course._id}&moduleId=${module._id}`);
  };

   useEffect(() => {
      const token = document.cookie
        .split("; ")
        .find((row) => row.startsWith("token="))?.split("=")[1];
  
      if (token) {
        const role = decodeToken(token)?.role;
        setUserRole(role);
      }
    }, []);


    return (
      <Card className="bg-white shadow-md rounded-lg p-4">
        <CardTitle className="text-xl font-semibold text-gray-800 mb-2">{module.title}</CardTitle>
        <CardContent>
        <p className="text-gray-600 mb-2">{module.content}</p>
        <p className="text-gray-500">Number of resources: {module.quiz_type}</p>
        <p className="text-gray-500">Quiz Type: {module.quiz_type}</p>
        <p className="text-gray-500">Quiz Length: {module.quiz_length}</p>
        <p className="text-gray-500">Difficulty: {module.module_difficulty}</p>
        </CardContent>
        <CardFooter className="justify-between">
        <Link
          href={`${module.course_id}/modules/${module._id}`}
          className="text-blue-500 hover:underline"
        >
          View Module Details
        </Link>
        {course?.isNoteEnabled && userRole==Role.Student && (
        <Button
          className="mt-4 bg-baby-blue text-navy"
          onClick={handleRedirectToNotes}
        >
          Go to Notes
        </Button>
      )}
      </CardFooter>
      </Card>
    );
  };
  
  export default ModuleCard;