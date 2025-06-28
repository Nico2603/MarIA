'use client';

import React, { useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, ChevronsLeft, ChevronsRight } from 'lucide-react';
import { useSession } from 'next-auth/react';
import dynamic from 'next/dynamic';
import type { Message, AppError } from "@/types";
import { ConnectionState as LiveKitConnectionState, Track, type RemoteTrackPublication, Participant, RemoteParticipant } from 'livekit-client';
import ErrorDisplay from '@/components/ui/ErrorDisplay';
import NotificationDisplay from '@/components/ui/NotificationDisplay';
import { VideoTrack } from '@livekit/components-react';
import type { ActiveTrackInfo } from '@/hooks/voicechat/useLiveKitTrackManagement';
import { cn } from '@/lib/utils';
import VideoPanel from './VideoPanel';

// Tipo para el estado de autenticación, ajusta según la implementación real de next-auth
type AuthStatus = "authenticated" | "loading" | "unauthenticated";

const DynamicChatPanel = dynamic(() => import('../ChatPanel'), {
  ssr: false,
  loading: () => (
    <div className="flex-1 flex items-center justify-center bg-gray-850 h-full border-l border-gray-700">
      <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
    </div>
  )
});

interface VoiceChatLayoutProps {
  // Estados del componente principal
  appError: AppError | null;
  notification: any | null; // Cambiado a any temporalmente
  isChatVisible: boolean;
  // Usando avatar CSS
  discoveredTargetParticipant?: RemoteParticipant;
  connectionState: LiveKitConnectionState;
  isSpeaking: boolean;
  isListening: boolean;
  isProcessing: boolean;
  isThinking: boolean;
  isSessionClosed: boolean;
  conversationActive: boolean;
  isPushToTalkActive: boolean;
  isReadyToStart: boolean;
  authStatus: AuthStatus; // Usando el tipo AuthStatus definido arriba
  userName: string | null | undefined;
  messages: Message[];
  greetingMessageId: string | null;
  currentSpeakingId: string | null;
  userProfile: any | null; // Cambiado a any temporalmente
  currentSessionTitle: string | null;
  sessionStartTime: number | null;
  textInput: string;
  setTextInput: (value: string) => void;

  // Callbacks y refs
  clearError: (type?: string) => void;
  toggleChatVisibility: () => void;
  handleStartListening: () => void;
  handleStopListening: () => void;
  handleSendTextMessage: (text: string, clearTextInput?: () => void) => Promise<void>;
  dispatch: React.Dispatch<any>; // Considerar un tipo más específico si es posible
  handleStartConversation: () => Promise<void>;
  redirectToFeedback?: () => void;
}

export default function VoiceChatLayout({
  appError,
  notification,
  isChatVisible,
  discoveredTargetParticipant,
  connectionState,
  isSpeaking,
  isListening,
  isProcessing,
  isThinking,
  isSessionClosed,
  conversationActive,
  isPushToTalkActive,
  isReadyToStart,
  authStatus,
  userName,
  messages,
  greetingMessageId,
  currentSpeakingId,
  userProfile,
  currentSessionTitle,
  sessionStartTime,
  textInput,
  setTextInput,
  clearError,
  toggleChatVisibility,
  handleStartListening,
  handleStopListening,
  handleSendTextMessage,
  dispatch,
  handleStartConversation,
  redirectToFeedback,
}: VoiceChatLayoutProps) {
  const { data: session } = useSession();
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const textAreaRef = useRef<HTMLTextAreaElement>(null);

  return (
    <div className="relative flex flex-col h-[calc(100vh-4rem)] overflow-hidden bg-gradient-to-br from-gray-900 to-gray-800 text-white">
      <AnimatePresence>
        {appError && appError.type === 'livekit' && appError.message && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="absolute top-0 left-0 right-0 z-50"
          >
            <ErrorDisplay error={{ message: appError.message, type: appError.type || undefined }} onClose={() => clearError()} />
          </motion.div>
        )}
      </AnimatePresence>
      <NotificationDisplay notification={notification} />

      <div className="flex flex-1 h-full overflow-hidden">
        {/* Panel del chat - Habilitado con toggle */}
        <AnimatePresence>
          {isChatVisible && (
            <motion.aside
              ref={chatContainerRef}
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className={cn(
                "flex-none bg-white dark:bg-gray-900 h-full border-r border-gray-300 dark:border-gray-700 flex flex-col max-h-full",
                // Responsivo: full width en mobile, 1/3 en desktop
                "w-full md:w-2/5 lg:w-1/3 xl:w-1/3",
                // En mobile, tomar toda la pantalla excepto cuando está colapsado
                "fixed md:relative z-40 md:z-auto"
              )}
            >
              <DynamicChatPanel
                messages={messages}
                isThinking={isThinking}
                isSpeaking={isSpeaking}
                currentSpeakingId={currentSpeakingId}
                greetingMessageId={greetingMessageId}
                userName={userProfile?.username || userName}
                userImage={session?.user?.image || null}
                chatContainerRef={chatContainerRef}
                chatEndRef={chatEndRef}
                authStatus={authStatus}
                initialContext={null}
                activeSessionId={null}
                currentSessionTitle={currentSessionTitle}
                textInput={textInput}
                setTextInput={setTextInput}
                handleSendTextMessage={(text: string) => handleSendTextMessage(text, () => setTextInput(''))}
                handleStartListening={handleStartListening}
                handleStopListening={handleStopListening}
                isListening={isListening}
                isSessionClosed={isSessionClosed}
                conversationActive={conversationActive}
                isPushToTalkActive={isPushToTalkActive}
                textAreaRef={textAreaRef}
                isProcessing={isProcessing}
                redirectToFeedback={redirectToFeedback}
              />
            </motion.aside>
          )}
        </AnimatePresence>

        {/* Contenedor principal optimizado para avatar CSS */}
        <div className="w-full h-full flex items-center justify-center bg-gray-900">
          {/* Video Panel - Siempre usa el avatar CSS */}
          <VideoPanel
            isChatVisible={isChatVisible}
            isSpeaking={isSpeaking}
            isListening={isListening}
            isProcessing={isProcessing}
            isThinking={isThinking}
            isSessionClosed={isSessionClosed}
            conversationActive={conversationActive}
            handleStartListening={handleStartListening}
            handleStopListening={handleStopListening}
            isPushToTalkActive={isPushToTalkActive}
            toggleChatVisibility={toggleChatVisibility}
            handleStartConversation={handleStartConversation}
            isReadyToStart={isReadyToStart}
            authStatus={authStatus}
            isAvatarLoaded={true}
            redirectToFeedback={redirectToFeedback}
          />
        </div>
      </div>
    </div>
  );
} 