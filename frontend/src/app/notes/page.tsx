"use client";

import React from "react";
import { useSearchParams } from "next/navigation";
import { NotesPageComponent } from "@/components/notes/NotesPage";

const NotesPage = () => {
  const searchParams = useSearchParams();
  const courseId = searchParams.get("courseId");
  const moduleId = searchParams.get("moduleId");

  if (!courseId || !moduleId) {
    return (
      <div className="container mx-auto mt-8 p-6">
        <p className="text-red-500 text-lg font-bold">
          Error: Missing course or module ID.
        </p>
        <p className="text-gray-700">
          Please ensure you accessed this page through the proper link from the module page.
        </p>
      </div>
    );
  }

  return (
    <div className="container mx-auto mt-8 p-6">
      <NotesPageComponent courseId={courseId} moduleId={moduleId} />
    </div>
  );
};

export default NotesPage;
