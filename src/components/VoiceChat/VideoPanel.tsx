'use client';

import React, { useRef, useEffect } from 'react';
import { Mic, Loader2, VideoOff, ChevronsLeft, ChevronsRight, UserIcon } from 'lucide-react';
import RemoteTrackPlayer from './RemoteTrackPlayer';
import type { ActiveTrackInfo } from '@/hooks/voicechat/useLiveKitTrackManagement';

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
}

// Componente de indicador de estado consolidado
const StatusIndicator: React.FC<{
  isListening: boolean;
  isProcessing: boolean;
  isSpeaking: boolean;
  isThinking: boolean;
  isSessionClosed: boolean;
  conversationActive: boolean;
}> = ({
  isListening,
  isProcessing,
  isSpeaking,
  isThinking,
  isSessionClosed,
  conversationActive
}) => (
  <div className="absolute bottom-4 left-4 flex items-center space-x-2 bg-black/60 text-white px-3 py-1.5 rounded-full text-xs backdrop-blur-sm">
    {isListening ? <><Mic className="h-3 w-3 text-red-400 animate-pulse" /><span>Escuchando...</span></> :
    isProcessing ? <><Loader2 className="h-3 w-3 animate-spin" /><span>Procesando...</span></> :
    isSpeaking ? <><svg className="h-3 w-3 text-blue-400" fill="currentColor" viewBox="0 0 16 16"><path d="M11.536 14.01A8.47 8.47 0 0 0 14.026 8a8.47 8.47 0 0 0-2.49-6.01l-1.088.92A6.479 6.479 0 0 1 12.025 8a6.48 6.48 0 0 1-1.578 4.09zM10.036 12.01A6.48 6.48 0 0 0 12.025 8a6.48 6.48 0 0 0-1.99-4.01l-1.088.92A4.486 4.486 0 0 1 10.025 8a4.486 4.486 0 0 1-1.088 3.09zM8 13a5 5 0 0 0 5-5V3a5 5 0 0 0-10 0v5a5 5 0 0 0 5 5m-3.5-5a3.5 3.5 0 1 1 7 0V3a3.5 3.5 0 1 1-7 0z"/></svg><span>Hablando...</span></> :
    isThinking ? <><Loader2 className="h-3 w-3 animate-spin" /><span>Pensando...</span></> :
    isSessionClosed ? <><svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg><span>Finalizada</span></> :
    conversationActive ? <><svg className="h-3 w-3 text-green-400" fill="currentColor" viewBox="0 0 16 16"><circle cx="8" cy="8" r="8"/></svg><span>Activa</span></> : 
    <><svg className="h-3 w-3 text-gray-400" fill="currentColor" viewBox="0 0 16 16"><circle cx="8" cy="8" r="8"/></svg><span>Inactiva</span></> 
    }
  </div>
);

// Placeholder minimalista simplificado
const AvatarPlaceholder: React.FC<{ 
  size?: 'small' | 'large';
}> = ({ size = 'large' }) => {
  const sizeClasses = size === 'small' 
    ? 'w-16 h-16' 
    : 'w-24 h-24';
  
  return (
    <div className="flex flex-col items-center justify-center space-y-4">
      {/* Avatar círculo con gradiente suave */}
      <div className={`${sizeClasses} rounded-full bg-gradient-to-br from-blue-500/20 to-purple-600/20 border-2 border-blue-400/30 flex items-center justify-center relative overflow-hidden`}>
        <UserIcon className={`${size === 'small' ? 'w-8 h-8' : 'w-12 h-12'} text-blue-400/60`} />
        
        {/* Animación de pulso sutil */}
        <div className={`absolute inset-0 rounded-full bg-blue-400/10 animate-pulse`}></div>
      </div>
      
      {/* Texto minimalista */}
      <div className="text-center space-y-1">
        <p className="text-neutral-300 text-sm font-medium">MarIA</p>
        <p className="text-neutral-500 text-xs">Preparando avatar...</p>
      </div>
    </div>
  );
};

// Componente de skeleton consolidado y minimalista
const VideoPanelSkeleton: React.FC<{ 
  isChatVisible?: boolean;
}> = ({ isChatVisible }) => (
  <div className="relative w-full h-full bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex flex-col items-center justify-center transition-all duration-300 ease-in-out overflow-hidden">
    {/* Contenedor del video con tamaño optimizado */}
    <div className={`transition-all duration-300 ease-in-out ${
      isChatVisible 
        ? 'w-full h-full rounded-lg bg-gradient-to-br from-gray-800/50 to-gray-700/50' 
        : 'w-full max-w-2xl h-full max-h-[70vh] aspect-video bg-gradient-to-br from-gray-800/50 to-gray-700/50 rounded-lg shadow-xl border border-gray-700/50'
    } flex items-center justify-center backdrop-blur-sm`}>
      <AvatarPlaceholder size={isChatVisible ? 'large' : 'large'} />
    </div>
    
    {/* Indicador de estado optimizado */}
    <div className="absolute bottom-4 left-4 flex items-center space-x-2 px-3 py-1.5 bg-gray-800/80 text-gray-300 rounded-full text-xs backdrop-blur-sm border border-gray-700/50">
      <Loader2 className="h-3 w-3 animate-spin text-blue-400" />
      <span>Conectando...</span>
    </div>
  </div>
);

