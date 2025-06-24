'use client';

import React, { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, Loader2 } from 'lucide-react';
import TranscribedResponse from './TranscribedResponse';
import ChatInput from './ChatInput';

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: string;
  suggestedVideo?: { title: string; url: string };
}

interface ChatPanelProps {
  messages: Message[];
  isThinking: boolean;
  isProcessing?: boolean;
  isSpeaking: boolean;
  currentSpeakingId: string | null;
  greetingMessageId: string | null;
  userName?: string | null;
  userImage?: string | null;
  chatContainerRef: React.RefObject<HTMLDivElement>;
  chatEndRef: React.RefObject<HTMLDivElement>;
  authStatus: string;
  totalPreviousSessions?: number | null;
  initialContext: string | null;
  activeSessionId: string | null;
  currentSessionTitle: string | null;
  textInput: string;
  setTextInput: (text: string) => void;
  handleSendTextMessage: (text: string) => void;
  handleStartListening: () => void;
  handleStopListening: () => void;
  isListening: boolean;
  isSessionClosed: boolean;
  conversationActive: boolean;
  isPushToTalkActive: boolean;
  textAreaRef: React.RefObject<HTMLTextAreaElement>;
  isAvatarLoaded?: boolean; // Nuevo: para verificar si el avatar está cargado
}

// Componente ThinkingIndicator consolidado
const ThinkingIndicator: React.FC = () => {
  const containerVariants = {
    animate: {
      transition: {
        staggerChildren: 0.15,
      },
    },
  };

  const dotVariants = {
    initial: { y: '0%', opacity: 0.5 },
    animate: {
      y: ['0%', '-50%', '0%'],
      opacity: [0.5, 1, 0.5],
      transition: {
        duration: 0.6,
        repeat: Infinity,
        ease: 'easeInOut',
      },
    },
  };

  return (
    <div className="flex items-end justify-start mb-4">
      <div className="flex-shrink-0 h-8 w-8 rounded-full bg-primary-100 dark:bg-primary-900/50 flex items-center justify-center mr-3">
        <svg className="h-5 w-5 text-primary-600 dark:text-primary-400 animate-pulse" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L1.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.25 18.75l.813-2.846a4.5 4.5 0 0 0 3.09-3.09L24.75 12l-2.846-.813a4.5 4.5 0 0 0-3.09-3.09L17.187 5.25l-.813 2.846a4.5 4.5 0 0 0-3.09 3.09L10.25 12l2.846.813a4.5 4.5 0 0 0 3.09 3.09l.813 2.846Z" />
        </svg>
      </div>
      <motion.div
        className="relative flex space-x-1.5 bg-white dark:bg-neutral-800 px-4 py-3 rounded-lg rounded-bl-none shadow-md"
        variants={containerVariants}
        initial="initial"
        animate="animate"
      >
        <motion.span
          variants={dotVariants}
          className="block w-2 h-2 bg-neutral-500 dark:bg-neutral-400 rounded-full"
        />
        <motion.span
          variants={dotVariants}
          className="block w-2 h-2 bg-neutral-500 dark:bg-neutral-400 rounded-full"
        />
        <motion.span
          variants={dotVariants}
          className="block w-2 h-2 bg-neutral-500 dark:bg-neutral-400 rounded-full"
        />
      </motion.div>
    </div>
  );
};

