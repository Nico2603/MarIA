'use client';

import React, { useState, useCallback } from 'react';
import { Loader2, Mic, MessageSquare, ChevronsLeft, ChevronsRight, Heart, MessageCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import type { ActiveTrackInfo } from '@/hooks/voicechat/useLiveKitTrackManagement';
import CSSAvatar from './CSSAvatar';

interface VideoPanelProps {
  isChatVisible: boolean;
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
  isReadyToStart?: boolean;
  authStatus?: string;
  handleStartConversation?: () => Promise<void>;
  isAvatarLoaded?: boolean;
  redirectToFeedback?: () => void;
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
}) => {
  if (!conversationActive || isSessionClosed) return null;

  return (
    <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-30">
      <div className="flex flex-col items-center space-y-3">
        {/* Botón principal del micrófono */}
        <motion.button 
          type="button"
          onClick={isListening ? handleStopListening : handleStartListening} 
          disabled={isProcessing || isSpeaking || isThinking} 
          className={`relative w-16 h-16 rounded-full flex items-center justify-center transition-all duration-300 ease-in-out focus:outline-none shadow-2xl backdrop-blur-sm border-2 ${ 
            isListening
              ? 'bg-red-500/90 border-red-400 hover:bg-red-600/90 text-white scale-110' 
              : 'bg-blue-600/90 border-blue-500 hover:bg-blue-700/90 text-white'
          } ${ 
            isPushToTalkActive ? 'ring-4 ring-green-400/50 scale-110' : ''
          } ${ 
            (isProcessing || isSpeaking || isThinking) ? 'opacity-60 cursor-not-allowed' : 'hover:scale-105'
          }`}
          whileHover={{ scale: (isProcessing || isSpeaking || isThinking) ? 1 : 1.1 }}
          whileTap={{ scale: (isProcessing || isSpeaking || isThinking) ? 1 : 0.95 }}
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
            {isListening ? "🎤 Micrófono activo" : 
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

// Componente de placeholder del avatar simplificado - Sin botón, inicio automático
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
                      <p className="text-white/80 text-lg">Tu asistente de acompañamiento emocional</p>
      
      {/* Mensaje de estado sin botón - inicio automático */}
      {authStatus === 'authenticated' && !conversationActive && (
        <div className="px-6 py-3 bg-blue-600/20 backdrop-blur-sm rounded-lg border border-blue-400/30">
          <p className="text-blue-200 text-base font-medium">
            {isReadyToStart ? '✨ Iniciando conversación...' : '🔗 Conectando...'}
          </p>
        </div>
      )}
    </div>
  </div>
);

// Componente para el estado de sesión finalizada con botón de feedback
const SessionClosedDisplay: React.FC<{
  redirectToFeedback?: () => void;
}> = ({ redirectToFeedback }) => (
  <div className="flex flex-col items-center justify-center space-y-8 text-white max-w-md mx-auto text-center">
    {/* Avatar con estado finalizado */}
    <div className="w-32 h-32 bg-gradient-to-br from-gray-500/30 to-gray-700/30 rounded-full flex items-center justify-center border-4 border-white/20 backdrop-blur-sm">
      <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center">
        <Heart className="w-8 h-8 text-pink-400" />
      </div>
    </div>
    
    {/* Mensaje de agradecimiento */}
    <div className="space-y-4">
      <h3 className="text-2xl font-bold text-white">¡Gracias por tu tiempo!</h3>
      <p className="text-white/80 text-lg leading-relaxed">
        Ha sido un honor acompañarte. Tu experiencia es muy valiosa para nosotros.
      </p>
    </div>
    
    {/* Botón de feedback */}
    {redirectToFeedback && (
      <motion.button
        onClick={redirectToFeedback}
        className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 rounded-xl text-white font-semibold text-lg shadow-2xl border border-white/20 backdrop-blur-sm flex items-center space-x-3 transition-all duration-300"
        whileHover={{ scale: 1.05, y: -2 }}
        whileTap={{ scale: 0.95 }}
      >
        <MessageCircle className="w-6 h-6" />
        <span>Compartir mi experiencia</span>
      </motion.button>
    )}
    
    {/* Mensaje opcional */}
    <p className="text-white/60 text-sm">
      Tu feedback nos ayuda a mejorar María para ayudar a más personas
    </p>
  </div>
);

// Componente principal del avatar CSS
const CSSAvatarDisplay: React.FC<{
  isSpeaking: boolean;
  isListening: boolean;
  isProcessing: boolean;
  isThinking: boolean;
  conversationActive: boolean;
  isSessionClosed: boolean;
}> = ({ isSpeaking, isListening, isProcessing, isThinking, conversationActive, isSessionClosed }) => {
  return (
    <div className="flex items-center justify-center w-full h-full">
      <CSSAvatar
        size={200}
        isSpeaking={isSpeaking}
        isListening={isListening}
        isProcessing={isProcessing}
        isThinking={isThinking}
        conversationActive={conversationActive}
        isSessionClosed={isSessionClosed}
      />
    </div>
  );
};

const VideoPanel: React.FC<VideoPanelProps> = ({
  isChatVisible,
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
  handleStartConversation,
  isReadyToStart,
  authStatus,
  isAvatarLoaded,
  redirectToFeedback,
}) => {
  // Layout principal simplificado y centrado
  return (
    <div className="relative w-full h-full bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center overflow-hidden">
      
      {/* Contenedor del contenido principal */}
      <div className="relative w-full h-full max-w-4xl mx-auto flex items-center justify-center p-6">
        
        {/* Avatar CSS - Siempre visible, cambia según el estado */}
        {isSessionClosed ? (
          <div className="relative w-full h-full max-h-[80vh] flex items-center justify-center">
            <SessionClosedDisplay redirectToFeedback={redirectToFeedback} />
          </div>
        ) : conversationActive ? (
          <div className="relative w-full h-full max-h-[80vh] flex items-center justify-center">
            <CSSAvatarDisplay
              isSpeaking={isSpeaking}
              isListening={isListening}
              isProcessing={isProcessing}
              isThinking={isThinking}
              conversationActive={conversationActive}
              isSessionClosed={isSessionClosed}
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

      {/* Indicador de conexión removido - avatar CSS inicia inmediatamente */}
    </div>
  );
};

export default VideoPanel;
export { MicrophoneButton, AvatarPlaceholder }; 