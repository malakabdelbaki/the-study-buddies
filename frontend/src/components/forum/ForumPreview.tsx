"use client";

import { useEffect, useState } from "react";
import { decodeToken } from "@/app/utils/decodeToken"; 
import { useRouter } from "next/navigation";
import CreateForumModal from "@/components/forum/CreateForumModal";
import { Button } from "@/components/ui/button";
import { Role } from "../../../../backend/src/enums/role.enum";
import { Forum } from "@/types/forum";


interface ForumPreviewProps {
  courseId: string;
  courseTitle: string;
  
}

const ForumPreview: React.FC<ForumPreviewProps> = ({ courseId, courseTitle }: ForumPreviewProps) => {
  const [forum, setForum] = useState<Forum | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<"instructor" | "student" | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false); 

  const router = useRouter();

  useEffect(() => {
    const token = document.cookie
      .split("; ")
      .find((row) => row.startsWith("token="))
      ?.split("=")[1];

    if (token) {
      const decoded = decodeToken(token);
      setUserId(decoded?.userid);
      setUserRole(decoded?.role); 
    }
  }, []);

  useEffect(() => {
    const fetchForum = async () => {
      try {
        const response = await fetch(`/api/forum/course/${courseId}`,{
            method: 'GET',
            cache: 'no-store',
        });
        const data = await response.json();

        if (response.ok && data.length > 0) {
          for (const forum of data) {
            if (forum.is_active) {
              setForum(forum);
              break;
            }
          }
        } 
      } catch (err) {
        setError("Failed to fetch forum data");
      } finally {
        setLoading(false);
      }
    };

    fetchForum();
  }, [courseId]);

 
  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div className="text-red-500">{error}</div>;
  }

  if (!forum) {
    if (userRole === Role.Instructor) {
      return (
        <div className="flex flex-col items-center space-y-4">
          <p className="text-gray-700">No forum has been created for this course yet.</p>
          <Button onClick={() => setShowModal(true)}>Create a New Forum</Button>
          <CreateForumModal
            courseId={courseId}
            open={showModal}
            onClose={() => setShowModal(false)}
            onSuccess={(newForum) => {
              setForum(newForum); 
            }}
          />
        </div>
      );
    }
    // Student's view when no forum exists
    return <p className="text-gray-700">No forum is currently available for this course.</p>;
  }
  
    return (
      <div className="flex flex-col items-center space-y-4">
        <h2 className="text-2xl font-bold">{forum.title}</h2>
        <p className="text-gray-600">{forum.description}</p>
        <Button onClick={() => router.push(`/forum/${forum._id}?courseId=${courseId}`)}>
          Go to Forum
        </Button>
      </div>
    );
};

export default ForumPreview;
