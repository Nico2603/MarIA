'use client';

import React, { useRef, useEffect } from 'react';
import { Mic, Loader2, VideoOff, ChevronsLeft, ChevronsRight } from 'lucide-react';
import { VideoTrack } from '@livekit/components-react';
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
  <div className="absolute bottom-4 left-4 flex items-center space-x-2 bg-black/50 text-white px-3 py-1 rounded-full text-xs">
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

// Componente de skeleton consolidado
const VideoPanelSkeleton: React.FC<{ isChatVisible?: boolean }> = ({ isChatVisible }) => (
  <div 
    className={`
      relative 
      ${isChatVisible ? 'w-full md:w-2/3' : 'w-full'} 
      h-full 
      bg-gradient-to-br from-neutral-900 to-neutral-800
      flex flex-col items-center justify-center 
      transition-all duration-300 ease-in-out
      overflow-hidden
    `}
  >
    {/* Contenedor del skeleton - más pequeño cuando chat está oculto */}
    <div className={`transition-all duration-300 ease-in-out ${
      isChatVisible 
        ? 'absolute inset-0 bg-gradient-to-br from-neutral-800 to-neutral-700' 
        : 'w-full max-w-2xl h-auto aspect-video mx-auto bg-gradient-to-br from-neutral-800 to-neutral-700 rounded-xl shadow-2xl'
    } flex items-center justify-center`}>
      <div className="text-center">
        <VideoOff className="w-16 h-16 text-neutral-500 mx-auto mb-4" />
        <p className="text-neutral-400 text-sm">Cargando avatar...</p>
        <div className="mt-4 flex justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-blue-400" />
        </div>
      </div>
    </div>
    
    {/* Controles inferiores del skeleton */}
    <div className={`absolute ${
      isChatVisible 
        ? 'bottom-4 left-4 right-4' 
        : 'bottom-6 left-1/2 transform -translate-x-1/2'
    } flex items-center justify-center p-2 bg-neutral-700/80 rounded-md backdrop-blur-sm`}>
      <div className="flex items-center space-x-2">
        <div className="h-6 w-6 bg-neutral-600 rounded animate-pulse"></div>
        <div className="h-4 w-24 bg-neutral-600 rounded animate-pulse"></div>
      </div>
      {isChatVisible && <div className="h-10 w-10 bg-neutral-600 rounded-full animate-pulse"></div>}
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
        className={`absolute top-4 right-4 z-30 p-3 bg-white/90 dark:bg-neutral-800/90 rounded-full shadow-lg hover:bg-white dark:hover:bg-neutral-700 transition-all duration-300 ease-in-out backdrop-blur-sm border border-neutral-200 dark:border-neutral-600`}
        aria-label={isChatVisible ? "Ocultar chat" : "Mostrar chat"}
        title={isChatVisible ? "Ocultar chat de texto" : "Mostrar chat de texto"}
    >
        {isChatVisible ? (
            <ChevronsLeft className="h-5 w-5 text-neutral-700 dark:text-neutral-200" />
        ) : (
            <ChevronsRight className="h-5 w-5 text-neutral-700 dark:text-neutral-200" />
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
}) => {
  // Si no hay track info, mostrar skeleton
  if (!tavusTrackInfo?.participant || !tavusTrackInfo.publication?.track) {
    return <VideoPanelSkeleton isChatVisible={isChatVisible} />;
  }

  return (
    <div className={`relative flex items-center justify-center flex-1 min-h-0 bg-gradient-to-br from-neutral-900 to-neutral-800 transition-all duration-300 ease-in-out ${isChatVisible ? 'md:w-2/3' : 'w-full'} overflow-hidden`}>
      {/* Toggle del chat */}
      {toggleChatVisibility && (
        <ChatToggle
          isChatVisible={isChatVisible}
          toggleChatVisibility={toggleChatVisibility}
          conversationActive={conversationActive}
        />
      )}

      {/* Contenedor del video optimizado - más pequeño cuando chat está oculto */}
      <div className={`relative transition-all duration-300 ease-in-out ${
        isChatVisible 
          ? 'w-full h-full' 
          : 'w-full max-w-2xl h-auto aspect-video mx-auto'
      }`}>
        <VideoTrack
          trackRef={{
            participant: tavusTrackInfo.participant,
            publication: tavusTrackInfo.publication,
            source: tavusTrackInfo.source,
          }}
          className={`${
            isChatVisible 
              ? 'absolute inset-0 w-full h-full object-cover' 
              : 'w-full h-full object-cover rounded-xl shadow-2xl'
          }`}
          style={{
            objectFit: 'cover',
            objectPosition: 'center',
          }}
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

      {/* Controles de micrófono - siempre visibles cuando chat está oculto */}
      {conversationActive && !isSessionClosed && (
        <div className={`absolute bottom-6 left-1/2 transform -translate-x-1/2 z-20 ${
          isChatVisible 
            ? 'bg-gradient-to-t from-black/70 via-black/50 to-transparent pb-4 pt-12 pointer-events-none w-full'
            : 'pointer-events-auto'
        }`}>
          <div className={`mx-auto px-4 max-w-md ${isChatVisible ? 'pointer-events-auto' : ''}`}>
            <div className={`${isChatVisible ? 'p-4 rounded-t-lg bg-transparent' : 'p-2'} flex justify-center`}> 
              <button 
                type="button"
                onClick={isListening ? handleStopListening : handleStartListening} 
                disabled={isProcessing || isSpeaking || isThinking} 
                className={`w-16 h-16 rounded-full flex items-center justify-center transition-all duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 shadow-xl ${ 
                    isListening
                    ? 'bg-red-500 hover:bg-red-600 text-white focus:ring-red-400 scale-110' 
                    : 'bg-primary-600 hover:bg-primary-700 text-white focus:ring-primary-500'
                } ${ 
                    (isPushToTalkActive) ? 'ring-4 ring-offset-0 ring-green-400 scale-110' : ''
                } ${ 
                    (isProcessing || isSpeaking || isThinking) ? 'opacity-60 cursor-not-allowed' : ''
                }`}
                aria-label={isListening ? "Detener micrófono" : "Activar micrófono"}
              >
                {isProcessing ? <Loader2 className="h-7 w-7 animate-spin" /> : <Mic className="h-7 w-7" />}
              </button>
            </div>
            <p className={`text-xs mt-2 text-center ${
              isChatVisible 
                ? 'text-neutral-200 drop-shadow-sm pointer-events-none' 
                : 'text-neutral-400'
            }`}>
              Mantén [Espacio] para hablar.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default VideoPanel;
export { VideoPanelSkeleton, StatusIndicator, ChatToggle }; 