'use client';
import React, { useEffect, useState } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { decodeToken } from "@/app/utils/decodeToken";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import EditThreadModal from "@/components/forum/EditThreadModal";
import { Thread } from "@/types/Thread";
import { Role } from '../../../../../../../backend/src/enums/role.enum';
import { Reply } from '@/types/reply';

const ThreadPage = () => {
  const forum_id = useParams().forumId as string;
  const thread_id = useParams().threadId as string;
  const [thread, setThread] = useState<Thread | null>(null);
  const [isEditModalOpen, setEditModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<Role | null>(null);
  const [replies, setReplies] = useState<Reply[]>([]);
  const [newReply, setNewReply] = useState<string>('');
  const [status, setStatus] = useState<string | null>('initial');
  const [editingReplyId, setEditingReplyId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState<string>("");
  
  const router = useRouter();
  const { toast } = useToast();

  const searchParams = useSearchParams();

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
    const fetchThread = async () => {
      try {
        const res = await fetch(`/api/forum/${forum_id}/threads/${thread_id}/find`);
        if (!res.ok) throw new Error("Failed to fetch thread data");
        const data = await res.json();
        setThread(data);


        const repliesRes = await fetch(`/api/forum/${forum_id}/threads/${thread_id}/reply/find`);
        const repliesData = await repliesRes.json();
        setReplies(repliesData);
        
      } catch (err) {
        console.error(err);
        setError("Failed to load thread details. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchThread();
  }, [forum_id, thread_id, status]);

  const handleEditClick = () => {
    setEditModalOpen(true);
  };

  const handleModalClose = () => {
    setEditModalOpen(false);
  };

  const handleThreadUpdated = async () => {
    setStatus('updated');
  };

  const handleResolveThread = async () => {
    try {
      const res = await fetch(`/api/forum/${forum_id}/threads/${thread_id}/resolve`, { method: "PATCH" });
      if (!res.ok) throw new Error("Failed to resolve thread");
      toast({ title: "Success", description: "Thread marked as resolved." });
      setThread((prev) => prev && { ...prev, resolved: true });
      
    } catch (error) {
      toast({ title: "Error", description: "Failed to resolve thread", variant: "destructive" });
    }
  };

  const handleDeleteThread = async () => {
    try {
      const res = await fetch(`/api/forum/${forum_id}/threads/${thread_id}/delete`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete thread");
      toast({ title: "Success", description: "Thread deleted successfully." });
      router.back();
    } catch (error) {
      toast({ title: "Error", description: "Failed to delete thread", variant: "destructive" });
    }
  };

  const handleCreateReply = async () => {
    if (!newReply.trim()) return;

    try {
      const res = await fetch(`/api/forum/${forum_id}/threads/${thread_id}/reply/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content: newReply }),
      });

      if (!res.ok) throw new Error("Failed to create reply");

      setNewReply('');
      setStatus('replyCreated');
    } catch (err) {
      console.error("Error creating reply:", err);
    }
  };



  const startEdit = (reply_id: string, content: string) => {
    setEditingReplyId(reply_id);
    setEditContent(content);
  };
  
  const cancelEdit = () => {
    setEditingReplyId(null);
    setEditContent("");
  };
  
  const handleSaveEdit = async (reply_id: string) => {
    try {
        const res = await fetch(`/api/forum/${forum_id}/threads/${thread_id}/reply/${reply_id}/update`, {
        method: 'PATCH',
        body: JSON.stringify({ content: editContent }),
      });
      const data = await res.json();
      console.log(data);

      setReplies((prevReplies) =>
        prevReplies.map((reply) =>
          reply._id === reply_id ? { ...reply, content: data.content } : reply
        )
      );
      cancelEdit();
    } catch (error) {
      console.error("Failed to update reply:", error);
    }
  };

  const handleDeleteReply = async (reply_id: string) => {
    try {
      const res = await fetch(`/api/forum/${forum_id}/threads/${thread_id}/reply/${reply_id}/delete`, {
        method: 'DELETE',
      });

      if (!res.ok) throw new Error("Failed to delete reply");
      setStatus('replyDeleted');
    } catch (err) {
      console.error("Error deleting reply:", err);
    }
  };

  if (loading) return <p>Loading...</p>;
  if (error) return <p className="text-red-600">{error}</p>;

  const isThreadCreator = thread?.createdBy.toString() === userId;
  const isInstructor = userRole === Role.Instructor;

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-4">
      <h1 className="text-2xl font-bold">{thread?.title}</h1>
      <p className="text-gray-700">{thread?.content}</p>
      <p className="text-gray-500">Created by: {thread?.creator_name}</p>

      <div className="flex space-x-4 justify-items-end">
        {isThreadCreator && (
          <Button variant="outline" onClick={handleEditClick}>
            Edit
          </Button>
        )}
        {isThreadCreator && !thread?.isResolved && (
          <Button variant="secondary" onClick={handleResolveThread}>
            Mark as Resolved
          </Button>
        )}
        {(isThreadCreator || isInstructor) && (
          <Button variant="destructive" onClick={handleDeleteThread}>
            Delete
          </Button>
        )}
      </div>

      {isEditModalOpen && thread && (
        <EditThreadModal
          threadId={thread._id}
          forumId={forum_id}
          initialTitle={thread.title}
          initialContent={thread.content}
          onClose={handleModalClose}
          onUpdated={handleThreadUpdated}
        />
      )}
  {thread?.isResolved? (
    <p className="text-green-500">This thread has been resolved.</p>
  ):(
    <div className="mt-6">
        <textarea
          value={newReply}
          onChange={(e) => setNewReply(e.target.value)}
          placeholder="Write your reply..."
          className="w-full p-2 border border-gray-300 rounded"
        ></textarea>
        <button
          onClick={handleCreateReply}
          className="bg-green-500 text-white px-4 py-2 rounded mt-2"
        >
          Post Reply
        </button>
      </div>
  )}
      <div className="mt-6">
        <h2 className="text-lg font-bold">Replies:</h2>
        {replies.map((reply) => (
  <div key={reply._id} className="p-4 border-b">
    {editingReplyId === reply._id ? (
      <div>
        <textarea
          className="w-full p-2 border rounded"
          value={editContent}
          onChange={(e) => setEditContent(e.target.value)}
        />
        <div className="flex justify-end space-x-2 mt-2">
          <button
            onClick={() => handleSaveEdit(reply._id)}
            className="bg-blue-500 text-white px-3 py-1 rounded"
          >
            Save
          </button>
          <button
            onClick={() => cancelEdit()}
            className="bg-gray-300 px-3 py-1 rounded"
          >
            Cancel
          </button>
        </div>
      </div>
    ) : (
      <div>
        <p>{reply.content}</p>
        <p className="text-sm text-gray-500">Posted by: {reply.creator_name}</p>
        <div className="flex justify-end space-x-2">
          {reply.user_id === userId && (
            <button
              onClick={() => startEdit(reply._id, reply.content)}
              className="text-blue-500"
            >
              Edit
            </button>
          )}
          {(reply.user_id === userId || userRole === Role.Instructor) && (
            <button
              onClick={() => handleDeleteReply(reply._id)}
              className="text-red-500"
            >
              Delete
            </button>
          )}
        </div>
      </div>
    )}
  </div>
))}
      </div>
    </div>
  );
}

export default ThreadPage;