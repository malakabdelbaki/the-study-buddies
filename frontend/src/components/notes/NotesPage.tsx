// "use client";

// import React, { useEffect, useState } from "react";
// import { Button } from "@/components/ui/button";
// import { NotesList } from "@/components/notes/NotesList";
// import { useRouter } from "next/navigation";
// import { Note } from "@/types/Note";

// interface NotesPageProps {
//   courseId: string;
//   moduleId: string;
// }

// export const NotesPageComponent: React.FC<NotesPageProps> = ({ courseId, moduleId }) => {
//   const [notes, setNotes] = useState<Note[]>([]);
//   const [isEditorOpen, setIsEditorOpen] = useState(false);
//   const [selectedNote, setSelectedNote] = useState<Note | null>(null);
//   const [title, setTitle] = useState("");
//   const [content, setContent] = useState("");
//   const [isAutosaveActive, setIsAutosaveActive] = useState(false);

//   const fetchNotes = async () => {
//     try {
//       const response = await fetch(
//         `/api/notes/course/${courseId}/module/${moduleId}`
//       );
//       const data = await response.json();
//       setNotes(data);
//     } catch (error) {
//       console.error("Failed to fetch notes:", error);
//     }
//   };

//   const handleSave = async () => {
//     if (!title || !content) {
//       alert("Please provide a title and content for the note.");
//       return;
//     }
//     const endpoint = selectedNote
//       ? `/api/notes/${selectedNote._id}/update`
//       : `/api/notes`;
//     const method = selectedNote ? "PATCH" : "POST";
//     const body = selectedNote
//       ? { title, content }
//       : { courseId, moduleId, title, content };

//     try {
//       const response = await fetch(endpoint, {
//         method,
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify(body),
//       });
//       const newNote = await response.json();

//       if (!selectedNote) {
//         setSelectedNote(newNote);
//       }

//       fetchNotes();
//       setIsEditorOpen(false);
//     } catch (error) {
//       console.error("Failed to save note:", error);
//     }
//   };

//   useEffect(() => {
//     fetchNotes();
//   }, [courseId, moduleId]);

//   useEffect(() => {
//     const autosaveInterval = setInterval(async () => {
//       if (isAutosaveActive) {
//         const endpoint = selectedNote
//           ? `/api/notes/${selectedNote._id}/update`
//           : `/api/notes`;

//         const method = selectedNote ? "PATCH" : "POST";
//         const body = selectedNote
//           ? { title, content }
//           : { courseId, moduleId, title, content };

//         try {
//           const response = await fetch(endpoint, {
//             method,
//             headers: { "Content-Type": "application/json" },
//             body: JSON.stringify(body),
//           });
//           const savedNote = await response.json();

//           if (!selectedNote) {
//             // Update the note reference if it was a new note
//             setSelectedNote(savedNote);
//           }
//         } catch (error) {
//           console.error("Failed to autosave note:", error);
//         }
//       }
//     }, 5000);

//     return () => clearInterval(autosaveInterval);
//   }, [isAutosaveActive, selectedNote, title, content, courseId, moduleId]);

//   const handleCreateNote = () => {
//     setSelectedNote(null);
//     setTitle("");
//     setContent("");
//     setIsEditorOpen(true);
//     setIsAutosaveActive(true);
//   };

//   const handleEditNote = (note: Note) => {
//     setSelectedNote(note);
//     setTitle(note.title);
//     setContent(note.content);
//     setIsEditorOpen(true);
//     setIsAutosaveActive(true);
//   };

//   const handleCloseEditor = () => {
//     setIsEditorOpen(false);
//     setIsAutosaveActive(false);
//     fetchNotes();
//   };

//   return (
//     <div className="container mx-auto mt-8 p-6 bg-white shadow-md rounded-lg">
//       <h2 className="text-3xl font-bold text-navy mb-6">Quick Notes</h2>

//       <Button className="bg-baby-blue text-navy mb-4" onClick={handleCreateNote}>
//         Create New Note
//       </Button>

//       <NotesList
//         notes={notes}
//         onEdit={handleEditNote}
//         onDelete={fetchNotes}
//       />

