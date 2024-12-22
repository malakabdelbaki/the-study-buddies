import { useState, useEffect } from 'react';
import Pusher from 'pusher-js';
import { NotificationType } from '../../../backend/src/enums/notification-type.enum';

export default function useNotifications(userId: string | null) {
  const [notifications, setNotifications] = useState<string[]>([]);

  useEffect(() => {
    if (!userId) {
      console.log('No userId available, not initializing Pusher');
      return;
    }

    console.log('Initializing Pusher for userId:', userId);
    const pusher = new Pusher('977b667134c0ca0f9d91', { cluster: 'eu', forceTLS: true });
    const channel = pusher.subscribe(`user-${userId}`);

    const handleNotification = (data: string) => {
      console.log('Received notification:', data);
      setNotifications([data]);
    };

    channel.bind(NotificationType.MESSAGE, handleNotification);
    channel.bind(NotificationType.ANNOUNCEMENT, handleNotification);
    channel.bind(NotificationType.REPLY, handleNotification);

    return () => {
      console.log('Cleaning up Pusher subscription');
      channel.unbind_all();
      channel.unsubscribe();
    };
  }, [userId]);

  return notifications;
}