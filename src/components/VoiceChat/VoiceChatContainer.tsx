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
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { useLiveKitConnectionManager } from '@/hooks/voicechat/useLiveKitConnectionManager';
import { useSessionTimeout } from '@/hooks/useSessionTimeout';
import { usePushToTalk } from '@/hooks/usePushToTalk';
import { useError } from '@/contexts/ErrorContext';
import { useNotifications } from '@/utils/notifications';
import NotificationDisplay from '@/components/ui/NotificationDisplay';
import ErrorDisplay from '@/components/ui/ErrorDisplay';
import { VideoPanelSkeleton } from './VideoPanel';
import type { Message } from "@/types";
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
import { AGENT_IDENTITY, isValidAgent } from '@/lib/constants';

const DynamicChatPanel = dynamic(() => import('../ChatPanel'), { 
  ssr: false
});

const DynamicVideoPanel = dynamic(() => import('./VideoPanel'), {
  ssr: false
});

function VoiceChatContainer() {
  const { data: session, status: authStatus } = useSession();
  const { error: appError, setError: setAppError, clearError } = useError();
  const { notification, showNotification } = useNotifications();

  const [state, dispatch] = useReducer(voiceChatReducer, initialState);
  const [discoveredTargetParticipant, setDiscoveredTargetParticipant] = useState<RemoteParticipant | null>(null);
  const [initializationPhase, setInitializationPhase] = useState<'auth' | 'connecting' | 'ready' | 'complete'>('auth');
  const [tavusVideoLoaded, setTavusVideoLoaded] = useState(false);
  
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
  const thinkingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const processingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isInitialized = useRef(false);

  const toggleChatVisibility = useCallback(() => {
    dispatch({ type: 'TOGGLE_CHAT_VISIBILITY' });
  }, []);

  const handleTavusVideoLoaded = useCallback(() => {
    setTavusVideoLoaded(true);
  }, []);

  // Reset tavus video loaded state when participant changes - SIMPLIFICADO
  useEffect(() => {
    if (discoveredTargetParticipant?.identity === 'tavus-avatar-agent' && tavusVideoLoaded) {
      // Solo resetear si cambia a un participante diferente de Tavus
      return;
    }
    if (discoveredTargetParticipant?.identity !== 'tavus-avatar-agent' && tavusVideoLoaded) {
      setTavusVideoLoaded(false);
    }
  }, [discoveredTargetParticipant?.identity]);

  const {
    activeTracks,
    handleTrackSubscribed,
    handleTrackUnsubscribed,
    handleParticipantDisconnected,
  } = useLiveKitTrackManagement({
    roomRef
  });

  const tavusVideoTrack = useMemo(() => activeTracks.find(t => 
    t.kind === Track.Kind.Video && 
    t.identity === 'tavus-avatar-agent' && 
    t.source === Track.Source.Camera
  ), [activeTracks]);

  const audioTracks = useMemo(() => activeTracks
    .filter(t => t.kind === Track.Kind.Audio && t.publication && t.publication.track)
    .map(t => t.publication.track!), [activeTracks]);

  const handleStartListening = useCallback(() => {
    if (!state.isSessionClosed && 
        state.conversationActive && 
        roomRef.current?.localParticipant && 
        !state.isListening && 
        !state.isSpeaking && 
        !state.isProcessing) {
      dispatch({ type: 'SET_LISTENING', payload: true });
    }
  }, [state.isSessionClosed, state.conversationActive, state.isListening, state.isSpeaking, state.isProcessing]);

  const handleStopListening = useCallback(() => {
    if (state.isListening) {
      dispatch({ type: 'SET_LISTENING', payload: false });
    }
  }, [state.isListening]);

  const onConnectedCallback = useCallback((connectedRoom: Room) => {
    roomRef.current = connectedRoom;
    clearError();
    setInitializationPhase('ready');
    
    if (state.conversationActive && roomRef.current?.localParticipant) {
      roomRef.current.localParticipant.setMicrophoneEnabled(true);
      dispatch({ type: 'SET_LISTENING', payload: true });
    }
  }, [clearError, state.conversationActive]);

  const onDisconnectedCallback = useCallback(() => {
    roomRef.current = null;
    showNotification("Conexión perdida", "warning");
    dispatch({ type: 'RESET_CONVERSATION_STATE' });
    setInitializationPhase('auth');
  }, [showNotification]);

  const onConnectionErrorCallback = useCallback((err: Error) => {
    setAppError('livekit', `Error de conexión: ${err.message}`);
    setInitializationPhase('auth');
  }, [setAppError]);

  const onDataReceivedLiveKitCallback = useCallback((...args: any[]) => {
    if (dataReceivedHandlerRef.current) {
      dataReceivedHandlerRef.current(...args);
    }
  }, []);

  // Memoizar la configuración del hook para evitar re-creaciones
  const liveKitConnectionConfig = useMemo(() => ({
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
  }), [
    userProfile?.id,
    userProfile?.username,
    userProfile?.email,
    initialContext,
    activeSessionId,
    onConnectedCallback,
    onDisconnectedCallback,
    onConnectionErrorCallback,
    handleTrackSubscribed,
    handleTrackUnsubscribed,
    handleParticipantDisconnected,
    onDataReceivedLiveKitCallback,
  ]);

  const {
    room,
    connectionState,
    disconnectFromLiveKit,
  } = useLiveKitConnectionManager(liveKitConnectionConfig);

  // Optimized participant discovery - SIMPLIFICADO
  useEffect(() => {
    if (!room) {
      setDiscoveredTargetParticipant(null);
      return;
    }

    const allParticipants = Array.from(room.remoteParticipants.values());
    const validAgents = allParticipants.filter(p => p.identity && isValidAgent(p.identity));
    
    let foundInteractiveAgent: RemoteParticipant | null = null;
    
    // Priorizar tavus-avatar-agent si está disponible
    const tavusAgent = validAgents.find(p => p.identity === 'tavus-avatar-agent');
    if (tavusAgent) {
      foundInteractiveAgent = tavusAgent;
    } else if (validAgents.length > 0) {
      foundInteractiveAgent = validAgents[0];
    }

    setDiscoveredTargetParticipant(foundInteractiveAgent);
  }, [room?.remoteParticipants.size]);

  // User profile management - Obtener perfil real de la base de datos
  useEffect(() => {
    if (authStatus === 'authenticated' && session?.user?.email && !userProfile) {
      // Obtener el perfil real de la base de datos
      const fetchUserProfile = async () => {
        try {
          const response = await fetch('/api/profile');
          if (response.ok) {
            const profile = await response.json();
            const newProfile = { 
              id: session?.user?.id || undefined,
              email: session?.user?.email || null,
              username: profile.username || session?.user?.name || null,
            };
            dispatch({ type: 'SET_USER_PROFILE', payload: newProfile });
          } else {
            // Fallback a datos de sesión si falla la API
            const newProfile = { 
              id: session?.user?.id || undefined,
              email: session?.user?.email || null,
              username: session?.user?.name || null,
            };
            dispatch({ type: 'SET_USER_PROFILE', payload: newProfile });
          }
        } catch (error) {
          console.error('Error obteniendo perfil de usuario:', error);
          // Fallback a datos de sesión
          const newProfile = { 
            id: session?.user?.id || undefined,
            email: session?.user?.email || null,
            username: session?.user?.name || null,
          };
          dispatch({ type: 'SET_USER_PROFILE', payload: newProfile });
        }
      };

      fetchUserProfile();
    } else if (authStatus === 'unauthenticated' && userProfile !== null) {
      dispatch({ type: 'SET_USER_PROFILE', payload: null });
    }
  }, [authStatus, session?.user?.id, session?.user?.email, userProfile]);

  // Conversation session management
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
    session?.user?.id,
    authStatus, 
    state.conversationActive, 
    state.isReadyToStart, 
    state.messages.length,
    state.activeSessionId, 
    state.isSessionClosed,
    disconnectFromLiveKit, 
    setAppError, 
    showNotification
  ]);

  const {
    endSession,
    handleStartConversation,
  } = useConversationSessionManager(conversationManagerProps);

  // Data channel events
  const dataChannelEventsProps = useMemo(() => ({
    dispatch,
    conversationActive: state.conversationActive,
    greetingMessageId: state.greetingMessageId,
    currentSpeakingId: state.currentSpeakingId,
    endSession,
    isProcessing: state.isProcessing,
    isListening: state.isListening,
    isSpeaking: state.isSpeaking,
    isSessionClosed: state.isSessionClosed,
    activeSessionId: state.activeSessionId,
    room: room,
    roomRef: roomRef,
    isReadyToStart: state.isReadyToStart,
  }), [
    state.conversationActive, 
    state.greetingMessageId, 
    state.currentSpeakingId,
    endSession, 
    state.isProcessing, 
    state.isListening, 
    state.isSpeaking,
    state.isSessionClosed, 
    state.activeSessionId, 
    room?.name,
    state.isReadyToStart,
  ]);

  const { handleDataReceived, handleSendTextMessage } = useLiveKitDataChannelEvents(dataChannelEventsProps);

  useEffect(() => {
    dataReceivedHandlerRef.current = handleDataReceived;
  }, [handleDataReceived]);

  // Ready to start calculation - ESTABILIZADO
  const stableActiveTracks = useMemo(() => activeTracks.map(track => ({
    identity: track.identity,
    kind: track.kind,
    source: track.source,
    publication: track.publication
  })), [activeTracks.length, activeTracks.map(t => `${t.identity}-${t.kind}-${t.source}`).join(',')]);

  const calculatedIsReadyToStart = useReadyToStart({
    authStatus,
    connectionState,
    discoveredParticipant: discoveredTargetParticipant,
    greetingMessageId: state.greetingMessageId,
    currentSpeakingId: state.currentSpeakingId,
    isSpeaking: state.isSpeaking,
    conversationActive: state.conversationActive,
    activeTracks: stableActiveTracks,
    tavusVideoLoaded: tavusVideoLoaded,
  });

  // Actualizar isReadyToStart SOLO cuando sea realmente necesario
  useEffect(() => {
    if (state.isReadyToStart !== calculatedIsReadyToStart) {
      dispatch({ type: 'SET_READY_TO_START', payload: calculatedIsReadyToStart });
      
      if (calculatedIsReadyToStart && !isInitialized.current) {
        setInitializationPhase('complete');
        isInitialized.current = true;
      }
    }
  }, [calculatedIsReadyToStart]);

  // Callbacks defined outside of useMemo to avoid hook violations
  const setIsListening = useCallback(
    (value: boolean) => dispatch({ type: 'SET_LISTENING', payload: value }),
    []
  );

  const setIsPushToTalkActive = useCallback(
    (value: boolean) => dispatch({ type: 'SET_PUSH_TO_TALK_ACTIVE', payload: value }),
    []
  );

  const onTimeoutCallback = useCallback(() => {
    endSession(false);
    showNotification("Sesión finalizada por inactividad.", "warning", 5000);
    dispatch({ type: 'SET_TIME_RUNNING_OUT', payload: false });
  }, [endSession, showNotification]);

  const onWarningCallback = useCallback(() => {
    showNotification("La sesión finalizará pronto.", "warning", 5000);
    dispatch({ type: 'SET_TIME_RUNNING_OUT', payload: true });
  }, [showNotification]);

  // Speech to text controls
  const speechToTextControlsProps = useMemo(() => ({
    isListening: state.isListening,
    isProcessing: state.isProcessing,
    isSpeaking: state.isSpeaking,
    isSessionClosed: state.isSessionClosed,
    conversationActive: state.conversationActive,
    roomRef,
    setIsListening,
  }), [
    state.isListening, 
    state.isProcessing, 
    state.isSpeaking, 
    state.isSessionClosed, 
    state.conversationActive,
    setIsListening,
  ]);

  const {
    handleStartListening: sttHandleStartListening,
    handleStopListening: sttHandleStopListening
  } = useSpeechToTextControls(speechToTextControlsProps);

  // Push to talk
  usePushToTalk({
    isListening: state.isListening,
    isProcessing: state.isProcessing,
    isSpeaking: state.isSpeaking,
    isThinking: state.isThinking,
    conversationActive: state.conversationActive,
    isSessionClosed: state.isSessionClosed,
    onStartListening: handleStartListening,
    onStopListening: handleStopListening,
    setIsPushToTalkActive,
  });

  // Session timeout
  const { isTimeRunningOut } = useSessionTimeout({
    conversationActive: state.conversationActive,
    sessionStartTime: state.sessionStartTime,
    isSessionClosed: state.isSessionClosed,
    onTimeout: onTimeoutCallback,
    onWarning: onWarningCallback,
  });

  useEffect(() => {
    if (state.isTimeRunningOutState !== isTimeRunningOut) {
      dispatch({ type: 'SET_TIME_RUNNING_OUT', payload: isTimeRunningOut });
    }
  }, [isTimeRunningOut, state.isTimeRunningOutState]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      clearError();
      if (thinkingTimeoutRef.current) clearTimeout(thinkingTimeoutRef.current);
      if (processingTimeoutRef.current) clearTimeout(processingTimeoutRef.current);
    };
  }, [clearError]);

  // Loading states
  const isLoading = authStatus === 'loading' || (!userProfile && session?.user?.id);

  // Simplificado: solo verificar autenticación básica
  if (authStatus === 'loading') {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-gray-900 text-white">
        <Loader2 className="animate-spin h-12 w-12 text-blue-500" />
        <p className="mt-4 text-lg">Iniciando MarIA...</p>
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

  if (appError.type && appError.type !== 'permissions' && appError.type !== 'profile' && appError.message) {
    return <ErrorDisplay error={{ message: appError.message, type: appError.type || undefined }} onClose={clearError} />;
  }

  // Ir directo a VoiceChatLayout sin pantallas de carga intermedias
  return (
    <>
      {/* Audio tracks - hidden but functional */}
      {audioTracks.map((audioTrack, index) => (
        <RemoteTrackPlayer
          key={`audio-${audioTrack.sid || index}`}
          track={audioTrack}
          autoPlay={true}
          muted={false}
          className="hidden"
        />
      ))}
      
      <VoiceChatLayout
        appError={appError}
        notification={notification}
        isChatVisible={isChatVisible}
        tavusVideoTrack={tavusVideoTrack}
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
        textInput={textInput}
        setTextInput={(value: string) => dispatch({ type: 'SET_TEXT_INPUT', payload: value })}
        clearError={clearError}
        toggleChatVisibility={toggleChatVisibility}
        handleStartListening={sttHandleStartListening}
        handleStopListening={sttHandleStopListening}
        handleSendTextMessage={handleSendTextMessage}
        dispatch={dispatch}
        onTavusVideoLoaded={handleTavusVideoLoaded}
        handleStartConversation={handleStartConversation}
      />
    </>
  );
}

export default VoiceChatContainer;