'use client';

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import type { AppError, AppErrorType } from '@/types';

interface ErrorContextType {
  error: AppError;
  setError: (errorType: AppErrorType, errorMessage: string | null) => void;
  clearError: () => void;
}

const ErrorContext = createContext<ErrorContextType | undefined>(undefined);

export const ErrorProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [error, setErrorState] = useState<AppError>({ type: null, message: null });

  const setError = useCallback((errorType: AppErrorType, errorMessage: string | null) => {
    setErrorState({ type: errorType, message: errorMessage });
  }, []);

  const clearError = useCallback(() => {
    setErrorState({ type: null, message: null });
  }, []);

  return (
    <ErrorContext.Provider value={{ error, setError, clearError }}>
      {children}
    </ErrorContext.Provider>
  );
};

export const useError = (): ErrorContextType => {
  const context = useContext(ErrorContext);
  if (context === undefined) {
    throw new Error('useError must be used within an ErrorProvider');
  }
  return context;
}; 