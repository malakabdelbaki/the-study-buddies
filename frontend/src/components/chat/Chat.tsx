'use client';

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import ChatList from "@/components/chat/ChatList";
import CreateChat from "@/components/chat/CreateChat";
import ChatForm from "@/components/chat/ChatForm";
import ChatMessage from "@/components/chat/ChatMessage";
import { getSocket } from "@/lib/socket-client";
import {Card} from "@/components/ui/card";
import { User } from "@/types/User";
import { ChatType } from '../../../../backend/src/enums/chat-type.enum';
import { ChatVisibility } from '../../../../backend/src/enums/chat-visibility.enum';
import { Role } from '../../../../backend/src/enums/role.enum';

// import {Spinner} from "@/components/ui/spinner";

interface Me {
  _id: string;
  role: Role;
  name: string;
}

interface InitialData {
  me: Me;
  userChats: any[];
  publicChats: any[];
  courses: any[];
}

export default function Chat({ initialData }: { initialData: InitialData }) {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [joined, setJoined] = useState<boolean>(false);
  const [data, setData] = useState<any[]>([]);
  const router = useRouter();

  useEffect(() => {
    if (initialData?.me) {
      setIsLoading(false);
    }
  }, [initialData?.me]);

  const { me, userChats, publicChats, courses } = initialData;

  const handleJoinExistingChat = (room: string) => {

    router.push(`/chat/${room}`);
  };

  const handleCreateNewChat = async (
    participant: User[],
    chatType: ChatType,
    chatName: string,
    visibility: ChatVisibility,
    courseId: string
  ) => {
    if(chatType== ChatType.Direct){
      const response = await fetch(`/api/communication/chat/directChat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          receiver_id: participant[0]._id,
          chatName: `${me.name} and ${participant[0].name}`,
          course_id: courseId,
          }),
      });
      const data = await response.json();
      router.push(`/chat/${data._id}`);

        }
        else{
      const response = await fetch(`/api/communication/chat/groupChat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          chatName,
          course_id: courseId,
          participants:participant.map((participant) => participant._id),
          visibility,
          }),
      });
      const data = await response.json();
      console.log(data);
      router.push(`/chat/${data._id}`);
    }
  };


  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        {/* <Spinner size="lg" /> */}
        <p className="text-xl font-semibold ml-4">Loading...</p>
      </div>
    );
  }

  return (
    <div className="flex mt-24 justify-center w-full p-4">
        <div className="flex w-full max-w-3xl mx-auto flex-col space-y-6">
          <Card className="p-6">
            <h1 className="text-2xl font-bold text-center mb-4">Chat Options</h1>
            <ChatList chats={userChats} onSelectChat={handleJoinExistingChat} title="Your Chats" />
            <ChatList chats={publicChats} onSelectChat={handleJoinExistingChat} title="Public Group Chats" />
            <CreateChat userId={me._id} userRole={me.role} courseList={courses} onCreateChat={handleCreateNewChat} />
          </Card>
        </div>
    </div>
  );
}
