"use client";
import React, { useState, useEffect } from 'react';
import { User } from '../../types/User';
import { ChatType } from '../../../../backend/src/enums/chat-type.enum';
import { ChatVisibility } from '../../../../backend/src/enums/chat-visibility.enum';
import { Role } from '../../../../backend/src/enums/role.enum';
import { Course } from '../../types/Course';


export interface CourseInfo {
  id: string;
  title: string;
}
interface CreateChatProps {
  userId: string;
  courseList: Course[];
  userRole: Role;
  onCreateChat: (participants: User[], chatType: ChatType, chatName: string, visibility: ChatVisibility, courseId: string) => void;
}

const CreateChat: React.FC<CreateChatProps> = ({userId, courseList, userRole, onCreateChat }) => {
  const [chatName, setChatName] = useState<string>('');
  const [chatType, setChatType] = useState<ChatType>(ChatType.Direct);
  const [chatVisibility, setChatVisibility] = useState<ChatVisibility>(ChatVisibility.PRIVATE);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [usersList, setUserList] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<User[]>([]);
 

 useEffect(() => {
  if (selectedCourse) {
    const fetchParticipants = async () => {
      try {
        const response = await fetch(
          `/api/communication/potential-participants/${selectedCourse._id}`,
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
    if (selectedUser && selectedCourse && selectedCourse._id) {
      onCreateChat(
        selectedUser,
        chatType,
        chatName,
        chatVisibility,
        selectedCourse._id
      );
    }
  };

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Create New Chat</h2>
      <div className="flex space-x-4">
        <button 
          className={`py-2 px-4 rounded ${chatType === ChatType.Direct ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
          onClick={() => setChatType( ChatType.Direct)}
        >
          Direct Chat
        </button>
        <button 
          className={`py-2 px-4 rounded ${chatType === ChatType.Group ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
          onClick={() => setChatType(ChatType.Group)}
        >
          Group Chat
        </button>
      </div>
      <select
        className="w-full p-2 border rounded"
        key={selectedCourse?._id}
        value={selectedCourse?.title}
        onChange={(e) => {
          const selectedCourse = courseList.find(course => course._id === e.target.value) || null;
          setSelectedCourse(selectedCourse);
        }}
      >
        <option value="">Select a course</option>
        {courseList.map((course) => (
          <option key={course._id} value={course._id}>
            {course.title}
          </option>
        ))}
      </select>
      {chatType === ChatType.Group && (
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
            onChange={(e) => setChatVisibility(e.target.value as ChatVisibility)}
            className="w-full p-2 border rounded mb-2"
          >
            <option value= {ChatVisibility.PRIVATE} >Private</option>
            <option value={ChatVisibility.PUBLIC}>Public</option>
          </select>
        </div>
      )}
      <select
        className="w-full p-2 border rounded"
        value={chatType === ChatType.Group ? selectedUser.map(user => user._id) : (selectedUser[0]?._id || '')}
        onChange={(e) => {
          const selectedOptions = Array.from(e.target.selectedOptions, option => option.value);
          const selectedUsers = usersList.filter(user => selectedOptions.includes(user._id));
          setSelectedUser(selectedUsers);
        }}
        multiple={chatType === ChatType.Group}
        disabled={!selectedCourse}
      >
        <option value="">Select {chatType === ChatType.Group ? 'users' : 'a user'}</option>
        {usersList.map(user => (
          <option key={user._id} value={user._id}>
        {user.name}
          </option>
        ))}
      </select>
      <button 
        className="bg-blue-950 text-white py-2 px-4 rounded w-full"
        onClick={() => { handleCreateChat() }}
        disabled={!selectedUser || !selectedCourse || (chatType === ChatType.Group && !chatName)}
      >
        Create Chat
      </button>
    </div>
  );
};

export default CreateChat;
