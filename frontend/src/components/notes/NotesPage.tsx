"use client";

import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { NotesList } from "@/components/notes/NotesList";
import { useRouter } from "next/navigation";
import { Note } from "@/types/Note";

interface NotesPageProps {
  courseId: string;
  moduleId: string;
}

export const NotesPageComponent: React.FC<NotesPageProps> = ({ courseId, moduleId }) => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [isAutosaveActive, setIsAutosaveActive] = useState(false);

  const fetchNotes = async () => {
    try {
      const response = await fetch(
        `/api/notes/course/${courseId}/module/${moduleId}`
      );
      const data = await response.json();
      setNotes(data);
    } catch (error) {
      console.error("Failed to fetch notes:", error);
    }
  };

  const handleSave = async () => {
    const endpoint = selectedNote
      ? `/api/notes/${selectedNote._id}/update`
      : `/api/notes`;
    const method = selectedNote ? "PATCH" : "POST";
    const body = selectedNote
      ? { title, content }
      : { courseId, moduleId, title, content };

    try {
      const response = await fetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const newNote = await response.json();

      if (!selectedNote) {
        // Set the newly created note for autosaving
        setSelectedNote(newNote);
      }

      fetchNotes();
      setIsEditorOpen(false);
    } catch (error) {
      console.error("Failed to save note:", error);
    }
  };

  useEffect(() => {
    fetchNotes();
  }, [courseId, moduleId]);

  useEffect(() => {
    const autosaveInterval = setInterval(async () => {
      if (isAutosaveActive) {
        const endpoint = selectedNote
          ? `/api/notes/${selectedNote._id}/update`
          : `/api/notes`;

        const method = selectedNote ? "PATCH" : "POST";
        const body = selectedNote
          ? { title, content }
          : { courseId, moduleId, title, content };

        try {
          const response = await fetch(endpoint, {
            method,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body),
          });
          const savedNote = await response.json();

          if (!selectedNote) {
            // Update the note reference if it was a new note
            setSelectedNote(savedNote);
          }
        } catch (error) {
          console.error("Failed to autosave note:", error);
        }
      }
    }, 5000);

    return () => clearInterval(autosaveInterval);
  }, [isAutosaveActive, selectedNote, title, content, courseId, moduleId]);

  const handleCreateNote = () => {
    setSelectedNote(null);
    setTitle("");
    setContent("");
    setIsEditorOpen(true);
    setIsAutosaveActive(true);
  };

  const handleEditNote = (note: Note) => {
    setSelectedNote(note);
    setTitle(note.title);
    setContent(note.content);
    setIsEditorOpen(true);
    setIsAutosaveActive(true);
  };

  const handleCloseEditor = () => {
    setIsEditorOpen(false);
    setIsAutosaveActive(false);
    fetchNotes();
  };

  return (
    <div className="container mx-auto mt-8 p-6 bg-white shadow-md rounded-lg">
      <h2 className="text-3xl font-bold text-navy mb-6">Quick Notes</h2>

      <Button className="bg-baby-blue text-navy mb-4" onClick={handleCreateNote}>
        Create New Note
      </Button>

      <NotesList
        notes={notes}
        onEdit={handleEditNote}
        onDelete={fetchNotes}
      />

      {isEditorOpen && (
        <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-md w-96">
            <h2 className="text-2xl font-bold text-navy mb-4">
              {selectedNote ? "Edit Note" : "Create Note"}
            </h2>
            <input
              className="w-full mb-4 p-2 border rounded-lg"
              placeholder="Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
            <textarea
              className="w-full p-2 border rounded-lg"
              placeholder="Content"
              rows={5}
              value={content}
              onChange={(e) => setContent(e.target.value)}
            ></textarea>
            <div className="mt-4 flex justify-end space-x-4">
              <Button
                className="bg-gray-500 text-white"
                onClick={handleCloseEditor}
              >
                Cancel
              </Button>
              <Button
                className="bg-baby-blue text-navy"
                onClick={handleSave}
              >
                Save
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
