import React from 'react';
import { NotificationMessage, NotificationType } from '../types/notification';

interface NotificationDisplayProps {
  notification: NotificationMessage | null;
}

const NotificationDisplay: React.FC<NotificationDisplayProps> = ({ notification }) => {
  if (!notification) return null;

  const baseClasses = "fixed top-4 right-4 p-4 rounded-md shadow-lg text-white transition-opacity duration-300 z-50";
  const typeClasses: Record<NotificationType, string> = {
    info: "bg-blue-500",
    success: "bg-green-500",
    warning: "bg-yellow-500",
    error: "bg-red-500",
  };

  return (
    <div className={`${baseClasses} ${typeClasses[notification.type]}`}>
      {notification.message}
    </div>
  );
};

export default NotificationDisplay; 