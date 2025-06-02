import { useState, useEffect, useCallback } from 'react';
import { NotificationMessage, NotificationType } from '@/types';

// Hook consolidado para manejo de notificaciones
export const useNotifications = () => {
  const [notification, setNotification] = useState<NotificationMessage | null>(null);

  const showNotification = useCallback(
    (message: string, type: NotificationType = "info", duration: number = 3000) => {
      setNotification({ message, type, duration });
    },
    []
  );

  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => {
        setNotification(null);
      }, notification.duration);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  return { 
    notification, 
    showNotification
  };
}; 