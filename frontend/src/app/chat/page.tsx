'use client';

import React, { useEffect, useState } from "react";
import Chat from "@/components/chat/Chat";

export default function ChatPage() {
  const [initialData, setInitialData] = useState<any>({});
  useEffect(() => {
    const fetchData = async () => {
      try {
        const userChatsResponse = await fetch(`/api/communication/chat`, {
          method: 'GET',
          cache: 'no-store',
        });
        if(!userChatsResponse.ok) {
          throw new Error("Failed to fetch user chats");
        }
        
        const publicChatsResponse = await fetch(`/api/communication/public-groups`, {
          method: 'GET',
          cache: 'no-store',
        });
        if(!publicChatsResponse.ok) {
          throw new Error("Failed to fetch public chats");
        }


        const coursesResponse = await fetch(`/api/courses`, {
          method: 'GET',
          cache: 'no-store',
        });
        if(!coursesResponse.ok) {
          throw new Error("Failed to fetch courses");
        }


        const meResponse  = await fetch(`/api/auth/me`, {
          method: 'GET',
          cache: 'no-store',
        });
        if(!meResponse.ok) {
          throw new Error("Failed to fetch user data");
        }


        const data = {
          me: await meResponse.json(),
          userChats: await userChatsResponse.json(),
          publicChats: await publicChatsResponse.json(),
          courses: await coursesResponse.json(),
        };

        setInitialData(data);

      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="flex justify-center w-full p-4">
      <Chat initialData={initialData} />
    </div>
  );
}
