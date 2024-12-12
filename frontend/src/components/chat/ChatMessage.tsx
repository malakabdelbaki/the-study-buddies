"use client";
import React from "react";

interface ChatMessageProps {
  message: string;
  isMine: boolean;
  // isSystemMessage: boolean;
  sender: string;
}

const ChatMessage = ({
  message,
  isMine,
  sender
} : ChatMessageProps) => {
  const isSystemMessage = sender === "system";
  return (
    <div
      className={`flex ${
        isSystemMessage
        ? "justify-center" 
        : isMine 
        ? "justify-end" 
        : "justify-start"
      } mb-3`}    
    >
      <div
        className={`max-w-s px-4 py-2 rounded-lg
        ${
          isSystemMessage
          ? "bg-gray-800 text-white text-center text-xs"
          : isMine
          ? "bg-blue-500 text-white"
          : "bg-white text-black"
        } `}>
         {!isSystemMessage && <p className="text-sm font-bold">{sender}</p>}
       <p>{message}</p> 
      </div>
    </div>
  );
}

export default ChatMessage;