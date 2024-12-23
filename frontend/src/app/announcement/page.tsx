'use client';
import AnnouncementComponent from '@/components/announcement/Announcement';
import { useAuthorization } from '@/hooks/useAuthorization';
import { useSearchParams } from 'next/navigation';

const AnnouncementPage = ( ) => {
useAuthorization(['student', 'instructor'])
  const searchParams = useSearchParams();
  const courseId = searchParams.get('courseId') || '';
  
  return (
    <AnnouncementComponent courseId={courseId} />
  );
};

export default AnnouncementPage;
