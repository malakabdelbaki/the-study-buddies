'use client';
import AnnouncementComponent from '@/components/announcement/Announcement';
import { useSearchParams } from 'next/navigation';

const AnnouncementPage = ( ) => {

  const searchParams = useSearchParams();
  const courseId = searchParams.get('courseId') || '';
  
  return (
    <AnnouncementComponent courseId={courseId} />
  );
};

export default AnnouncementPage;
