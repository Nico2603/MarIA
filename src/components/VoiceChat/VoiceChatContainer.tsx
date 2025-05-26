'use client';

import React, { useEffect, useRef, useCallback, useReducer, useMemo, useState } from 'react';
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
import { Send, AlertCircle, Mic, ChevronsLeft, ChevronsRight, MessageSquare, Loader2, Terminal, Clock, Calendar } from 'lucide-react';
import dynamic from 'next/dynamic';
import ChatInput from '../ChatInput';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
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
import { voiceChatReducer, initialState } from '@/reducers/voiceChatReducer';
import { VideoTrack } from '@livekit/components-react';
import VoiceChatLayout from './VoiceChatLayout';
import { useParticipantDiscovery } from '@/hooks/voicechat/useParticipantDiscovery';
import { useReadyToStart } from '@/hooks/voicechat/useReadyToStart';

const HISTORY_LENGTH = 12;
const AGENT_IDENTITY = "Maria-TTS-Bot";

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

function VoiceChatContainer() {
  console.log('[VoiceChatContainer] Component rendering started.');
  const { data: session, status: authStatus } = useSession();
  const { error: appError, setError: setAppError, clearError } = useError();
  const { notification, showNotification } = useNotifications();

  const [state, dispatch] = useReducer(voiceChatReducer, initialState);
  const [discoveredTargetParticipant, setDiscoveredTargetParticipant] = useState<RemoteParticipant | null>(null);
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
    .map(t => t.publication.track!);

  const handleStartListening = useCallback(() => {
    if (!isSessionClosed && conversationActive && roomRef.current?.localParticipant && !isListening && !isSpeaking && !isProcessing) {
      console.log('[VoiceChatContainer] Iniciando escucha STT');
      dispatch({ type: 'SET_LISTENING', payload: true });
    }
  }, [isSessionClosed, conversationActive, isListening, isSpeaking, isProcessing, roomRef]);

  const handleStopListening = useCallback(() => {
    if (isListening) {
      console.log('[VoiceChatContainer] Deteniendo escucha STT');
      dispatch({ type: 'SET_LISTENING', payload: false });
    }
  }, [isListening]);

  const onConnectedCallback = useCallback((connectedRoom: Room) => {
    roomRef.current = connectedRoom;
    clearError();
    showNotification("Conectado a la sala de voz", "success");
    if (state.conversationActive && roomRef.current?.localParticipant) {
      roomRef.current.localParticipant.setMicrophoneEnabled(true);
      dispatch({ type: 'SET_LISTENING', payload: true });
    }
  }, [clearError, showNotification, state.conversationActive, dispatch]);

  const onDisconnectedCallback = useCallback(() => {
    roomRef.current = null;
    showNotification("Desconectado de la sala de voz", "warning");
    dispatch({ type: 'RESET_CONVERSATION_STATE' });
  }, [showNotification, dispatch]);

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
    userProfile: userProfile,
    initialContext: initialContext,
    activeSessionId: activeSessionId,
    onConnected: onConnectedCallback,
    onDisconnected: onDisconnectedCallback,
    onConnectionError: onConnectionErrorCallback,
    handleTrackSubscribed,
    handleTrackUnsubscribed,
    handleParticipantDisconnected,
    onDataReceived: onDataReceivedLiveKitCallback,
  });

  useEffect(() => {
    if (!room) {
      setDiscoveredTargetParticipant(null);
      return;
    }

    let foundInteractiveAgent: RemoteParticipant | null = null;
    // AGENT_IDENTITY es "Maria-TTS-Bot". Buscamos otro agente remoto 
    // que no sea el usuario local y que no sea Maria-TTS-Bot.
    // Este debería ser el agente interactivo (ej. Tavus).
    for (const p of Array.from(room.remoteParticipants.values())) {
      // Asegurarse de que no es el bot de solo TTS y que tiene una identidad
      if (p.identity && p.identity !== AGENT_IDENTITY) { 
        console.log(`[VoiceChatContainer] Participant Discovery: Found potential interactive agent: ${p.identity}`);
        foundInteractiveAgent = p;
        break;
      }
    }

    if (foundInteractiveAgent) {
      setDiscoveredTargetParticipant(foundInteractiveAgent);
    } else {
      setDiscoveredTargetParticipant(null);
      console.log("[VoiceChatContainer] Participant Discovery: No interactive agent found initially. Listening for new connections...");
      const handleNewParticipantConnected = (participant: RemoteParticipant) => {
        if (participant.identity && participant.identity !== AGENT_IDENTITY) {
          console.log(`[VoiceChatContainer] Participant Discovery: New interactive agent connected: ${participant.identity}`);
          setDiscoveredTargetParticipant(participant);
          room.off(RoomEvent.ParticipantConnected, handleNewParticipantConnected);
        }
      };
      room.on(RoomEvent.ParticipantConnected, handleNewParticipantConnected);
      return () => {
        room.off(RoomEvent.ParticipantConnected, handleNewParticipantConnected);
      };
    }
  }, [room, dispatch]);

  useEffect(() => {
    if (discoveredTargetParticipant) {
      console.log(`VoiceChatContainer: Discovered target participant ${discoveredTargetParticipant.identity} is available.`);
    } else if (room && room.remoteParticipants.size > 0 && Array.from(room.remoteParticipants.values()).every(p => p.identity === AGENT_IDENTITY)) {
      console.log(`VoiceChatContainer: Only agent participant(s) found. Still waiting for target participant.`);
    } else if (room) {
      console.log(`VoiceChatContainer: Waiting for target participant to be auto-discovered (room is present).`);
    }
  }, [discoveredTargetParticipant, room]);

  const conversationManagerProps = useMemo(() => ({
    session,
    authStatus,
    conversationActive: state.conversationActive,
    isReadyToStart: state.isReadyToStart,
    messages: state.messages,
    activeSessionId: state.activeSessionId,
    isSessionClosed: state.isSessionClosed,
    roomRef,
    audioStreamRef,
    disconnectFromLiveKit,
    setAppError,
    showNotification,
    dispatch,
  }), [
    session, authStatus, 
    state.conversationActive, state.isReadyToStart, state.messages, 
    state.activeSessionId, state.isSessionClosed,
    disconnectFromLiveKit, setAppError, showNotification, dispatch
  ]);

  const {
    handleStartConversation,
    endSession
  } = useConversationSessionManager(conversationManagerProps);

  const memoizedEndSession = useCallback(endSession, [endSession]);

  const dataChannelEventsProps = useMemo(() => ({
    dispatch,
    conversationActive: state.conversationActive,
    greetingMessageId: state.greetingMessageId,
    currentSpeakingId: state.currentSpeakingId,
    endSession: memoizedEndSession,
    isProcessing: state.isProcessing,
    isListening: state.isListening,
    isSpeaking: state.isSpeaking,
    isSessionClosed: state.isSessionClosed,
    activeSessionId: state.activeSessionId,
    room: room,
    roomRef: roomRef,
    isReadyToStart: state.isReadyToStart,
  }), [
    dispatch,
    state.conversationActive, state.greetingMessageId, state.currentSpeakingId,
    memoizedEndSession, state.isProcessing, state.isListening, state.isSpeaking,
    state.isSessionClosed, state.activeSessionId, room, roomRef,
    state.isReadyToStart,
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

  const setIsListeningCallback = useCallback(
    (value: boolean) => dispatch({ type: 'SET_LISTENING', payload: value }),
    []
  );

  const speechToTextControlsProps = useMemo(() => ({
    isListening: state.isListening,
    isProcessing: state.isProcessing,
    isSpeaking: state.isSpeaking,
    isSessionClosed: state.isSessionClosed,
    conversationActive: state.conversationActive,
    roomRef,
    setIsListening: setIsListeningCallback,
  }), [
    state.isListening, state.isProcessing, state.isSpeaking, 
    state.isSessionClosed, state.conversationActive, 
    setIsListeningCallback,
  ]);

  const {
    handleStartListening: sttHandleStartListening,
    handleStopListening: sttHandleStopListening
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

  useEffect(() => {
    console.log('[UserProfileEffect] authStatus:', authStatus, 'Session:', session);
    if (authStatus === 'authenticated' && session?.user) {
      console.log('[UserProfileEffect] Setting user profile:', session.user);
      dispatch({ 
        type: 'SET_USER_PROFILE', 
        payload: { 
          id: session.user.id || undefined,
          email: session.user.email || null,
          username: session.user.name || null,
        } 
      });
    } else if (authStatus === 'unauthenticated') {
      console.log('[UserProfileEffect] Setting user profile to null (unauthenticated).');
      dispatch({ type: 'SET_USER_PROFILE', payload: null });
    } else {
      console.log('[UserProfileEffect] Conditions not met to set user profile.');
    }
  }, [authStatus, session, dispatch]);

  const calculatedIsReadyToStart = useReadyToStart({
    authStatus,
    connectionState,
    discoveredParticipant: discoveredTargetParticipant,
    greetingMessageId: state.greetingMessageId,
    currentSpeakingId: state.currentSpeakingId,
    isSpeaking: state.isSpeaking,
    conversationActive: state.conversationActive,
  });

  useEffect(() => {
    if (state.isReadyToStart !== calculatedIsReadyToStart) {
        dispatch({ type: 'SET_READY_TO_START', payload: calculatedIsReadyToStart });
        if (calculatedIsReadyToStart && state.greetingMessageId && !state.currentSpeakingId && !state.isSpeaking) {
            // Opcional: Mover la notificación aquí si se quiere solo cuando greeting ha sonado Y está listo
            // showNotification("María está lista para conversar.", "success");
        }
    }
  }, [calculatedIsReadyToStart, dispatch, state.isReadyToStart, state.greetingMessageId, state.currentSpeakingId, state.isSpeaking, showNotification]);

  const handleKeyPress = useCallback((event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      if (state.textInput.trim() && state.conversationActive && !state.isProcessing && !state.isSpeaking && !state.isListening && !state.isThinking) {
        handleSendTextMessage(state.textInput.trim());
      }
    }
  }, [state.textInput, state.conversationActive, state.isProcessing, state.isSpeaking, state.isListening, state.isThinking, handleSendTextMessage]);
  
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
    console.log('[VoiceChatContainer] Initializing basic listeners and cleanup.');
    return () => {
      console.log('[VoiceChatContainer] Cleaning up basic listeners.');
      clearError(); // Ensure errors are cleared on unmount
      // Clear any timeouts that might have been set
      if (thinkingTimeoutRef.current) {
        clearTimeout(thinkingTimeoutRef.current);
      }
      if (processingTimeoutRef.current) {
        clearTimeout(processingTimeoutRef.current);
      }
    };
  }, [clearError]);

  const isLoading = authStatus === 'loading' || (!state.userProfile && session?.user?.id);

  if (isLoading) {
    console.log('[VoiceChatContainer] Early return: isLoading is true.');
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-gray-900 text-white">
        <Loader2 className="animate-spin h-12 w-12 text-blue-500" />
        <p className="mt-4 text-lg">Cargando perfil y configuración...</p>
      </div>
    );
  }

  if (!session?.user?.id) {
    console.log('[VoiceChatContainer] Early return: User not authenticated.');
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

  if (appError.type && appError.type !== 'permissions' && appError.type !== 'profile') {
    console.error(
      '[VoiceChatContainer] Early return: Application error occurred.',
      `Type: ${appError.type}, Message: ${appError.message}`,
      appError 
    );
    return <ErrorDisplay error={appError} onClose={clearError} />;
  }

  if (authStatus === 'authenticated' && 
      connectionState === LiveKitConnectionState.Connecting && 
      !state.conversationActive) {
    console.log('[VoiceChatContainer] Early return: Connecting to LiveKit room.');
    return (
        <div className="flex flex-col items-center justify-center h-screen bg-gray-900 text-white p-4">
          <Loader2 className="h-16 w-16 animate-spin text-blue-400" />
          <h1 className="mt-6 text-2xl md:text-3xl font-semibold text-center">
            Conectando a la sala de voz...
          </h1>
        </div>
      );
  }

  if (!state.conversationActive && state.userProfile) {
    console.log('[VoiceChatContainer] Displaying StartConversationOverlay because conversation is not active and user profile exists.');
    return (
      <StartConversationOverlay
        authStatus={authStatus}
        userName={state.userProfile?.username}
        isReadyToStart={state.isReadyToStart}
        handleStartConversation={() => {
          console.log('[VoiceChatContainer] StartConversationOverlay: handleStartConversation triggered.');
          handleStartConversation();
        }}
        isSessionClosed={state.isSessionClosed}
        connectionState={connectionState}
      />
    );
  }

  console.log(
    '⚙️ [VoiceChatContainer] Estados antes de renderizar VoiceChatLayout:',
    'isReadyToStart=', state.isReadyToStart,
    'conversationActive=', state.conversationActive,
    'isChatVisible=', state.isChatVisible,
    'isSessionClosed=', state.isSessionClosed,
    'authStatus=', authStatus,
    'connectionState=', connectionState,
    'discoveredTargetParticipant=', discoveredTargetParticipant?.identity,
    'userProfile=', state.userProfile ? 'Exists' : 'null',
    'appError=', appError ? `${appError.type}: ${appError.message}` : 'null'
  );

  console.log('[VoiceChatContainer] Rendering main VoiceChatLayout.');
  return (
    <VoiceChatLayout
      appError={appError}
      notification={notification}
      isChatVisible={isChatVisible}
      tavusVideoTrackPublication={tavusVideoTrack?.publication as RemoteTrackPublication | undefined}
      discoveredTargetParticipant={discoveredTargetParticipant || undefined}
      connectionState={connectionState}
      isSpeaking={isSpeaking}
      isListening={isListening}
      isProcessing={isProcessing}
      isThinking={isThinking}
      isSessionClosed={isSessionClosed}
      conversationActive={conversationActive}
      isPushToTalkActive={isPushToTalkActive}
      isReadyToStart={state.isReadyToStart}
      authStatus={authStatus}
      userName={session?.user?.name || userProfile?.username}
      messages={messages}
      greetingMessageId={greetingMessageId}
      currentSpeakingId={currentSpeakingId}
      userProfile={userProfile}
      currentSessionTitle={currentSessionTitle}
      sessionStartTime={sessionStartTime}
      clearError={clearError}
      toggleChatVisibility={toggleChatVisibility}
      handleStartConversation={handleStartConversation}
      handleStartListening={sttHandleStartListening}
      handleStopListening={sttHandleStopListening}
      handleSendTextMessage={handleSendTextMessage}
      dispatch={dispatch}
    />
  );
}

export default VoiceChatContainer;