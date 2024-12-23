'use client';
import AnnouncementComponent from '@/components/announcement/Announcement';
import { useParams } from 'next/navigation';

const InstructorAnnouncementPage = () => {
  const courseId  = useParams().courseId as string;
  return (
    <AnnouncementComponent courseId={courseId} />
  );
};

export default InstructorAnnouncementPage;
