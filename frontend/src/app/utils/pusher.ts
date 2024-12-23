import Pusher from 'pusher-js';
import { decodeToken } from './decodeToken';
import { NotificationType } from 'src/enums/notification-type.enum';

const pusher = new Pusher('977b667134c0ca0f9d91', {
  cluster: 'eu',
  forceTLS: true,
});

const token = document.cookie.split("; ").find((row) => row.startsWith("token="))?.split("=")[1]; 
const userId = token ? decodeToken(token)?.userid : null;

const channel = pusher.subscribe(`user-${userId}`);

channel.bind(NotificationType.MESSAGE, (data: string) => {
  console.log('New Message:', data);
  console.log('New Message:', data);
});

channel.bind(NotificationType.ANNOUNCEMENT, (data: string) => {
  console.log('New Announcement:', data);
});

channel.bind(NotificationType.REPLY, (data: string) => {
  console.log('New Reply:', data);
});
