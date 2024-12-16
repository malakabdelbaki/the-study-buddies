'use client';
import React, { useEffect } from "react";
import { initializeSocket, getSocket, disconnectSocket } from "@/lib/socket-client";

interface SocketManagerProps {
  onReceiveMessage: (message: string) => Promise<void>;
}

export const SocketManager: React.FC<SocketManagerProps> = ({ onReceiveMessage }) => {
  useEffect(() => {
    const token = localStorage.getItem('token');
    
    // Initialize socket connection
    initializeSocket();

    const socket = getSocket();
    
    if (socket) {
      socket.on("receiveMessage", async (message: string) => {
        await onReceiveMessage(message);
      });
    }

    return () => {
      disconnectSocket();
      if (socket) {
        socket.off("receiveMessage");
      }
    };
  }, [onReceiveMessage]);

  return null;
};
