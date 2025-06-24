'use client';

import React, { useState, useCallback } from 'react';
import { Loader2, Mic, MessageSquare, ChevronsLeft, ChevronsRight } from 'lucide-react';
import { motion } from 'framer-motion';
import type { ActiveTrackInfo } from '@/hooks/voicechat/useLiveKitTrackManagement';
import RemoteTrackPlayer from './RemoteTrackPlayer';

interface VideoPanelProps {
  isChatVisible: boolean;
  tavusTrackInfo?: ActiveTrackInfo;
  isSpeaking: boolean;
  isListening: boolean;
  isProcessing: boolean;
  isThinking: boolean;
  isSessionClosed: boolean;
  conversationActive: boolean;
  handleStartListening: () => void;
  handleStopListening: () => void;
  isPushToTalkActive: boolean;
  toggleChatVisibility?: () => void;
  onVideoLoaded?: () => void;
  isReadyToStart?: boolean;
  authStatus?: string;
  handleStartConversation?: () => Promise<void>;
  isAvatarLoaded?: boolean; // << NUEVO: Para verificar si el avatar está cargado
}

// Componente de botón del micrófono mejorado
const MicrophoneButton: React.FC<{
  isListening: boolean;
  isProcessing: boolean;
  isSpeaking: boolean;
  isThinking: boolean;
  conversationActive: boolean;
  isSessionClosed: boolean;
  isPushToTalkActive: boolean;
  handleStartListening: () => void;
  handleStopListening: () => void;
  isAvatarLoaded?: boolean; // << NUEVO: Para verificar si el avatar está cargado
}> = ({
  isListening,
  isProcessing,
  isSpeaking,
  isThinking,
  conversationActive,
  isSessionClosed,
  isPushToTalkActive,
  handleStartListening,
  handleStopListening,
  isAvatarLoaded = true, // << NUEVO: Por defecto true para compatibilidad
}) => {
  if (!conversationActive || isSessionClosed) return null;

  return (
    <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-30">
      <div className="flex flex-col items-center space-y-3">
        {/* Botón principal del micrófono */}
        <motion.button 
          type="button"
          onClick={isListening ? handleStopListening : handleStartListening} 
          disabled={isProcessing || isSpeaking || isThinking || !isAvatarLoaded} 
          className={`relative w-16 h-16 rounded-full flex items-center justify-center transition-all duration-300 ease-in-out focus:outline-none shadow-2xl backdrop-blur-sm border-2 ${ 
            isListening
              ? 'bg-red-500/90 border-red-400 hover:bg-red-600/90 text-white scale-110' 
              : 'bg-blue-600/90 border-blue-500 hover:bg-blue-700/90 text-white'
          } ${ 
            isPushToTalkActive ? 'ring-4 ring-green-400/50 scale-110' : ''
          } ${ 
            (isProcessing || isSpeaking || isThinking || !isAvatarLoaded) ? 'opacity-60 cursor-not-allowed' : 'hover:scale-105'
          }`}
          whileHover={{ scale: (isProcessing || isSpeaking || isThinking || !isAvatarLoaded) ? 1 : 1.1 }}
          whileTap={{ scale: (isProcessing || isSpeaking || isThinking || !isAvatarLoaded) ? 1 : 0.95 }}
          aria-label={isListening ? "Detener micrófono" : "Activar micrófono"}
        >
          {isProcessing ? (
            <Loader2 className="h-6 w-6 animate-spin" />
          ) : (
            <Mic className="h-6 w-6" />
          )}
          
          {/* Indicador de estado */}
          {isListening && (
            <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-400 rounded-full animate-pulse border-2 border-white"></div>
          )}
        </motion.button>
        
        {/* Texto de instrucciones */}
        <div className="text-center bg-black/50 backdrop-blur-sm rounded-lg px-4 py-2 border border-white/20">
          <p className="text-sm text-white font-medium">
            {!isAvatarLoaded ? "🔄 Cargando avatar..." :
             isListening ? "🎤 Micrófono activo" : 
             isProcessing ? "⏳ Procesando..." :
             isSpeaking ? "🗣️ María hablando..." :
             isThinking ? "💭 María pensando..." :
             "Click o [Espacio] para hablar"}
          </p>
          
          {/* Indicador push-to-talk */}
          {isPushToTalkActive && (
            <div className="flex items-center justify-center space-x-2 mt-1">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-xs text-green-400 font-medium">Push-to-Talk Activo</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Componente de placeholder del avatar simplificado
const AvatarPlaceholder: React.FC<{ 
  handleStartConversation?: () => Promise<void>;
  isReadyToStart?: boolean;
  authStatus?: string;
  conversationActive?: boolean;
}> = ({ 
  handleStartConversation, 
  isReadyToStart, 
  authStatus, 
  conversationActive
}) => (
  <div className="flex flex-col items-center justify-center space-y-6 text-white">
    {/* Avatar círculo */}
    <div className="w-32 h-32 bg-gradient-to-br from-blue-500/30 to-purple-600/30 rounded-full flex items-center justify-center border-4 border-white/20 backdrop-blur-sm">
      <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center">
        <svg className="w-8 h-8 text-white/80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      </div>
    </div>
    
    {/* Información */}
    <div className="text-center space-y-4">
      <h3 className="text-2xl font-bold text-white">MarIA</h3>
      <p className="text-white/80 text-lg">Tu asistente de salud mental</p>
      
      {/* Botón para iniciar conversación */}
      {authStatus === 'authenticated' && !conversationActive && (
        <motion.button
          onClick={handleStartConversation}
          disabled={!isReadyToStart}
          className={`px-8 py-4 rounded-full font-semibold text-lg transition-all duration-300 ${
            isReadyToStart 
              ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-xl transform hover:scale-105'
              : 'bg-gray-600 text-gray-300 cursor-not-allowed'
          }`}
          whileHover={isReadyToStart ? { scale: 1.05 } : {}}
          whileTap={isReadyToStart ? { scale: 0.95 } : {}}
        >
          {isReadyToStart ? '▶ Iniciar Conversación' : 'Preparando...'}
        </motion.button>
      )}
    </div>
  </div>
);

// Componente principal del video optimizado
const OptimizedVideoDisplay: React.FC<{
  tavusTrackInfo: ActiveTrackInfo;
  onVideoLoaded?: () => void;
}> = ({ tavusTrackInfo, onVideoLoaded }) => {
  const [isVideoLoading, setIsVideoLoading] = useState(true);

  const handleVideoLoadedData = useCallback(() => {
    setIsVideoLoading(false);
    onVideoLoaded?.();
  }, [onVideoLoaded]);

  return (
    <div className="relative w-full h-full">
      {/* Loading overlay */}
      {isVideoLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-900/50 backdrop-blur-sm z-10 rounded-lg">
          <div className="text-center space-y-4">
            <Loader2 className="w-12 h-12 text-blue-400 animate-spin mx-auto" />
            <p className="text-white/80 text-sm">Cargando avatar...</p>
          </div>
        </div>
      )}
      
      {/* Video del avatar */}
      <RemoteTrackPlayer
        track={tavusTrackInfo.publication.track!}
        className="w-full h-full object-cover rounded-lg"
        autoPlay={true}
        muted={false}
        playsInline={true}
        onLoadedData={handleVideoLoadedData}
        onVideoLoaded={handleVideoLoadedData}
      />
    </div>
  );
};

const VideoPanel: React.FC<VideoPanelProps> = ({
  isChatVisible,
  tavusTrackInfo,
  isSpeaking,
  isListening,
  isProcessing,
  isThinking,
  isSessionClosed,
  conversationActive,
  handleStartListening,
  handleStopListening,
  isPushToTalkActive,
  toggleChatVisibility,
  onVideoLoaded,
  handleStartConversation,
  isReadyToStart,
  authStatus,
  isAvatarLoaded,
}) => {
  // Layout principal simplificado y centrado
  return (
    <div className="relative w-full h-full bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center overflow-hidden">
      
      {/* Video oculto para pre-carga cuando no está activa la conversación */}
      {tavusTrackInfo?.participant && tavusTrackInfo.publication?.track && !conversationActive && (
        <div className="absolute inset-0 opacity-0 pointer-events-none">
          <OptimizedVideoDisplay
            tavusTrackInfo={tavusTrackInfo}
            onVideoLoaded={onVideoLoaded}
          />
        </div>
      )}
      
      {/* Contenedor del contenido principal */}
      <div className="relative w-full h-full max-w-4xl mx-auto flex items-center justify-center p-6">
        
        {/* Video o placeholder - Solo mostrar video cuando la conversación esté activa */}
        {tavusTrackInfo?.participant && tavusTrackInfo.publication?.track && conversationActive ? (
          <div className="relative w-full h-full max-h-[80vh] aspect-video rounded-xl overflow-hidden shadow-2xl border border-white/10">
            <OptimizedVideoDisplay
              tavusTrackInfo={tavusTrackInfo}
              onVideoLoaded={onVideoLoaded}
            />
          </div>
        ) : (
          <div className="relative w-full h-full max-h-[80vh] flex items-center justify-center">
            <AvatarPlaceholder
              handleStartConversation={handleStartConversation}
              isReadyToStart={isReadyToStart}
              authStatus={authStatus}
              conversationActive={conversationActive}
            />
          </div>
        )}
      </div>

      {/* Botón del micrófono siempre visible cuando la conversación está activa */}
      <MicrophoneButton
        isListening={isListening}
        isProcessing={isProcessing}
        isSpeaking={isSpeaking}
        isThinking={isThinking}
        conversationActive={conversationActive}
        isSessionClosed={isSessionClosed}
        isPushToTalkActive={isPushToTalkActive}
        handleStartListening={handleStartListening}
        handleStopListening={handleStopListening}
        isAvatarLoaded={isAvatarLoaded}
      />

      {/* Botón toggle del chat */}
      {toggleChatVisibility && (
        <motion.button
          onClick={toggleChatVisibility}
          className="absolute top-4 left-4 w-12 h-12 bg-black/50 backdrop-blur-sm rounded-lg border border-white/20 flex items-center justify-center text-white hover:bg-black/70 transition-all duration-200 z-30"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          aria-label={isChatVisible ? "Ocultar chat" : "Mostrar chat"}
        >
          {isChatVisible ? (
            <ChevronsLeft className="h-5 w-5" />
          ) : (
            <MessageSquare className="h-5 w-5" />
          )}
        </motion.button>
      )}

      {/* Indicador de estado en la esquina */}
      {conversationActive && (
        <div className="absolute top-4 right-4 px-3 py-2 bg-black/50 backdrop-blur-sm rounded-lg border border-white/20">
          <div className="flex items-center space-x-2">
            <div className={`w-2 h-2 rounded-full ${
              isListening ? 'bg-red-400 animate-pulse' :
              isProcessing ? 'bg-yellow-400 animate-pulse' :
              isSpeaking ? 'bg-green-400 animate-pulse' :
              isThinking ? 'bg-blue-400 animate-pulse' :
              'bg-gray-400'
            }`}></div>
            <span className="text-xs text-white font-medium">
              {isListening ? 'Escuchando' :
               isProcessing ? 'Procesando' :
               isSpeaking ? 'Hablando' :
               isThinking ? 'Pensando' :
               'Listo'}
            </span>
          </div>
        </div>
      )}

      {/* Indicador de conexión cuando no está lista */}
      {!conversationActive && authStatus === 'authenticated' && (
        <div className="absolute bottom-4 left-4 px-3 py-2 bg-black/50 backdrop-blur-sm rounded-lg border border-white/20">
          <div className="flex items-center space-x-2">
            <Loader2 className="h-3 w-3 animate-spin text-blue-400" />
            <span className="text-xs text-white/80">Conectando...</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default VideoPanel;
export { MicrophoneButton, AvatarPlaceholder }; 