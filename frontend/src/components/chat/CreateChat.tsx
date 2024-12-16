"use client";
import React, { useState, useEffect } from 'react';
import { User } from '../../types/User';
import { Course } from '../../types/Course';
import { fetchPotentialParticipants } from './FetchPotentialParticipants';

interface CreateChatProps {
  userId: string;
  courseList: Course[];
  userRole: 'student' | 'instructor';
  onCreateChat: (userId: string, chatType: 'direct' | 'group', chatName: string, visibility: 'private' | 'public', courseId: string) => void;
}

const CreateChat: React.FC<CreateChatProps> = ({userId, courseList, userRole, onCreateChat }) => {
  const [selectedUser, setSelectedUser] = useState<string>('');
  const [chatName, setChatName] = useState<string>('');
  const [chatType, setChatType] = useState<'direct' | 'group'>('direct');
  const [chatVisibility, setChatVisibility] = useState<'private' | 'public'>('private');
  const [selectedCourse, setSelectedCourse] = useState<string>('');
  const [usersList, setUserList] = useState<User[]>([]);
 

 useEffect(() => {
  if (selectedCourse) {
    const fetchParticipants = async () => {
      try {
        const response = await fetch(
          `/api/communication/potential-participants/${selectedCourse}`,
          {
            method: "GET",
            cache: "no-store",
          }
        );
        if (!response.ok) {
          throw new Error("Failed to fetch users");
        }
        const users = await response.json();
        setUserList(users);
      } catch (error) {
        console.error("Error fetching users:", error);
      }
    };
    fetchParticipants();
  } else {
    setUserList([]); // Clear users when no course is selected
  }
}, [selectedCourse]);
 
const handleCreateChat = () => {
    if (selectedUser && selectedCourse) {
      onCreateChat(
        selectedUser,
        chatType,
        chatName,
        chatVisibility,
        selectedCourse
      );
    }
  };
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Create New Chat</h2>
      <div className="flex space-x-4">
        <button 
          className={`py-2 px-4 rounded ${chatType === 'direct' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
          onClick={() => setChatType('direct')}
        >
          Direct Chat
        </button>
        <button 
          className={`py-2 px-4 rounded ${chatType === 'group' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
          onClick={() => setChatType('group')}
        >
          Group Chat
        </button>
      </div>
      <select
        className="w-full p-2 border rounded"
        value={selectedCourse}
        onChange={(e) => setSelectedCourse(e.target.value)}
      >
        <option value="">Select a course</option>
        {courseList.map((course) => (
          <option key={course.id} value={course.id}>
            {course.title}
          </option>
        ))}
      </select>
      {chatType === 'group' && (
        <div>
          <input
            type="text"
            placeholder="Enter chat name"
            value={chatName}
            onChange={(e) => setChatName(e.target.value)}
            className="w-full p-2 border rounded mb-2"
          />
          <select
            value={chatVisibility}
            onChange={(e) => setChatVisibility(e.target.value as 'private' | 'public')}
            className="w-full p-2 border rounded mb-2"
          >
            <option value="private">Private</option>
            <option value="public">Public</option>
          </select>
        </div>
      )}
      <select 
        className="w-full p-2 border rounded"
        value={selectedUser}
        onChange={(e) => setSelectedUser(e.target.value)}
        disabled={!selectedCourse}
      >
        <option value="">Select a user</option>
        {usersList.map(user => (
          <option key={user._id} value={user._id}>
            {user.name}
          </option>
        ))}
      </select>
      <button 
        className="bg-blue-950 text-white py-2 px-4 rounded w-full"
        onClick={handleCreateChat}
        disabled={!selectedUser || !selectedCourse || (chatType === 'group' && !chatName)}
      >
        Create Chat
      </button>
    </div>
  );
};

export default CreateChat;
