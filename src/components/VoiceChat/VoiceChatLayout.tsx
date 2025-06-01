import React, { useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, ChevronsLeft, ChevronsRight } from 'lucide-react';
import dynamic from 'next/dynamic';
import type { Message, AppError } from "@/types";
import { ConnectionState as LiveKitConnectionState, Track, type RemoteTrackPublication, Participant } from 'livekit-client';
import ErrorDisplay from '@/components/ui/ErrorDisplay';
import NotificationDisplay from '@/components/ui/NotificationDisplay';
import { VideoPanelSkeleton } from './VideoPanel';
import StartConversationOverlay from './StartConversationOverlay';
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

const DynamicVideoPanel = dynamic(() => import('./VideoPanel'), {
  ssr: false,
  loading: () => <VideoPanelSkeleton />,
});

interface VoiceChatLayoutProps {
  // Estados del componente principal
  appError: AppError | null;
  notification: any | null; // Cambiado a any temporalmente
  isChatVisible: boolean;
  tavusVideoTrackPublication: RemoteTrackPublication | undefined;
  discoveredTargetParticipant?: Participant;
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
  handleStartConversation: () => void;
  handleStartListening: () => void;
  handleStopListening: () => void;
  handleSendTextMessage: (text: string) => Promise<void>;
  dispatch: React.Dispatch<any>; // Considerar un tipo más específico si es posible
}

export default function VoiceChatLayout({
  appError,
  notification,
  isChatVisible,
  tavusVideoTrackPublication,
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
  handleStartConversation,
  handleStartListening,
  handleStopListening,
  handleSendTextMessage,
  dispatch,
}: VoiceChatLayoutProps) {
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const textAreaRef = useRef<HTMLTextAreaElement>(null);

  return (
    <div className="relative flex flex-col h-screen overflow-hidden bg-gradient-to-br from-gray-900 to-gray-800 text-white">
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

      <div className="flex flex-row-reverse flex-1 h-full overflow-hidden items-stretch">
        <div className={`relative flex-1 flex flex-col items-center justify-center transition-all duration-300 ease-in-out p-4 h-full`}>
          <div className="h-full w-full rounded-lg overflow-hidden bg-gradient-to-br from-neutral-900 to-neutral-800 flex items-center justify-center relative">
            {tavusVideoTrackPublication && discoveredTargetParticipant ? (
              <>
                {/* Botón de toggle del chat para video directo */}
                {conversationActive && (
                  <button
                    onClick={toggleChatVisibility}
                    className="absolute top-4 right-4 z-30 p-3 bg-white/90 dark:bg-neutral-800/90 rounded-full shadow-lg hover:bg-white dark:hover:bg-neutral-700 transition-all duration-300 ease-in-out backdrop-blur-sm border border-neutral-200 dark:border-neutral-600"
                    aria-label={isChatVisible ? "Ocultar chat" : "Mostrar chat"}
                    title={isChatVisible ? "Ocultar chat de texto" : "Mostrar chat de texto"}
                  >
                    {isChatVisible ? (
                      <ChevronsLeft className="h-5 w-5 text-neutral-700 dark:text-neutral-200" />
                    ) : (
                      <ChevronsRight className="h-5 w-5 text-neutral-700 dark:text-neutral-200" />
                    )}
                  </button>
                )}
                
                {/* Contenedor del video con tamaño adaptativo */}
                <div className={`transition-all duration-300 ease-in-out ${
                  isChatVisible 
                    ? 'w-full h-full' 
                    : 'w-full max-w-2xl h-auto aspect-video mx-auto'
                }`}>
                  <VideoTrack
                    trackRef={{
                      participant: discoveredTargetParticipant,
                      publication: tavusVideoTrackPublication,
                      source: tavusVideoTrackPublication.source,
                    }}
                    className={`${
                      isChatVisible 
                        ? 'w-full h-full object-cover' 
                        : 'w-full h-full object-cover rounded-xl shadow-2xl'
                    }`}
                    style={{
                      objectFit: 'cover',
                      objectPosition: 'center',
                    }}
                  />
                </div>
              </>
            ) : connectionState === LiveKitConnectionState.Connected ? (
              <DynamicVideoPanel
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
              />
            ) : (
              <VideoPanelSkeleton />
            )}
          </div>

          {!conversationActive && !isSessionClosed && (
             <StartConversationOverlay
                handleStartConversation={handleStartConversation}
                isReadyToStart={isReadyToStart}
                authStatus={authStatus}
                userName={userName}
                isSessionClosed={isSessionClosed}
                connectionState={connectionState}
             />
          )}

          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex flex-col items-center space-y-2 z-20">
            {isPushToTalkActive && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="bg-blue-600 text-white px-4 py-2 rounded-full shadow-lg text-sm font-semibold"
              >
                Habla ahora (mantén pulsado Espacio)
              </motion.div>
            )}
            {appError && appError.type !== 'livekit' && appError.message && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                className="w-full max-w-md"
              >
                <ErrorDisplay error={{ message: appError.message, type: appError.type || undefined }} onClose={() => clearError()} />
              </motion.div>
            )}
          </div>
        </div>

        <AnimatePresence>
          {isChatVisible && (
            <motion.aside
              ref={chatContainerRef}
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="flex-none w-full md:w-1/3 bg-transparent h-full border-r border-gray-300 dark:border-gray-700 flex flex-col"
            >
              <DynamicChatPanel
                messages={messages}
                isThinking={isThinking}
                isSpeaking={isSpeaking}
                currentSpeakingId={currentSpeakingId}
                greetingMessageId={greetingMessageId}
                userName={userProfile?.name || userName}
                userImage={userProfile?.image}
                chatContainerRef={chatContainerRef}
                chatEndRef={chatEndRef}
                authStatus={authStatus}
                initialContext={null}
                activeSessionId={null}
                currentSessionTitle={currentSessionTitle}
                textInput={textInput}
                setTextInput={setTextInput}
                handleSendTextMessage={handleSendTextMessage}
                handleStartListening={handleStartListening}
                handleStopListening={handleStopListening}
                isListening={isListening}
                isSessionClosed={isSessionClosed}
                conversationActive={conversationActive}
                isPushToTalkActive={isPushToTalkActive}
                textAreaRef={textAreaRef}
                isProcessing={isProcessing}
              />
            </motion.aside>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
} 