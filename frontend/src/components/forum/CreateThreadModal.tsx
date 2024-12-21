"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

export default function CreateThreadModal({ forumId, onSuccess }: { forumId: string; onSuccess: (newThread: any) => void }) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const { toast } = useToast();

  const handleSubmit = async () => {
    if (!title || !content) {
      toast({
        title: "Error",
        description: "Please fill in all fields.",
        variant: "destructive",
      });
      return;
    }

    try {
      const response = await fetch(`/api/forum/${forumId}/threads/create`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title,
          content,
          forum_id: forumId,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to create thread");
      }

      toast({
        title: "Success",
        description: "Thread created successfully!",
      });

      // Reset fields and close modal
      setTitle("");
      setContent("");
      setOpen(false);

      // Notify parent of the created thread
      onSuccess(data);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Something went wrong.",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="default" className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded">
          + Create Thread
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create a New Thread</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <Input
            placeholder="Thread Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="border border-gray-300 rounded px-3 py-2 w-full"
          />
          <Textarea
            placeholder="Thread Description"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="border border-gray-300 rounded px-3 py-2 w-full"
          />
          <Button onClick={handleSubmit} className="bg-blue-500 hover:bg-blue-600 text-white w-full py-2 rounded">
            Create Thread
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
