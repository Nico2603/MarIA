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

// Funciones auxiliares para el manejo de transcripciones
function calculateTextSimilarity(text1: string, text2: string): number {
  // Algoritmo simple de similitud basado en palabras comunes
  const words1 = text1.toLowerCase().split(/\s+/);
  const words2 = text2.toLowerCase().split(/\s+/);
  
  const commonWords = words1.filter(word => words2.includes(word));
  const totalWords = Math.max(words1.length, words2.length);
  
  return totalWords > 0 ? commonWords.length / totalWords : 0;
}

function combineTranscriptions(prevText: string, newText: string): string {
  // Lógica inteligente para combinar transcripciones
  const prevWords = prevText.trim().split(/\s+/);
  const newWords = newText.trim().split(/\s+/);
  
  // Si el nuevo texto comienza donde terminó el anterior, concatenar
  if (newWords.length > 0 && prevWords.length > 0) {
    const lastPrevWord = prevWords[prevWords.length - 1];
    const firstNewWord = newWords[0];
    
    // Si la última palabra del texto anterior está contenida en la primera del nuevo
    if (firstNewWord.toLowerCase().includes(lastPrevWord.toLowerCase()) || 
        lastPrevWord.toLowerCase().includes(firstNewWord.toLowerCase())) {
      // Combinar eliminando la duplicación
      return prevText + ' ' + newWords.slice(1).join(' ');
    }
  }
  
  // Si no hay solapamiento claro, concatenar con espacio
  return prevText + ' ' + newText;
}

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

  // DESHABILITADO: No escuchar transcripciones automáticamente
  // Las transcripciones solo se activarán cuando el usuario use push-to-talk
  useEffect(() => {
    if (!room || !userProfile) {
      return;
    }

    // SOLO registrar transcripciones cuando el usuario esté activamente hablando (isListening)
    const updateTranscriptions = (segments: any[], participant?: Participant) => {
      if (!participant) return;
      
      // CRÍTICO: Solo procesar transcripciones si el usuario está usando push-to-talk
      if (!isListening && participant.isLocal) {
        console.log(`[VoiceChatContainer] 🚫 Ignorando transcripción - micrófono no activado por push-to-talk`);
        return;
      }
      
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

          // Solo procesar transcripciones del usuario cuando está hablando activamente
          if (participant.isLocal && !isListening) {
            console.log(`[VoiceChatContainer] 🚫 Ignorando transcripción del usuario - no está en modo PTT activo`);
            return newTranscriptions;
          }

          // Solo almacenar las transcripciones sin agregar al chat inmediatamente
          // El chat se actualizará cuando el usuario termine de hablar (suelte PTT)
          if (lastTextRef.current[speaker]) {
            const prevText = lastTextRef.current[speaker];
            
            // Mejoramos la lógica de acumulación de texto:
            // 1. Si el nuevo texto es más largo, actualizar directamente
            // 2. Si es diferente pero similar longitud, usar el más reciente
            // 3. Si es completamente diferente, concatenar inteligentemente
            if (newText.length > prevText.length) {
              // Solo log para usuario, no para bot (reduce spam)
              if (participant.isLocal && isListening) {
                console.log(`[VoiceChatContainer] 📝 Actualizando transcripción del usuario: "${newText}"`);
              }
              lastTextRef.current[speaker] = newText;
            } else if (newText !== prevText && newText.length > 5) {
              // Si son textos diferentes pero de longitud similar, verificar si complementan
              const similarity = calculateTextSimilarity(prevText, newText);
              if (similarity < 0.7) {
                // Textos muy diferentes, posiblemente nueva frase
                const combinedText = combineTranscriptions(prevText, newText);
                if (participant.isLocal && isListening) {
                  console.log(`[VoiceChatContainer] 🔄 Combinando transcripciones: "${combinedText}"`);
                }
                lastTextRef.current[speaker] = combinedText;
              } else {
                // Similar, usar el más reciente
                lastTextRef.current[speaker] = newText;
              }
            }
          } else {
            // Primera transcripción del speaker
            if (participant.isLocal && isListening) {
              console.log(`[VoiceChatContainer] 📝 Primera transcripción del usuario: "${newText}"`);
            }
            lastTextRef.current[speaker] = newText;
          }

          // NOTA: No agregar mensajes del bot aquí ya que llegan correctamente via DataChannel
          // Solo mantener las transcripciones para referencia pero el chat se actualiza via DataChannel
        }

        return newTranscriptions;
      });
    };

    // SOLO registrar el listener si está habilitado
    if (isListening) {
      console.log(`[VoiceChatContainer] 🎤 Activando listener de transcripciones (Push-to-Talk activo)`);
      room.on(RoomEvent.TranscriptionReceived, updateTranscriptions);
    }
    
    return () => {
      console.log(`[VoiceChatContainer] 🔇 Desactivando listener de transcripciones`);
      room.off(RoomEvent.TranscriptionReceived, updateTranscriptions);
    };
  }, [room, userProfile, messages, dispatch, isListening]); // Añadir isListening como dependencia

  // Efecto para procesar transcripciones pendientes cuando se deja de escuchar
  useEffect(() => {
    // SOLO procesar si el usuario estuvo escuchando y ahora dejó de hacerlo
    if (!isListening && userProfile && conversationActive) {
      // Delay más largo para capturar transcripciones finales que puedan llegar después de soltar PTT
      const timeoutId = setTimeout(() => {
        const userSpeaker = userProfile?.username || "Tú";
        const lastUserText = lastTextRef.current[userSpeaker];
        
        // Reducir el requisito mínimo de caracteres para capturar frases más cortas
        if (lastUserText && lastUserText.trim().length > 3) {
          console.log(`[VoiceChatContainer] 🔍 Procesando transcripción final del usuario: "${lastUserText}"`);
          
          // Verificar si ya existe un mensaje reciente con este texto exacto
          const existingMessage = messages.find(m => 
            m.isUser && m.text.trim() === lastUserText.trim()
          );
          
          if (!existingMessage) {
            console.log(`[VoiceChatContainer] ➕ Agregando mensaje final del usuario al chat`);
            
            const userMessage: Message = { 
              id: `user-final-${Date.now()}`, 
              text: lastUserText.trim(), 
              isUser: true, 
              timestamp: new Date().toLocaleTimeString('es-ES', { hour: 'numeric', minute: 'numeric', hour12: true })
            };
            
            dispatch({ type: 'ADD_MESSAGE', payload: userMessage });
            dispatch({ type: 'SET_PROCESSING', payload: true });
            dispatch({ type: 'SET_THINKING', payload: true });
            
            // Limpiar el texto para evitar reprocesamiento
            lastTextRef.current[userSpeaker] = '';
            
            console.log(`[VoiceChatContainer] ✅ Mensaje final del usuario enviado: "${lastUserText}"`);
            
            // Timeout de seguridad MÁS LARGO para dar tiempo a la respuesta completa
            setTimeout(() => {
              console.log(`[VoiceChatContainer] ⚠️ Timeout de seguridad: limpiando estados de procesamiento`);
              dispatch({ type: 'SET_PROCESSING', payload: false });
              dispatch({ type: 'SET_THINKING', payload: false });
            }, 45000); // 45 segundos de timeout en lugar de 30
          } else {
            console.log(`[VoiceChatContainer] 🔄 Mensaje del usuario ya existe, omitiendo`);
            // Limpiar el texto de todas formas
            lastTextRef.current[userSpeaker] = '';
          }
        } else {
          console.log(`[VoiceChatContainer] ⚠️ No hay transcripción válida del usuario o es muy corta`);
        }
      }, 2500); // Aumentar de 1.5 a 2.5 segundos para capturar transcripciones tardías
      
      return () => clearTimeout(timeoutId);
    }
  }, [isListening, userProfile, messages, dispatch, conversationActive]);

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

  const onConnectedCallback = useCallback(async (connectedRoom: Room) => {
    roomRef.current = connectedRoom;
    clearError();
    setInitializationPhase('ready');
    
    // CRÍTICO: Asegurar que el micrófono esté COMPLETAMENTE desactivado por defecto
    if (roomRef.current?.localParticipant) {
      try {
        await roomRef.current.localParticipant.setMicrophoneEnabled(false);
        console.log('[VoiceChatContainer] 🔇 Micrófono COMPLETAMENTE desactivado por defecto');
        console.log('[VoiceChatContainer] 🎤 Push-to-Talk es el ÚNICO método para activar micrófono');
        
        // Verificar que efectivamente esté desactivado
        const isMicEnabled = roomRef.current.localParticipant.isMicrophoneEnabled;
        console.log(`[VoiceChatContainer] 🔍 Estado del micrófono verificado: ${isMicEnabled ? 'ACTIVADO' : 'DESACTIVADO'}`);
        
        if (isMicEnabled) {
          console.error('[VoiceChatContainer] ❌ PROBLEMA: Micrófono sigue activado después de deshabilitarlo');
          // Intentar desactivar de nuevo
          await roomRef.current.localParticipant.setMicrophoneEnabled(false);
        }
      } catch (error) {
        console.error('[VoiceChatContainer] ❌ Error desactivando micrófono:', error);
      }
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

  // EFECTO CRÍTICO: Monitorear constantemente que el micrófono esté desactivado
  useEffect(() => {
    if (!room?.localParticipant) return;
    
    const checkMicrophoneState = async () => {
      const isMicEnabled = room.localParticipant.isMicrophoneEnabled;
      
      // Si el micrófono está activado pero NO estamos en modo listening, desactivarlo
      if (isMicEnabled && !isListening) {
        console.warn(`[VoiceChatContainer] ⚠️ PROBLEMA DETECTADO: Micrófono activo sin push-to-talk`);
        console.log(`[VoiceChatContainer] 🔧 Desactivando micrófono automáticamente...`);
        try {
          await room.localParticipant.setMicrophoneEnabled(false);
          console.log(`[VoiceChatContainer] ✅ Micrófono desactivado correctamente`);
        } catch (error) {
          console.error(`[VoiceChatContainer] ❌ Error desactivando micrófono:`, error);
        }
      } else if (!isMicEnabled && isListening) {
        console.log(`[VoiceChatContainer] 🎤 Push-to-talk activo, micrófono correctamente activado`);
      } else if (!isMicEnabled && !isListening) {
        // Solo log ocasional para evitar spam
        if (Math.random() < 0.1) { // Solo 10% de las veces
          console.log(`[VoiceChatContainer] ✅ Estado correcto: Micrófono desactivado, sin push-to-talk`);
        }
      }
    };
    
    // Verificar inmediatamente
    checkMicrophoneState();
    
    // Verificar cada 2 segundos para detectar activaciones no autorizadas
    const intervalId = setInterval(checkMicrophoneState, 2000);
    
    return () => clearInterval(intervalId);
  }, [room, isListening]);

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

  // Función para redirigir directamente a feedback (nuevo flujo)
  const redirectToFeedback = useCallback(() => {
    console.log("[VoiceChatContainer] 🎯 Redirigiendo directamente a página de feedback");
    // Usar router para ir directamente al perfil con parámetros para mostrar feedback
    try {
      router.push('/settings/profile?fromChat=true&showFeedback=true');
      console.log("[VoiceChatContainer] ✅ Redirección a feedback exitosa");
    } catch (error) {
      console.error("[VoiceChatContainer] ❌ Error en redirección a feedback:", error);
      // Fallback
      window.location.href = '/settings/profile?fromChat=true&showFeedback=true';
    }
  }, [router]);

  // Handlers para el modal de feedback (SIN redirección automática)
  const handleCloseFeedbackModal = useCallback(() => {
    console.log(`[VoiceChatContainer] ❌ Modal de feedback cerrado sin completar`);
    setShowFeedbackModal(false);
    
    // Limpiar flag automático si estaba activo
    if (autoRedirectInProgress) {
      setAutoRedirectInProgress(false);
      console.log(`[VoiceChatContainer] 🏁 Flag de redirección automática limpiado`);
    }
    
    // YA NO redirigir automáticamente - dejar que el usuario decida
    console.log(`[VoiceChatContainer] 🔄 Modal cerrado - usuario permanece en la sesión finalizada`);
  }, [autoRedirectInProgress]);

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
    
    // YA NO redirigir automáticamente - mostrar agradecimiento
    console.log(`[VoiceChatContainer] 🔄 Feedback completado - usuario permanece para decidir siguiente paso`);
    showNotification("¡Gracias por compartir tu información! Puedes cerrar esta ventana.", "success", 5000);
  }, [showNotification, autoRedirectInProgress]);

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
    messages: state.messages,
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

  const onTimeoutCallback = useCallback(async () => {
    console.log('[VoiceChatContainer] ⏰ Sesión alcanzó 30 minutos - iniciando despedida automática');
    
    // Enviar señal especial al agente para que genere despedida automática de 30 minutos
    try {
      await handleSendTextMessage('[TIMEOUT_30_MINUTOS]');
      console.log('[VoiceChatContainer] ✅ Señal de timeout enviada al agente');
      
      // Dar tiempo para que María genere y reproduzca la despedida antes de cerrar
      setTimeout(() => {
        endSession(false, "timeout_30_minutos", false);
        dispatch({ type: 'SET_TIME_RUNNING_OUT', payload: false });
      }, 8000); // 8 segundos para despedida completa
      
    } catch (error) {
      console.error('[VoiceChatContainer] ❌ Error enviando señal de timeout:', error);
      // Fallback: cerrar sesión inmediatamente si hay error
      endSession(false, "timeout_30_minutos", false);
      showNotification("Sesión finalizada - 30 minutos completados.", "info", 5000);
      dispatch({ type: 'SET_TIME_RUNNING_OUT', payload: false });
    }
  }, [endSession, showNotification, handleSendTextMessage]);

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
        redirectToFeedback={redirectToFeedback}
      />
      
      {audioTracks.map((track, index) => (
        <RemoteTrackPlayer
          key={`audio-${index}`}
          track={track}
          autoPlay={true}
          muted={false}
          className="hidden"
          onLoadedData={() => {
            console.log('[VoiceChatContainer] 🔊 Audio track cargado y listo para reproducir');
          }}
          onError={() => {
            console.error('[VoiceChatContainer] ❌ Error reproduciendo audio track');
          }}
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