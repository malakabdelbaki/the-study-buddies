'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { Home, BookOpen, MessageSquare, ClipboardList, Users, User, LogOut } from 'lucide-react'

type UserRole = 'student' | 'instructor' | 'admin'

interface NavItem {
  name: string
  href: string
  icon: React.ElementType
}

const Navigation = ({ userRole }: { userRole: UserRole }) => {
  const pathname = usePathname()
  const [profileImage, setProfileImage] = useState('/placeholder.svg')

  const navItems: Record<UserRole, NavItem[]> = {
    student: [
      { name: 'Home', href: '/StudHome', icon: Home },
      { name: 'Courses', href: '/courses', icon: BookOpen },
      { name: 'Discussion', href: '/discussion', icon: MessageSquare },
      { name: 'Quizzes', href: '/quizzes', icon: ClipboardList },
    ],
    instructor: [
      { name: 'Home', href: '/InstrHome', icon: Home },
      { name: 'Courses', href: '/courses', icon: BookOpen },
      { name: 'Discussion', href: '/discussion', icon: MessageSquare },
      { name: 'Quizzes', href: '/quizzes', icon: ClipboardList },
      { name: 'Students', href: '/students', icon: Users },
    ],
    admin: [
      { name: 'Home', href: '/AdminHome', icon: Home },
      { name: 'Courses', href: '/courses', icon: BookOpen },
      { name: 'Discussion', href: '/discussion', icon: MessageSquare },
      { name: 'Quizzes', href: '/quizzes', icon: ClipboardList },
      { name: 'Students', href: '/students', icon: Users },
      { name: 'Instructors', href: '/instructors', icon: Users },
    ],
  }

  const isActive = (path: string) => pathname === path

  const handleLogout = async () => {
    try {
      const response = await fetch('api/auth/logout', { method: 'POST' });
      if (response.ok) {
        // Redirect to login page or refresh the page to clear sensitive data
        window.location.href = '/login';
      } else {
        console.error('Logout failed');
      }
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  return (
    <nav className="fixed left-0 top-0 h-screen w-20 bg-white shadow-lg flex flex-col items-center py-8">
      {/* Profile Picture */}
      <div className="w-12 h-12 rounded-full overflow-hidden mb-8">
        <Image
          src={profileImage}
          alt="Profile"
          width={48}
          height={48}
          className="w-full h-full object-cover"
        />
      </div>

      {/* Navigation Items */}
      <div className="flex-1 flex flex-col items-center gap-6">
        {navItems[userRole].map((item) => {
          const Icon = item.icon
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`p-3 rounded-xl transition-colors ${
                isActive(item.href)
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:text-primary hover:bg-primary/10'
              }`}
              title={item.name}
            >
              <Icon className="w-6 h-6" />
              <span className="sr-only">{item.name}</span>
            </Link>
          )
        })}
      </div>

      {/* Bottom Actions */}
      <div className="flex flex-col items-center gap-4 mt-auto">
        <Link
          href="/profile"
          className="p-3 rounded-xl text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"
          title="Profile"
        >
          <User className="w-6 h-6" />
          <span className="sr-only">Profile</span>
        </Link>
        <button
          onClick={handleLogout}
          className="p-3 rounded-xl text-muted-foreground hover:text-red-600 hover:bg-red-50 transition-colors"
          title="Sign Out"
        >
          <LogOut className="w-6 h-6" />
          <span className="sr-only">Sign Out</span>
        </button>
      </div>
    </nav>
  )
}

export default Navigation

