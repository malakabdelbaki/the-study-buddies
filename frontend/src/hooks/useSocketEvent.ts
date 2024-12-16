import { useEffect } from 'react';
import { getSocket } from '../lib/socket-client';

export const useSocketEvent = <T>(event: string, callback: (data: T) => void): void => {
  useEffect(() => {
    const socket = getSocket();

    const handleEvent = (data: T) => {
      callback(data);
    };

    socket.on(event, handleEvent);

    return () => {
      socket.off(event, handleEvent);
    };
  }, [event, callback]);
};
