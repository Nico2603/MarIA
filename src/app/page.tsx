'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import AgentAvatar from '@/components/AgentAvatar';
import { useSessionContext } from '@/contexts/SessionContext';
import ChatContainer from '@/components/ChatContainer';
import Link from 'next/link';
import InteractiveVoiceAvatar from '@/components/InteractiveVoiceAvatar';

export default function Home() {
  const router = useRouter();
  const { isAuthenticated, isLoading, user, login } = useSessionContext();
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
  
  // Redirigir si es necesario
  useEffect(() => {
    // Si el usuario está autenticado, redirigir al chat
    if (isAuthenticated && !isLoading) {
      router.push('/chat');
    }
  }, [isAuthenticated, isLoading, router]);
  
  const startChat = () => {
    // Establecer cookie para el middleware
    document.cookie = "simulatedAuth=true; path=/; max-age=86400";
    
    // Redirigir a chat inmediatamente
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
                Tu espacio seguro especializado en ansiedad y depresión, con orientación inicial personalizada.
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
              
              <h2 className="text-2xl font-medium text-neutral-700 mb-2">Asistente especializado en ansiedad y depresión</h2>
              <p className="text-lg text-neutral-500 mb-6 text-center max-w-md">
                Tu primera sesión es completamente gratis. Después, podrás elegir entre nuestros planes de suscripción o sesiones individuales.
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
                    ¡Hola, {user?.given_name || user?.name || 'Usuario'}! Ya puedes comenzar tu sesión gratuita
                  </p>
                </div>
              )}
              
              <div className="flex justify-center w-full max-w-md">
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={startChat}
                  className="btn btn-primary py-3 px-8 text-lg rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all"
                  disabled={isLoading}
                >
                  {isLoading ? 'Cargando...' : 'Registrarse para sesión gratuita'}
                </motion.button>
              </div>
            </motion.div>
            
            {/* Sección de características */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="bg-white rounded-xl p-6 shadow-soft text-center"
              >
                <div className="bg-blue-100 text-blue-600 w-14 h-14 mx-auto mb-4 rounded-full flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-neutral-800 mb-2">Apoyo en ansiedad</h3>
                <p className="text-neutral-600">
                  Recibe orientación personalizada para manejar tus síntomas de ansiedad y desarrollar estrategias de afrontamiento efectivas.
                </p>
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="bg-white rounded-xl p-6 shadow-soft text-center"
              >
                <div className="bg-purple-100 text-purple-600 w-14 h-14 mx-auto mb-4 rounded-full flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.182 15.182a4.5 4.5 0 01-6.364 0M21 12a9 9 0 11-18 0 9 9 0 0118 0zM9.75 9.75c0 .414-.168.75-.375.75S9 10.164 9 9.75 9.168 9 9.375 9s.375.336.375.75zm-.375 0h.008v.015h-.008V9.75zm5.625 0c0 .414-.168.75-.375.75s-.375-.336-.375-.75.168-.75.375-.75.375.336.375.75zm-.375 0h.008v.015h-.008V9.75z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-neutral-800 mb-2">Ayuda con depresión</h3>
                <p className="text-neutral-600">
                  Encuentra acompañamiento empático para momentos difíciles y orientación sobre recursos profesionales disponibles.
                </p>
              </motion.div>
            </div>
            
            {/* Sección de características adicionales */}
            <div className="mb-12">
              <h2 className="text-2xl font-bold text-center mb-8">Funcionalidades Especializadas</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white rounded-xl p-6 shadow-soft">
                  <div className="bg-blue-50 text-blue-600 w-12 h-12 rounded-full flex items-center justify-center mb-4">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-medium mb-2">Etiquetas inteligentes</h3>
                  <p className="text-sm text-neutral-600">
                    Sistema que categoriza automáticamente tus consultas para brindarte respuestas más precisas sobre ansiedad y depresión.
                  </p>
                </div>
                
                <div className="bg-white rounded-xl p-6 shadow-soft">
                  <div className="bg-purple-50 text-purple-600 w-12 h-12 rounded-full flex items-center justify-center mb-4">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-medium mb-2">Conversación enfocada</h3>
                  <p className="text-sm text-neutral-600">
                    Nuestro asistente está diseñado para mantenerse centrado en temas de ansiedad y depresión, proporcionando orientación de calidad.
                  </p>
                </div>
                
                <div className="bg-white rounded-xl p-6 shadow-soft">
                  <div className="bg-green-50 text-green-600 w-12 h-12 rounded-full flex items-center justify-center mb-4">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-medium mb-2">Recursos especializados</h3>
                  <p className="text-sm text-neutral-600">
                    Acceso a una biblioteca curada de recursos sobre ansiedad y depresión, actualizada con información validada por especialistas.
                  </p>
                </div>
              </div>
            </div>
            
            {/* Sección de precios */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="bg-white rounded-xl p-8 shadow-soft mb-12"
            >
              <h2 className="text-2xl font-bold text-center mb-8">Nuestros Planes</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Plan gratuito */}
                <div className="border border-neutral-200 rounded-lg p-6 bg-neutral-50">
                  <div className="text-center mb-4">
                    <h3 className="text-xl font-semibold">Primera Sesión</h3>
                    <div className="mt-2 text-3xl font-bold text-primary-600">Gratis</div>
                    <p className="mt-2 text-neutral-600 text-sm">Sin compromiso</p>
                  </div>
                  <ul className="space-y-2 mb-6">
                    <li className="flex items-center">
                      <svg className="w-5 h-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                      </svg>
                      Evaluación inicial de ansiedad y depresión
                    </li>
                    <li className="flex items-center">
                      <svg className="w-5 h-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                      </svg>
                      Enfoque personalizado en ansiedad o depresión
                    </li>
                    <li className="flex items-center">
                      <svg className="w-5 h-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                      </svg>
                      Recursos básicos
                    </li>
                  </ul>
                  <button 
                    onClick={startChat}
                    className="w-full py-2 px-4 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition"
                  >
                    Registrarse para sesión gratuita
                  </button>
                </div>
                
                {/* Plan por sesión */}
                <div className="border border-primary-200 rounded-lg p-6 bg-white shadow-soft relative">
                  <div className="absolute -top-3 right-4 bg-primary-600 text-white text-xs px-3 py-1 rounded-full">
                    Popular
                  </div>
                  <div className="text-center mb-4">
                    <h3 className="text-xl font-semibold">Sesión individual</h3>
                    <div className="mt-2 text-3xl font-bold text-primary-600">40.000 COP</div>
                    <p className="mt-2 text-neutral-600 text-sm">Por sesión</p>
                  </div>
                  <ul className="space-y-2 mb-6">
                    <li className="flex items-center">
                      <svg className="w-5 h-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                      </svg>
                      Sesión completa de 30 minutos
                    </li>
                    <li className="flex items-center">
                      <svg className="w-5 h-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                      </svg>
                      Recursos personalizados
                    </li>
                    <li className="flex items-center">
                      <svg className="w-5 h-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                      </svg>
                      Técnicas específicas para ansiedad/depresión
                    </li>
                  </ul>
                  <button 
                    className="w-full py-2 px-4 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition"
                  >
                    Seleccionar
                  </button>
                </div>
                
                {/* Plan mensual */}
                <div className="border border-neutral-200 rounded-lg p-6 bg-neutral-50">
                  <div className="text-center mb-4">
                    <h3 className="text-xl font-semibold">Suscripción mensual</h3>
                    <div className="mt-2 text-3xl font-bold text-primary-600">120.000 COP</div>
                    <p className="mt-2 text-neutral-600 text-sm">Por mes</p>
                  </div>
                  <ul className="space-y-2 mb-6">
                    <li className="flex items-center">
                      <svg className="w-5 h-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                      </svg>
                      4 sesiones mensuales
                    </li>
                    <li className="flex items-center">
                      <svg className="w-5 h-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                      </svg>
                      Seguimiento personalizado
                    </li>
                    <li className="flex items-center">
                      <svg className="w-5 h-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                      </svg>
                      Acceso a recursos premium
                    </li>
                  </ul>
                  <button 
                    className="w-full py-2 px-4 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition"
                  >
                    Seleccionar
                  </button>
                </div>
              </div>
            </motion.div>
            
            {/* Sección de testimonios */}
            <div className="mb-12">
              <h2 className="text-2xl font-bold text-center mb-8">Lo que dicen nuestros usuarios</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-xl shadow-soft">
                  <div className="flex items-center mb-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold mr-4">
                      M
                    </div>
                    <div>
                      <h3 className="font-semibold">María C.</h3>
                      <p className="text-sm text-neutral-500">Usuaria con ansiedad</p>
                    </div>
                  </div>
                  <p className="text-neutral-600">
                    "Encontrar un espacio especializado en ansiedad ha sido invaluable. El asistente me ha ayudado a identificar patrones en mis episodios de ansiedad y me ha dado técnicas efectivas para manejarlos."
                  </p>
                </div>
                
                <div className="bg-white p-6 rounded-xl shadow-soft">
                  <div className="flex items-center mb-4">
                    <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center text-purple-600 font-bold mr-4">
                      J
                    </div>
                    <div>
                      <h3 className="font-semibold">Juan R.</h3>
                      <p className="text-sm text-neutral-500">Usuario con depresión</p>
                    </div>
                  </div>
                  <p className="text-neutral-600">
                    "El apoyo que recibí durante mi episodio de depresión fue fundamental. Me sentí escuchado y recibí orientación clara sobre recursos profesionales. Valoro mucho el enfoque especializado del servicio."
                  </p>
                </div>
              </div>
            </div>
            
            {/* Llamada a la acción final */}
            <div className="text-center mb-12">
              <h2 className="text-2xl font-bold mb-4">Comienza tu camino hacia el bienestar emocional</h2>
              <p className="text-lg text-neutral-600 mb-6 max-w-2xl mx-auto">
                Nuestro asistente especializado en ansiedad y depresión está listo para apoyarte con información personalizada y recursos efectivos.
              </p>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.98 }}
                onClick={startChat}
                className="btn btn-primary py-3 px-8 text-lg rounded-xl"
              >
                Registrarse para sesión gratuita
              </motion.button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 