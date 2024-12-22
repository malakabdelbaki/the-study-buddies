'use client';

import { Inter } from 'next/font/google'
import Navigation from '@/components/Navigation/Navigation'
import SearchBar from '@/components/ui/searchBar'; // Ensure this is the correct path
import { useRouter, usePathname } from 'next/navigation';
import './globals.css'

import { useAuth } from '@/hooks/useAuth'

const inter = Inter({ subsets: ['latin'] });

type UserRole = 'student' | 'admin' | 'instructor';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  useAuth();
  const pathname = usePathname(); // Get the current path
  const router = useRouter(); // Use the Next.js router

  const isAuthPage = pathname === '/login' || pathname === '/signup';
  const pathStart = pathname.split('/')[1];

  let userRole: UserRole = 'student'; // Default role
  if (pathStart === 'AdminHome') {
    userRole = 'admin';
  } else if (pathStart === 'InstrHome') {
    userRole = 'instructor';
  } else if (pathStart === 'StudHome') {
    userRole = 'student';
  }

  // Handler for search submissions
  const handleSearch = (searchTerm: string) => {
    if (searchTerm.trim()) {
      router.push(`/search?searchTerm=${encodeURIComponent(searchTerm)}`);
    }
  };

  return (
    <html lang="en">
      <body className={inter.className}>
        {!isAuthPage && (
          <>
            <Navigation userRole={userRole} />
            <div className="flex justify-center items-center mt-4">
              <SearchBar onSearch={handleSearch} />
            </div>
          </>
        )}
        <main className={!isAuthPage ? 'ml-20 p-4' : ''}>{children}</main>
      </body>
    </html>
  );
}
