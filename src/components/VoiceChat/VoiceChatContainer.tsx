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
import { LiveKitRoom, useMaybeRoomContext } from '@livekit/components-react';
import { Send, AlertCircle, Mic, ChevronsLeft, ChevronsRight, MessageSquare, Loader2, Terminal, Clock, Calendar } from 'lucide-react';
import dynamic from 'next/dynamic';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { useLiveKitConnectionManager } from '@/hooks/voicechat/useLiveKitConnectionManager';
import { useSessionTimeout } from '@/hooks/useSessionTimeout';
import { usePushToTalk } from '@/hooks/usePushToTalk';
import { useError } from '@/contexts/ErrorContext';
import { useNotifications } from '@/utils/notifications';
import NotificationDisplay from '@/components/ui/NotificationDisplay';
import ErrorDisplay from '@/components/ui/ErrorDisplay';
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
import { FeedbackPaymentModal } from '@/components/ui/FeedbackPaymentModal';

const DynamicChatPanel = dynamic(() => import('../ChatPanel'), { 
  ssr: false
});

const DynamicVideoPanel = dynamic(() => import('./VideoPanel'), {
  ssr: false
});

// Componente interno que usa el contexto de LiveKit
function VoiceChatInner() {
  const { data: session, status: authStatus } = useSession();
  const router = useRouter();
  const { error: appError, setError: setAppError, clearError } = useError();
  const { notification, showNotification } = useNotifications();
  const room = useMaybeRoomContext();

  const [state, dispatch] = useReducer(voiceChatReducer, initialState);
  const [discoveredTargetParticipant, setDiscoveredTargetParticipant] = useState<RemoteParticipant | null>(null);
  const [initializationPhase, setInitializationPhase] = useState<'auth' | 'connecting' | 'ready' | 'complete'>('auth');
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [autoRedirectInProgress, setAutoRedirectInProgress] = useState(false);
  
  // Estado para transcripciones
  const [transcriptions, setTranscriptions] = useState<{[key: string]: any}>({});
  const [transcriptionCompleted, setTranscriptionCompleted] = useState<any[]>([]);
  const lastTextRef = useRef<{[key: string]: string}>({});
  
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

  // Actualizar roomRef cuando cambie room
  useEffect(() => {
    roomRef.current = room || null;
  }, [room]);

  // useEffect para capturar transcripciones en tiempo real
  useEffect(() => {
    if (!room || !userProfile) {
      return;
    }

    const updateTranscriptions = (segments: any[], participant?: Participant) => {
      if (!participant) return;
      
      setTranscriptions((prev) => {
        const newTranscriptions = { ...prev };
        for (const segment of segments) {
          newTranscriptions[segment.id] = {
            ...segment,
            origin: participant.isLocal
              ? userProfile?.username || "Tú"
              : "MarIA", // Nombre del asistente
          };
        }
        return newTranscriptions;
      });

      setTranscriptionCompleted((prev) => {
        const newTranscriptions = [...prev];

        for (const segment of segments) {
          const newText = segment.text.trim();
          const speaker = participant.isLocal
            ? userProfile?.username || "Tú"
            : "MarIA";

          // Si el speaker tiene un texto previo, extraer solo la parte nueva
          if (lastTextRef.current[speaker]) {
            const prevText = lastTextRef.current[speaker];

            // Remover la parte repetida al inicio
            const cleanText = newText.replace(prevText, "").trim();

            if (cleanText) {
              newTranscriptions.push({
                id: segment.id,
                text: cleanText,
                origin: speaker,
              });

              // Guardar este texto como el nuevo último texto recibido
              lastTextRef.current[speaker] = newText;
            }
          } else {
            // Primer fragmento de texto del speaker, se almacena completo
            newTranscriptions.push({
              id: segment.id,
              text: newText,
              origin: speaker,
            });

            lastTextRef.current[speaker] = newText;
          }
        }

        return newTranscriptions;
      });
    };

    room.on(RoomEvent.TranscriptionReceived, updateTranscriptions);
    return () => {
      room.off(RoomEvent.TranscriptionReceived, updateTranscriptions);
    };
  }, [room, userProfile]);



  // Función para mostrar/ocultar el chat
  const toggleChatVisibility = useCallback(() => {
    dispatch({ type: 'TOGGLE_CHAT_VISIBILITY' });
  }, []);

  // Usando avatar CSS

  const {
    activeTracks,
    handleTrackSubscribed,
    handleTrackUnsubscribed,
    handleParticipantDisconnected,
  } = useLiveKitTrackManagement({
    roomRef
  });

  // Avatar CSS no requiere track de video - simplificado

  const audioTracks = useMemo(() => activeTracks
    .filter(t => t.kind === Track.Kind.Audio && t.publication && t.publication.track)
    .map(t => t.publication.track!), [activeTracks]);

  // Callback para eventos de DataChannel
  const onDataReceivedLiveKitCallback = useCallback((...args: any[]) => {
    if (dataReceivedHandlerRef.current) {
      dataReceivedHandlerRef.current(...args);
    }
  }, []);

  // CRÍTICO: Configurar eventos de tracks de LiveKit
  useEffect(() => {
    if (!room) {
      console.log('[VoiceChatContainer] ⚠️ No hay room para configurar eventos de tracks');
      return;
    }

    console.log('[VoiceChatContainer] 🔧 Configurando eventos de tracks de LiveKit...');

    // Manejar tracks cuando se suscriben
    const onTrackSubscribed = (track: any, publication: any, participant: any) => {
      console.log('[VoiceChatContainer] 🎉 EVENTO: TrackSubscribed recibido!');
      handleTrackSubscribed(track, publication, participant);
    };

    // Manejar tracks cuando se des-suscriben
    const onTrackUnsubscribed = (track: any, publication: any, participant: any) => {
      console.log('[VoiceChatContainer] 👋 EVENTO: TrackUnsubscribed recibido!');
      handleTrackUnsubscribed(track, publication, participant);
    };

    // Manejar cuando los participantes se desconectan
    const onParticipantDisconnected = (participant: any) => {
      console.log('[VoiceChatContainer] 🚪 EVENTO: ParticipantDisconnected recibido!');
      handleParticipantDisconnected(participant);
    };

    // Registrar eventos
    room.on(RoomEvent.TrackSubscribed, onTrackSubscribed);
    room.on(RoomEvent.TrackUnsubscribed, onTrackUnsubscribed);
    room.on(RoomEvent.ParticipantDisconnected, onParticipantDisconnected);
    room.on(RoomEvent.DataReceived, onDataReceivedLiveKitCallback);

    console.log('[VoiceChatContainer] ✅ Eventos de tracks y DataReceived configurados exitosamente');
    console.log('[VoiceChatContainer] 🔗 DataReceived handler registrado - el chat debería funcionar correctamente');

    // Cleanup
    return () => {
      console.log('[VoiceChatContainer] 🧹 Limpiando eventos de tracks...');
      room.off(RoomEvent.TrackSubscribed, onTrackSubscribed);
      room.off(RoomEvent.TrackUnsubscribed, onTrackUnsubscribed);
      room.off(RoomEvent.ParticipantDisconnected, onParticipantDisconnected);
      room.off(RoomEvent.DataReceived, onDataReceivedLiveKitCallback);
    };
  }, [room, handleTrackSubscribed, handleTrackUnsubscribed, handleParticipantDisconnected, onDataReceivedLiveKitCallback]);

  const onConnectedCallback = useCallback((connectedRoom: Room) => {
    roomRef.current = connectedRoom;
    clearError();
    setInitializationPhase('ready');
    
    // NO activar automáticamente el micrófono - el usuario debe controlarlo manualmente
    if (roomRef.current?.localParticipant) {
      roomRef.current.localParticipant.setMicrophoneEnabled(false);
    }
  }, [clearError]);

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

  // Como ahora usamos LiveKitRoom, necesitamos obtener la conexión de manera diferente
  const connectionState = room?.state || LiveKitConnectionState.Disconnected;
  
  // Determinar si está listo para iniciar
  useEffect(() => {
    const calculatedIsReadyToStart = 
      authStatus === 'authenticated' &&
      connectionState === LiveKitConnectionState.Connected &&
      !!discoveredTargetParticipant &&
      !state.conversationActive &&
      !!userProfile;
      
    if (state.isReadyToStart !== calculatedIsReadyToStart) {
      dispatch({ type: 'SET_READY_TO_START', payload: calculatedIsReadyToStart });
    }
  }, [
    authStatus,
    connectionState,
    discoveredTargetParticipant,
    state.conversationActive,
    state.isReadyToStart,
    userProfile
  ]);

  // Optimized participant discovery - SIMPLIFICADO
  useEffect(() => {
    if (!room) {
      setDiscoveredTargetParticipant(null);
      return;
    }

    const allParticipants = Array.from(room.remoteParticipants.values());
    const validAgents = allParticipants.filter(p => p.identity && isValidAgent(p.identity));
    
    let foundInteractiveAgent: RemoteParticipant | null = null;
    
    // Usar cualquier agente válido disponible
    if (validAgents.length > 0) {
      foundInteractiveAgent = validAgents[0];
    }

    setDiscoveredTargetParticipant(foundInteractiveAgent);
  }, [room?.remoteParticipants.size]);

  // User profile management - Obtener perfil real de la base de datos
  useEffect(() => {
    if (authStatus === 'authenticated' && session?.user?.email && !userProfile) {
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

  // Callback para mostrar modal de feedback
  const handleShowFeedbackModal = useCallback(() => {
    console.log(`[VoiceChatContainer] 🎯 Activando modal de feedback - showFeedbackModal será true`);
    setShowFeedbackModal(true);
    console.log(`[VoiceChatContainer] ✅ Modal de feedback activado - estado actualizado`);
  }, []);

  // Conversation session management - Simplified
  const {
    endSession,
    handleStartConversation,
    redirectToProfile,
  } = useConversationSessionManager({
    session,
    authStatus,
    conversationActive: state.conversationActive,
    isReadyToStart: state.isReadyToStart,
    messages: state.messages,
    activeSessionId: state.activeSessionId,
    isSessionClosed: state.isSessionClosed,
    roomRef,
    audioStreamRef,
    disconnectFromLiveKit: async () => {
      if (room) {
        await room.disconnect();
      }
    },
    setAppError,
    showNotification,
    dispatch,
    onShowFeedbackModal: handleShowFeedbackModal,
    setAutoRedirectInProgress,
  });

  // Handlers para el modal de feedback
  const handleCloseFeedbackModal = useCallback(() => {
    console.log(`[VoiceChatContainer] ❌ Modal de feedback cerrado sin completar`);
    setShowFeedbackModal(false);
    
    // Limpiar flag automático si estaba activo
    if (autoRedirectInProgress) {
      setAutoRedirectInProgress(false);
      console.log(`[VoiceChatContainer] 🏁 Flag de redirección automática limpiado`);
    }
    
    // Siempre redirigir al cerrar el modal (con o sin datos)
    console.log(`[VoiceChatContainer] 🔄 Redirección después de cerrar modal`);
    setTimeout(() => {
      redirectToProfile();
    }, 500);
  }, [redirectToProfile, autoRedirectInProgress]);

  const handleCompleteFeedbackModal = useCallback((phoneNumber?: string) => {
    console.log(`[VoiceChatContainer] ✅ Modal de feedback completado`, phoneNumber ? 'con número' : 'sin número');
    setShowFeedbackModal(false);
    
    if (phoneNumber) {
      showNotification("¡Gracias! Tu número ha sido guardado.", "success", 3000);
    }
    
    // Limpiar flag automático si estaba activo
    if (autoRedirectInProgress) {
      setAutoRedirectInProgress(false);
      console.log(`[VoiceChatContainer] 🏁 Flag de redirección automática limpiado`);
    }
    
    // Siempre redirigir al completar el modal
    console.log(`[VoiceChatContainer] 🔄 Redirección después de completar modal`);
    setTimeout(() => {
      redirectToProfile();
    }, 1000);
  }, [redirectToProfile, showNotification, autoRedirectInProgress]);

  // Data channel events - Simplified
  const { handleDataReceived, handleSendTextMessage } = useLiveKitDataChannelEvents({
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
    room: room || null,
    roomRef: roomRef,
    isReadyToStart: state.isReadyToStart,
  });

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

  // Auto-inicio de conversación cuando todo esté listo
  useEffect(() => {
    if (state.isReadyToStart && !state.conversationActive && !state.isSessionClosed) {
      console.log('[VoiceChatContainer] 🚀 Iniciando conversación automáticamente');
      // Pequeño delay para asegurar que la UI esté lista
      setTimeout(() => {
        handleStartConversation();
      }, 100);
    }
  }, [state.isReadyToStart, state.conversationActive, state.isSessionClosed, handleStartConversation]);

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
    endSession(false, "inactividad", false); // No redirigir en timeout por inactividad
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
    isAvatarLoaded: true, // Avatar CSS siempre está "cargado"
  }), [
    state.isListening,
    state.isProcessing,
    state.isSpeaking,
    state.isSessionClosed,
    state.conversationActive,
    setIsListening,
  ]);

  const { handleStartListening, handleStopListening } = useSpeechToTextControls(speechToTextControlsProps);

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
    isAvatarLoaded: true, // Avatar CSS siempre está "cargado"
  });

  // Session timeout
  useSessionTimeout({
    sessionStartTime: state.sessionStartTime,
    isSessionClosed: state.isSessionClosed,
    conversationActive: state.conversationActive,
    onTimeout: onTimeoutCallback,
    onWarning: onWarningCallback,
  });

  // Logging for debugging
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      console.log(`[VoiceChatContainer] Estado actual:`, {
        connectionState,
        conversationActive: state.conversationActive,
        isReadyToStart: state.isReadyToStart,
        isListening: state.isListening,
        isSpeaking: state.isSpeaking,
        isProcessing: state.isProcessing,
        isThinking: state.isThinking,
        participantFound: !!discoveredTargetParticipant,
        messageCount: state.messages.length,
      });
    }
  }, [
    connectionState,
    state.conversationActive,
    state.isReadyToStart,
    state.isListening,
    state.isSpeaking,
    state.isProcessing,
    state.isThinking,
    discoveredTargetParticipant,
    state.messages.length,
  ]);

  return (
    <>
      <VoiceChatLayout
        appError={appError}
        notification={notification}
        isChatVisible={isChatVisible}

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
        userName={session?.user?.name}
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
        handleStartListening={handleStartListening}
        handleStopListening={handleStopListening}
        handleSendTextMessage={handleSendTextMessage}
        dispatch={dispatch}
        handleStartConversation={handleStartConversation}
      />
      
      {audioTracks.map((track, index) => (
        <RemoteTrackPlayer
          key={`audio-${index}`}
          track={track}
          autoPlay={true}
          muted={false}
          className="hidden"
        />
      ))}
      
      <AnimatePresence>
        {showFeedbackModal && (
          <FeedbackPaymentModal
            isOpen={showFeedbackModal}
            onClose={handleCloseFeedbackModal}
            onComplete={handleCompleteFeedbackModal}
          />
        )}
      </AnimatePresence>
    </>
  );
}

