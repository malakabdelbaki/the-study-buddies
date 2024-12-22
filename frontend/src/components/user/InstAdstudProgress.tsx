'use client';

import React, { useState } from "react";
import { Card, CardHeader, CardContent, CardFooter, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar } from "@/components/ui/avatar";

const StudentProgressCard = () => {
  const [studentName, setStudentName] = useState("");
  const [courseName, setCourseName] = useState("");
  const [progress, setProgress] = useState<any | null>(null);
  const [editableCompletionPercentage, setEditableCompletionPercentage] = useState<number>(0);

  const fetchProgress = async () => {
    if (!studentName || !courseName) {
      alert("Please enter both the student name and the course name.");
      return;
    }

    try {
      // Construct the URL with query parameters for title and name
      const url = new URL('/api/user/home/progress', window.location.origin);
      url.searchParams.append('title', courseName);  // Add course name to query
      url.searchParams.append('name', studentName);  // Add student name to query

      // Make the GET request with query parameters
      const response = await fetch(url.toString(), {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) throw new Error("Failed to fetch progress");

      const data = await response.json();
      setProgress(data);
      // Set initial editable completion percentage
      setEditableCompletionPercentage(data.completionPercentage);
    } catch (error) {
      console.error(error);
      alert("Error fetching progress. Please check inputs or try again.");
    }
  };

  const updateCompletionPercentage = async () => {
    if (editableCompletionPercentage < 0 || editableCompletionPercentage > 100) {
      alert("Please enter a valid percentage between 0 and 100.");
      return;
    }

    try {
        // Construct the URL with query parameters for title and name
      const url = new URL('/api/user/home/progress', window.location.origin);
      url.searchParams.append('title', courseName);  // Add course name to query
      url.searchParams.append('name', studentName);  // Add student name to query
      // Make the PUT request to update the completion percentage
      const response = await fetch(url.toString(), {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          completionPercentage: editableCompletionPercentage,
        }),
      });

      if (!response.ok) throw new Error("Failed to update progress");

      // Update the progress state with the new completion percentage
      setProgress((prevState: any) => ({
        ...prevState,
        completionPercentage: editableCompletionPercentage,
      }));
      alert("Progress updated successfully :)");

    } catch (error) {
      console.error(error);
      alert("Error updating completion percentage. Please try again.");
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <div className="flex items-center space-x-4">
          <Avatar className="w-10 h-10 bg-muted" />
          <CardTitle>Student Progress</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <Label htmlFor="studentName">Student Name</Label>
            <Input
              id="studentName"
              value={studentName}
              onChange={(e) => setStudentName(e.target.value)}
              placeholder="Enter student name"
            />
          </div>
          <div>
            <Label htmlFor="courseName">Course Name</Label>
            <Input
              id="courseName"
              value={courseName}
              onChange={(e) => setCourseName(e.target.value)}
              placeholder="Enter course name"
            />
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <Button onClick={fetchProgress} className="w-full">
          Get Progress
        </Button>
      </CardFooter>
      {progress && (
        <CardContent className="bg-muted p-4 mt-4 rounded-lg">
          <div className="space-y-4">
            <div className="flex justify-between">
              <strong>Name:</strong>
              <span>{progress.userId?.name}</span>
            </div>
            <div className="flex justify-between">
              <strong>Title:</strong>
              <span>{progress.courseId?.title}</span>
            </div>
            <div className="flex justify-between">
              <strong>Completion Percentage:</strong>
              <Input
                type="number"
                value={editableCompletionPercentage}
                onChange={(e) => setEditableCompletionPercentage(Number(e.target.value))}
                className="w-1/3"
              />
              <Button onClick={updateCompletionPercentage}>Update</Button>
            </div>
            <div className="flex justify-between">
              <strong>Student Level:</strong>
              <span>{progress.studentLevel}</span>
            </div>
            <div className="flex justify-between">
              <strong>Completed Modules:</strong>
              <span>{progress.completedModules.length}</span>
            </div>
            <div className="flex justify-between">
              <strong>Total Quizzes:</strong>
              <span>{progress.totalNumberOfQuizzes}</span>
            </div>
            <div className="flex justify-between">
              <strong>Accumulated Grade:</strong>
              <span>{progress.AccumilativeGrade}</span>
            </div>
            <div className="flex justify-between">
              <strong>Average Grade:</strong>
              <span>{progress.AverageGrade}</span>
            </div>
          </div>
        </CardContent>
      )}
    </Card>
  );
};

export default StudentProgressCard;
