"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Note } from "@/types/Note";

export const NotesList: React.FC<{
  notes: Note[];
  onEdit: (note: any) => void;
  onDelete: () => void;
}> = ({ notes, onEdit, onDelete }) => {
  const handleDelete = async (noteId: string) => {
    try {
      await fetch(`/api/notes/${noteId}/delete`, {
        method: "DELETE",
      });
      onDelete();
    } catch (error) {
      console.error("Failed to delete note:", error);
    }
  };

  return (
    <div>
      {notes.length === 0 ? (
        <p className="text-gray-600">No notes available for this module.</p>
      ) : (
        <ul className="space-y-4">
          {notes && notes.length>0 && notes.map((note) => (
            <li
              key={note._id}
              className="p-4 border rounded-lg shadow-md bg-baby-blue text-navy"
            >
              <h3 className="font-bold mb-2">{note.title}</h3>
              <p className="text-sm text-gray-700">{note.content}</p>
              <div className="mt-4 flex justify-end space-x-4">
                <Button className="bg-blue-900 text-white" onClick={() => onEdit(note)}>
                  Edit
                </Button>
                <Button
                  className="bg-red-500 text-white"
                  onClick={() => handleDelete(note._id)}
                >
                  Delete
                </Button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};
