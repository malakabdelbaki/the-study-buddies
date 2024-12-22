'use client';

import { Inter } from 'next/font/google'
import Navigation from '@/components/Navigation/Navigation'
import SearchBar from '@/components/ui/searchBar';
import { useRouter, usePathname } from 'next/navigation';
import './globals.css'
import { useAuth } from '@/hooks/useAuth'
import { NotificationProvider } from '@/context/NotificationContext';
import NotificationToast from '@/components/Notifications/NotificationToast';
import useNotifications from '@/hooks/useNotifications';
import styles from '@/app/styles/NotificationToast.module.css'

const inter = Inter({ subsets: ['latin'] });

type UserRole = 'student' | 'admin' | 'instructor';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const userId = useAuth();
  const notifications = useNotifications(userId);
  const pathname = usePathname();
  const router = useRouter();

  const isAuthPage = pathname === '/login' || pathname === '/signup';
  const pathStart = pathname.split('/')[1];

  let userRole: UserRole = 'student';
  if (pathStart === 'AdminHome') {
    userRole = 'admin';
  } else if (pathStart === 'InstrHome') {
    userRole = 'instructor';
  } else if (pathStart === 'StudHome') {
    userRole = 'student';
  }

  const handleSearch = (searchTerm: string) => {
    if (searchTerm.trim()) {
      router.push(`/search?searchTerm=${encodeURIComponent(searchTerm)}`);
    }
  };

  return (
    <html lang="en">
      <NotificationProvider>
        <body className={inter.className}>
          <div className={styles.shape}>
            <NotificationToast notifications={notifications} />
          </div>
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
      </NotificationProvider>
    </html>
  );
}


