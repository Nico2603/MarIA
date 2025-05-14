'use client';

import React, { useState, useEffect, useRef, useCallback, FormEvent } from 'react';
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
import ChatPanel from './ChatPanel';
import ChatInput from './ChatInput';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import type { UserProfile } from '@/types/profile';
import type { ChatSession } from '@prisma/client';
import { Button } from '@/components/ui/button';
import { useLiveKitRoom } from '@/hooks/useLiveKitRoom';
import { useSessionTimeout } from '@/hooks/useSessionTimeout';
import { usePushToTalk } from '@/hooks/usePushToTalk';
import { useError, AppError as AppErrorTypeFromContext } from '@/contexts/ErrorContext';
import { useNotifications } from '@/hooks/useNotifications';
import NotificationDisplay from './NotificationDisplay';
import type { Message } from "@/types";
import { SupabaseClient } from "@supabase/supabase-js";

// Definir constante para la longitud del historial (debe coincidir con backend)
const HISTORY_LENGTH = 12;

const AGENT_IDENTITY = "Maria-TTS-Bot";

const CLOSING_PHRASES = [
  "ha sido un placer hablar contigo",
  "espero que esto te sea útil",
  "cuídate mucho",
  "que tengas un buen día",
  "sesión finalizada",
  "hasta la próxima",
  "espero haberte podido ayudar hoy"
];

interface ExtendedUserProfile extends UserProfile {
  tavus_api_key?: string | null; 
  openai_api_key?: string | null;
  elevenlabs_api_key?: string | null;
  elevenlabs_voice_id?: string | null;
}

interface HistoryPagination {
  currentPage: number;
  itemsPerPage: number;
  totalItems: number;
}

const ErrorDisplay: React.FC<{ error: AppErrorTypeFromContext; onClose: () => void }> = ({ error, onClose }) => {
  if (!error.message) return null;
  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 10 }}
      className="fixed bottom-4 right-4 z-50 bg-red-100 border border-red-300 text-red-800 px-4 py-3 rounded-lg shadow-md flex items-center max-w-sm dark:bg-red-900/80 dark:text-red-200 dark:border-red-700"
    >
      <AlertCircle className="w-5 h-5 mr-3 flex-shrink-0" />
      <span className="text-sm mr-3">{error.message}</span>
      <button onClick={onClose} className="ml-auto p-1 rounded-full hover:bg-red-200 dark:hover:bg-red-800 transition-colors">
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </motion.div>
  );
};

