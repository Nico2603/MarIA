'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import Header from '@/components/Header';
import ChatContainer from '@/components/ChatContainer';
import ResourcesSidebar from '@/components/ResourcesSidebar';
import AgentAvatar from '@/components/AgentAvatar';

export default function Home() {
  const [showWelcome, setShowWelcome] = useState(true);
  
  const startChat = () => {
    setShowWelcome(false);
  };
  
  return (
    <main className="flex flex-col min-h-screen bg-neutral-50">
      <Header />
      
      {showWelcome ? (
        <div className="flex-1 flex flex-col items-center justify-center text-center px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="max-w-2xl"
          >
            <div className="mb-6 flex justify-center">
              <AgentAvatar isActive={true} size="lg" />
            </div>
            
            <h1 className="text-4xl font-display font-bold text-neutral-800 mb-4">
              AI Mental Health
            </h1>
            
            <p className="text-xl text-neutral-600 mb-8">
              Un espacio seguro para conversar y recibir orientación inicial en temas de salud mental. Recuerda que este asistente no sustituye a un profesional.
            </p>
            
            <div className="bg-white rounded-xl shadow-soft p-6 mb-8">
              <h2 className="text-xl font-semibold mb-4 text-neutral-800">
                ¿Cómo puedo ayudarte?
              </h2>
              
              <ul className="text-left space-y-3 mb-6">
                <li className="flex items-start">
                  <div className="bg-primary-100 rounded-full p-1 mr-3 mt-0.5">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <span className="text-neutral-700">
                    Te escucho y ofrezco un espacio para expresar tus preocupaciones
                  </span>
                </li>
                <li className="flex items-start">
                  <div className="bg-primary-100 rounded-full p-1 mr-3 mt-0.5">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <span className="text-neutral-700">
                    Brindo información sobre temas comunes de salud mental
                  </span>
                </li>
                <li className="flex items-start">
                  <div className="bg-primary-100 rounded-full p-1 mr-3 mt-0.5">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <span className="text-neutral-700">
                    Comparto recursos útiles y técnicas de manejo emocional
                  </span>
                </li>
                <li className="flex items-start">
                  <div className="bg-primary-100 rounded-full p-1 mr-3 mt-0.5">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <span className="text-neutral-700">
                    Te oriento hacia ayuda profesional cuando es necesario
                  </span>
                </li>
              </ul>
              
              <div className="bg-neutral-100 p-3 rounded-lg text-sm text-neutral-700 mb-6">
                <strong>Importante:</strong> Este asistente ofrece orientación inicial, pero no sustituye el diagnóstico, tratamiento o consejo de un profesional de la salud mental cualificado.
              </div>
              
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.98 }}
                onClick={startChat}
                className="btn btn-primary w-full py-3 text-lg"
              >
                Comenzar conversación
              </motion.button>
            </div>
          </motion.div>
        </div>
      ) : (
        <div className="flex-1 flex">
          <ChatContainer />
          <ResourcesSidebar />
        </div>
      )}
    </main>
  );
} 