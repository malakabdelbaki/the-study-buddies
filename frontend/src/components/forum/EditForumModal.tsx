'use client';
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

const EditForumModal = ({ forum, onUpdate }: { forum: any; onUpdate: (updatedForum: any) => void }) => {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState(forum.title);
  const [description, setDescription] = useState(forum.description);

  const { toast } = useToast();

  const handleUpdate = async () => {
    try {
      const res = await fetch(`/api/forum/${forum._id}/update`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ title, description }),
      });
      if (!res.ok) throw new Error("Failed to update forum");
      const updatedForum = await res.json();
      onUpdate(updatedForum);
      toast({ title: "Success", description: "Forum updated successfully." });
      setOpen(false);
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>Edit Forum</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Forum</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Title" />
          <Input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Description" />
          <Button onClick={handleUpdate} className="w-full">
            Save Changes
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EditForumModal;
