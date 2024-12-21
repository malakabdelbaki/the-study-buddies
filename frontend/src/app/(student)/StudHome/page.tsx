'use client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useAuthorization } from "@/hooks/useAuthorization"
import { BarChart, BookOpen, Bell } from 'lucide-react'
import EnrolledCoursesClient from "@/components/user/studProgress"

import React from "react"
import Link from "next/link";

export default function StudentHomePage() {
  useAuthorization(['student'])
  return (
    <div className="p-8">
      <h1 className="text-4xl font-bold mb-8">Welcome Back, Student!</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Student Performance Card */}
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
              <div>
                <h3 className="font-semibold">Overall Grade: A-</h3>
                <p className="text-sm text-muted-foreground">Keep up the good work!</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Announcements Card */}
        <Card>
          <CardHeader>
            <CardTitle>Announcements</CardTitle>
            <CardDescription>Latest updates from your courses</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                  <Bell className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold">New Quiz Available</h3>
                  <p className="text-sm text-muted-foreground">Introduction to React - Module 3</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        <EnrolledCoursesClient />
      </div>

      {/* Link to student dashboard Page */}
<div className="mt-8">
  <Link href="/studentPerformance" className="text-blue-500 hover:underline text-lg font-semibold">
    View student dashboard
  </Link>
</div>

    </div>
  )
}

