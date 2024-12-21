import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart, BookOpen, Bell } from 'lucide-react'
import EnrolledCoursesClient from "@/components/user/studProgress"


export default function StudentHomePage() {
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

        {/* Current Courses Card */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Current Courses</CardTitle>
            <CardDescription>Your enrolled courses this semester</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {['Introduction to React', 'Advanced JavaScript', 'UI/UX Design Principles', 'Data Structures and Algorithms'].map((course, index) => (
                <div key={index} className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                    <BookOpen className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold">{course}</h3>
                    <p className="text-sm text-muted-foreground">In Progress</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
        <EnrolledCoursesClient />
      </div>
    </div>
  )
}