// Componente de toggle del chat consolidado
const ChatToggle: React.FC<{
  isChatVisible: boolean;
  toggleChatVisibility: () => void;
  conversationActive: boolean;
}> = ({
  isChatVisible,
  toggleChatVisibility,
  conversationActive
}) => {
  if (!conversationActive) return null;

  return (
    <button
        onClick={toggleChatVisibility}
        className={`absolute top-6 right-6 z-30 p-3 bg-white/10 backdrop-blur-md rounded-xl shadow-lg hover:bg-white/20 transition-all duration-300 ease-in-out border border-white/20`}
        aria-label={isChatVisible ? "Ocultar chat" : "Mostrar chat"}
        title={isChatVisible ? "Ocultar chat de texto" : "Mostrar chat de texto"}
    >
        {isChatVisible ? (
            <ChevronsLeft className="h-5 w-5 text-white" />
        ) : (
            <ChevronsRight className="h-5 w-5 text-white" />
        )}
    </button>
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
}) => {
  // Si no hay track info, mostrar skeleton
  if (!tavusTrackInfo?.participant || !tavusTrackInfo.publication?.track) {
    return (
      <VideoPanelSkeleton isChatVisible={isChatVisible} />
    );
  }

  return (
    <div className="relative w-full h-full bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 transition-all duration-300 ease-in-out overflow-hidden flex items-center justify-center">
      {/* Toggle del chat */}
      {toggleChatVisibility && (
        <ChatToggle
          isChatVisible={isChatVisible}
          toggleChatVisibility={toggleChatVisibility}
          conversationActive={conversationActive}
        />
      )}

      {/* Contenedor del video optimizado */}
      <div className={`relative transition-all duration-300 ease-in-out ${
        isChatVisible 
          ? 'w-full h-full rounded-lg overflow-hidden' 
          : 'w-full max-w-2xl h-full max-h-[70vh] aspect-video rounded-lg overflow-hidden shadow-xl border border-gray-700/50'
      }`}>
        <RemoteTrackPlayer
          track={tavusTrackInfo.publication.track}
          className="w-full h-full object-cover object-top"
          autoPlay={true}
          muted={false}
          playsInline={true}
          onVideoLoaded={onVideoLoaded}
        />
        
        <StatusIndicator 
          isListening={isListening}
          isProcessing={isProcessing}
          isSpeaking={isSpeaking}
          isThinking={isThinking}
          isSessionClosed={isSessionClosed}
          conversationActive={conversationActive}
        />
      </div>

      {/* Controles de micrófono optimizados - posición absoluta fija */}
      {conversationActive && !isSessionClosed && (
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-20">
          <div className="flex flex-col items-center space-y-2">
            {/* Botón principal del micrófono */}
            <button 
              type="button"
              onClick={isListening ? handleStopListening : handleStartListening} 
              disabled={isProcessing || isSpeaking || isThinking} 
              className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-200 ease-in-out focus:outline-none focus:ring-4 focus:ring-offset-0 shadow-lg backdrop-blur-sm ${ 
                  isListening
                  ? 'bg-red-500/90 hover:bg-red-600/90 text-white focus:ring-red-400/50 scale-110' 
                  : 'bg-blue-600/90 hover:bg-blue-700/90 text-white focus:ring-blue-500/50'
              } ${ 
                  (isPushToTalkActive) ? 'ring-4 ring-green-400/50 scale-110' : ''
              } ${ 
                  (isProcessing || isSpeaking || isThinking) ? 'opacity-60 cursor-not-allowed' : ''
              }`}
              aria-label={isListening ? "Detener micrófono" : "Activar micrófono"}
              title={isListening ? "Click para detener micrófono" : "Click para activar micrófono"}
            >
              {isProcessing ? <Loader2 className="h-5 w-5 animate-spin" /> : <Mic className="h-5 w-5" />}
            </button>
            
            {/* Instrucciones compactas */}
            <div className="text-center">
              <p className="text-xs text-gray-300 font-medium">
                {isListening ? "Micrófono activo" : "Click o mantén [Espacio]"}
              </p>
              
              {/* Indicador visual del push-to-talk cuando está activo */}
              {isPushToTalkActive && (
                <div className="flex items-center justify-center space-x-1 mt-1 px-2 py-1 bg-green-500/20 rounded-full border border-green-400/30">
                  <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></div>
                  <span className="text-xs text-green-400 font-medium">Push-to-Talk</span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VideoPanel;
export { VideoPanelSkeleton, StatusIndicator, ChatToggle }; 