// "use client";

// import React, { useState, useEffect } from "react";
// import { Button } from "@/components/ui/button";
// import { Note } from "@/types/Note";

// export const NoteEditor: React.FC<{
//   note?: Note | null;
//   courseId: string;
//   moduleId: string;
//   onClose: () => void;
// }> = ({ note, courseId, moduleId, onClose }) => {
//   const [title, setTitle] = useState(note?.title || "");
//   const [content, setContent] = useState(note?.content || "");

//   useEffect(() => {
//     const interval = setInterval(() => {
//       if (note?._id) {
//         fetch(`/api/notes/${note._id}/autosave`, {
//           method: "PATCH",
//           headers: { "Content-Type": "application/json" },
//           body: JSON.stringify({ title, content }),
//         });
//       }
//     }, 1000);

//     return () => clearInterval(interval);
//   }, [title, content, note?._id]);

//   const handleSave = async () => {
//     const endpoint = note
//       ? `/api/notes/${note._id}/update`
//       : `/api/notes`;

//     const method = note ? "PATCH" : "POST";
//     const body = note? 
//     {
//       title,
//       content,
//     }:
//     {
//       courseId,
//       moduleId,
//       title,
//       content,
//     };

//     console.log("body", body);
//     try {
//       await fetch(endpoint, {
//         method,
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify(body),
//       });
//       onClose();
//     } catch (error) {
//       console.error("Failed to save note:", error);
//     }
//   };

//   return (
//     <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex items-center justify-center z-50">
//       <div className="bg-white p-6 rounded-lg shadow-md w-96">
//         <h2 className="text-2xl font-bold text-navy mb-4">
//           {note ? "Edit Note" : "Create Note"}
//         </h2>
//         <input
//           className="w-full mb-4 p-2 border rounded-lg"
//           placeholder="Title"
//           value={title}
//           onChange={(e) => setTitle(e.target.value)}
//         />
//         <textarea
//           className="w-full p-2 border rounded-lg"
//           placeholder="Content"
//           rows={5}
//           value={content}
//           onChange={(e) => setContent(e.target.value)}
//         ></textarea>
//         <div className="mt-4 flex justify-end space-x-4">
//           <Button className="bg-gray-500 text-white" onClick={onClose}>
//             Cancel
//           </Button>
//           <Button className="bg-baby-blue text-navy" onClick={handleSave}>
//             Save
//           </Button>
//         </div>
//       </div>
//     </div>
//   );
// };
