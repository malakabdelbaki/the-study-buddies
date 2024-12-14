'use client';
import React, { useEffect, useState } from "react";
import axios from 'axios';
// import Cookies from 'js-cookie';
import ChatList from '@/components/chat/ChatList';
import CreateChat from '@/components/chat/CreateChat';
import ChatForm from "@/components/chat/ChatForm";
import ChatMessage from "@/components/chat/ChatMessage";
import type { Chat } from '../../types/Chat';
import { User } from '../../types/User';
import { Course } from '../../types/Course';
import { cookies } from "next/headers"; 
import { initializeSocket, getSocket, disconnectSocket } from "@/lib/socket-client";

export default async function Chat() {
  const [room, setRoom] = useState<string>('');
  const [joined, setJoined] = useState<boolean>(false);
  const [messages, setMessages] = useState<{sender:string, message:string}[]>([]);
  const [userName, setUserName] = useState<string>('');
  const [userRole, setUserRole] = useState<'student' | 'instructor' | 'admin'>('student');
  const [userId, setUserId] = useState<string>('');

  const [userChatList, setUserChatList] = useState<Chat[]>([]);
  const [publicGroupChatList, setPublicGroupChatList] = useState<Chat[]>([]); 
  const [userList, setUserList] = useState<User[]>([]);
  const [courseList, setCourseList] = useState<Course[]>([]);

  useEffect(() => {
    const fetchCookies = async () => {
      const cookieStore = await cookies();
      const token = cookies.get('token');
      const cookieUserId = cookies.get('userId');
      const cookieUserRole = cookies.get('userRole') as 'student' | 'instructor';
      const cookieUserName = Cookies.get('userName');

      if (token && cookieUserId && cookieUserRole && cookieUserName) {
        setUserId(cookieUserId);
        setUserRole(cookieUserRole);
        setUserName(cookieUserName);
        initializeSocket(token);
      } else {
        console.error('User information or token not found in cookies');
        // Handle the case when user information is not available
        // You might want to redirect to a login page or show an error message
      }
    };

    fetchCookies();

    return () => {
      disconnectSocket();
    };
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      if (!userId || !userRole) return;

      try {
        const [userChatsResponse, publicChatsResponse, usersResponse, coursesResponse] = await Promise.all([
          axios.get('api/chat'),
          axios.get('api/chats/public-groups'),
          axios.get('/apipotential-participants'),
          axios.get(userRole === 'student' ? `${userId}/courses/enrolled` : `${userId}/courses`)
        ]);

        setUserChatList(userChatsResponse.data);
        setPublicGroupChatList(publicChatsResponse.data);
        setUserList(usersResponse.data);
        setCourseList(coursesResponse.data);
      } catch (error) {
        console.error('Failed to fetch data', error);
      }
    };

    fetchData();
  }, [userId, userRole]);

  useEffect(() => {
    const socket = getSocket();
    
    socket.on('receiveMessage', (message: string) => { 
      setMessages((prevMessages) => [...prevMessages, { sender: 'system', message: message }]);
    });

    return () => {
      socket.off('receiveMessage');
    };
  }, []);

  
  const handleJoinExistingChat = (chatId: string) => {
    const socket = getSocket();
    setRoom(chatId);
    socket.emit('joinChat', { 
      room: chatId, 
      addParticipantDto: { 
        chat_id: chatId, 
        participant: userId
      }
    });
    setJoined(true);
  };

  const handleCreateNewChat = async (participantId: string, chatType: 'direct' | 'group', chatName: string, visibility: 'private' | 'public', courseId: string) => {
    const socket = getSocket();
    try {
      const chatData = chatType === 'direct' 
        ? { 
            createDirectChatdto: { 
              participants: [userId, participantId],
              course_id: courseId
            } 
          }
        : { 
            createChatDto: { 
              participants: [userId, participantId],
              chat_name: chatName,
              is_public: visibility === 'public',
              course_id: courseId
            } 
          };

      const response = await socket.emitWithAck('createChat', {
        room: 'global',
        ...chatData
      });

      if (response && response.chatId) {
        handleJoinExistingChat(response.chatId);
      }
    } catch (error) {
      console.error('Failed to create chat', error);
    }
  };

  const handleSendMessage = (message: string) => {
    const socket = getSocket();
    socket.emit('sendMessage', {
      room,
      addMessageDto: {
        chat_id: room,
        sender_id: userId,
        content: message
      }
    });
  };

  return (
    <div className="flex mt-24 justify-center w-full p-4">
      {!joined ? (
        <div className="flex w-full max-w-3xl mx-auto flex-col space-y-4">
          <h1 className="text-2xl font-bold text-center">Chat Options</h1>
          <ChatList 
            chats={userChatList} 
            onSelectChat={handleJoinExistingChat} 
            title="Your Chats"
          />
          <ChatList 
            chats={publicGroupChatList} 
            onSelectChat={handleJoinExistingChat} 
            title="Public Group Chats"
          />
          <CreateChat 
            userList={userList}
            courseList={courseList}
            userRole={userRole}
            onCreateChat={handleCreateNewChat}
          />
        </div>
      ) : (
        <div className="w-full max-w-3xl mx-auto">
          <h1 className="mb-4 text-2xl font-bold">Chat Room</h1>
          <div className="h-[500px] overflow-y-auto p-4 mb-4 bg-gray-200 border-2 rounded-lg">
            {messages.map((msg, index) => (
              <ChatMessage
                key={index}
                message={msg.message}
                isMine={msg.sender === userName}
                sender={msg.sender}
              />
            ))}
          </div>
          <ChatForm onSendMessage={handleSendMessage}/>
        </div>
      )}
    </div>
  );
}

