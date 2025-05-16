'use client';

import React, { useEffect, useRef, useCallback, FormEvent, useReducer, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Room, 
    RoomEvent, 
    RemoteParticipant, 
    RemoteTrackPublication, 
    RemoteTrack, 
    LocalParticipant, 
    Participant, 
    Track,
    DataPacket_Kind,
    ConnectionState as LiveKitConnectionState,
    DataPublishOptions
} from 'livekit-client';
import { Send, AlertCircle, Mic, ChevronsLeft, ChevronsRight, MessageSquare, Loader2, Terminal, Calendar, Clock } from 'lucide-react';
import dynamic from 'next/dynamic';
import ChatInput from '../ChatInput';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import type { UserProfile as BaseUserProfile } from '@/types/profile';
// import type { ChatSession } from '@prisma/client'; // No se usa directamente
import { Button } from '@/components/ui/button';
import { useLiveKitConnectionManager } from '@/hooks/voicechat/useLiveKitConnectionManager';
import { useSessionTimeout } from '@/hooks/useSessionTimeout';
import { usePushToTalk } from '@/hooks/usePushToTalk';
import { useError } from '@/contexts/ErrorContext';
import { useNotifications } from '@/hooks/useNotifications';
import NotificationDisplay from '../NotificationDisplay';
import ErrorDisplay from './ErrorDisplay';
import VideoPanelSkeleton from './VideoPanelSkeleton';
import type { Message } from "@/types/message";
import ChatToggle from './ChatToggle';
import StartConversationOverlay from './StartConversationOverlay';
import { useLiveKitTrackManagement, ActiveTrackInfo } from '@/hooks/voicechat/useLiveKitTrackManagement';
import RemoteTrackPlayer from './RemoteTrackPlayer';
import { useLiveKitDataChannelEvents } from '@/hooks/voicechat/useLiveKitDataChannelEvents';
import { useSpeechToTextControls } from '@/hooks/voicechat/useSpeechToTextControls';
import { useConversationSessionManager } from '@/hooks/voicechat/useConversationSessionManager';
import { voiceChatReducer, initialState, ExtendedUserProfile } from '@/reducers/voiceChatReducer';
import { useQuery } from '@tanstack/react-query';

const HISTORY_LENGTH = 12;
const AGENT_IDENTITY = "Maria-TTS-Bot";
const API_PROFILE_URL = '/api/profile';

const DynamicChatPanel = dynamic(() => import('../ChatPanel'), { 
  ssr: false, 
  loading: () => (
    <div className="flex-1 flex items-center justify-center bg-gray-850 h-full border-l border-gray-700">
      <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
    </div>
  )
});

// Carga dinámica para VideoPanel
const DynamicVideoPanel = dynamic(() => import('./VideoPanel'), {
  ssr: false,
  loading: () => <VideoPanelSkeleton />,
});

