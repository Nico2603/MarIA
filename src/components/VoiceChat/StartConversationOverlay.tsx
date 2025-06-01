'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Loader2, AlertCircle, CheckCircle2, Wifi, Bot, Video, Volume2 } from 'lucide-react';

import { ConnectionState as LiveKitConnectionState, RemoteParticipant } from 'livekit-client';

interface StartConversationOverlayProps {
  authStatus: 'loading' | 'authenticated' | 'unauthenticated';

  userName?: string | null; 
  isReadyToStart: boolean;
  handleStartConversation: () => void;
  isSessionClosed: boolean;
  connectionState: LiveKitConnectionState;
  discoveredParticipant?: RemoteParticipant | null;
}

const StartConversationOverlay: React.FC<StartConversationOverlayProps> = ({
  authStatus,

  userName,
  isReadyToStart,
  handleStartConversation,
  isSessionClosed,
  connectionState,
  discoveredParticipant,

}) => {
  // Estados de carga para mostrar progreso
  const isAuthenticating = authStatus === 'loading';
  const isConnectingToRoom = connectionState === LiveKitConnectionState.Connecting;
  const isRoomConnected = connectionState === LiveKitConnectionState.Connected;
  const hasDiscoveredAgent = !!discoveredParticipant;
  const isTavusAgent = discoveredParticipant?.identity === 'tavus-avatar-agent';

  const LoadingStep = ({ 
    icon: Icon, 
    label, 
    isCompleted, 
    isActive, 
    description 
  }: { 
    icon: any, 
    label: string, 
    isCompleted: boolean, 
    isActive: boolean, 
    description?: string 
  }) => (
    <motion.div 
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      className={`flex items-center space-x-3 p-3 rounded-lg transition-all duration-300 ${
        isCompleted ? 'bg-green-500/20 text-green-300 border border-green-500/30' :
        isActive ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30' :
        'bg-gray-500/20 text-gray-400 border border-gray-500/30'
      }`}
    >
      {isCompleted ? (
        <CheckCircle2 className="h-5 w-5 text-green-400 flex-shrink-0" />
      ) : isActive ? (
        <Loader2 className="h-5 w-5 animate-spin text-blue-400 flex-shrink-0" />
      ) : (
        <Icon className="h-5 w-5 flex-shrink-0" />
      )}
      <div className="flex-1 min-w-0">
        <div className="font-medium truncate">{label}</div>
        {description && (
          <div className="text-xs opacity-75 mt-1 truncate">{description}</div>
        )}
      </div>
    </motion.div>
  );

  const getMainMessage = () => {
    if (isAuthenticating) return 'Verificando credenciales...';
    if (isConnectingToRoom) return 'Estableciendo conexión segura...';
    if (!hasDiscoveredAgent) return 'Localizando agente de IA...';
    if (!isReadyToStart && isTavusAgent) return 'Inicializando avatar inteligente...';
    if (isReadyToStart) return '¡Todo listo para comenzar!';
    return 'Preparando el sistema...';
  };

  return (
    <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-gradient-to-br from-black/60 to-black/40 backdrop-blur-md text-white">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="text-center p-8 max-w-md w-full mx-4"
      >
        <h2 className="text-3xl md:text-4xl font-bold mb-2">
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
        
        <p className="text-lg text-neutral-300 mb-8">a tu sesión con María</p>
        
        {(authStatus === 'loading' || !isReadyToStart) && authStatus !== 'unauthenticated' && (
          <div className="mb-8">
            <h3 className="text-lg font-semibold mb-6 text-blue-300">
              {getMainMessage()}
            </h3>
            
            <div className="space-y-3 text-left">
              <LoadingStep
                icon={Wifi}
                label="Conexión establecida"
                isCompleted={isRoomConnected}
                isActive={isConnectingToRoom}
                description={isRoomConnected ? "Conectado de forma segura" : "Conectando a servidor..."}
              />
              
              <LoadingStep
                icon={Bot}
                label="Agente de IA detectado"
                isCompleted={hasDiscoveredAgent}
                isActive={isRoomConnected && !hasDiscoveredAgent}
                description={hasDiscoveredAgent ? `Agente ${discoveredParticipant?.identity} encontrado` : "Esperando agente..."}
              />
              
              {isTavusAgent && (
                <>
                  <LoadingStep
                    icon={Video}
                    label="Avatar visual cargado"
                    isCompleted={isReadyToStart}
                    isActive={hasDiscoveredAgent && !isReadyToStart}
                    description={isReadyToStart ? "Avatar completamente renderizado" : "Cargando componentes visuales..."}
                  />
                  
                  <LoadingStep
                    icon={Volume2}
                    label="Sistema de audio sincronizado"
                    isCompleted={isReadyToStart}
                    isActive={hasDiscoveredAgent && !isReadyToStart}
                    description={isReadyToStart ? "Audio y voz configurados" : "Sincronizando sistema de voz..."}
                  />
                </>
              )}
            </div>
          </div>
        )}
        
        {authStatus === 'authenticated' && (
           <motion.button
             onClick={handleStartConversation}
             disabled={!isReadyToStart || isSessionClosed}
             className={`w-full inline-flex items-center justify-center whitespace-nowrap rounded-lg text-lg font-semibold transition-all duration-300 h-12 px-8 shadow-lg ${
               isReadyToStart 
                 ? 'bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white shadow-green-500/25 hover:shadow-green-500/40 transform hover:scale-105' 
                 : 'bg-gray-600 text-gray-300 cursor-not-allowed opacity-50'
             }`}
             whileHover={isReadyToStart ? { scale: 1.02 } : {}}
             whileTap={isReadyToStart ? { scale: 0.98 } : {}}
             aria-label="Comenzar sesión de conversación"
           >
             {!isReadyToStart ? (
               <>
                 <Loader2 className="mr-2 h-5 w-5 animate-spin" /> 
                 Preparando sistema...
               </>
             ) : (
               <>
                 <CheckCircle2 className="mr-2 h-5 w-5" />
                 ¡Comenzar conversación!
               </>
             )}
           </motion.button>
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