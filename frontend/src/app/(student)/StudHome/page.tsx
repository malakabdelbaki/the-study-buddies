'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useAuthorization } from "@/hooks/useAuthorization"
import { BarChart, BookOpen, Bell, Calendar, Target, Clock } from 'lucide-react'
import EnrolledCoursesClient from "@/components/user/studProgress"
<<<<<<< Updated upstream
import { decodeToken } from "@/app/utils/decodeToken";
import React from "react"
import Link from "next/link";
// import { useEffect, useState } from "react";


=======
import { Button } from "@/components/ui/button"
// import { Progress } from "@/components/ui/progress"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"

import React from "react"
import Link from "next/link"
>>>>>>> Stashed changes

export default function StudentHomePage() {
  // const [userRole, setUserRole] = useState<string | null>(null);
  // const [userId, setUserId] = useState<string | null>(null);
  // const [userName, setUserName] = useState<string | null>(null);
  //  useEffect(() => {
  //   const token = document.cookie
  //     .split("; ")
  //     .find((row) => row.startsWith("token="))?.split("=")[1]; 
  //   if (token) {
  //     const userId = decodeToken(token)?.userid; 
  //     const role = decodeToken(token)?.role;
  //     setUserId(userId); 
  //     setUserRole(role);
  //     setUserName(userName);
  //   }
  // }, []);
  useAuthorization(['student'])

  return (
<<<<<<< Updated upstream
    <div className="p-8">
      <h1 className="text-4xl font-bold mb-8">Welcome Back, </h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">


        {/* Announcements Card
        <Card>
          <CardHeader>
            <CardTitle>Announcements</CardTitle>
            <CardDescription>Latest updates from your courses</CardDescription>
          </CardHead        Student Performance Card
=======
    <div className="p-8 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-4xl font-bold">Welcome back, Student!</h1>
          <p className="text-xl text-muted-foreground mt-2">Ready to continue your learning journey?</p>
        </div>
      </div>
      
      {/* <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Courses in Progress</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">4</div>
            <p className="text-xs text-muted-foreground">+1 from last month</p>
          </CardContent>
        </Card>

      </div> */}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
>>>>>>> Stashed changes
        <Card>
          <CardHeader>
            <CardTitle>Your Performance</CardTitle>
            <CardDescription>Overview of your academic progress</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                  <BarChart className="w-6 h-6 text-primary" />
                </div>
                <Button asChild>
                <Link href="/studentPerformance">View Detailed Analytics</Link>
              </Button>
                </div>
            </div>
          </CardContent>
<<<<<<< Updated upstream
        </Card>er>
=======
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Announcements</CardTitle>
            <CardDescription>Latest updates from your courses</CardDescription>
          </CardHeader>
>>>>>>> Stashed changes
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                  <Bell className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold"></h3>
                  <p className="text-sm text-muted-foreground"></p>
                  {/* <Badge className="mt-2"></Badge> */}
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                  <Calendar className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold"></h3>
                  <p className="text-sm text-muted-foreground"></p>
                  {/* <Badge variant="outline" className="mt-2"></Badge> */}
                </div>
              </div>
            </div>
          </CardContent>
<<<<<<< Updated upstream
        </Card>*/}
        <EnrolledCoursesClient />
      </div>

      {/* Link to student dashboard Page */}
        <div className="mt-8">
          <Link href="/studentPerformance" className="text-blue-500 hover:underline text-lg font-semibold">
            View student dashboard
          </Link>
        </div>
=======
        </Card>
      </div>

      <Card>
        <CardHeader>
          {/* <CardTitle>Enrolled Courses</CardTitle>
          <CardDescription>Your current course progress</CardDescription> */}
        </CardHeader>
        <CardContent>
          <EnrolledCoursesClient />
        </CardContent>
      </Card>
>>>>>>> Stashed changes

      <div className="mt-8 text-center">
        <Button asChild size="lg">
          <Link href="/courses">Explore More Courses</Link>
        </Button>
      </div>
    </div>
  )
}



