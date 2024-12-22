'use client';
import { useAuthorization } from "@/hooks/useAuthorization"
import React from "react"



import StudentProgressCard from "@/components/user/InstAdstudProgress"


export default function AdminHomePage() {
  useAuthorization(['admin'])
    return (
      <div className="p-8">
        <h1 className="text-4xl font-bold mb-8">Welcome Back, Admin!</h1>
        <StudentProgressCard/>
      </div>
    )
  }
  
  