'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { AlertCircle } from 'lucide-react';
import type { AppError as AppErrorTypeFromContext } from '@/contexts/ErrorContext';

const ErrorDisplay: React.FC<{ error: AppErrorTypeFromContext; onClose: () => void }> = ({ error, onClose }) => {
  if (!error.message) return null;
  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 10 }}
      className="fixed bottom-4 right-4 z-50 bg-red-100 border border-red-300 text-red-800 px-4 py-3 rounded-lg shadow-md flex items-center max-w-sm dark:bg-red-900/80 dark:text-red-200 dark:border-red-700"
    >
      <AlertCircle className="w-5 h-5 mr-3 flex-shrink-0" />
      <span className="text-sm mr-3">{error.message}</span>
      <button onClick={onClose} className="ml-auto p-1 rounded-full hover:bg-red-200 dark:hover:bg-red-800 transition-colors">
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </motion.div>
  );
};

export default ErrorDisplay; 