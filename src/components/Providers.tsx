'use client';

import React from 'react';
import { ThemeProvider } from './ThemeProvider';
import { SessionProvider } from '@/contexts/SessionContext';

interface ProvidersProps {
  children: React.ReactNode;
}

export default function Providers({ children }: ProvidersProps) {
  return (
    <SessionProvider>
      <ThemeProvider>
        {children}
      </ThemeProvider>
    </SessionProvider>
  );
} 