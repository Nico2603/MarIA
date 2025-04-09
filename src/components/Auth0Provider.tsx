'use client';

import { Auth0Provider } from '@auth0/auth0-react';
import { useRouter } from 'next/navigation';
import React from 'react';

interface Auth0ProviderWithNavigationProps {
  children: React.ReactNode;
}

export default function Auth0ProviderWithNavigation({ children }: Auth0ProviderWithNavigationProps) {
  const router = useRouter();

  // Estas variables deberían estar disponibles en el entorno cliente
  const domain = process.env.NEXT_PUBLIC_AUTH0_DOMAIN || '';
  const clientId = process.env.NEXT_PUBLIC_AUTH0_CLIENT_ID || '';
  
  // IMPORTANTE: Debe coincidir EXACTAMENTE con lo configurado en Auth0
  const redirectUri = typeof window !== 'undefined' ? `${window.location.origin}/chat` : 'http://localhost:3000/chat';

  if (!domain || !clientId) {
    console.warn('Auth0 configuration is incomplete. Check your environment variables.');
    return <>{children}</>;
  }

  // Esta función se ejecuta después de una autenticación exitosa
  const onRedirectCallback = (appState: any) => {
    // Redirigir al usuario a /chat después del login
    router.push('/chat');
    
    // Limpiar la URL eliminando los parámetros
    if (window.location.search || window.location.hash) {
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  };

  return (
    <Auth0Provider
      domain={domain}
      clientId={clientId}
      authorizationParams={{
        redirect_uri: redirectUri,
      }}
      onRedirectCallback={onRedirectCallback}
      useRefreshTokens={true}
      cacheLocation="localstorage"
      cookieDomain={typeof window !== 'undefined' ? window.location.hostname : 'localhost'}
    >
      {children}
    </Auth0Provider>
  );
} 