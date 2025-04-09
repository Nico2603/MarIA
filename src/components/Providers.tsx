'use client';

import React from 'react';
import Auth0ProviderWithNavigation from './Auth0Provider';
import { ThemeProvider } from './ThemeProvider';

interface ProvidersProps {
  children: React.ReactNode;
}

export default function Providers({ children }: ProvidersProps) {
  return (
    <Auth0ProviderWithNavigation>
      <ThemeProvider>
        {children}
      </ThemeProvider>
    </Auth0ProviderWithNavigation>
  );
} 