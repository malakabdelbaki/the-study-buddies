'use client';

import { io, Socket } from "socket.io-client";
import { useState, useEffect } from 'react';

const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:5000";

export const socket: Socket = io(SOCKET_URL, {
  reconnection: true,
  reconnectionAttempts: Infinity,
  reconnectionDelay: 1000,
  reconnectionDelayMax: 5000,
  timeout: 20000,
  transports: ['websocket', 'polling'],
  autoConnect: false, // Prevent auto-connection on import
  withCredentials: true,
});

export const initializeSocket = () => {
  if (!socket.connected) {
    socket.connect();
  }

  socket.on('connect', () => {
    console.log('Socket connected successfully');
  });

  socket.on('connect_error', (error: any) => {
    console.error('Socket connection error:', error);
    if (error.description) {
      console.error('Error description:', error.description);
    }
    // Implement exponential backoff for reconnection
    const reconnectDelay = Math.min(1000 * Math.pow(2, socket.io.opts.reconnectionAttempts || 0), 60000);
    setTimeout(() => {
      console.log(`Attempting to reconnect in ${reconnectDelay}ms...`);
      socket.connect();
    }, reconnectDelay);
  });

  socket.on('disconnect', (reason) => {
    console.log('Socket disconnected:', reason);
    if (reason === 'io server disconnect') {
      socket.connect();
    }
  });
};

export const isSocketConnected = (): boolean => {
  return socket.connected;
};

export const reconnectSocket = (): void => {
  if (!socket.connected) {
    socket.connect();
  }
};

export const disconnectSocket = (): void => {
  if (socket.connected) {
    socket.disconnect();
  }
};

export const useSocketStatus = () => {
  const [isConnected, setIsConnected] = useState(socket.connected);

  useEffect(() => {
    const onConnect = () => setIsConnected(true);
    const onDisconnect = () => setIsConnected(false);

    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);

    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
    };
  }, []);

  return isConnected;
};

export const checkServerAvailability = async (): Promise<boolean> => {
  try {
    const response = await fetch(`${SOCKET_URL}/health`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
    });
    return response.ok;
  } catch (error) {
    console.error('Error checking server availability:', error);
    return false;
  }
};

export const useSocketEvent = <T>(eventName: string, callback: (data: T) => void) => {
  useEffect(() => {
    socket.on(eventName, callback);
    return () => {
      socket.off(eventName, callback);
    };
  }, [eventName, callback]);
};

export const emitSocketEvent = <T>(eventName: string, data: T): Promise<any> => {
  return new Promise((resolve, reject) => {
    socket.timeout(5000).emit(eventName, data, (err: Error | null, response: any) => {
      if (err) {
        reject(err);
      } else {
        resolve(response);
      }
    });
  });
};

