'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import AgentAvatar from '@/components/AgentAvatar';
import { useAuth0 } from '@auth0/auth0-react';
import ChatContainer from '@/components/ChatContainer';
import Link from 'next/link';
import InteractiveVoiceAvatar from '@/components/InteractiveVoiceAvatar';

export default function Home() {
  const router = useRouter();
  const { isAuthenticated, isLoading, loginWithRedirect, user } = useAuth0();
  const [showResourcesModal, setShowResourcesModal] = useState(false);
  
  // Para la demostración de la funcionalidad de voz
  const [isVoiceDemoActive, setIsVoiceDemoActive] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  
  // Simulación de demostración de voz
  const handleVoiceDemoStart = () => {
    if (isVoiceDemoActive) {
      setIsVoiceDemoActive(false);
      return;
    }
    
    setIsVoiceDemoActive(true);
    
    // Simulación: después de escuchar, procesar la respuesta
    setTimeout(() => {
      setIsVoiceDemoActive(false);
      setIsProcessing(true);
      
      // Simular procesamiento y luego hablar
      setTimeout(() => {
        setIsProcessing(false);
        setIsSpeaking(true);
        
        // Finalizar la demostración
        setTimeout(() => {
          setIsSpeaking(false);
        }, 3000);
      }, 1500);
    }, 3000);
  };
  
  // Limpiar la URL y redirigir si es necesario
  useEffect(() => {
    // Verificar si venimos de una autenticación (URL con código y estado)
    const url = window.location.href;
    const hasAuthParams = url.includes('code=') && url.includes('state=');
    
    if (hasAuthParams) {
      // Limpiar la URL eliminando los parámetros
      window.history.replaceState({}, document.title, window.location.pathname);
    }
    
    // Si el usuario está autenticado, redirigir al chat
    if (isAuthenticated && !isLoading) {
      router.push('/chat');
    }
  }, [isAuthenticated, isLoading, router]);
  
  const startChat = () => {
    if (!isAuthenticated) {
      // Iniciar sesión con Auth0
      loginWithRedirect({
        appState: { returnTo: '/chat' }
      });
      return;
    }
    router.push('/chat');
  };
  
  return (
    <div className="flex flex-col min-h-screen">
      {/* Área de contenido principal - Centrado */}
      <div className="flex-1 flex flex-col items-center">
        <div className="w-full px-4 py-12 bg-gradient-to-b from-blue-50 to-white">
          <div className="container mx-auto max-w-5xl">
            <div className="text-center mb-10">
              <motion.h1
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="text-4xl md:text-5xl font-display font-bold text-neutral-800 mb-4"
              >
                AI Mental Health
              </motion.h1>
              
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="text-xl text-neutral-600 max-w-3xl mx-auto"
              >
                Un espacio seguro para conversar y recibir orientación inicial en temas de salud mental. 
                Recuerda que este asistente no sustituye a un profesional.
              </motion.p>
            </div>
            
            {/* Sección principal con el avatar como punto focal */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6 }}
              className="flex flex-col items-center justify-center bg-white rounded-2xl shadow-soft p-8 mb-12"
            >
              {/* Avatar interactivo como centro de atención */}
              <div className="mb-6">
                <InteractiveVoiceAvatar 
                  isListening={isVoiceDemoActive}
                  isProcessing={isProcessing}
                  isSpeaking={isSpeaking}
                  onStartListening={handleVoiceDemoStart}
                  onStopListening={handleVoiceDemoStart}
                  size="xl"
                />
              </div>
              
              <h2 className="text-2xl font-medium text-neutral-700 mb-2">Asistente AI Mental Health</h2>
              <p className="text-lg text-neutral-500 mb-6 text-center max-w-md">
                Tu compañero para explorar soluciones iniciales y recursos de salud mental
              </p>
              
              {isAuthenticated && (
                <div className="flex items-center justify-center gap-3 mb-6 bg-blue-50 p-4 rounded-lg max-w-md w-full">
                  <div className="w-10 h-10 rounded-full overflow-hidden border border-blue-200">
                    {user?.picture ? (
                      <img 
                        src={user.picture} 
                        alt={user.name || 'Usuario'} 
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold">
                        {user?.name?.charAt(0) || 'U'}
                      </div>
                    )}
                  </div>
                  <p className="text-blue-800">
                    ¡Hola, {user?.given_name || user?.name || 'Usuario'}! Ya puedes comenzar a conversar
                  </p>
                </div>
              )}
              
              <div className="flex flex-col sm:flex-row gap-4 w-full max-w-md">
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={startChat}
                  className="btn btn-primary py-3 text-lg flex-1 rounded-xl"
                  disabled={isLoading}
                >
                  {isLoading ? 'Cargando...' : isAuthenticated ? 'Comenzar conversación' : 'Iniciar sesión para conversar'}
                </motion.button>
                
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleVoiceDemoStart}
                  className="btn btn-secondary py-3 text-lg flex-1 rounded-xl"
                >
                  {isVoiceDemoActive || isProcessing || isSpeaking ? "Detener demo" : "Probar demostración"}
                </motion.button>
              </div>
            </motion.div>
            
            {/* Sección de características */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="bg-white rounded-xl p-6 shadow-soft text-center"
              >
                <div className="bg-primary-100 text-primary-600 w-14 h-14 mx-auto mb-4 rounded-full flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-neutral-800 mb-2">Interacción por voz</h3>
                <p className="text-neutral-600">
                  Conversa naturalmente usando tu voz, como lo harías con un terapeuta real.
                </p>
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="bg-white rounded-xl p-6 shadow-soft text-center"
              >
                <div className="bg-primary-100 text-primary-600 w-14 h-14 mx-auto mb-4 rounded-full flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-neutral-800 mb-2">Respuestas adaptadas</h3>
                <p className="text-neutral-600">
                  El asistente comprende el contexto y ofrece orientación relevante a tus inquietudes.
                </p>
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
                className="bg-white rounded-xl p-6 shadow-soft text-center"
              >
                <div className="bg-primary-100 text-primary-600 w-14 h-14 mx-auto mb-4 rounded-full flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-neutral-800 mb-2">Recursos útiles</h3>
                <p className="text-neutral-600">
                  Accede a material de apoyo personalizado y contactos de profesionales.
                </p>
                <div className="mt-4">
                  <Link 
                    href="/recursos" 
                    className="text-blue-600 hover:underline inline-flex items-center text-sm font-medium"
                  >
                    Ver todos los recursos
                    <svg className="w-4 h-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                  </Link>
                </div>
              </motion.div>
            </div>
            
            {/* Disclaimer importante */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.5 }}
              className="bg-neutral-50 border border-neutral-200 rounded-lg p-4 text-center max-w-3xl mx-auto"
            >
              <p className="text-neutral-600">
                <strong>Importante:</strong> Este asistente ofrece orientación inicial, pero no sustituye el diagnóstico, tratamiento o consejo de un profesional de la salud mental cualificado.
              </p>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
} 