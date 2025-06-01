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

  const hideNotification = useCallback(() => {
    setNotification(null);
  }, []);

  const showSuccess = useCallback((message: string, duration?: number) => {
    showNotification(message, 'success', duration);
  }, [showNotification]);

  const showError = useCallback((message: string, duration?: number) => {
    showNotification(message, 'error', duration);
  }, [showNotification]);

  const showWarning = useCallback((message: string, duration?: number) => {
    showNotification(message, 'warning', duration);
  }, [showNotification]);

  const showInfo = useCallback((message: string, duration?: number) => {
    showNotification(message, 'info', duration);
  }, [showNotification]);

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
    showNotification,
    hideNotification,
    showSuccess,
    showError,
    showWarning,
    showInfo
  };
};

// Utilidades adicionales para notificaciones
export const createNotification = (
  message: string, 
  type: NotificationType = 'info', 
  duration: number = 3000
): NotificationMessage => ({
  message,
  type,
  duration
});

// Constantes para duraciones comunes
export const NOTIFICATION_DURATIONS = {
  SHORT: 2000,
  MEDIUM: 3000,
  LONG: 5000,
  PERSISTENT: 10000,
} as const; 