// Función para obtener el token de LiveKit
async function getLiveKitToken(roomName: string, participantName: string, userProfile: any, activeSessionId: string | null, initialContext: string | null): Promise<string> {
  try {
    const queryParams = new URLSearchParams({
      room: roomName,
      participant: participantName,
      identity: participantName,
    });

    // Añadir metadata del usuario si está disponible
    if (userProfile?.id) {
      queryParams.set('userId', userProfile.id);
    }
    if (userProfile?.username) {
      queryParams.set('username', userProfile.username);
    }
    
    // Manejar chatSessionId: usar el activo o generar uno temporal si es null
    const chatSessionId = activeSessionId || `temp_session_${Date.now()}_${Math.random().toString(36).substring(7)}`;
    queryParams.set('chatSessionId', chatSessionId);
    
    if (initialContext) {
      queryParams.set('latestSummary', initialContext);
    }

    console.log(`[VoiceChatContainer] Generando token con chatSessionId: ${chatSessionId}`);

    const response = await fetch(`/api/livekit-token?${queryParams.toString()}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Token request failed: ${response.status} - ${errorText}`);
    }

    const data = await response.json();

    if (!data.token) {
      throw new Error('No token received from server');
    }

    return data.token;
  } catch (error) {
    console.error('[VoiceChatContainer] Error obteniendo token de LiveKit:', error);
    throw error;
  }
}

