'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth0 } from '@auth0/auth0-react';
import VoiceChatContainer from '@/components/VoiceChatContainer';
import ResourcesSidebar from '@/components/ResourcesSidebar';

export default function ChatPage() {
  const { isAuthenticated, isLoading, loginWithRedirect } = useAuth0();
  const router = useRouter();
  const [showResourcesModal, setShowResourcesModal] = useState(false);

  // Limpiar la URL quitando los parámetros de autenticación
  useEffect(() => {
    // Limpiar URL de manera más efectiva
    if (window.location.href.includes('?') || window.location.href.includes('#')) {
      const cleanPath = window.location.pathname;
      window.history.replaceState({}, document.title, cleanPath);
    }
  }, []);

  // Redireccionar a inicio si el usuario no está autenticado
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/');
    }
  }, [isAuthenticated, isLoading, router]);

  // Verificar y restaurar sesión si existe
  useEffect(() => {
    const isStoredAuthenticated = localStorage.getItem('auth0.is.authenticated');
    if (isStoredAuthenticated === 'true' && !isAuthenticated && !isLoading) {
      // Intentar restaurar la sesión
      setTimeout(() => {
        if (!isAuthenticated) {
          router.push('/');
        }
      }, 2000);
    }
  }, [isAuthenticated, isLoading, router]);

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-t-blue-600 border-blue-200 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center min-h-screen">
        <p className="text-xl text-neutral-600 mb-6">
          Por favor inicia sesión para acceder al chat
        </p>
        <button 
          onClick={() => loginWithRedirect()} 
          className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-md"
        >
          Iniciar sesión
        </button>
      </div>
    );
  }

  return (
    <div className="flex min-h-[calc(100vh-64px)]">
      {/* Área principal del chat */}
      <div className="flex-1 flex flex-col relative">
        <VoiceChatContainer />
        
        {/* Botón flotante para abrir recursos en móvil */}
        <button
          onClick={() => setShowResourcesModal(true)}
          className="lg:hidden fixed bottom-20 right-4 bg-white shadow-lg rounded-full p-3 z-10 border border-neutral-200"
          aria-label="Ver recursos"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
          </svg>
        </button>
      </div>
      
      {/* Sidebar de recursos - visible sólo en desktop */}
      <div className="hidden lg:block lg:w-80 border-l border-neutral-200">
        <ResourcesSidebar />
      </div>
      
      {/* Modal de recursos - visible sólo en móvil/tablet al hacer clic */}
      {showResourcesModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4 lg:hidden">
          <div className="bg-white rounded-xl w-full max-w-md max-h-[80vh] overflow-y-auto">
            <div className="p-4 border-b border-neutral-200 flex justify-between items-center">
              <h3 className="text-lg font-semibold">Recursos útiles</h3>
              <button
                onClick={() => setShowResourcesModal(false)}
                className="text-neutral-500 hover:text-neutral-700"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-4">
              <ResourcesSidebar />
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 