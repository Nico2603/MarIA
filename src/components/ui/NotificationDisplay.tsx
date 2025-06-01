'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { NotificationMessage, NotificationType } from '@/types';

interface NotificationDisplayProps {
  notification: NotificationMessage | null;
  className?: string;
}

const NotificationDisplay: React.FC<NotificationDisplayProps> = ({ 
  notification, 
  className = "fixed top-4 right-4 z-50" 
}) => {
  if (!notification) return null;

  const icons = {
    info: Info,
    success: CheckCircle,
    warning: AlertTriangle,
    error: AlertCircle,
  };

  const baseClasses = "p-4 rounded-lg shadow-lg text-white transition-all duration-300 ease-in-out max-w-sm";
  const typeClasses: Record<NotificationType, string> = {
    info: "bg-blue-500 border-blue-600",
    success: "bg-green-500 border-green-600",
    warning: "bg-yellow-500 border-yellow-600",
    error: "bg-red-500 border-red-600",
  };

  const Icon = icons[notification.type];

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, x: 100, scale: 0.95 }}
        animate={{ opacity: 1, x: 0, scale: 1 }}
        exit={{ opacity: 0, x: 100, scale: 0.95 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        className={`${className} ${baseClasses} ${typeClasses[notification.type]} border-l-4 flex items-center`}
        role="alert"
        aria-live="polite"
      >
        <Icon className="w-5 h-5 mr-3 flex-shrink-0" />
        <span className="text-sm font-medium">{notification.message}</span>
      </motion.div>
    </AnimatePresence>
  );
};

export default NotificationDisplay; 