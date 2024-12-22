
import React, { useState, useEffect } from 'react';
import styles from '@/app/styles/NotificationToast.module.css';


interface NotificationToastProps {
  notifications: string[];
}

const NotificationToast: React.FC<NotificationToastProps> = ({ notifications }) => {
  const [currentNotification, setCurrentNotification] = useState<string | null>(null);

  useEffect(() => {
    if (notifications.length > 0) {
      setCurrentNotification(notifications[0]);
      const timer = setTimeout(() => {
        setCurrentNotification(null);
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [notifications]);

  return (
    <div className={styles.toastContainer}>
      {currentNotification && (
        <div className={`${styles.toast} ${styles.fadeInOut}`}>
          {currentNotification}
        </div>
      )}
    </div>
  );
};

export default NotificationToast;
