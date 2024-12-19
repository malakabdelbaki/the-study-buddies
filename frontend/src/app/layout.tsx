'use client'

import { Inter } from 'next/font/google'
import Navigation from '@/components/Navigation/Navigation'
import { usePathname } from 'next/navigation' // Import usePathname from next/navigation
import './globals.css'

const inter = Inter({ subsets: ['latin'] })


// Assuming UserRole is a type or enum, you can use it here
type UserRole = 'student' | 'admin' | 'instructor';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname() // Get the current path
  // Get the first part of the path (e.g., '/admin', '/student', etc.)
  const pathStart = pathname.split('/')[1] // Extract the first part of the path

  // Set the userRole based on the path start
  let userRole: UserRole = 'student'; // Default role
  if (pathStart === 'AdminHome') {
    userRole = 'admin'
  } else if (pathStart === 'InstrHome') {
    userRole = 'instructor'
  }
  else if (pathStart === 'StudHome') {
    userRole = 'student'
  }

  return (
    <html lang="en">
      <body className={inter.className}>
        <Navigation userRole={userRole} />
        <main className="ml-20 p-4">
          {children}
        </main>
      </body>
    </html>
  )
}
