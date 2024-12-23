'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useRouter } from 'next/navigation';
import { Textarea } from '@/components/ui/textarea';
import { decodeToken } from '@/app/utils/decodeToken';
import { Role } from '../../../../backend/src/enums/role.enum';
import { Announcement } from '@/types/Announcement';

const AnnouncementComponent = ({ courseId }: { courseId: string }) => {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [newAnnouncement, setNewAnnouncement] = useState('');
  const [userId, setUserId] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<Role | null>(null);
  const router = useRouter();

   useEffect(() => {
      const token = document.cookie
        .split("; ")
        .find((row) => row.startsWith("token="))?.split("=")[1]; 
  
      if (token) {
        const userId = decodeToken(token)?.userid; 
        const role = decodeToken(token)?.role;
        setUserId(userId); 
        setUserRole(role);
      }
    }, []);

  useEffect(() => {
    const fetchAnnouncements = async () => {
      try {
        const res = await fetch(`/api/announcement/course/${courseId}`,{
          method: 'GET',
          cache: 'no-store',
        });
        if (res.ok) {
          const data = await res.json();
          setAnnouncements(data);
        }
      } catch (error) {
        console.error('Error fetching announcements:', error);
      }
    };
    fetchAnnouncements();
  }, [courseId]);

  // Handle creating a new announcement
  const handleCreateAnnouncement = async () => {
    if (!newAnnouncement.trim()) return;

    try {
      const res = await fetch('/api/announcement/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ course_id: courseId, content: newAnnouncement.trim() }),
      });

      if (res.ok) {
        setNewAnnouncement('');
        router.refresh(); 
      }
    } catch (error) {
      console.error('Error creating announcement:', error);
    }
  };

  return (
    <div className="space-y-6 p-6">
      <Card>
        <CardHeader>
          <CardTitle>Course Announcements</CardTitle>
        </CardHeader>
        <CardContent>
          {userRole==Role.Instructor && (
            <div className="space-y-4 mb-6">
              <Textarea
                placeholder="Write a new announcement..."
                value={newAnnouncement}
                onChange={(e) => setNewAnnouncement(e.target.value)}
              />
              <Button onClick={handleCreateAnnouncement}>Post Announcement</Button>
            </div>
          )}
          <hr className="my-6" />
          <div className="space-y-4">
            {announcements.length > 0 ? (
              announcements.map((announcement) => (
                <Card key={announcement._id}>
                  <CardContent>
                    <p className='mt-2 mb-2'>{announcement.content}</p>
                    <p className="text-sm text-gray-500">Posted on: {new Date(announcement.createdAt).toLocaleString()}</p>
                    <p className='text-sm text-gray-500'>Posted by: {announcement.creator_name}</p>
                  </CardContent>
                </Card>
              ))
            ) : (
              <p className="text-gray-500">No announcements yet.</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AnnouncementComponent;
