'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Loader2, AlertCircle } from 'lucide-react';

import { ConnectionState as LiveKitConnectionState } from 'livekit-client';

interface StartConversationOverlayProps {
  authStatus: 'loading' | 'authenticated' | 'unauthenticated';

  userName?: string | null; 
  isReadyToStart: boolean;
  handleStartConversation: () => void;
  isSessionClosed: boolean;
  connectionState: LiveKitConnectionState;

}

const StartConversationOverlay: React.FC<StartConversationOverlayProps> = ({
  authStatus,

  userName,
  isReadyToStart,
  handleStartConversation,
  isSessionClosed,
  connectionState

}) => {
  return (
    <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-black/50 backdrop-blur-md text-white">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="text-center p-8"
      >
        <h2 className="text-3xl md:text-4xl font-bold mb-4">
          Bienvenido
          {authStatus === 'authenticated' && userName && (
             <motion.span 
               initial={{ opacity: 0, x: -10 }}
               animate={{ opacity: 1, x: 0 }}
               transition={{ delay: 0.3, duration: 0.5 }}
               className="ml-2"
             >
               , {userName}
             </motion.span>
           )}
        </h2> 
        
        {(authStatus === 'loading' || !isReadyToStart) && authStatus !== 'unauthenticated' && (
          <div className="mt-4 text-center">
            <Loader2 className="h-8 w-8 mb-4 mx-auto animate-spin text-primary-400" />
            <p className="text-neutral-300">{authStatus === 'loading' ? 'Cargando datos de sesión...' : 'Preparando IA...'}</p>
          </div>
        )}
        
        {authStatus === 'authenticated' && (
           <button
             onClick={handleStartConversation}
             disabled={!isReadyToStart || isSessionClosed || connectionState === LiveKitConnectionState.Connecting}
             className="button-glow mt-8 inline-flex items-center justify-center whitespace-nowrap rounded-md text-lg font-semibold ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 h-11 px-8 shadow-soft hover:shadow-soft-lg transform hover:-translate-y-1 bg-primary-600 hover:bg-primary-700 text-white disabled:opacity-50 disabled:cursor-not-allowed"
             aria-label="Comenzar sesión de conversación"
           >
             {connectionState === LiveKitConnectionState.Connecting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Conectando...</> :
              !isReadyToStart ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Preparando IA...</> : 
              'Comenzar tu sesión'}
            </button>
        )}
         {authStatus === 'unauthenticated' && (
            <div className="mt-6 text-center">
                <AlertCircle className="h-8 w-8 mb-4 mx-auto text-yellow-400" />
                <p className="text-neutral-300">Debes iniciar sesión para comenzar.</p>
             </div>
         )}
      </motion.div>
    </div>
  );
};

export default StartConversationOverlay; 