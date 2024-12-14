import { io, Socket } from 'socket.io-client';

const SOCKET_SERVER_URL = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3001';

let socket: Socket;

export const initializeSocket = (token: string) => {
  socket = io(SOCKET_SERVER_URL, {
    auth: {
      token: `Bearer ${token}`
    },
    transports: ['websocket']
  });

  socket.on('connect', () => {
    console.log('Connected to WebSocket server');
  });

  socket.on('connect_error', (error) => {
    console.error('Connection error:', error.message);
  });

  return socket;
};

export const getSocket = (): Socket => {
  if (!socket) {
    throw new Error('Socket not initialized. Call initializeSocket first.');
  }
  return socket;
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
  }
};  //handles socket connection and disconnection

