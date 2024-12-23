'use client';

import { useEffect, useState } from 'react';
import { useRouter } from "next/navigation"; //allows page to redirect after sucessful login
import { Card } from '@/components/ui/card';
import ChatMessage from '@/components/chat/ChatMessage';
import ChatForm from '@/components/chat/ChatForm';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { ChatType } from '../../../../backend/src/enums/chat-type.enum';
import { Role } from '../../../../backend/src/enums/role.enum';
import { Chat } from '@/types/Chat';
import Pusher from 'pusher-js';
import useChat from '@/hooks/useChat';


type ChatRoomProps = {
  chat_id: string;
  data: {
    chat: {
      name: string;
      chat_type: ChatType;
    };
    potentialParticipants: Array<{ _id: string; name: string }>;
  };
  me: { _id: string; role:Role; name: string };
};

export default function ChatRoom({ chat_id, data, me }: ChatRoomProps) {
  const messages = useChat(chat_id);

  const [isLoading, setIsLoading] = useState(false);
  const { chat, potentialParticipants } = data;
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [ SuccessMessage, setSuccessMessage] = useState<string | null>(null);
  const [ ChatRoom, setChatRoom] = useState<Chat>();
  const router = useRouter();

  useEffect(() => {
    const fetchChatRoom = async () => {
      setIsLoading(true);
      setErrorMessage(null);

      try {
        const chatResponse = await fetch(`/api/communication/chat/${chat_id}/find`, {
          method: 'GET',
          cache: 'no-store',
        });
        if (!chatResponse.ok) {
          throw new Error('Failed to fetch chat');
        }
        const chatData = await chatResponse.json();
        setChatRoom(chatData);
      } catch (error) {
        console.error('Error fetching room:', error);
        setErrorMessage('Failed to fetch room');
      } finally {
        setIsLoading(false);
      }
    };

    fetchChatRoom();
  }, []);

  // useEffect(() => {
  //   const fetchMessages = async () => {
  //     setIsLoading(true);
  //     setErrorMessage(null);

  //     try {
  //       const response = await fetch(`/api/communication/chat/${chat_id}/messageHistory`, {
  //         method: 'GET',
  //         headers: { 'Content-Type': 'application/json' },
  //       });
    
  //       if (!response.ok) {
  //         const errorData = await response.json();
  //         throw new Error(errorData.error || 'Failed to fetch messages');
  //       }

  //       const data = await response.json();
  //       console.log('Fetched messages:', data);
  //       setMessages( (data && [...data]) || []);
      
  //     } catch (error) {
  //       console.error('Error fetching messages:', error);
  //       setErrorMessage('Failed to fetch messages');
  //     } finally {
  //       setIsLoading(false);
  //     }
  //   };

  //   fetchMessages();
  // }, []);


  // useEffect(() => {
  //   const pusher = new Pusher('your-key', {
  //     cluster: 'your-cluster',
  //   });

  //   const channel = pusher.subscribe(`chat-${ChatRoom.}`);
  //   channel.bind('new-message', (data) => {
  //     setMessages((prev) => [...prev, data.message]);
  //   });

  //   return () => {
  //     channel.unsubscribe();
  //     pusher.disconnect();
  //   };
  // }, [chatId]);


  const handleSendMessage = async (message: string) => {
    try {
     
      const response = await fetch(`/api/communication/chat/${chat_id}/addMessage`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: message }),
      });
  
      console.log('Message sent:', await response.json());
      if (!response.ok) {
        throw new Error('Failed to send message');
      }
  
    } catch (error) {
      console.error('Error sending message:', error);
      setErrorMessage('Failed to send the message. Please try again.');
    }
  };

  const handleAddParticipant = async (participantId: string) => {
    try {
      setIsLoading(true);
  
      // Prepare payload as an array
      const response = await fetch(`/api/communication/chat/${chat_id}/addParticipant`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ participants: [participantId] }), // Wrap in array
      });
  
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to add participant');
      }
  
      const result = await response.json();
      console.log('Participant added:', result);
      // Show success feedback
      setSuccessMessage('Participant added successfully!');
    } catch (error) {
      console.error('Error adding participant:', error);
      setErrorMessage('Failed to add participant. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };
  

  const handleLeaveChat = async () => {
    try {
      setIsLoading(true);
  
      const response = await fetch(`/api/communication/chat/${chat_id}/leaveChat`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
      });
  
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to leave chat');
      }
  
      const result = await response.json();
      console.log('Left chat successfully:', result);
      if (router) {
        router.push('/chat');
      }
  
      
      // Provide success feedback
      setSuccessMessage('You have left the chat.');
    } catch (error) {
      console.error('Error leaving chat:', error);
      setErrorMessage('Failed to leave chat. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };
  

  const handleUpdateChatName = async (newName: string) => {
    try {
      const response = await fetch(`/api/communication/chat/${chat_id}/updateName`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newName }),
      });

      if (!response.ok) {
        throw new Error('Failed to update chat name');
      }

      alert('Chat name updated successfully!');
    } catch (error) {
      console.error('Error updating chat name:', error);
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto">
      <Card className="mb-4 p-6">
        <h1 className="text-2xl font-bold mb-4">{chat.name}</h1>
        <div className="flex gap-4 mb-4">
          {chat.chat_type === ChatType.Group && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline">Add Participant</Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                {potentialParticipants
                  .filter(participant => !ChatRoom?.participants?.some(p => p === participant._id))
                  .map((participant) => (
                  <DropdownMenuItem
                    key={participant._id}
                    onClick={() => handleAddParticipant(participant._id)}
                  >
                    {participant.name}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
          <Button variant="outline" onClick={handleLeaveChat}>
            Leave Chat
          </Button>
          <Button variant="outline" onClick={() => handleUpdateChatName(prompt('Enter new chat name') || '')}>
            Update Chat Name
          </Button>
         
        </div>
        <div className="max-h-[80vh] overflow-y-scroll px-4 py-2 mb-4 bg-white shadow-md border border-gray-300 rounded-lg">
          {messages.map((msg) => (
            <ChatMessage
              key={msg._id}
              message={msg.content}
              isMine={msg.sender_id === me._id}
              sender={msg.sender_name}
            />
          ))}
</div>

        <ChatForm onSendMessage={handleSendMessage} />
      </Card>
    </div>
  );
}
