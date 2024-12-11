"use client";
import React, {useState} from "react";

const ChatForm = ({
  onSendMessage,
}: {
  onSendMessage: (message: string) => void;
}) => {
  const [message, setMessage] = useState('');
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if(message.trim() !== '') {
      onSendMessage(message);
      setMessage('');
    }
  };

  return (
   <form 
   className="flex gap-2 mt-4"
   onSubmit={handleSubmit}>
      <input 
      type="text" 
      onChange={(e) => setMessage(e.target.value)}
      placeholder="Type a message" 
      className="flex-1 px-4 border-2 py-2 rounded-lg focus:outline-none" />

      <button 
      type="submit" 
      className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
        Send
      </button>

    </form>
  )
}

export default ChatForm;