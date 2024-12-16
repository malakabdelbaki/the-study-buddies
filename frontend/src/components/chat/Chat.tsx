'use client';
import React, { useState, useEffect } from "react";
import ChatList from "@/components/chat/ChatList";
import CreateChat from "@/components/chat/CreateChat";
import ChatForm from "@/components/chat/ChatForm";
import ChatMessage from "@/components/chat/ChatMessage";
import { SocketManager } from "@/components/socket/SocketManager";
import { getSocket } from "@/lib/socket-client";
import { User } from "@/types/User";
interface Me {
  _id: string;
  role: string;
}

interface InitialData {
  me: Me;
  userChats: any[];
  publicChats: any[];
  courses: any[];
}
export default function Chat({ initialData }: { initialData: any }) {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [room, setRoom] = useState<string>('');
  const [joined, setJoined] = useState<boolean>(false);
  const [messages, setMessages] = useState<{ sender: string; message: string }[]>([]);

  useEffect(() => {
    if (initialData?.me) {
      setIsLoading(false); // Stop loading once initialData.me is loaded
    }
  }, [initialData?.me]);

  const { me, userChats, publicChats, courses } = initialData;

  const handleReceiveMessage = async (message: string): Promise<void> => {
    setMessages((prevMessages) => [...prevMessages, { sender: "system", message }]);
  };

  const handleJoinExistingChat = (chatId: string) => {
    const socket = getSocket();
    setRoom(chatId);
    socket.emit("joinChat", { room: chatId });
    setJoined(true);
  };

  const handleCreateNewChat = async (participantId: string, chatType: "direct" | "group", chatName: string, visibility: "private" | "public", courseId: string) => {
    const socket = getSocket();
    const response = await socket.emitWithAck("createChat", {
      room: "global",
      participants: [participantId],
    });

    if (response?.chatId) {
      handleJoinExistingChat(response.chatId);
    }
  };

  const handleSendMessage = (message: string) => {
    const socket = getSocket();
    socket.emit("sendMessage", { room, addMessageDto: { chat_id: room, content: message } });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-xl font-semibold">Loading...</p>
      </div>
    );
  }
 else return (
    <div className="flex mt-24 justify-center w-full p-4">
      <SocketManager onReceiveMessage={handleReceiveMessage} />
      {!joined ? (
        <div className="flex w-full max-w-3xl mx-auto flex-col space-y-4">
          <h1 className="text-2xl font-bold text-center">Chat Options</h1>
          <ChatList chats={userChats} onSelectChat={handleJoinExistingChat} title="Your Chats" />
          <ChatList chats={publicChats} onSelectChat={handleJoinExistingChat} title="Public Group Chats" />
          <CreateChat userId={me._id} userRole={me.role} courseList={courses} onCreateChat={handleCreateNewChat} />
        </div>
      ) : (
        <div className="w-full max-w-3xl mx-auto">
          <h1 className="mb-4 text-2xl font-bold">Chat Room</h1>
          <div className="h-[500px] overflow-y-auto p-4 mb-4 bg-gray-200 border-2 rounded-lg">
            {messages.map((msg, index) => ( 
                <ChatMessage key={index} message={msg.message} isMine={msg.sender === (me as User)._id} sender={msg.sender} /> 
            ))}
          </div>
          <ChatForm onSendMessage={handleSendMessage} />
        </div>
      )}
    </div>
  );
}
