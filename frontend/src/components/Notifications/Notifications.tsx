import useNotifications from '../../hooks/useNotifications';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function Notifications({ userId }: { userId: string }) {
  const notifications = useNotifications(userId);

  return (
    <div className="w-full max-w-md mx-auto">
      {notifications.map((notification, index) => (
        <Card key={index} className="mb-4">
          <CardHeader>
            <CardTitle>Notification</CardTitle>
          </CardHeader>
          <CardContent>
            <p>{notification}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
