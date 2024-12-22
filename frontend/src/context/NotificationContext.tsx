'use client';

import React, { createContext, useContext, useState } from 'react';

const NotificationContext = createContext<any>(null);

export const NotificationProvider = ({ children }: { children: React.ReactNode }) => {
  const [notifications, setNotifications] = useState<string[]>([]);

  const addNotification = (message: string) => {
    setNotifications((prev) => [...prev, message]);
    // Optionally auto-remove after a timeout
    setTimeout(() => {
      setNotifications((prev) => prev.slice(1));
    }, 3000);
  };

  return (
    <NotificationContext.Provider value={{ notifications, addNotification }}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotification = () => useContext(NotificationContext);
