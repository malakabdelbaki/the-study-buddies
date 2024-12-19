'use client';

import { useParams } from 'next/navigation';
import { useState, useEffect, Suspense } from 'react';
import dynamic from 'next/dynamic';

const ChatRoom = dynamic(() => import('../../../components/chat/ChatRoom'));

export default function ChatPage() {
  const { chat_id } = useParams<{ chat_id: string }>();
  const [initialData, setInitialData] = useState<any | null>(null);
  const [ user, setUser] = useState<any>()

  useEffect(() => {
    const fetchData = async () => {
      try {
        console.log('in client ', chat_id)
        const chatResponse = await fetch(`/api/communication/chat/${chat_id}/find`, {
          method: 'GET',
          cache: 'no-store',
        });
        if (!chatResponse.ok) {
          throw new Error('Failed to fetch chat');
        }
        const chatData = await chatResponse.json();

        const potentialParticipantsResponse = await fetch(
          `/api/communication/potential-participants/${chatData.course_id}`,
          {
            method: 'GET',
            cache: 'no-store',
          }
        );
        if (!potentialParticipantsResponse.ok) {
          throw new Error('Failed to fetch participants');
        }
        const potentialParticipants = await potentialParticipantsResponse.json();

        const meResponse  = await fetch(`/api/auth/me`, {
          method: 'GET',
          cache: 'no-store',
        });
        if(!meResponse.ok) {
          throw new Error("Failed to fetch user data");
        }
        setUser(await meResponse.json());

        setInitialData({
          chat: chatData,
          potentialParticipants,
        });
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, [chat_id]);

  if (!initialData) {
    return <div>Loading chat...</div>;
  }

  return (
    <div>
      <h1>{user._id}</h1>
      <Suspense fallback={<div>Loading chat room...</div>}>
        <ChatRoom chat_id={chat_id} data={initialData} me={{ _id: user._id, role: user.role, name: user.name }} />
      </Suspense>
    </div>
  );
}
