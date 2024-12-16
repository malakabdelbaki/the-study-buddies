import { io, Socket } from 'socket.io-client';

const SOCKET_SERVER_URL = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3001';

let socket: Socket | null = null;

export const initializeSocket = () => {
  const token  = localStorage.getItem('token');
  if (!socket) {
    socket = io(SOCKET_SERVER_URL, {
      auth: {
        token: `Bearer ${token}`
      },
      transports: ['websocket'],
      reconnection: true, // Enable automatic reconnection
      reconnectionAttempts: 5, // Number of attempts before failing
    });

    socket.on('connect', () => {
      console.log('Connected to WebSocket server');
    });

    socket.on('connect_error', (error) => {
      console.error('Connection error:', error.message);
    });

    socket.on('disconnect', () => {
      console.log('Disconnected from WebSocket server');
    });
  }

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
    socket = null;
  }
};

export const checkServerAvailability = async (): Promise<boolean> => {
  try {
    const response = await fetch(SOCKET_SERVER_URL, { method: 'HEAD' });
    return response.ok;
  } catch {
    return false;
  }


 };


export const emitSocketEvent = async <T, R = any>(event: string, data: T): Promise<R> => {
  const socket = getSocket();

  return new Promise<R>((resolve, reject) => {
    socket.emit(event, data, (response: R) => {
      if (response && typeof response === 'object' && 'error' in response) {
        reject(new Error(response.error as string));
      } else {
        resolve(response);
      }
    });
  });
};