//       {isEditorOpen && (
//         <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex items-center justify-center z-50">
//           <div className="bg-white p-6 rounded-lg shadow-md w-96">
//             <h2 className="text-2xl font-bold text-navy mb-4">
//               {selectedNote ? "Edit Note" : "Create Note"}
//             </h2>
//             <input
//               className="w-full mb-4 p-2 border rounded-lg"
//               placeholder="Title"
//               value={title}
//               onChange={(e) => setTitle(e.target.value)}
//             />
//             <textarea
//               className="w-full p-2 border rounded-lg"
//               placeholder="Content"
//               rows={5}
//               value={content}
//               onChange={(e) => setContent(e.target.value)}
//             ></textarea>
//             <div className="mt-4 flex justify-end space-x-4">
//               <Button
//                 className="bg-gray-500 text-white"
//                 onClick={handleCloseEditor}
//               >
//                 Cancel
//               </Button>
//               <Button
//                 className="bg-baby-blue text-navy"
//                 onClick={handleSave}
//               >
//                 Save
//               </Button>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };


"use client";

import React, { useEffect, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { NotesList } from "@/components/notes/NotesList";
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
  const [lastSavedContent, setLastSavedContent] = useState({ title: "", content: "" });
  const [isDirty, setIsDirty] = useState(false);

  const fetchNotes = useCallback(async () => {
    try {
      const response = await fetch(
        `/api/notes/course/${courseId}/module/${moduleId}`
      );
      const data = await response.json();
      setNotes(data);
    } catch (error) {
      console.error("Failed to fetch notes:", error);
    }
  }, [courseId, moduleId]);

  const saveNote = async (isAutosave = false) => {
    // Don't autosave if content hasn't changed
    if (isAutosave && !isDirty) {
      return;
    }

    // For autosave, we want at least some content before saving
    if (isAutosave && (!title.trim() || !content.trim())) {
      return;
    }

    // For manual save, we want to enforce both title and content
    if (!isAutosave && (!title.trim() || !content.trim())) {
      alert("Please provide a title and content for the note.");
      return;
    }

    const endpoint = selectedNote
      ? `/api/notes/${selectedNote._id}/update`
      : `/api/notes/create`;
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
        setSelectedNote(savedNote);
      }

      setLastSavedContent({ title, content });
      setIsDirty(false);

      if (!isAutosave) {
        await fetchNotes();
        setIsEditorOpen(false);
        setIsAutosaveActive(false);
      }
    } catch (error) {
      console.error(`Failed to ${isAutosave ? 'autosave' : 'save'} note:`, error);
    }
  };

  // Handle content changes
  const handleContentChange = (newContent: string) => {
    setContent(newContent);
    setIsDirty(true);
  };

  const handleTitleChange = (newTitle: string) => {
    setTitle(newTitle);
    setIsDirty(true);
  };

  // Initial load
  useEffect(() => {
    fetchNotes();
  }, [fetchNotes]);

  // Autosave setup
  useEffect(() => {
    let autosaveInterval: NodeJS.Timeout;

    if (isAutosaveActive) {
      autosaveInterval = setInterval(() => {
        saveNote(true);
      }, 5000);
    }

    return () => {
      if (autosaveInterval) {
        clearInterval(autosaveInterval);
      }
    };
  }, [isAutosaveActive, title, content, isDirty]);

  const handleCreateNote = () => {
    setSelectedNote(null);
    setTitle("");
    setContent("");
    setLastSavedContent({ title: "", content: "" });
    setIsDirty(false);
    setIsEditorOpen(true);
    setIsAutosaveActive(true);
  };

  const handleEditNote = (note: Note) => {
    setSelectedNote(note);
    setTitle(note.title);
    setContent(note.content);
    setLastSavedContent({ title: note.title, content: note.content });
    setIsDirty(false);
    setIsEditorOpen(true);
    setIsAutosaveActive(true);
  };

  const handleCloseEditor = async () => {
    if (isDirty) {
      const shouldSave = window.confirm(
        "You have unsaved changes. Would you like to save before closing?"
      );
      if (shouldSave) {
        await saveNote(false);
      }
    }
    setIsEditorOpen(false);
    setIsAutosaveActive(false);
    setIsDirty(false);
    await fetchNotes();
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
              onChange={(e) => handleTitleChange(e.target.value)}
            />
            <textarea
              className="w-full p-2 border rounded-lg"
              placeholder="Content"
              rows={5}
              value={content}
              onChange={(e) => handleContentChange(e.target.value)}
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
                onClick={() => saveNote(false)}
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