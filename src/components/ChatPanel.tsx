'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, Loader2 } from 'lucide-react';
import TranscribedResponse from './TranscribedResponse';
import ThinkingIndicator from './ThinkingIndicator';
import type { UserProfile } from '@/types/profile';

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
  userProfile: UserProfile | null;
  sessionUserImage: string | null | undefined;
  chatContainerRef: React.RefObject<HTMLDivElement>;
  chatEndRef: React.RefObject<HTMLDivElement>;
  authStatus: string;
  totalPreviousSessions?: number | null;
  initialContext: string | null;
  activeSessionId: string | null;
  currentSessionTitle: string | null;
}

const ChatPanel: React.FC<ChatPanelProps> = ({
  messages,
  isThinking,
  isProcessing,
  isSpeaking,
  currentSpeakingId,
  greetingMessageId,
  userProfile,
  sessionUserImage,
  chatContainerRef,
  chatEndRef,
  authStatus,
  totalPreviousSessions,
  initialContext,
  activeSessionId,
  currentSessionTitle,
}) => {
  return (
    <div
      ref={chatContainerRef}
      className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4 scroll-smooth bg-white dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-700 relative"
      aria-live="polite"
      aria-relevant="additions text"
    >
      {messages.length === 0 && !isThinking ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col items-center justify-center h-full text-center text-neutral-500 dark:text-neutral-400"
        >
          <MessageSquare className="w-12 h-12 mb-4 text-neutral-400 dark:text-neutral-500" />
          <h2 className="text-lg font-medium text-neutral-700 dark:text-neutral-200 mb-2">
            {authStatus === 'authenticated' ? 'Esperando para comenzar...' : 'Inicia sesión para empezar.'}
          </h2>
          {authStatus === 'authenticated' && (
            <div className="mb-4">
              {totalPreviousSessions !== null && totalPreviousSessions !== undefined ? (
                <>
                  <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-1">
                    Has completado {totalPreviousSessions} {totalPreviousSessions === 1 ? 'sesión previa' : 'sesiones previas'}.
                  </p>
                  <p className="text-sm font-semibold text-neutral-700 dark:text-neutral-300">
                    Estás por iniciar tu sesión número {totalPreviousSessions + 1}.
                  </p>
                </>
              ) : (
                <p className="text-sm flex items-center justify-center text-neutral-600 dark:text-neutral-400">
                  Iniciando una nueva aventura conversacional.
                </p>
              )}
              {initialContext && (
                <p className="mt-3 text-xs italic text-neutral-500 dark:text-neutral-500 max-w-md mx-auto">
                  Contexto anterior: &quot;{initialContext.substring(0, 80)}{initialContext.length > 80 ? '...' : ''}&quot;
                </p>
              )}
            </div>
          )}
          <p className="text-sm">
            {authStatus === 'authenticated'
              ? 'Cuando estés listo, pulsa "Comenzar tu sesión".'
              : 'Usa el menú superior para acceder.'}
          </p>
        </motion.div>
      ) : (
        messages.map((msg) => (
          <TranscribedResponse
            key={msg.id}
            text={msg.text}
            isUser={msg.isUser}
            timestamp={msg.timestamp}
            isHighlighted={currentSpeakingId === msg.id}
            suggestedVideo={msg.suggestedVideo}
            avatarUrl={msg.isUser ? (userProfile?.avatarUrl || sessionUserImage || '/default-avatar.png') : undefined}
          />
        ))
      )}
      {isThinking && <ThinkingIndicator />}
      <div ref={chatEndRef} />
    </div>
  );
};

export default ChatPanel; 