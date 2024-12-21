'use client';
import { useAuthorization } from "@/hooks/useAuthorization"
import React from "react"

export default function AdminHomePage() {
  useAuthorization(['admin'])
    return (
      <div className="p-8">
        <h1 className="text-4xl font-bold mb-8">Welcome Back, Admin!</h1>
        <p className="text-xl text-muted-foreground">This page is currently empty. Add admin dashboard components here.</p>
      </div>
    )
  }
  
  