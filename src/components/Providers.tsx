'use client';

import React from 'react';
import { ThemeProvider } from './ThemeProvider';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
// Opcional: Importar ReactQueryDevtools para desarrollo
// import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

// Crear una instancia de QueryClient
// Se puede configurar globalmente aquí, por ejemplo, con defaultOptions
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Por ejemplo, staleTime de 5 minutos
      staleTime: 1000 * 60 * 5,
      // Por ejemplo, reintentos en caso de error
      retry: 2,
    },
  },
});

interface ProvidersProps {
  children: React.ReactNode;
}

export default function Providers({ children }: ProvidersProps) {
  return (
    <ThemeProvider>
      <QueryClientProvider client={queryClient}>
        {children}
        {/* Opcional: Habilitar ReactQueryDevtools solo en desarrollo */}
        {/* <ReactQueryDevtools initialIsOpen={false} /> */}
      </QueryClientProvider>
    </ThemeProvider>
  );
} 