const ChatPanel: React.FC<ChatPanelProps> = ({
  messages,
  isThinking,
  isProcessing,
  isSpeaking,
  currentSpeakingId,
  greetingMessageId,
  userName,
  userImage,
  chatContainerRef,
  chatEndRef,
  authStatus,
  totalPreviousSessions,
  initialContext,
  activeSessionId,
  currentSessionTitle,
  textInput,
  setTextInput,
  handleSendTextMessage,
  handleStartListening,
  handleStopListening,
  isListening,
  isSessionClosed,
  conversationActive,
  isPushToTalkActive,
  textAreaRef,
  isAvatarLoaded = true, // Por defecto true para compatibilidad
}) => {
  // Debug reducido para ChatPanel
  if (messages.length > 0) {
    console.log('[ChatPanel] 📊 Renderizando:', {
      messagesCount: messages.length,
      isThinking,
      conversationActive
    });
  }

  useEffect(() => {
    if (chatContainerRef && chatContainerRef.current) {
      const container = chatContainerRef.current;
      const messagesContainer = container.querySelector('.flex-1.overflow-y-auto');
      if (messagesContainer) {
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
      }
    }
  }, [messages, chatContainerRef]);

  // Auto-scroll cuando se agreguen mensajes nuevos - solo dentro del contenedor de chat
  useEffect(() => {
    if (chatEndRef.current && chatContainerRef.current) {
      const container = chatContainerRef.current;
      const messagesContainer = container.querySelector('.flex-1.overflow-y-auto');
      if (messagesContainer) {
        // Usar scrollIntoView pero limitado al contenedor padre
        chatEndRef.current.scrollIntoView({ 
          behavior: 'smooth',
          block: 'end',
          inline: 'nearest'
        });
      }
    }
  }, [messages.length, isThinking, chatEndRef, chatContainerRef]);

  return (
    <div
      ref={chatContainerRef}
      className="flex-1 flex flex-col bg-transparent border-b border-gray-200 dark:border-gray-700 relative"
      aria-live="polite"
      aria-relevant="additions text"
    >
      <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4 scroll-smooth">
        {messages.length === 0 && !isThinking ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex flex-col items-center justify-center h-full text-center text-neutral-700 dark:text-neutral-400"
          >
            <MessageSquare className="w-12 h-12 mb-4 text-neutral-600 dark:text-neutral-500" />
            <h2 className="text-lg font-medium text-neutral-700 dark:text-neutral-200 mb-2">
              {authStatus === 'authenticated' ? (
                userName ? `Hola ${userName}, esperando para comenzar...` : 'Esperando para comenzar...') 
                : 'Inicia sesión para empezar.'}
            </h2>
            {authStatus === 'authenticated' && (
              <div className="mb-4 text-sm text-neutral-700 dark:text-neutral-400">
                {totalPreviousSessions !== null && totalPreviousSessions !== undefined ? (
                  <>
                    <p className="mb-1">
                      Has completado {totalPreviousSessions} {totalPreviousSessions === 1 ? 'sesión previa' : 'sesiones previas'}.
                    </p>
                    <p className="font-semibold text-neutral-700 dark:text-neutral-300">
                      Estás por iniciar tu sesión número {totalPreviousSessions + 1}.
                    </p>
                  </>
                ) : (
                  <p className="flex items-center justify-center">
                    Iniciando una nueva aventura conversacional.
                  </p>
                )}
                {initialContext && (
                  <p className="mt-3 text-xs italic text-neutral-600 dark:text-neutral-500 max-w-md mx-auto">
                    Contexto anterior: &quot;{initialContext.substring(0, 80)}{initialContext.length > 80 ? '...' : ''}&quot;
                  </p>
                )}
              </div>
            )}
            <p className="text-sm text-neutral-700 dark:text-neutral-400">
              {authStatus === 'authenticated'
                ? 'Esperando inicio de la conversación...'
                : 'Usa el menú superior para acceder.'}
            </p>
          </motion.div>
        ) : (
          <>
            {messages.map((msg, index) => {
              return (
                <TranscribedResponse
                  key={msg.id}
                  messageId={msg.id}
                  text={msg.text}
                  isUser={msg.isUser}
                  timestamp={msg.timestamp}
                  isHighlighted={currentSpeakingId === msg.id}
                  suggestedVideo={msg.suggestedVideo}
                  avatarUrl={msg.isUser ? (userImage || undefined) : undefined}
                  userName={msg.isUser ? userName : undefined}
                />
              );
            })}
            {isThinking && <ThinkingIndicator />}
          </>
        )}
        <div ref={chatEndRef} />
      </div>
      
      <div className="flex-shrink-0 bg-transparent">
        <ChatInput 
          textInput={textInput}
          setTextInput={setTextInput}
          handleSendTextMessage={handleSendTextMessage}
          handleStartListening={handleStartListening}
          handleStopListening={handleStopListening}
          isListening={isListening}
          isProcessing={isProcessing ?? false}
          isSpeaking={isSpeaking}
          isThinking={isThinking}
          isSessionClosed={isSessionClosed}
          conversationActive={conversationActive}
          isPushToTalkActive={isPushToTalkActive}
          textAreaRef={textAreaRef}
          isAvatarLoaded={isAvatarLoaded}
        />
      </div>
    </div>
  );
};

export default ChatPanel;
export { ThinkingIndicator }; 