function VoiceChatContainer() {
  const { data: session, status: authStatus } = useSession();
  const { error: appError, setError: setAppError, clearError } = useError();
  const { notification, showNotification } = useNotifications();
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [currentSpeakingId, setCurrentSpeakingId] = useState<string | null>(null);
  const [textInput, setTextInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [connectionState, setConnectionState] = useState<LiveKitConnectionState>(LiveKitConnectionState.Disconnected);
  const [liveKitToken, setLiveKitToken] = useState<string | null>(null);
  const [greetingMessageId, setGreetingMessageId] = useState<string | null>(null);
  const [isReadyToStart, setIsReadyToStart] = useState(false);
  const [conversationActive, setConversationActive] = useState(false);
  const [isPushToTalkActive, setIsPushToTalkActive] = useState(false);
  const [isChatVisible, setIsChatVisible] = useState(true);
  const [sessionStartTime, setSessionStartTime] = useState<number | null>(null);
  const [isFirstInteraction, setIsFirstInteraction] = useState(true);
  const [isSessionClosed, setIsSessionClosed] = useState(false);
  const [isThinking, setIsThinking] = useState(false);
  const [pendingAiMessage, setPendingAiMessage] = useState<Message | null>(null);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [initialContext, setInitialContext] = useState<string | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [totalPreviousSessions, setTotalPreviousSessions] = useState<number | null>(null);
  const [isTimeRunningOutState, setIsTimeRunningOutState] = useState(false);
  const [isTavusVideoActive, setIsTavusVideoActive] = useState(false);
  const [currentSessionTitle, setCurrentSessionTitle] = useState<string | null>(null);

  const roomRef = useRef<Room | null>(null);
  const audioStreamRef = useRef<MediaStream | null>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const textAreaRef = useRef<HTMLTextAreaElement>(null);
  const thinkingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const processingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const toggleChatVisibility = useCallback(() => {
    setIsChatVisible(prev => !prev);
  }, []);

  const endSession = useCallback(async (notify = true, reason?: string) => {
    if (isSessionClosed) {
      console.log("La sesión ya está marcada como cerrada localmente. No se tomarán más acciones en endSession.");
      return;
    }
    
    console.log(`Finalizando sesión localmente... (ID Sesión API: ${activeSessionId})`);
    setIsSessionClosed(true);
    setConversationActive(false);

    setIsListening(false);
    setIsProcessing(false);
    setIsSpeaking(false);
    setCurrentSpeakingId(null);

    if (roomRef.current && roomRef.current.localParticipant) {
      try {
        await roomRef.current.localParticipant.setMicrophoneEnabled(false);
        console.log("Micrófono local deshabilitado al finalizar sesión.");
      } catch (error) {
        console.error("Error al deshabilitar micrófono al finalizar sesión:", error);
         setAppError('livekit', "Error al deshabilitar micrófono.");
      }
    }
    if (audioStreamRef.current) {
      audioStreamRef.current.getTracks().forEach(track => track.stop());
      audioStreamRef.current = null;
    }
    
    setSessionStartTime(null);
    setIsFirstInteraction(true);
    setPendingAiMessage(null);

    if (roomRef.current && roomRef.current.state === 'connected') {
      console.log("Desconectando de LiveKit para finalizar sesión...");
      await roomRef.current.disconnect();
    }
    console.log("Proceso de finalización de sesión en frontend completado.");

    if (notify) {
      const message = reason
        ? `Sesión terminada: ${reason}`
        : "Sesión terminada.";
      showNotification(message, "info");
    }
  }, [activeSessionId, isSessionClosed, setAppError, showNotification]);

  const handleTrackSubscribed = useCallback((track: RemoteTrack, publication: RemoteTrackPublication, participant: RemoteParticipant) => {
    if (participant.identity === AGENT_IDENTITY && track.kind === Track.Kind.Audio) {
      console.log(`Adjuntando pista de audio del BOT TTS: ${participant.identity} (Track SID: ${track.sid})`);
      const audioElement = track.attach();
      audioElement.id = `audio-${participant.identity}-${track.sid}`;
      audioElement.autoplay = true;
      document.body.appendChild(audioElement);
    } else if (participant.identity === AGENT_IDENTITY && track.kind === Track.Kind.Video) {
      console.log(`Adjuntando pista de VIDEO del BOT (Tavus): ${participant.identity} (Track SID: ${track.sid})`);
      const videoEl = track.attach();
      videoEl.id = `video-${track.sid}`;
      videoEl.autoplay = true;
      videoEl.muted = false;
      if (videoEl instanceof HTMLVideoElement) {
        videoEl.playsInline = true;
      }
      videoEl.className = "w-full h-full object-contain";
      const container = document.getElementById('video-container');
      if (container) {
        container.appendChild(videoEl);
        setIsTavusVideoActive(true);
        console.log("Video de Tavus adjuntado al contenedor.");
      } else {
        console.error("Contenedor de video 'video-container' no encontrado.");
      }
    } else if (participant.identity !== roomRef.current?.localParticipant.identity && track.kind === Track.Kind.Audio) {
      console.log(`Adjuntando pista de audio REMOTA de: ${participant.identity} (Track SID: ${track.sid})`);
      const audioElement = track.attach();
      audioElement.id = `audio-${participant.identity}-${track.sid}`;
      audioElement.autoplay = true;
      document.body.appendChild(audioElement);
    } else {
      console.log(`Ignorando pista suscrita: Local=${participant.identity === roomRef.current?.localParticipant.identity}, Kind=${track.kind}, Identity=${participant.identity}, TrackSID=${track.sid}`);
    }
  }, [setIsTavusVideoActive]);

  const handleTrackUnsubscribed = useCallback((track: RemoteTrack, publication: RemoteTrackPublication, participant: RemoteParticipant) => {
    if (participant.identity === AGENT_IDENTITY && track.kind === Track.Kind.Audio) {
      const elementId = `audio-${participant.identity}-${track.sid}`;
      const audioElement = document.getElementById(elementId) as HTMLAudioElement | null;
      if (audioElement) {
        console.log(`Desadjuntando pista de audio de: ${participant.identity} (Track SID: ${track.sid})`);
        track.detach(audioElement);
        audioElement.remove();
      }
    } else if (participant.identity === AGENT_IDENTITY && track.kind === Track.Kind.Video) {
      const videoElementId = `video-${track.sid}`;
      const videoElement = document.getElementById(videoElementId) as HTMLVideoElement | null;
      if (videoElement) {
        console.log(`Desadjuntando pista de VIDEO de: ${participant.identity} (Track SID: ${track.sid})`);
        track.detach(videoElement);
        videoElement.remove();
        setIsTavusVideoActive(false);
      }
    }
  }, [setIsTavusVideoActive]);

  const handleParticipantDisconnected = useCallback((participant: RemoteParticipant) => {
    console.log(`Limpiando audios y videos del participante desconectado: ${participant.identity}`);
    participant.trackPublications.forEach(publication => {
      if (publication.track?.kind === Track.Kind.Audio && publication.track.sid) {
        const elementId = `audio-${participant.identity}-${publication.track.sid}`;
        const audioElement = document.getElementById(elementId) as HTMLAudioElement | null;
        if (audioElement) {
          publication.track.detach(audioElement);
          audioElement.remove();
          console.log(`Audio limpiado: ${elementId}`);
        }
      }
      if (participant.identity === AGENT_IDENTITY && publication.track?.kind === Track.Kind.Video && publication.track.sid) {
        const videoElementId = `video-${publication.track.sid}`;
        const videoElement = document.getElementById(videoElementId) as HTMLVideoElement | null;
        if (videoElement) {
          publication.track.detach(videoElement);
          videoElement.remove();
          console.log(`Video de Tavus limpiado: ${videoElementId}`);
          setIsTavusVideoActive(false);
        }
      }
    });
  }, [setIsTavusVideoActive]);

  const getLiveKitToken = useCallback(async (participantName: string, signal: AbortSignal) => {
    clearError();
    try {
      const roomName = 'ai-mental-health-chat';
      const queryParams = new URLSearchParams({
        room: roomName,
        participant: participantName,
      });

      if (session?.user?.id) queryParams.append('userId', session.user.id);
      const currentUsername = userProfile?.username || session?.user?.name || 'Usuario Invitado';
      queryParams.append('username', currentUsername);
      if (initialContext) queryParams.append('latestSummary', initialContext);
      if (activeSessionId) queryParams.append('chatSessionId', activeSessionId);

      const response = await fetch(`/api/livekit-token?${queryParams.toString()}`, {
        method: 'GET',
        signal,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.error || `Error del servidor al obtener token: ${response.statusText}`;
        setAppError('livekit', errorMessage);
        setConnectionState(LiveKitConnectionState.Disconnected);
        return null;
      }
      const data = await response.json();
      if (!data.token) {
        setAppError('livekit', "Token no recibido del servidor.");
        return null;
      }
      setLiveKitToken(data.token);
      return data.token;
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        console.log("Solicitud de token de LiveKit cancelada.");
        return null;
      }
      console.error("Error fetching LiveKit token:", error);
      setConnectionState(LiveKitConnectionState.Disconnected);
      setAppError('livekit', error instanceof Error ? error.message : 'Error desconocido al obtener token.');
      return null;
    }
  }, [session?.user?.id, userProfile?.username, session?.user?.name, initialContext, activeSessionId, clearError, setAppError, setLiveKitToken, setConnectionState]);

  const saveMessage = useCallback(async (message: Message) => {
    if (!activeSessionId) {
      console.warn("Intento de guardar mensaje sin sesión activa (API).");
      return;
    }
    console.log("Función saveMessage en frontend NO está activa. El agente maneja el guardado.");
  }, [activeSessionId]);

  const handleTranscriptionResult = useCallback((finalTranscript: string) => {
    console.log(`Procesando transcripción final DEL AGENTE: "${finalTranscript}"`);
    if (finalTranscript.trim() && conversationActive && activeSessionId) {
      // Lógica de manejo de transcripción (si es necesaria más allá del agente)
    } else {
      console.log("Transcripción (del agente) descartada localmente (vacía, no activa, o sin sesión ID).");
    }
    if (isPushToTalkActive) {
      setIsPushToTalkActive(false);
    }
  }, [conversationActive, activeSessionId, isPushToTalkActive]);

  const handleStartListening = useCallback(async () => {
    if (isListening || isProcessing || isSpeaking || isSessionClosed || !conversationActive) return;
    clearError();
    if (roomRef.current && roomRef.current.localParticipant) {
        try {
            await roomRef.current.localParticipant.setMicrophoneEnabled(true);
            console.log("Micrófono local habilitado para LiveKit (STT).");
            setIsListening(true);
        } catch (error) {
            console.error("Error al habilitar el micrófono para LiveKit STT:", error);
            setAppError('stt', 'Error al activar el micrófono para la transcripción.');
            setIsListening(false);
            return;
        }
    } else {
        console.warn("LiveKit Room o LocalParticipant no disponible para iniciar STT.");
        setAppError('livekit', 'Conexión no lista para iniciar transcripción.');
        return;
    }
  }, [isListening, isProcessing, isSpeaking, isSessionClosed, conversationActive, clearError, setAppError]);
  
  const handleStopListening = useCallback(() => {
    if (!isListening) {
        console.log("Intento de detener escucha cuando no se está grabando (STT).");
        return;
    }
    console.log("Deteniendo escucha para STT (LiveKit)...");
    if (roomRef.current && roomRef.current.localParticipant) {
        roomRef.current.localParticipant.setMicrophoneEnabled(false)
            .then(() => console.log("Micrófono local deshabilitado (STT)."))
            .catch(error => {
                console.error("Error al deshabilitar micrófono para LiveKit STT:", error);
                setAppError('stt', 'Error al desactivar el micrófono.');
            });
    }
    setIsListening(false);
  }, [isListening, clearError, setAppError]);

  const handleSendTextMessage = useCallback(async (event: FormEvent) => {
    event.preventDefault();
    const trimmedInput = textInput.trim();
    if (trimmedInput && conversationActive && !isProcessing && !isSpeaking && !isListening && !isSessionClosed && activeSessionId && roomRef.current) {
      console.log(`Enviando texto al agente Maria: "${trimmedInput}"`);
      try {
        const payload = JSON.stringify({ type: "submit_user_text", payload: { text: trimmedInput } });
        await roomRef.current.localParticipant.publishData(new TextEncoder().encode(payload), { reliable: true });
        setTextInput('');
        setIsThinking(true);
      } catch (error) {
        console.error("Error al enviar mensaje de texto al agente vía DataChannel:", error);
        setAppError(null, "Error al enviar tu mensaje. Intenta de nuevo.");
        setIsThinking(false);
      }
    } else {
        console.log("Envío de mensaje de texto ignorado. Condiciones no cumplidas:", { trimmedInput, conversationActive, isProcessing, isSpeaking, isListening, isSessionClosed, activeSessionId, roomExists: !!roomRef.current });
    }
  }, [textInput, conversationActive, isProcessing, isSpeaking, isListening, isSessionClosed, activeSessionId, setAppError, setTextInput, setIsThinking]);

  const handleStartConversation = useCallback(async () => {
    if (!session?.user?.id || authStatus !== 'authenticated') {
      setAppError(null, "Debes iniciar sesión para comenzar.");
      return;
    }
    if (conversationActive || !isReadyToStart) {
        console.warn("Intento de iniciar conversación cuando ya está activa o no está lista.");
        return;
    }
    clearError();
    setIsSessionClosed(false);
    setIsTimeRunningOutState(false); 
    setIsFirstInteraction(true);
    setTextInput('');
     if (messages.length > 0 && messages[0].id.startsWith('greeting-')) {
         setMessages([messages[0]]);
      } else {
         setMessages([]);
     }
    try {
      console.log("Llamando a API para crear nueva sesión de chat...");
      const response = await fetch('/api/sessions', { method: 'POST' });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Error ${response.status} al crear sesión en API`);
      }
      const data = await response.json();
      if (!data.id) throw new Error("La API de sesiones no devolvió un ID válido.");
      setActiveSessionId(data.id);
      console.log(`Nueva sesión de API creada con ID: ${data.id}`);
      setConversationActive(true); 
      setSessionStartTime(Date.now());
      if (isReadyToStart) {
          console.log("Conversación iniciada. El bot TTS debería reproducir el saludo inicial.");
      } else {
        console.warn("Intento de iniciar conversación, pero la preparación del saludo (bot TTS) podría no estar completa.");
      }
      showNotification("Iniciando nueva conversación...", "info");
    } catch (error: any) {
      console.error("Error en handleStartConversation:", error);
      const message = error instanceof Error ? error.message : "No se pudo iniciar la nueva sesión. Inténtalo de nuevo.";
      setAppError(null, message);
      setActiveSessionId(null);
      setConversationActive(false); 
      setSessionStartTime(null);
      showNotification(`Error al iniciar la conversación: ${error.message}`, "error");
    }
  }, [session, authStatus, conversationActive, isReadyToStart, messages, clearError, setAppError, showNotification]);

  useEffect(() => {
    // No ejecutar si no está autenticado, o si la conversación ya está activa/lista, o si ya hay mensajes (saludo previo)
    if (authStatus !== 'authenticated' || isReadyToStart || conversationActive || messages.length > 0) {
      // Si las condiciones iniciales no se cumplen, asegurarse de que no haya un saludo pendiente si se vuelve a este estado.
      // Esto es una heurística, podría necesitar más lógica si el flujo es complejo.
      if (messages.length > 0 && messages[0].id.startsWith('greeting-') && !isReadyToStart && !conversationActive) {
        // No hacer nada aquí explícitamente, la condición de arriba previene la re-ejecución
      }
      return;
    }
    console.log("Ejecutando useEffect para preparar saludo inicial y cargar datos...");

    const controller = new AbortController();
    const { signal } = controller;

    const prepareInitialGreeting = () => {
        let initialGreetingText = "";
        let personalizedLog = false;

        if (totalPreviousSessions === null || totalPreviousSessions === 0) {
             initialGreetingText = "Hola";
             let firstName = "";
             if (userProfile?.username) {
                 firstName = userProfile.username.split(' ')[0];
             } else if (session?.user?.name) {
                  firstName = session.user.name.split(' ')[0];
             }
             if (firstName) {
                 initialGreetingText += `, ${firstName}`;
             }
             initialGreetingText += ". Soy María. Estoy aquí para escucharte y ofrecerte apoyo. ¿Cómo te sientes hoy?";
        } else {
            personalizedLog = true;
            let greeting = "Hola";
            let firstName = "";
            if (userProfile?.username) {
                firstName = userProfile.username.split(' ')[0];
            } else if (session?.user?.name) {
                 firstName = session.user.name.split(' ')[0];
            }
            if (firstName) {
                greeting += `, ${firstName}`;
            }
            greeting += ". Soy María.";

            if (initialContext) {
                let feelingMention = "que estabas lidiando con ansiedad";
                let situationMention = "";
                 if (initialContext.toLowerCase().includes('trabajo') || initialContext.toLowerCase().includes('laboral')){
                     situationMention = " relacionada con preocupaciones laborales";
                } else if (initialContext.toLowerCase().includes('reuniones')) {
                     situationMention = " relacionada con las reuniones";
                } else if (initialContext.toLowerCase().includes('impostor')) {
                     situationMention = " y sentimientos asociados al síndrome del impostor";
                }
                if (situationMention) {
                    feelingMention += situationMention;
                }

                let techniquesMention = "";
                const techniques = [];
                if (initialContext.toLowerCase().includes('grounding') || initialContext.toLowerCase().includes('5-4-3-2-1')) techniques.push('la técnica de grounding 5-4-3-2-1');
                if (initialContext.toLowerCase().includes('respiración') || initialContext.toLowerCase().includes('4-7-8')) techniques.push('ejercicios de respiración 4-7-8');
                if (initialContext.toLowerCase().includes('mindfulness')) techniques.push('mindfulness');
                if(techniques.length > 0){
                     let techniquesString = techniques.join(techniques.length > 2 ? ', ' : ' y ');
                     if (techniques.length > 2) {
                        const lastCommaIndex = techniquesString.lastIndexOf(', ');
                        techniquesString = techniquesString.substring(0, lastCommaIndex) + ' y ' + techniquesString.substring(lastCommaIndex + 2);
                     }
                    techniquesMention = ` y terminamos explorando ${techniquesString} para ayudarte`;
                }

                greeting += ` En nuestra sesión anterior me comentaste ${feelingMention}${techniquesMention}.`;
                greeting += ` Cuéntame, ¿te sirvió ${techniques.length > 0 ? 'lo que exploramos' : 'hablar de ello'} y cómo has seguido con esas sensaciones?`;
            } else {
                 greeting += " Qué bueno tenerte de vuelta. ¿Cómo te has sentido desde nuestra última conversación?";
            }
            initialGreetingText = greeting;
        }

        const msgId = `greeting-${Date.now()}`;
        setGreetingMessageId(msgId);

        const initialMessage: Message = {
            id: msgId,
            text: initialGreetingText,
            isUser: false,
            timestamp: new Date().toLocaleTimeString('es-ES', { hour: 'numeric', minute: 'numeric', hour12: true }),
        };
        setMessages([initialMessage]);
        console.log(`Generando audio para saludo inicial ${personalizedLog ? 'PERSONALIZADO' : '(Primera Sesión)'} (sin reproducir)...`);
    };
    
    const fetchInitialData = async () => {
        // Resetear solo si no tenemos datos, para evitar blanquear si es la primera carga real
        // y totalPreviousSessions ya tenía un valor de una ejecución previa del efecto.
        // La lógica de dependencias debería prevenir esto, pero es una salvaguarda.
        if (totalPreviousSessions === null) {
            setTotalPreviousSessions(null); // Mantiene el spinner si es la primera carga real
        }
        try {
            console.log("Fetching initial data (profile, summary, and session count) with signal:", signal.aborted);
            const [profileRes, summaryRes, historyRes] = await Promise.all([
                fetch('/api/profile', { signal }),
                fetch('/api/sessions/latest-summary', { signal }),
                fetch('/api/chat-sessions/history?page=1&pageSize=1', { signal })
            ]);

            // Solo procesar si la señal no ha sido abortada
            if (signal.aborted) {
                console.log("fetchInitialData abortado después de Promise.all");
                return;
            }

            if (profileRes.ok) {
                const profileData: UserProfile = await profileRes.json();
                if (!signal.aborted) setUserProfile(profileData);
                 console.log("Perfil de usuario cargado:", profileData.username);
            } else {
                 console.warn(`Error al cargar el perfil: ${profileRes.status}`);
                 if (!signal.aborted) setUserProfile(null);
            }

            if (summaryRes.ok) {
                const summaryData = await summaryRes.json();
                if (!signal.aborted) setInitialContext(summaryData.summary);
                console.log(`Resumen de sesión anterior cargado: ${summaryData.summary ? summaryData.summary.substring(0, 50) + '...' : 'Ninguno'}`);
            } else {
                 console.warn(`Error al cargar resumen anterior: ${summaryRes.status}`);
                 if (!signal.aborted) setInitialContext(null);
            }

            if (historyRes.ok) {
                const historyData: { data: any[]; pagination: HistoryPagination } = await historyRes.json();
                if (!signal.aborted) setTotalPreviousSessions(historyData.pagination.totalItems);
                 console.log(`Total de sesiones previas cargado: ${historyData.pagination.totalItems}`);
            } else {
                 console.warn(`Error al cargar contador de sesiones: ${historyRes.status}`);
                 if (!signal.aborted) setTotalPreviousSessions(0); // Asumir 0 si falla la carga
            }
            
            if (!signal.aborted) {
              prepareInitialGreeting(); // Llamar solo si no se ha abortado y los datos están listos
            }

        } catch (error) {
            if (error instanceof Error && error.name === 'AbortError') {
                console.log("Operaciones fetch en fetchInitialData canceladas.");
            } else {
                console.error("Error de red al obtener datos iniciales (perfil/resumen/contador):", error);
                if (!signal.aborted) {
                    setAppError(null, "Error de red al cargar datos iniciales.");
                    setTotalPreviousSessions(0); // Asumir 0 en caso de error de red
                    prepareInitialGreeting(); // Intentar preparar saludo con datos por defecto
                }
            }
        }
    };

    // Solo llamar a fetchInitialData si las dependencias clave (userProfile, initialContext, totalPreviousSessions) son null/undefined
    // Esto es para evitar recargar si el efecto se dispara por otra razón (ej. cambio en setAppError)
    // y los datos ya existen. Las dependencias del useEffect ya controlan cuándo se vuelve a ejecutar.
    // El estado inicial de estas variables es null/undefined.
    if (userProfile === null || initialContext === null || totalPreviousSessions === null) {
        fetchInitialData();
    } else {
        // Si los datos ya están, pero el efecto se disparó (ej. por cambio en `authStatus` a `authenticated`
        // y las otras condiciones de guarda iniciales se cumplen),
        // simplemente preparar el saludo con los datos existentes.
        console.log("Datos iniciales ya existen, preparando saludo directamente.");
        prepareInitialGreeting();
    }

    return () => {
      console.log("Limpiando efecto de datos iniciales y saludo.");
      controller.abort();
    };
    // Dependencias: authStatus (para saber si está autenticado),
    // isReadyToStart, conversationActive, messages.length (para las guardas iniciales),
    // setAppError (usado en catch),
    // Y las variables que fetchInitialData y prepareInitialGreeting leen para determinar su comportamiento:
    // session?.user?.name (leído en prepareInitialGreeting),
    // userProfile (leído en prepareInitialGreeting, y condición para fetch),
    // initialContext (leído en prepareInitialGreeting, y condición para fetch),
    // totalPreviousSessions (leído en prepareInitialGreeting, y condición para fetch).
    // Las funciones setState (setUserProfile, setInitialContext, setTotalPreviousSessions, setGreetingMessageId, setMessages)
    // son estables y no necesitan estar en el array.
  }, [authStatus, isReadyToStart, conversationActive, messages.length, setAppError, session?.user?.name, userProfile, initialContext, totalPreviousSessions]);

  const { room, connect: connectToLiveKit, disconnect: disconnectFromLiveKit } = useLiveKitRoom({
    token: liveKitToken,
    serverUrl: process.env.NEXT_PUBLIC_LIVEKIT_WS_URL,
    onConnected: () => {
      console.log("Conectado a LiveKit exitosamente.");
      setConnectionState(LiveKitConnectionState.Connected);
      setAppError('livekit', null);
      showNotification("Conectado a la sala de voz", "success");
      
      if (conversationActive && roomRef.current?.localParticipant) {
        roomRef.current.localParticipant.setMicrophoneEnabled(true);
        setIsListening(true);
        console.log("Micrófono reactivado al reconectar con conversación activa.");
      }
    },
    onDisconnected: () => {
      console.log("Desconectado de LiveKit.");
      setConnectionState(LiveKitConnectionState.Disconnected);
      showNotification("Desconectado de la sala de voz", "warning");
    },
    onError: (err: Error) => {
      console.error("Error de LiveKit Room:", err);
      setAppError('livekit', `Error de LiveKit: ${err.message}`);
      setConnectionState(LiveKitConnectionState.Disconnected);
    },
    onTrackSubscribed: handleTrackSubscribed,
    onTrackUnsubscribed: handleTrackUnsubscribed,
    onDataReceived: (payload, participant, kind, topic, room) => {
      if (kind === DataPacket_Kind.RELIABLE && participant && participant.identity === AGENT_IDENTITY) {
        try {
          const event = JSON.parse(new TextDecoder().decode(payload));
          switch (event.type) {
            case 'initial_greeting_message':
              if (event.payload && event.payload.text) {
                const greetingMsg: Message = {
                  id: event.payload.id || `greeting-${Date.now()}`,
                  text: event.payload.text,
                  isUser: false,
                  timestamp: new Date().toLocaleTimeString('es-ES', { hour: 'numeric', minute: 'numeric', hour12: true }),
                };
                setMessages([greetingMsg]);
                setGreetingMessageId(greetingMsg.id);
              }
              break;
            case 'user_transcription_result':
              if (event.payload && event.payload.transcript) {
                const userMessage: Message = { id: `user-${Date.now()}`, text: event.payload.transcript, isUser: true, timestamp: new Date().toLocaleTimeString('es-ES', { hour: 'numeric', minute: 'numeric', hour12: true }) };
                setMessages(prev => [...prev, userMessage]);
              }
              break;
            case 'ai_response_generated':
              if (event.payload && event.payload.text) {
                const aiMessage: Message = { 
                    id: event.payload.id || `ai-${Date.now()}`, 
                    text: event.payload.text, 
                    isUser: false, 
                    timestamp: new Date().toLocaleTimeString('es-ES', { hour: 'numeric', minute: 'numeric', hour12: true }), 
                    suggestedVideo: event.payload.suggestedVideo || undefined 
                };
                setMessages(prev => [...prev, aiMessage]);
                setIsThinking(false);
              }
              break;
            case 'tts_started':
              if (event.payload && event.payload.messageId) {
                setCurrentSpeakingId(event.payload.messageId);
                setIsSpeaking(true);
                setIsThinking(false);
                if (event.payload.messageId === greetingMessageId && !conversationActive) {
                  setIsReadyToStart(true);
                }
              }
              break;
            case 'tts_ended':
              if (event.payload && event.payload.messageId) {
                if (currentSpeakingId === event.payload.messageId) {
                  setIsSpeaking(false);
                  setCurrentSpeakingId(null);
                  if (event.payload.isClosing) {
                    endSession(); 
                  }
                }
              }
              break;
            case 'session_should_end_signal':
               endSession(); 
               break;
            default:
          }
        } catch (e) {
          console.error("[VCContainer] Error procesando DataChannel del agente Maria:", e);
          setAppError('agent', 'Error procesando datos del agente.');
        }
      }
    },
    onConnectionStateChanged: (state: LiveKitConnectionState) => {
      console.log("Estado de conexión de LiveKit cambiado a:", state);
      setConnectionState(state);
      if (state === LiveKitConnectionState.Failed) {
        setAppError('livekit', "Falló la conexión a LiveKit.");
      }
    },
    onParticipantDisconnected: handleParticipantDisconnected,
  });

  useEffect(() => {
    roomRef.current = room;
  }, [room]);

  useEffect(() => {
    if (authStatus === "authenticated" && session?.user?.name && !liveKitToken && !roomRef.current && connectionState === LiveKitConnectionState.Disconnected) {
      console.log("Usuario autenticado, intentando conectar a LiveKit...");
      initializeConnection();
    }
  }, [authStatus, session, liveKitToken, initializeConnection, connectionState, session?.user?.name]);

  // Hook para Push-to-Talk
  usePushToTalk({
    isListening,
    isProcessing,
    isSpeaking,
    isThinking,
    conversationActive,
    isSessionClosed,
    onStartListening: handleStartListening,
    onStopListening: handleStopListening,
    setIsPushToTalkActive,
  });

  // useEffect para scroll automático en el chat
  useEffect(() => {
    if (chatEndRef.current) {
        chatEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const handleSessionTimeout = useCallback(() => {
    endSession(false);
    showNotification("La sesión ha finalizado debido a inactividad.", "warning", 5000);
    setIsTimeRunningOutState(false);
  }, [endSession, showNotification]);

  const handleSessionWarning = useCallback(() => {
    showNotification("La sesión finalizará pronto debido a inactividad.", "warning", 5000);
    setIsTimeRunningOutState(true);
  }, [showNotification]);

  const { isTimeRunningOut } = useSessionTimeout({
    conversationActive,
    sessionStartTime,
    isSessionClosed,
    onTimeout: handleSessionTimeout,
    onWarning: handleSessionWarning,
  });

  useEffect(() => {
    setIsTimeRunningOutState(isTimeRunningOut);
  }, [isTimeRunningOut]);

  // useEffect para la fuente de video
   useEffect(() => {
        if (videoRef.current && !isTavusVideoActive) { 
            const newSrc = '/videos/mute.mp4'; 
            const currentBaseSrc = videoRef.current.currentSrc.substring(videoRef.current.currentSrc.lastIndexOf('/') + 1);
            if (currentBaseSrc !== 'mute.mp4') {
                videoRef.current.src = newSrc;
                videoRef.current.load(); 
                videoRef.current.play().catch(e => {
                    if (e.name !== 'AbortError') {
                        console.error("Error playing video:", e);
                    }
                });
            }
        }
    }, [isTavusVideoActive]);

  // Limpia el error de la UI cuando el componente se desmonta o el error cambia
  useEffect(() => {
    return () => {
      if (appError && appError.message) {
        // No limpiar si es un error persistente o si se navega fuera
      }
    };
  }, [appError, clearError]);

  // Limpiar el error de la UI
  const handleClearError = useCallback(() => {
    clearError();
  }, []);

  // Conexión inicial y obtención de token al montar y cuando el usuario está autenticado
  useEffect(() => {
    const controller = new AbortController();
    const { signal } = controller;

    const initializeConnection = async () => {
      if (authStatus === 'authenticated' && session?.user?.id && userProfile !== undefined && initialContext !== undefined && !liveKitToken && connectionState === LiveKitConnectionState.Disconnected) {
        const participantIdentifier = session.user.id;
        const participantDisplayName = userProfile?.username || session.user.name || 'Usuario Invitado';
        await getLiveKitToken(`${participantDisplayName}_${participantIdentifier.substring(0,8)}`, signal);
      }
    };

    initializeConnection();

    return () => {
      controller.abort();
      // Limpieza adicional si es necesario cuando el componente se desmonta o las dependencias cambian
      if (authStatus !== 'authenticated') {
        // Quizás resetear liveKitToken u otros estados si el usuario cierra sesión
        setLiveKitToken(null); 
        // Podrías querer llamar a endSession() aquí si la sesión debe terminar al cerrar sesión.
      }
    };
  }, [authStatus, session?.user?.id, session?.user?.name, userProfile, initialContext, getLiveKitToken, liveKitToken, connectionState]);

  // Refactor: Efecto para preparar el saludo inicial
  useEffect(() => {
    // No ejecutar si no está autenticado, o si la conversación ya está activa/lista, o si ya hay mensajes (saludo previo)
    if (authStatus !== 'authenticated' || isReadyToStart || conversationActive || messages.length > 0) {
      // Si las condiciones iniciales no se cumplen, asegurarse de que no haya un saludo pendiente si se vuelve a este estado.
      // Esto es una heurística, podría necesitar más lógica si el flujo es complejo.
      if (messages.length > 0 && messages[0].id.startsWith('greeting-') && !isReadyToStart && !conversationActive) {
        // No hacer nada aquí explícitamente, la condición de arriba previene la re-ejecución
      }
      return;
    }
    console.log("Ejecutando useEffect para preparar saludo inicial y cargar datos...");

    const controller = new AbortController();
    const { signal } = controller;

    const prepareInitialGreeting = () => {
        let initialGreetingText = "";
        let personalizedLog = false;

        if (totalPreviousSessions === null || totalPreviousSessions === 0) {
             initialGreetingText = "Hola";
             let firstName = "";
             if (userProfile?.username) {
                 firstName = userProfile.username.split(' ')[0];
             } else if (session?.user?.name) {
                  firstName = session.user.name.split(' ')[0];
             }
             if (firstName) {
                 initialGreetingText += `, ${firstName}`;
             }
             initialGreetingText += ". Soy María. Estoy aquí para escucharte y ofrecerte apoyo. ¿Cómo te sientes hoy?";
        } else {
            personalizedLog = true;
            let greeting = "Hola";
            let firstName = "";
            if (userProfile?.username) {
                firstName = userProfile.username.split(' ')[0];
            } else if (session?.user?.name) {
                 firstName = session.user.name.split(' ')[0];
            }
            if (firstName) {
                greeting += `, ${firstName}`;
            }
            greeting += ". Soy María.";

            if (initialContext) {
                let feelingMention = "que estabas lidiando con ansiedad";
                let situationMention = "";
                 if (initialContext.toLowerCase().includes('trabajo') || initialContext.toLowerCase().includes('laboral')){
                     situationMention = " relacionada con preocupaciones laborales";
                } else if (initialContext.toLowerCase().includes('reuniones')) {
                     situationMention = " relacionada con las reuniones";
                } else if (initialContext.toLowerCase().includes('impostor')) {
                     situationMention = " y sentimientos asociados al síndrome del impostor";
                }
                if (situationMention) {
                    feelingMention += situationMention;
                }

                let techniquesMention = "";
                const techniques = [];
                if (initialContext.toLowerCase().includes('grounding') || initialContext.toLowerCase().includes('5-4-3-2-1')) techniques.push('la técnica de grounding 5-4-3-2-1');
                if (initialContext.toLowerCase().includes('respiración') || initialContext.toLowerCase().includes('4-7-8')) techniques.push('ejercicios de respiración 4-7-8');
                if (initialContext.toLowerCase().includes('mindfulness')) techniques.push('mindfulness');
                if(techniques.length > 0){
                     let techniquesString = techniques.join(techniques.length > 2 ? ', ' : ' y ');
                     if (techniques.length > 2) {
                        const lastCommaIndex = techniquesString.lastIndexOf(', ');
                        techniquesString = techniquesString.substring(0, lastCommaIndex) + ' y ' + techniquesString.substring(lastCommaIndex + 2);
                     }
                    techniquesMention = ` y terminamos explorando ${techniquesString} para ayudarte`;
                }

                greeting += ` En nuestra sesión anterior me comentaste ${feelingMention}${techniquesMention}.`;
                greeting += ` Cuéntame, ¿te sirvió ${techniques.length > 0 ? 'lo que exploramos' : 'hablar de ello'} y cómo has seguido con esas sensaciones?`;
            } else {
                 greeting += " Qué bueno tenerte de vuelta. ¿Cómo te has sentido desde nuestra última conversación?";
            }
            initialGreetingText = greeting;
        }

        const msgId = `greeting-${Date.now()}`;
        setGreetingMessageId(msgId);

        const initialMessage: Message = {
            id: msgId,
            text: initialGreetingText,
            isUser: false,
            timestamp: new Date().toLocaleTimeString('es-ES', { hour: 'numeric', minute: 'numeric', hour12: true }),
        };
        setMessages([initialMessage]);
        console.log(`Generando audio para saludo inicial ${personalizedLog ? 'PERSONALIZADO' : '(Primera Sesión)'} (sin reproducir)...`);
    };
    
    const fetchInitialData = async () => {
        // Resetear solo si no tenemos datos, para evitar blanquear si es la primera carga real
        // y totalPreviousSessions ya tenía un valor de una ejecución previa del efecto.
        // La lógica de dependencias debería prevenir esto, pero es una salvaguarda.
        if (totalPreviousSessions === null) {
            setTotalPreviousSessions(null); // Mantiene el spinner si es la primera carga real
        }
        try {
            console.log("Fetching initial data (profile, summary, and session count) with signal:", signal.aborted);
            const [profileRes, summaryRes, historyRes] = await Promise.all([
                fetch('/api/profile', { signal }),
                fetch('/api/sessions/latest-summary', { signal }),
                fetch('/api/chat-sessions/history?page=1&pageSize=1', { signal })
            ]);

            // Solo procesar si la señal no ha sido abortada
            if (signal.aborted) {
                console.log("fetchInitialData abortado después de Promise.all");
                return;
            }

            if (profileRes.ok) {
                const profileData: UserProfile = await profileRes.json();
                if (!signal.aborted) setUserProfile(profileData);
                 console.log("Perfil de usuario cargado:", profileData.username);
            } else {
                 console.warn(`Error al cargar el perfil: ${profileRes.status}`);
                 if (!signal.aborted) setUserProfile(null);
            }

            if (summaryRes.ok) {
                const summaryData = await summaryRes.json();
                if (!signal.aborted) setInitialContext(summaryData.summary);
                console.log(`Resumen de sesión anterior cargado: ${summaryData.summary ? summaryData.summary.substring(0, 50) + '...' : 'Ninguno'}`);
            } else {
                 console.warn(`Error al cargar resumen anterior: ${summaryRes.status}`);
                 if (!signal.aborted) setInitialContext(null);
            }

            if (historyRes.ok) {
                const historyData: { data: any[]; pagination: HistoryPagination } = await historyRes.json();
                if (!signal.aborted) setTotalPreviousSessions(historyData.pagination.totalItems);
                 console.log(`Total de sesiones previas cargado: ${historyData.pagination.totalItems}`);
            } else {
                 console.warn(`Error al cargar contador de sesiones: ${historyRes.status}`);
                 if (!signal.aborted) setTotalPreviousSessions(0); // Asumir 0 si falla la carga
            }
            
            if (!signal.aborted) {
              prepareInitialGreeting(); // Llamar solo si no se ha abortado y los datos están listos
            }

        } catch (error) {
            if (error instanceof Error && error.name === 'AbortError') {
                console.log("Operaciones fetch en fetchInitialData canceladas.");
            } else {
                console.error("Error de red al obtener datos iniciales (perfil/resumen/contador):", error);
                if (!signal.aborted) {
                    setAppError(null, "Error de red al cargar datos iniciales.");
                    setTotalPreviousSessions(0); // Asumir 0 en caso de error de red
                    prepareInitialGreeting(); // Intentar preparar saludo con datos por defecto
                }
            }
        }
    };

    // Solo llamar a fetchInitialData si las dependencias clave (userProfile, initialContext, totalPreviousSessions) son null/undefined
    // Esto es para evitar recargar si el efecto se dispara por otra razón (ej. cambio en setAppError)
    // y los datos ya existen. Las dependencias del useEffect ya controlan cuándo se vuelve a ejecutar.
    // El estado inicial de estas variables es null/undefined.
    if (userProfile === null || initialContext === null || totalPreviousSessions === null) {
        fetchInitialData();
    } else {
        // Si los datos ya están, pero el efecto se disparó (ej. por cambio en `authStatus` a `authenticated`
        // y las otras condiciones de guarda iniciales se cumplen),
        // simplemente preparar el saludo con los datos existentes.
        console.log("Datos iniciales ya existen, preparando saludo directamente.");
        prepareInitialGreeting();
    }

    return () => {
      console.log("Limpiando efecto de datos iniciales y saludo.");
      controller.abort();
    };
    // Dependencias: authStatus (para saber si está autenticado),
    // isReadyToStart, conversationActive, messages.length (para las guardas iniciales),
    // setAppError (usado en catch),
    // Y las variables que fetchInitialData y prepareInitialGreeting leen para determinar su comportamiento:
    // session?.user?.name (leído en prepareInitialGreeting),
    // userProfile (leído en prepareInitialGreeting, y condición para fetch),
    // initialContext (leído en prepareInitialGreeting, y condición para fetch),
    // totalPreviousSessions (leído en prepareInitialGreeting, y condición para fetch).
    // Las funciones setState (setUserProfile, setInitialContext, setTotalPreviousSessions, setGreetingMessageId, setMessages)
    // son estables y no necesitan estar en el array.
  }, [authStatus, isReadyToStart, conversationActive, messages.length, setAppError, session?.user?.name, userProfile, initialContext, totalPreviousSessions]);

  // --- Renderizado ---
  return (
    <div className="relative flex flex-1 h-[calc(100vh-64px)] bg-neutral-100 dark:bg-neutral-900 overflow-hidden">

      {/* Display de Errores (Banner Superior) - ELIMINADO */}
      {/* 
      {appError.message && (
        <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-[64px] left-1/2 transform -translate-x-1/2 z-50 w-full max-w-lg p-3 bg-red-100 dark:bg-red-900/90 border-b border-red-300 dark:border-red-700 shadow-md flex items-center justify-between"
        >
          <div className="flex items-center">
            <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-300 mr-2 flex-shrink-0" />
            <span className="text-sm text-red-800 dark:text-red-200">
              {appError.type === 'livekit' && "Error de conexión de audio/video. "}
              {appError.type === 'stt' && "No se pudo transcribir tu voz. "}
              {appError.type === 'tts' && "Fallo al reproducir la respuesta. "}
              {appError.type === 'openai' && "Error del asistente IA. "}
              {appError.type === 'agent' && "Error interno del agente. "}
              {appError.message}
            </span>
          </div>
          <button 
            onClick={clearError} 
            className="ml-3 text-red-500 dark:text-red-400 hover:text-red-700 dark:hover:text-red-200 p-1 rounded-full focus:outline-none focus:ring-1 focus:ring-red-500"
            aria-label="Cerrar error"
            >
             <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </motion.div>
      )}
      */}

      {/* << NUEVO: Botón unificado para toggle, posicionado absolutamente >> */}
      {conversationActive && (
          <button
              onClick={toggleChatVisibility}
              className={`absolute top-1/2 transform -translate-y-1/2 z-30 p-2 bg-neutral-200 dark:bg-neutral-700 rounded-full shadow-md hover:bg-neutral-300 dark:hover:bg-neutral-600 transition-all duration-300 ease-in-out ${
                  isChatVisible 
                      ? 'left-[calc(33.33%-28px)] md:left-[calc(33.33%-28px)]' // Ajustar el offset (-28px) para que no tape el borde
                      : 'left-4' // Posición cuando el chat está oculto
              }`}
              aria-label={isChatVisible ? "Ocultar chat" : "Mostrar chat"}
              style={{ transform: 'translateY(-50%)' }} // Asegurar centrado vertical
          >
              {isChatVisible ? (
                  <ChevronsLeft className="h-5 w-5 text-neutral-700 dark:text-neutral-200" />
              ) : (
                  <ChevronsRight className="h-5 w-5 text-neutral-700 dark:text-neutral-200" />
              )}
          </button>
      )}

      {/* Panel de Chat (Izquierda) */}
      <AnimatePresence>
        {isChatVisible && (
            <motion.div
              key="chat-panel"
              initial={{ x: '-100%', opacity: 0 }}
              animate={{ x: '0%', opacity: 1 }}
              exit={{ x: '-100%', opacity: 0 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="w-full md:w-1/3 flex flex-col h-full bg-neutral-100 dark:bg-neutral-900 border-r border-neutral-200 dark:border-neutral-700"
            >
              {/* Área de Mensajes */}
              <ChatPanel 
                messages={messages}
                isThinking={isThinking}
                currentSpeakingId={currentSpeakingId}
                userProfile={userProfile}
                sessionUserImage={session?.user?.image}
                chatContainerRef={chatContainerRef}
                chatEndRef={chatEndRef}
                authStatus={authStatus}
                totalPreviousSessions={totalPreviousSessions}
                initialContext={initialContext}
              />

              {/* Área de Input (Texto y Micrófono) */}
              <ChatInput
                textInput={textInput}
                setTextInput={setTextInput}
                handleSendTextMessage={handleSendTextMessage}
                handleStartListening={handleStartListening}
                handleStopListening={handleStopListening}
                isListening={isListening}
                isProcessing={isProcessing}
                isSpeaking={isSpeaking}
                isThinking={isThinking}
                isSessionClosed={isSessionClosed}
                conversationActive={conversationActive}
                isPushToTalkActive={isPushToTalkActive}
                textAreaRef={textAreaRef}
              />
            </motion.div>
        )}
      </AnimatePresence>

      {/* Panel de Video (Derecha) */}
      <div className={`relative flex flex-col items-center justify-center flex-1 h-full bg-white dark:bg-neutral-800 transition-all duration-300 ease-in-out p-4 md:p-6 ${isChatVisible ? 'md:w-2/3' : 'w-full'}`}>
        <div id="video-container" className="relative w-full h-full rounded-lg overflow-hidden shadow-lg bg-black"> 
          {!isTavusVideoActive && (
            <video
              ref={videoRef}
              key={isSpeaking ? 'speaking-fallback' : 'idle-fallback'}
              autoPlay
              loop
              muted
              playsInline
              className={`w-full h-full transition-all duration-300 ease-in-out ${isChatVisible || !conversationActive ? 'object-cover' : 'object-contain'}`}
            >
              Tu navegador no soporta el elemento de video. 
            </video>
          )}
          
          <div className="absolute bottom-4 left-4 flex items-center space-x-2 bg-black/50 text-white px-3 py-1 rounded-full text-xs">
             {isListening ? <><Mic className="h-3 w-3 text-red-400 animate-pulse" /><span>Escuchando...</span></> :
              isProcessing ? <><Loader2 className="h-3 w-3 animate-spin" /><span>Procesando...</span></> :
              isSpeaking ? <><svg className="h-3 w-3 text-blue-400" fill="currentColor" viewBox="0 0 16 16"><path d="M11.536 14.01A8.47 8.47 0 0 0 14.026 8a8.47 8.47 0 0 0-2.49-6.01l-1.088.92A6.479 6.479 0 0 1 12.025 8a6.48 6.48 0 0 1-1.578 4.09zM10.036 12.01A6.48 6.48 0 0 0 12.025 8a6.48 6.48 0 0 0-1.99-4.01l-1.088.92A4.486 4.486 0 0 1 10.025 8a4.486 4.486 0 0 1-1.088 3.09zM8 13a5 5 0 0 0 5-5V3a5 5 0 0 0-10 0v5a5 5 0 0 0 5 5m-3.5-5a3.5 3.5 0 1 1 7 0V3a3.5 3.5 0 1 1-7 0z"/></svg><span>Hablando...</span></> :
              isThinking ? <><Loader2 className="h-3 w-3 animate-spin" /><span>Pensando...</span></> :
              isSessionClosed ? <><svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg><span>Finalizada</span></> :
              conversationActive ? <><svg className="h-3 w-3 text-green-400" fill="currentColor" viewBox="0 0 16 16"><circle cx="8" cy="8" r="8"/></svg><span>Activa</span></> : 
              <><svg className="h-3 w-3 text-gray-400" fill="currentColor" viewBox="0 0 16 16"><circle cx="8" cy="8" r="8"/></svg><span>Inactiva</span></> 
             }
           </div>
        </div>
      </div>

      {!isChatVisible && conversationActive && !isSessionClosed && (
          <div className={`absolute bottom-0 left-0 right-0 z-20 bg-gradient-to-t from-black/70 via-black/50 to-transparent pb-4 pt-12 pointer-events-none`}>
             <div className={`mx-auto px-4 max-w-md pointer-events-auto`}>
                <div className={`p-4 rounded-t-lg bg-transparent flex justify-center`}> 
                    <button 
                    type="button"
                    onClick={isListening ? handleStopListening : handleStartListening} 
                    disabled={isProcessing || isSpeaking || isThinking} 
                    className={`w-14 h-14 rounded-full flex items-center justify-center transition-all duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-neutral-900 shadow-lg ${ 
                        isListening
                        ? 'bg-red-500 hover:bg-red-600 text-white focus:ring-red-400 scale-110' 
                        : 'bg-primary-600 hover:bg-primary-700 text-white focus:ring-primary-500'
                    } ${
                        (isPushToTalkActive) ? 'ring-4 ring-offset-0 ring-green-400 scale-110' : '' 
                    } ${
                        (isProcessing || isSpeaking || isThinking) ? 'opacity-60 cursor-not-allowed' : ''
                    }`}
                    aria-label={isListening ? "Detener micrófono" : "Activar micrófono"}
                    >
                    {isProcessing ? <Loader2 className="h-6 w-6 animate-spin" /> : <Mic className="h-6 w-6" />}
                    </button>
                 </div>
                 <p className={`text-xs mt-1 text-center text-neutral-200 drop-shadow-sm pointer-events-none`}>
                        Mantén [Espacio] para hablar.
                    </p>
             </div>
          </div>
      )}

      {!conversationActive && (
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-black/50 backdrop-blur-md text-white">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="text-center p-8"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Bienvenido
              {authStatus === 'authenticated' && (userProfile?.username || session?.user?.name) && (
                 <motion.span 
                   initial={{ opacity: 0, x: -10 }}
                   animate={{ opacity: 1, x: 0 }}
                   transition={{ delay: 0.3, duration: 0.5 }}
                   className="ml-2"
                 >
                   , {userProfile?.username || session?.user?.name}
                 </motion.span>
               )}
            </h2> 
            
            {(authStatus === 'loading' || !isReadyToStart) && authStatus !== 'unauthenticated' && (
              <div className="mt-4 text-center">
                <Loader2 className="h-8 w-8 mb-4 mx-auto animate-spin text-primary-400" />
                <p className="text-neutral-300">{authStatus === 'loading' ? 'Cargando datos de sesión...' : 'Preparando IA...'}</p>
              </div>
            )}
            
            {authStatus === 'authenticated' && (
               <button
                 onClick={handleStartConversation}
                 disabled={!isReadyToStart || isSessionClosed || connectionState === LiveKitConnectionState.Connecting}
                 className="button-glow mt-8 inline-flex items-center justify-center whitespace-nowrap rounded-md text-lg font-semibold ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 h-11 px-8 shadow-soft hover:shadow-soft-lg transform hover:-translate-y-1 bg-primary-600 hover:bg-primary-700 text-white disabled:opacity-50 disabled:cursor-not-allowed"
               >
                 {connectionState === LiveKitConnectionState.Connecting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Conectando...</> :
                  !isReadyToStart ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Preparando IA...</> : 
                  'Comenzar tu sesión'}
                </button>
            )}
             {authStatus === 'unauthenticated' && (
                <div className="mt-6 text-center">
                    <AlertCircle className="h-8 w-8 mb-4 mx-auto text-yellow-400" />
                    <p className="text-neutral-300">Debes iniciar sesión para comenzar.</p>
                 </div>
             )}
          </motion.div>
        </div>
      )}

      <NotificationDisplay notification={notification} />
      <ErrorDisplay error={appError} onClose={clearError} />

    </div>
  );
}

export default VoiceChatContainer;