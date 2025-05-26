import React, { useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, Terminal, Clock, Calendar } from 'lucide-react';
import dynamic from 'next/dynamic';
import type { Message } from "@/types/message";
import { ConnectionState as LiveKitConnectionState, Track, type RemoteTrackPublication, Participant } from 'livekit-client';
import ErrorDisplay from './ErrorDisplay';
import NotificationDisplay from '../NotificationDisplay';
import VideoPanelSkeleton from './VideoPanelSkeleton';
import ChatToggle from './ChatToggle';
import StartConversationOverlay from './StartConversationOverlay';
import { VideoTrack } from '@livekit/components-react';
import type { ActiveTrackInfo } from '@/hooks/voicechat/useLiveKitTrackManagement';
import type { AppError } from '@/contexts/ErrorContext';

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

  // El efecto de scroll to bottom y de ajuste de textarea se quedan en VoiceChatContainer
  // ya que dependen de estados que no se pasan a este layout (como textInput)
  // o se manejan mejor en el contenedor principal.

  return (
    <div className="relative flex flex-col h-full max-h-screen overflow-hidden bg-gradient-to-br from-gray-900 to-gray-800 text-white">
      <AnimatePresence>
        {appError && appError.type === 'livekit' && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="absolute top-0 left-0 right-0 z-50"
          >
            {/* @ts-ignore onClose no espera argumentos o uno opcional según uso previo */}
            <ErrorDisplay error={appError} onClose={() => clearError()} />
          </motion.div>
        )}
      </AnimatePresence>
      <NotificationDisplay notification={notification} />

      <div className="flex flex-1 overflow-hidden">
        <div className={`relative flex-1 flex flex-col items-center justify-center transition-all duration-300 ease-in-out ${isChatVisible ? 'md:w-2/3' : 'w-full'}`}>
          {tavusVideoTrackPublication ? (
            <VideoTrack
              trackRef={{
                participant: discoveredTargetParticipant!,
                publication: tavusVideoTrackPublication!,
                source: tavusVideoTrackPublication!.source,
              }}
              className="w-full h-full object-contain"
            />
          ) : connectionState === LiveKitConnectionState.Connected ? (
            <DynamicVideoPanel
              isChatVisible={isChatVisible}
              // tavusTrackInfo={tavusVideoTrackPublication} // DynamicVideoPanel espera ActiveTrackInfo, no solo publication
              isSpeaking={isSpeaking}
              isListening={isListening}
              isProcessing={isProcessing}
              isThinking={isThinking}
              isSessionClosed={isSessionClosed}
              conversationActive={conversationActive}
              handleStartListening={handleStartListening}
              handleStopListening={handleStopListening}
              isPushToTalkActive={isPushToTalkActive}
            />
          ) : (
            <VideoPanelSkeleton />
          )}

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
            {appError && appError.type !== 'livekit' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                className="w-full max-w-md" 
              >
                 {/* @ts-ignore onClose no espera argumentos o uno opcional según uso previo*/}
                <ErrorDisplay error={appError} onClose={() => clearError()} />
              </motion.div>
            )}
          </div>
        </div>

        <AnimatePresence>
          {isChatVisible && (
            <motion.aside
              ref={chatContainerRef}
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="flex-none w-full md:w-1/3 max-w-md bg-gray-850 h-full border-l border-gray-700 flex flex-col"
            >
              {/* @ts-ignore ChatPanelProps pendiente de revisión para onSendMessage */}
              <DynamicChatPanel
                messages={messages}
                isThinking={isThinking}
                handleSendTextMessage={handleSendTextMessage}
                chatEndRef={chatEndRef}
                greetingMessageId={greetingMessageId}
                currentSpeakingId={currentSpeakingId}
                userName={userProfile?.name}
                userImage={userProfile?.image}
                conversationActive={conversationActive}
              />
            </motion.aside>
          )}
        </AnimatePresence>

        <ChatToggle
          isChatVisible={isChatVisible}
          toggleChatVisibility={toggleChatVisibility}
          conversationActive={conversationActive}
        />
      </div>

      <footer className="bg-gray-850 p-3 border-t border-gray-700 flex items-center justify-between text-xs text-gray-400">
        <div className="flex items-center space-x-2">
          <Terminal size={16} />
          <span>{currentSessionTitle || 'Nueva Conversación'}</span>
        </div>
        <div className="flex items-center space-x-2">
          {sessionStartTime && (
            <>
              <Calendar size={16} />
              <span>{new Date(sessionStartTime).toLocaleDateString()}</span>
              <Clock size={16} />
              <span>{new Date(sessionStartTime).toLocaleTimeString()}</span>
            </>
          )}
          {connectionState === LiveKitConnectionState.Connected && <span className="text-green-400">Conectado</span>}
          {connectionState === LiveKitConnectionState.Connecting && <span className="text-yellow-400">Conectando...</span>}
          {connectionState === LiveKitConnectionState.Disconnected && <span className="text-red-400">Desconectado</span>}
        </div>
      </footer>
    </div>
  );
} 