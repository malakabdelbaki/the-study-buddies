'use client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useAuthorization } from "@/hooks/useAuthorization"
import { BookOpen, Users } from 'lucide-react'
import React from "react"

export default function InstructorHomePage() {
  useAuthorization(['instructor']);
  return (
    <div className="p-8">
      <h1 className="text-4xl font-bold mb-8">Welcome Back, Instructor!</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Courses Card */}
        <Card className="col-span-full">
          <CardHeader>
            <CardTitle>Your Courses</CardTitle>
            <CardDescription>Courses you're currently teaching</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {['Introduction to React', 'Advanced JavaScript', 'Web Development Bootcamp'].map((course, index) => (
                <div key={index} className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                    <BookOpen className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold">{course}</h3>
                    <p className="text-sm text-muted-foreground">Active</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Student Overview Card */}
        <Card>
          <CardHeader>
            <CardTitle>Student Overview</CardTitle>
            <CardDescription>Quick stats about your students</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold">Total Students: 150</h3>
                <p className="text-sm text-muted-foreground">Across all courses</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity Card */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Latest updates from your courses</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              <li className="text-sm">New discussion post in Advanced JavaScript</li>
              <li className="text-sm">5 new quiz submissions in Introduction to React</li>
              <li className="text-sm">Updated course materials for Web Development Bootcamp</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

