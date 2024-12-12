'use client';

import React, { useEffect, useState } from 'react';
import { socket, useSocketStatus, checkServerAvailability, useSocketEvent, emitSocketEvent, initializeSocket } from '@/lib/socket-client';

export default function SocketStatus() {
  const isConnected = useSocketStatus();
  const [serverAvailable, setServerAvailable] = useState<boolean | null>(null);
  const [lastMessage, setLastMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    initializeSocket();
    const checkAvailability = async () => {
      const available = await checkServerAvailability();
      setServerAvailable(available);
    };
    checkAvailability();

    return () => {
      socket.disconnect();
    };
  }, []);

  useSocketEvent<string>('message', (data: string) => {
    setLastMessage(data);
  });

  const handleSendMessage = async () => {
    try {
      setError(null);
      const response = await emitSocketEvent('sendMessage', 'Hello, server!');
      console.log('Message sent successfully:', response);
    } catch (error) {
      console.error('Error sending message:', error);
      setError('Failed to send message. Please try again.');
    }
  };

  return (
    <div className="p-4 bg-gray-100 rounded-lg">
      <h2 className="text-xl font-bold mb-4">Socket Status</h2>
      <p className="mb-2">Server status: {serverAvailable === null ? 'Checking...' : serverAvailable ? 'Available' : 'Unavailable'}</p>
      <p className="mb-2">Socket status: {isConnected ? 'Connected' : 'Disconnected'}</p>
      {!isConnected && serverAvailable && (
        <button 
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mb-2"
          onClick={() => socket.connect()}
        >
          Reconnect
        </button>
      )}
      <button 
        className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded mb-2 ml-2"
        onClick={handleSendMessage}
      >
        Send Test Message
      </button>
      {lastMessage && (
        <p className="mt-4">Last received message: {lastMessage}</p>
      )}
      {error && (
        <p className="mt-4 text-red-500">{error}</p>
      )}
    </div>
  );
}

