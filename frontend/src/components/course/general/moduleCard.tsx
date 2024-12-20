import { Card, CardContent, CardFooter, CardTitle } from "@/components/ui/card";
import { Module } from "@/types/Module";
import Link from "next/link";
import { useEffect } from "react";

const ModuleCard = ({ module }:{module:Module}) => {

    return (
      <Card className="bg-white shadow-md rounded-lg p-4">
        <CardTitle className="text-xl font-semibold text-gray-800 mb-2">{module.title}</CardTitle>
        <CardContent>
        <p className="text-gray-600 mb-2">{module.content}</p>
        <p className="text-gray-500">Number of resources: {module.quiz_type}</p>
        <p className="text-gray-500">Quiz Type: {module.quiz_type}</p>
        <p className="text-gray-500">Quiz Length: {module.quiz_length}</p>
        </CardContent>
        <CardFooter className="justify-between">
        <Link
          href={`${module.course_id}/modules/${module._id}`}
          className="text-blue-500 hover:underline"
        >
          View Module Details
        </Link>
      </CardFooter>
      </Card>
    );
  };
  
  export default ModuleCard;