function VoiceChatContainer() {
  const { data: session, status: authStatus } = useSession();
  const { error: appError, setError: setAppError, clearError } = useError();
  const { notification, showNotification } = useNotifications();

  const [state, dispatch] = useReducer(voiceChatReducer, initialState);
  const dataReceivedHandlerRef = useRef<((...args: any[]) => void) | null>(null);
  const {
    isListening,
    isProcessing,
    isSpeaking,
    currentSpeakingId,
    textInput,
    messages,
    greetingMessageId,
    isReadyToStart,
    conversationActive,
    isPushToTalkActive,
    isChatVisible,
    sessionStartTime,
    isFirstInteraction,
    isSessionClosed,
    isThinking,
    activeSessionId,
    initialContext,
    userProfile,
    isTimeRunningOutState,
    currentSessionTitle,
  } = state;

  const roomRef = useRef<Room | null>(null);
  const audioStreamRef = useRef<MediaStream | null>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const textAreaRef = useRef<HTMLTextAreaElement>(null);
  const thinkingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const processingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const toggleChatVisibility = useCallback(() => {
    dispatch({ type: 'TOGGLE_CHAT_VISIBILITY' });
  }, []);

  const {
    activeTracks,
    handleTrackSubscribed,
    handleTrackUnsubscribed,
    handleParticipantDisconnected,
  } = useLiveKitTrackManagement({
    roomRef
  });

  const tavusVideoTrack = activeTracks.find(t => t.isAgent && t.kind === Track.Kind.Video && t.source === Track.Source.Camera);
  const audioTracks = activeTracks
    .filter(t => t.kind === Track.Kind.Audio && t.publication && t.publication.track)
    .map(t => t.publication.track!); // Ahora audioTracks es Track[]

  const onConnectedCallback = useCallback((connectedRoom: Room) => {
    roomRef.current = connectedRoom;
    setAppError('livekit', null);
    showNotification("Conectado a la sala de voz", "success");
    if (state.conversationActive && roomRef.current?.localParticipant) {
      roomRef.current.localParticipant.setMicrophoneEnabled(true);
      dispatch({ type: 'SET_LISTENING', payload: true });
    }
  }, [setAppError, showNotification, state.conversationActive]);

  const onDisconnectedCallback = useCallback(() => {
    roomRef.current = null;
    showNotification("Desconectado de la sala de voz", "warning");
  }, [showNotification]);

  const onConnectionErrorCallback = useCallback((err: Error) => {
    setAppError('livekit', `Error de LiveKit: ${err.message}`);
  }, [setAppError]);

  const onDataReceivedLiveKitCallback = useCallback((...args: any[]) => {
    if (dataReceivedHandlerRef.current) {
      dataReceivedHandlerRef.current(...args);
    }
  }, []);

  const {
    room,
    connectionState,
    disconnectFromLiveKit,
  } = useLiveKitConnectionManager({
    initialContext: state.initialContext,
    activeSessionId: state.activeSessionId,
    userProfile: state.userProfile,
    onConnected: onConnectedCallback,
    onDisconnected: onDisconnectedCallback,
    onConnectionError: onConnectionErrorCallback,
    handleTrackSubscribed,
    handleTrackUnsubscribed,
    handleParticipantDisconnected,
    onDataReceived: onDataReceivedLiveKitCallback,
  });

  // Props memoizadas para useConversationSessionManager
  const conversationManagerProps = useMemo(() => ({
    session,
    authStatus,
    conversationActive: state.conversationActive,
    isReadyToStart: state.isReadyToStart,
    messages: state.messages,
    activeSessionId: state.activeSessionId,
    isSessionClosed: state.isSessionClosed,
    roomRef, // ref es estable
    audioStreamRef, // ref es estable
    disconnectFromLiveKit, // Asumiendo estable desde useLiveKitConnectionManager
    setAppError, // Asumiendo estable desde useError
    showNotification, // Asumiendo estable desde useNotifications
    dispatch, // dispatch es estable y se pasa como prop
  }), [
    session, authStatus, 
    state.conversationActive, state.isReadyToStart, state.messages, 
    state.activeSessionId, state.isSessionClosed,
    disconnectFromLiveKit, setAppError, showNotification 
    // dispatch no es necesario aquí porque es estable
  ]);

  const {
    handleStartConversation,
    endSession
  } = useConversationSessionManager(conversationManagerProps);

  // Props memoizadas para useLiveKitDataChannelEvents
  // endSession es devuelta por useConversationSessionManager, por lo que debe ser una dependencia para dataChannelEventsProps
  const memoizedEndSession = useCallback(endSession, [endSession]);

  const dataChannelEventsProps = useMemo(() => ({
    dispatch, // dispatch es estable y se pasa como prop
    conversationActive: state.conversationActive,
    greetingMessageId: state.greetingMessageId,
    currentSpeakingId: state.currentSpeakingId,
    endSession: memoizedEndSession, // Usar la versión memoizada
    isProcessing: state.isProcessing,
    isListening: state.isListening,
    isSpeaking: state.isSpeaking,
    isSessionClosed: state.isSessionClosed,
    activeSessionId: state.activeSessionId,
    roomRef, // ref es estable
  }), [
    state.conversationActive, state.greetingMessageId, state.currentSpeakingId,
    memoizedEndSession, state.isProcessing, state.isListening, state.isSpeaking,
    state.isSessionClosed, state.activeSessionId
    // dispatch no es necesario aquí porque es estable
    // roomRef no necesita estar aquí si es estable
  ]);

  const { handleDataReceived, handleSendTextMessage } = useLiveKitDataChannelEvents(dataChannelEventsProps);

  useEffect(() => {
    dataReceivedHandlerRef.current = handleDataReceived;
  }, [handleDataReceived]);

  useEffect(() => {
    if (room !== roomRef.current) {
        roomRef.current = room;
    }
  }, [room]);

  // Callback memoizado para useSpeechToTextControls
  const setIsListeningCallback = useCallback(
    (value: boolean) => dispatch({ type: 'SET_LISTENING', payload: value }),
    []
  );

  // Props memoizadas para useSpeechToTextControls
  const speechToTextControlsProps = useMemo(() => ({
    isListening: state.isListening,
    isProcessing: state.isProcessing,
    isSpeaking: state.isSpeaking,
    isSessionClosed: state.isSessionClosed,
    conversationActive: state.conversationActive,
    roomRef, // ref es estable
    setIsListening: setIsListeningCallback,
  }), [
    state.isListening, state.isProcessing, state.isSpeaking, 
    state.isSessionClosed, state.conversationActive, 
    setIsListeningCallback,
    // roomRef no necesita estar aquí si es estable
  ]);

  const {
    handleStartListening,
    handleStopListening
  } = useSpeechToTextControls(speechToTextControlsProps);

  const setPushToTalkActiveCallback = useCallback(
    (value: boolean) => dispatch({ type: 'SET_PUSH_TO_TALK_ACTIVE', payload: value }),
    []
  );

  usePushToTalk({
    isListening: state.isListening,
    isProcessing: state.isProcessing,
    isSpeaking: state.isSpeaking,
    isThinking: state.isThinking,
    conversationActive: state.conversationActive,
    isSessionClosed: state.isSessionClosed,
    onStartListening: handleStartListening,
    onStopListening: handleStopListening,
    setIsPushToTalkActive: setPushToTalkActiveCallback,
  });

  const handleSessionTimeout = useCallback(() => {
    endSession(false);
    showNotification("La sesión ha finalizado debido a inactividad.", "warning", 5000);
    dispatch({ type: 'SET_TIME_RUNNING_OUT', payload: false });
  }, [endSession, showNotification]);

  const handleSessionWarning = useCallback(() => {
    showNotification("La sesión finalizará pronto debido a inactividad.", "warning", 5000);
    dispatch({ type: 'SET_TIME_RUNNING_OUT', payload: true });
  }, [showNotification]);

  const { isTimeRunningOut } = useSessionTimeout({
    conversationActive: state.conversationActive,
    sessionStartTime: state.sessionStartTime,
    isSessionClosed: state.isSessionClosed,
    onTimeout: handleSessionTimeout,
    onWarning: handleSessionWarning,
  });

  useEffect(() => {
    if (state.isTimeRunningOutState !== isTimeRunningOut) {
      dispatch({ type: 'SET_TIME_RUNNING_OUT', payload: isTimeRunningOut });
    }
  }, [isTimeRunningOut, state.isTimeRunningOutState]);

  // Carga del perfil del usuario con TanStack Query
  const { 
    data: fetchedUserProfile, 
    isLoading: isLoadingProfile, 
    error: profileError, 
    refetch: refetchProfile 
  } = useQuery<ExtendedUserProfile, Error>({
    queryKey: ['userProfileForChat', session?.user?.id], // Clave de query única para este contexto
    queryFn: async () => {
      if (!session?.user?.id) throw new Error('Usuario no autenticado para cargar perfil en chat.');
      // La API route es /api/profile, no necesita el ID en la URL según el código de route.ts
      const response = await fetch(API_PROFILE_URL); 
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: `Error del servidor: ${response.status}` }));
        throw new Error(errorData.message || `Error del servidor al cargar el perfil: ${response.status} ${response.statusText}`);
      }
      return response.json();
    },
    enabled: authStatus === 'authenticated' && !!session?.user?.id, // Solo ejecutar si está autenticado y hay ID de usuario
    staleTime: 1000 * 60 * 15, // Ejemplo: Perfil puede ser stale después de 15 minutos
  });

  // Efecto para actualizar el estado del reducer cuando el perfil se carga o cambia
  useEffect(() => {
    if (authStatus === 'authenticated' && fetchedUserProfile) {
      dispatch({ type: 'SET_USER_PROFILE', payload: fetchedUserProfile });
      
      if (fetchedUserProfile.tavus_api_key && fetchedUserProfile.elevenlabs_api_key && fetchedUserProfile.elevenlabs_voice_id) {
        dispatch({ type: 'SET_READY_TO_START', payload: true });
      } else {
        setAppError('permissions', "Faltan configuraciones de API en tu perfil para iniciar una conversación de voz.");
        dispatch({ type: 'SET_READY_TO_START', payload: false });
      }
      const initialContextData = fetchedUserProfile.initial_context || "";
      dispatch({ type: 'SET_INITIAL_CONTEXT', payload: initialContextData });

    } else if (authStatus === 'authenticated' && profileError) {
      console.error("Error fetching user profile with useQuery:", profileError);
      const errorMessage = profileError.message || "Ocurrió un error desconocido al cargar el perfil.";
      setAppError('api', `Error al cargar perfil: ${errorMessage}`);
      dispatch({ type: 'SET_READY_TO_START', payload: false });
    }
  }, [authStatus, fetchedUserProfile, profileError, setAppError, dispatch, session]);

  const handleKeyPress = useCallback((event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      if (state.textInput.trim() && state.conversationActive && !state.isProcessing && !state.isSpeaking && !state.isListening && !state.isThinking) {
        handleSendTextMessage(state.textInput.trim());
      }
    }
  }, [state.textInput, state.conversationActive, state.isProcessing, state.isSpeaking, state.isListening, state.isThinking, handleSendTextMessage]); // Asegurar que las dependencias sean del estado del reducer
  
  const scrollToBottom = useCallback(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  useEffect(() => {
    const container = chatContainerRef.current;
    let observer: MutationObserver | null = null;

    if (container) {
      const MutationObserverConstructor = window.MutationObserver || (window as any).WebKitMutationObserver;
      if (MutationObserverConstructor) {
        observer = new MutationObserverConstructor((mutations) => {
          mutations.forEach((mutation) => {
            if (mutation.type === 'childList') {
              scrollToBottom();
            }
          });
        });
        observer.observe(container, { childList: true });
      }
    }

    return () => {
      if (observer) {
        observer.disconnect();
      }
    };
  }, [scrollToBottom]);

  useEffect(() => {
    if (textAreaRef.current) {
      textAreaRef.current.style.height = 'auto';
      textAreaRef.current.style.height = `${textAreaRef.current.scrollHeight}px`;
    }
  }, [textInput]);

  useEffect(() => {
    return () => {
      clearError();
    };
  }, [clearError]);

  // Efecto dedicado para limpiar timeouts al desmontar
  useEffect(() => {
    return () => {
      if (thinkingTimeoutRef.current) {
        clearTimeout(thinkingTimeoutRef.current);
      }
      if (processingTimeoutRef.current) {
        clearTimeout(processingTimeoutRef.current);
      }
    };
  }, []);

  const isLoading = authStatus === 'loading' || (!state.userProfile && session?.user?.id);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-gray-900 text-white">
        <Loader2 className="animate-spin h-12 w-12 text-blue-500" />
        <p className="mt-4 text-lg">Cargando perfil y configuración...</p>
      </div>
    );
  }

  if (!session?.user?.id) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-gray-900 text-white">
        <AlertCircle className="h-16 w-16 text-red-500" />
        <h1 className="mt-6 text-3xl font-semibold">Acceso Denegado</h1>
        <p className="mt-2 text-lg text-center">Debes iniciar sesión para acceder a esta función.</p>
        <Link href="/login" legacyBehavior>
          <a className="mt-6 px-6 py-2 bg-blue-600 hover:bg-blue-700 rounded-md text-lg font-medium transition-colors">
            Iniciar Sesión
          </a>
        </Link>
      </div>
    );
  }

  if (appError?.type === 'profile' || appError?.type === 'permissions') {
    return <ErrorDisplay error={appError} onClose={clearError} />;
  }

  const hasRequiredApiKeys =
    state.userProfile?.tavus_api_key &&
    state.userProfile?.openai_api_key &&
    state.userProfile?.elevenlabs_api_key &&
    state.userProfile?.elevenlabs_voice_id;

  if (!hasRequiredApiKeys && !state.conversationActive) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-gray-900 text-white p-4">
        <AlertCircle className="h-16 w-16 text-yellow-500" />
        <h1 className="mt-6 text-2xl md:text-3xl font-semibold text-center">Configuración Incompleta</h1>
        <p className="mt-2 text-md md:text-lg text-center text-gray-300">
          Faltan una o más claves API necesarias para iniciar la conversación.
        </p>
        <p className="mt-1 text-sm text-gray-400 text-center">
          (Tavus API Key, OpenAI API Key, ElevenLabs API Key, ElevenLabs Voice ID)
        </p>
        <Link href="/profile" legacyBehavior>
          <a className="mt-6 px-6 py-2 bg-indigo-600 hover:bg-indigo-700 rounded-md text-lg font-medium transition-colors">
            Ir a Mi Perfil para Configurar
          </a>
        </Link>
      </div>
    );
  }

  if (!isReadyToStart && !state.conversationActive && authStatus === 'authenticated' && !isLoadingProfile) {
    // Este bloque se activa si, después de cargar el perfil, isReadyToStart es false.
    // Esto ya incluye el caso de !hasRequiredApiKeys porque el useEffect que usa fetchedUserProfile actualiza isReadyToStart.
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-gray-900 text-white p-4">
        <AlertCircle className="h-16 w-16 text-yellow-500" />
        <h1 className="mt-6 text-2xl md:text-3xl font-semibold text-center">Configuración Incompleta</h1>
        <p className="mt-2 text-md md:text-lg text-center text-gray-300">
          {appError?.message || "Faltan una o más claves API necesarias o hay un problema con tu perfil."}
        </p>
        <p className="mt-1 text-sm text-gray-400 text-center">
          (Revisa Tavus API Key, OpenAI API Key, ElevenLabs API Key, ElevenLabs Voice ID)
        </p>
        <Button onClick={() => refetchProfile()} className="mt-4" variant="outline">
          Reintentar Cargar Perfil
        </Button>
        <Link href="/settings/profile" legacyBehavior>
          <a className="mt-6 px-6 py-2 bg-indigo-600 hover:bg-indigo-700 rounded-md text-lg font-medium transition-colors">
            Ir a Mi Perfil para Configurar
          </a>
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-gray-900 text-white relative overflow-hidden">
      <AnimatePresence>
        {notification && (
          <NotificationDisplay notification={notification} />
        )}
      </AnimatePresence>

      <div className="flex flex-1 min-h-0 relative">
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
        />

        <AnimatePresence>
          {isChatVisible && (
            <motion.div
              ref={chatContainerRef}
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="w-full md:w-1/3 bg-gray-850 flex flex-col h-full border-l border-gray-700 shadow-lg"
            >
              <DynamicChatPanel
                messages={messages}
                isProcessing={isProcessing}
                isThinking={isThinking}
                isSpeaking={isSpeaking}
                currentSpeakingId={currentSpeakingId}
                greetingMessageId={greetingMessageId}
                chatContainerRef={chatContainerRef}
                chatEndRef={chatEndRef}
                activeSessionId={activeSessionId}
                currentSessionTitle={currentSessionTitle}
                userProfile={userProfile as ExtendedUserProfile}
                initialContext={initialContext}
                totalPreviousSessions={userProfile?.sessions?.length}
                sessionUserImage={session?.user?.image}
                authStatus={authStatus}
              />
              <ChatInput
                textInput={textInput}
                setTextInput={(value) => dispatch({ type: 'SET_TEXT_INPUT', payload: value })}
                handleSendTextMessage={handleSendTextMessage}
                isListening={isListening}
                isProcessing={isProcessing}
                isSpeaking={isSpeaking}
                isSessionClosed={isSessionClosed}
                conversationActive={conversationActive}
                handleStartListening={handleStartListening}
                handleStopListening={handleStopListening}
                textAreaRef={textAreaRef}
                isPushToTalkActive={isPushToTalkActive}
                isThinking={isThinking}
              />
            </motion.div>
          )}
        </AnimatePresence>

        <ChatToggle
          isChatVisible={isChatVisible}
          toggleChatVisibility={toggleChatVisibility}
          conversationActive={conversationActive}
        />
      </div>

      {!conversationActive && !isSessionClosed && (
         <StartConversationOverlay
            handleStartConversation={handleStartConversation}
            isReadyToStart={isReadyToStart}
            authStatus={authStatus}
            userProfile={userProfile}
            sessionUserName={session?.user?.name}
            isSessionClosed={isSessionClosed}
            connectionState={connectionState}
         />
      )}

      {audioTracks.map(track => (
        <RemoteTrackPlayer 
          key={track.sid} // Usar track.sid ya que ahora track es un objeto Track
          track={track}   // Pasar el objeto Track directamente
          autoPlay 
        />
      ))}
    </div>
  );
}

export default VoiceChatContainer; 