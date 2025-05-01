'use client';

import { SessionProvider } from 'next-auth/react';
import React from 'react';

interface AuthProviderProps {
  children: React.ReactNode;
}

export default function AuthProvider({ children }: AuthProviderProps) {
  // No necesitamos pasar la sesión aquí si usamos la estrategia 'database' o 'jwt'
  // SessionProvider la obtendrá automáticamente del contexto de next-auth.
  return <SessionProvider>{children}</SessionProvider>;
} 