// Componente principal que incluye LiveKitRoom
function VoiceChatContainer() {
  const { data: session, status: authStatus } = useSession();
  const [liveKitToken, setLiveKitToken] = useState<string | null>(null);
  const [tokenError, setTokenError] = useState<string | null>(null);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [initialContext, setInitialContext] = useState<string | null>(null);

  // Obtener perfil del usuario al cargar
  useEffect(() => {
    if (authStatus === 'authenticated' && session?.user?.email && !userProfile) {
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
            setUserProfile(newProfile);
          } else {
            // Fallback a datos de sesión si falla la API
            const newProfile = { 
              id: session?.user?.id || undefined,
              email: session?.user?.email || null,
              username: session?.user?.name || null,
            };
            setUserProfile(newProfile);
          }
        } catch (error) {
          console.error('Error obteniendo perfil de usuario:', error);
          // Fallback a datos de sesión
          const newProfile = { 
            id: session?.user?.id || undefined,
            email: session?.user?.email || null,
            username: session?.user?.name || null,
          };
          setUserProfile(newProfile);
        }
      };

      fetchUserProfile();
    } else if (authStatus === 'unauthenticated' && userProfile !== null) {
      setUserProfile(null);
    }
  }, [authStatus, session?.user?.id, session?.user?.email, userProfile]);

  // Obtener token de LiveKit
  useEffect(() => {
    if (authStatus === 'authenticated' && userProfile && !liveKitToken) {
      const fetchToken = async () => {
        try {
          const roomName = 'ai-mental-health-chat';
          const participantName = userProfile.username || userProfile.email || 'usuario';
          
          const token = await getLiveKitToken(roomName, participantName, userProfile, activeSessionId, initialContext);
          setLiveKitToken(token);
          setTokenError(null);
        } catch (error) {
          console.error('Error obteniendo token:', error);
          setTokenError(error instanceof Error ? error.message : 'Error desconocido');
        }
      };

      fetchToken();
    }
  }, [authStatus, userProfile, liveKitToken, activeSessionId, initialContext]);

  // Mostrar loading mientras se obtiene el token
  if (authStatus === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
      </div>
    );
  }

  // Mostrar error si no se puede obtener el token
  if (tokenError) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-red-500">Error obteniendo token: {tokenError}</div>
      </div>
    );
  }

  // Mostrar loading mientras se obtiene el token
  if (!liveKitToken) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <LiveKitRoom
      token={liveKitToken}
      serverUrl={process.env.NEXT_PUBLIC_LIVEKIT_URL || ''}
      audio={true}
      video={false}
    >
      <VoiceChatInner />
    </LiveKitRoom>
  );
}

export default VoiceChatContainer;