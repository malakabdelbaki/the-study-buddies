'use client';

import React, { useEffect, useState } from "react";
import Link from "next/link";
import axios from "axios";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Announcement } from "@/types/Announcement";
import EnrolledCoursesClient from "@/components/user/studProgress";

export default function StudentHomePage() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAnnouncements = async () => {
      try {
        const response = await axios.get('/api/notification');
        setAnnouncements(response.data);
      } catch (err) {
        setError("Failed to fetch announcements");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchAnnouncements();
  }, []);

  return (
    <div className="flex flex-col items-center justify-center h-screen p-8">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold">Welcome back, Student!</h1>
        <p className="text-xl text-muted-foreground mt-2">Ready to continue your learning journey?</p>
      </div>

      {/* Centered "Your Performance" Card */}
      <div className="max-w-md w-full mb-8">
        <Card>
          <CardHeader>
            <CardTitle>Your Performance</CardTitle>
            <CardDescription>Overview of your academic progress</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                <BarChart className="w-6 h-6 text-primary" />
              </div>
              <Button asChild>
                <Link href="/studentPerformance">View Detailed Analytics</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Enrolled Courses Card */}
      <div className="max-w-md w-full">
        <Card>
          <CardHeader>
            <CardTitle>Enrolled Courses</CardTitle>
            <CardDescription>Your current course progress</CardDescription>
          </CardHeader>
          <CardContent>
            <EnrolledCoursesClient />
          </CardContent>
        </Card>
      </div>

      <div className="mt-8 text-center">
        <Button asChild size="lg">
          <Link href="/courses">Explore More Courses</Link>
        </Button>
      </div>
    </div>
  );
}
