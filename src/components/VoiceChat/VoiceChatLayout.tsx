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
import { VideoPanelSkeleton } from './VideoPanel';
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
  tavusVideoTrack?: ActiveTrackInfo;
  tavusVideoTrackPublication: RemoteTrackPublication | undefined;
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
  handleSendTextMessage: (text: string) => Promise<void>;
  dispatch: React.Dispatch<any>; // Considerar un tipo más específico si es posible
  onTavusVideoLoaded?: () => void;
  handleStartConversation: () => Promise<void>;
}

export default function VoiceChatLayout({
  appError,
  notification,
  isChatVisible,
  tavusVideoTrack,
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
  handleStartListening,
  handleStopListening,
  handleSendTextMessage,
  dispatch,
  onTavusVideoLoaded,
  handleStartConversation,
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
        {/* Panel del chat - 1/3 del espacio a la izquierda en desktop, full width en mobile */}
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

        {/* Contenedor principal del video - 2/3 del espacio a la derecha en desktop, ajustado en mobile */}
        <div className={cn(
          "relative flex flex-col transition-all duration-300 ease-in-out bg-gray-900",
          // En desktop: 2/3 cuando chat visible, full cuando no
          isChatVisible 
            ? "flex-1 md:w-3/5 lg:w-2/3 xl:w-2/3" 
            : "w-full",
          // En mobile: full width siempre
          "w-full md:w-auto",
          // Asegurar min-width para evitar colapso excesivo
          "min-w-0"
        )}>
          {/* Contenedor del video con altura optimizada */}
          <div className="flex-1 flex items-center justify-center relative p-2 md:p-4 min-h-0">
            <div className={cn(
              "relative w-full h-full rounded-lg overflow-hidden bg-gradient-to-br from-neutral-900 to-neutral-800 flex items-center justify-center",
              "max-h-full",
              // Asegurar que el contenido sea visible
              "min-h-[300px]"
            )}>
              {tavusVideoTrackPublication && discoveredTargetParticipant ? (
                <>
                  {/* Botón de toggle del chat - posición responsive */}
                  {conversationActive && (
                    <button
                      onClick={toggleChatVisibility}
                      className={cn(
                        "absolute z-30 p-2.5 bg-white/90 dark:bg-neutral-800/90 rounded-full shadow-lg hover:bg-white dark:hover:bg-neutral-700 transition-all duration-300 ease-in-out backdrop-blur-sm border border-neutral-200 dark:border-neutral-600",
                        // Posición responsive
                        "top-3 right-3 md:top-4 md:left-4"
                      )}
                      aria-label={isChatVisible ? "Ocultar chat" : "Mostrar chat"}
                      title={isChatVisible ? "Ocultar chat de texto" : "Mostrar chat de texto"}
                    >
                      {isChatVisible ? (
                        <ChevronsLeft className="h-4 w-4 md:h-5 md:w-5 text-neutral-700 dark:text-neutral-200" />
                      ) : (
                        <ChevronsRight className="h-4 w-4 md:h-5 md:w-5 text-neutral-700 dark:text-neutral-200" />
                      )}
                    </button>
                  )}
                  
                  {/* Video track optimizado */}
                  <div className="w-full h-full">
                    <VideoTrack
                      trackRef={{
                        participant: discoveredTargetParticipant,
                        publication: tavusVideoTrackPublication,
                        source: tavusVideoTrackPublication.source,
                      }}
                      className="w-full h-full object-cover rounded-lg"
                      style={{
                        objectFit: 'cover',
                        objectPosition: 'center top',
                      }}
                    />
                  </div>
                  
                  {/* Botón de Iniciar Conversación - aparece cuando el avatar está listo pero la conversación no está activa */}
                  {!conversationActive && isReadyToStart && authStatus === 'authenticated' && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm">
                      <motion.button
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        onClick={handleStartConversation}
                        className="bg-primary-600 hover:bg-primary-700 text-white px-8 py-4 rounded-xl text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-primary-500/50"
                      >
                        Iniciar Conversación con María
                      </motion.button>
                    </div>
                  )}
                </>
              ) : connectionState === LiveKitConnectionState.Connected ? (
                <DynamicVideoPanel
                  isChatVisible={isChatVisible}
                  tavusTrackInfo={tavusVideoTrack}
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
                  onVideoLoaded={onTavusVideoLoaded}
                  handleStartConversation={handleStartConversation}
                  isReadyToStart={isReadyToStart}
                  authStatus={authStatus}
                />
              ) : (
                <VideoPanelSkeleton 
                  isChatVisible={isChatVisible}
                  handleStartConversation={handleStartConversation}
                  isReadyToStart={isReadyToStart}
                  authStatus={authStatus}
                  conversationActive={conversationActive}
                />
              )}
            </div>
          </div>

          {/* Controles e indicadores en la parte inferior - posición responsive */}
          <div className="absolute bottom-4 md:bottom-6 left-1/2 transform -translate-x-1/2 flex flex-col items-center space-y-2 md:space-y-3 z-20 px-4">
            {isPushToTalkActive && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="bg-blue-600 text-white px-4 md:px-6 py-2 md:py-3 rounded-full shadow-lg text-xs md:text-sm font-semibold border border-blue-500"
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
      </div>
    </div>
  );
} 