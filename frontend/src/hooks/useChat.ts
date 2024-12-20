import { useState, useEffect } from 'react';
import Pusher from 'pusher-js';
import { Message } from '../types/Message';

const useChat = (chat_id: string) => {
  const [messages, setMessages] = useState<Message[]>([]);

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const response = await fetch(`/api/communication/chat/${chat_id}/messageHistory`);
        if (!response.ok) {
          throw new Error('Failed to fetch messages');
        }
        const data = await response.json();
        setMessages(data);
      } catch (error) {
        console.error('Error fetching messages:', error);
      }
    };

    fetchMessages();

    const pusher = new Pusher('977b667134c0ca0f9d91', { cluster: 'eu' });
    const channel = pusher.subscribe(`chat-${chat_id}`);

    channel.bind('new-message', (newMessage:Message) => {
      console.log('Received message:', newMessage); // Debugging
      setMessages((prevMessages) => [...prevMessages, newMessage]);
    });

    return () => {
      channel.unbind_all();
      channel.unsubscribe();
      pusher.disconnect();
    };
  }, [chat_id]);

  return messages;
};

export default useChat;
