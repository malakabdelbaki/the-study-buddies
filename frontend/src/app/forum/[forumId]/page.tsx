'use client';
import { useEffect, useState } from "react";
import { decodeToken } from "@/app/utils/decodeToken"; 
import { useRouter, useSearchParams } from "next/navigation";
import ThreadCard  from "@/components/forum/ThreadCard";
import { Role } from '../../../../../backend/src/enums/role.enum';
import CreateThreadModal from "@/components/forum/CreateThreadModal";
import EditForumModal from "@/components/forum/EditForumModal";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import ThreadSearchBar from "@/components/forum/ThreadSearchBar";
import Link from "next/link";


const ForumPage = () => {
  const [userId, setUserId] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<Role>();
  const [forum, setForum] = useState<any>(null); // Holds the forum data
  const [threads, setThreads] = useState<any[]>([]); // Holds the threads
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const router = useRouter();
  const { toast } = useToast();
  const searchParams = useSearchParams();
  const course_id = searchParams.get('courseId');

  const handleNewThread = (newThread: any) => {
    setThreads((prev) => [newThread, ...prev]);
    router.refresh();
  };

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
      const fetchForum = async () => {
        try {
          const forumRes = await fetch(`/api/forum/course/${course_id}`,{
              method: 'GET',
              cache: 'no-store',
          });
          const forumData = await forumRes.json();
          console.log(forumData, "at client");

          setForum(forumData.length > 0 ? forumData[0] : null); 
          
        } catch (err) {
          setError("Failed to fetch forum data");
        } 
      };



      fetchForum();
    
  }, [course_id]);

  useEffect(() => {
    const fetchThreads = async () => {
      if (!forum?._id) return; // Ensure the forum ID is available before fetching threads
  
      try {
        const threadsRes = await fetch(`/api/forum/${forum._id}/threads/find`, {
          method: 'GET',
          cache: 'no-store',
        });
        const threadData = await threadsRes.json();
        console.log(threadData, "threads at client");
  
        setThreads(threadData.length > 0 ? threadData : []); 
        console.log(threads, "threads at client");
      } catch (err) {
        setError("Failed to fetch thread data");
      } finally {
        setLoading(false);
      }
    };
  
    fetchThreads();
  }, [forum?._id]); // Use forum ID as a dependency
  

  const handleArchiveForum = async () => {
    try {
      const res = await fetch(`/api/forum/${forum._id}/archive`, {
        method: 'PATCH',
      });
      if (!res.ok) throw new Error("Failed to archive the forum");
      toast({ title: "Success", description: "Forum archived successfully." });
      router.push(`/InstrCourses/${course_id}`);
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  const handleDeleteForum = async () => {
    try {
      const res = await fetch(`/api/forum/${forum._id}/delete`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error("Failed to delete the forum");
      toast({ title: "Success", description: "Forum deleted successfully." });
      router.push(`/InstrCourses/${course_id}`);
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  
  if (loading) {
    return <div>Loading...</div>; // Display loading state while data is fetching
  }

  return (
    <div className="max-w-4xl mx-auto p-4">
      {forum ? (
        <div>
          <h1 className="text-3xl font-bold mb-6">Forum {forum.title}</h1>
          <p className="text-lg text-gray-700"> Created By: {forum.creator_name}</p>
          <p className="text-lg text-gray-600 text-center mb-12">{forum.description}</p>
          {userRole === Role.Instructor && (
            <div className="flex space-x-4 mb-8">
              <EditForumModal forum={forum} onUpdate={setForum} />
              <Button variant="outline" onClick={handleArchiveForum}>
                Archive Forum
              </Button>
              <Button variant="destructive" onClick={handleDeleteForum}>
                Delete Forum
              </Button>
            </div>
          )}
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold">Forum Threads</h2>
            <CreateThreadModal forumId={forum._id} onSuccess={handleNewThread} />
          </div>
          <div className="w-full mb-6 mt-2">
            <ThreadSearchBar forumId={forum._id} courseId={course_id as string} />
            </div>
          <div className="space-y-4">
            {loading && <p>Loading threads...</p>}
            {!loading && threads.length > 0 ? (
              threads.map((thread) => (
                <Link key={thread._id} href={`./${forum._id}/threads/${thread._id}`}>
                <ThreadCard key={thread._id} thread={thread} />
                </Link>
            ))
            ) : (
              <p>No threads available.</p>
            )}
          </div>
        </div>
      ) : (
        <div>
          <p>No forum created yet.</p>
        </div>
      )}
    </div>
  );
};

export default ForumPage;