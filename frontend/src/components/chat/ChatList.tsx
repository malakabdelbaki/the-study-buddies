"use client";
import React from 'react';
import { Chat } from '../../types/Chat';

interface ChatListProps {
  chats: Chat[];
  onSelectChat: (chatId: string) => void;
  title: string;
}

const ChatList: React.FC<ChatListProps> = ({ chats, onSelectChat, title }) => {
  return (
    <div>
      <h2 className="text-xl font-semibold mb-2">{title}</h2>
      <select 
        className="w-full p-2 border rounded"
        onChange={(e) => onSelectChat(e.target.value)}
      >
        <option value="">Select a chat</option>
        {chats.map(chat => (
          <option key={chat._id} value={chat._id}>
            {chat.chat_name}
          </option>
        ))}
      </select>
    </div>
  );
};

export default ChatList;

