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
    Track 
} from 'livekit-client';
import TranscribedResponse from './TranscribedResponse';
import { Send, AlertCircle, Mic, ChevronsLeft, ChevronsRight, MessageSquare, Loader2, Terminal, Calendar, Clock } from 'lucide-react';
import ThinkingIndicator from './ThinkingIndicator';
import { useSession } from 'next-auth/react';
import Link from 'next/link'; // Import Link from next/link
import type { UserProfile } from '@/types/profile'; // Assuming types/profile.ts exists
import type { ChatSession } from '@prisma/client'; // Import ChatSession type
import { Button } from '@/components/ui/button'; // Import Button from @/components/ui/button

// Definir constante para la longitud del historial (debe coincidir con backend)
const HISTORY_LENGTH = 12;

// << NUEVO: Frases clave para detectar el cierre de sesión por parte de María >>
const CLOSING_PHRASES = [
  "ha sido un placer hablar contigo",
  "espero que esto te sea útil",
  "cuídate mucho",
  "que tengas un buen día",
  "sesión finalizada", // Añadir por si acaso
  "hasta la próxima",
  "espero haberte podido ayudar hoy"
];

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: string;
  suggestedVideo?: { title: string; url: string }; // << NUEVO: Campo opcional para video
}

// Nuevo estado para la conexión de LiveKit y Errores
type ConnectionState = 'disconnected' | 'connecting' | 'connected' | 'error';
type AppError = { type: 'livekit' | 'openai' | 'stt' | 'tts' | null; message: string | null };

// Nuevo componente para mostrar errores
const ErrorDisplay: React.FC<{ error: AppError; onClose: () => void }> = ({ error, onClose }) => {
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

// Interfaz Profile (asegúrate que exista o defínela)
interface Profile {
  username: string | null;
  avatarUrl: string | null;
  // ...otras props si las necesitas
}

// << NUEVO: Interfaz para metadata de paginación del historial >>
interface HistoryPagination {
    totalItems: number;
    totalPages: number;
    currentPage: number;
    pageSize: number;
}

// << CORREGIDO: Definición del componente como función estándar >>
function VoiceChatContainer() {
  const { data: session, status: authStatus } = useSession(); // << NUEVO: Obtener sesión y estado de autenticación
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false); // Para llamadas a OpenAI
  const [isSpeaking, setIsSpeaking] = useState(false); // << NUEVO: Para audio de OpenAI TTS
  const [currentSpeakingId, setCurrentSpeakingId] = useState<string | null>(null);
  const [textInput, setTextInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [connectionState, setConnectionState] = useState<ConnectionState>('disconnected');
  const [liveKitToken, setLiveKitToken] = useState<string | null>(null);
  const [appError, setAppError] = useState<AppError>({ type: null, message: null }); // <<< Estado para errores
  const [initialAudioUrl, setInitialAudioUrl] = useState<string | null>(null); // << NUEVO: Guardar URL saludo
  const [greetingMessageId, setGreetingMessageId] = useState<string | null>(null); // << NUEVO: Guardar ID saludo
  const [isReadyToStart, setIsReadyToStart] = useState(false); // << NUEVO: Estado para indicar si el saludo está listo
  const [conversationActive, setConversationActive] = useState(false); // << NUEVO: Estado para overlay
  // << NUEVO: Estado para saber si la escucha fue iniciada por Push-to-Talk >>
  const [isPushToTalkActive, setIsPushToTalkActive] = useState(false);
  // << NUEVO: Estado para visibilidad del chat >>
  const [isChatVisible, setIsChatVisible] = useState(true);
  // << NUEVO: Estado para la hora de inicio de la sesión >>
  const [sessionStartTime, setSessionStartTime] = useState<number | null>(null);
  // << NUEVO: Estado para controlar la introducción del flujo >>
  const [isFirstInteraction, setIsFirstInteraction] = useState(true);
  // << NUEVO: Estado para controlar si la sesión ha finalizado >>
  const [isSessionClosed, setIsSessionClosed] = useState(false);
  // << NUEVO: Estado para indicar María está "pensando" (OpenAI + TTS) >>
  const [isThinking, setIsThinking] = useState(false);
  // << NUEVO: Estado para almacenar temporalmente el mensaje de la IA >>
  const [pendingAiMessage, setPendingAiMessage] = useState<Message | null>(null); // << USAR ESTE ESTADO >>
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null); // << NUEVO: Estado para ID de sesión activa en BD
  const [initialContext, setInitialContext] = useState<string | null>(null); // << NUEVO: Estado para resumen previo
  const [userProfile, setUserProfile] = useState<Profile | null>(null); // << NUEVO: Estado para perfil de usuario
  const [totalPreviousSessions, setTotalPreviousSessions] = useState<number | null>(null); // << NUEVO: Contador total sesiones
  // << NUEVO: Estado para indicar que el tiempo se está acabando >>
  const [isTimeRunningOut, setIsTimeRunningOut] = useState(false); 
  
  const roomRef = useRef<Room | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null); // << NUEVO: Ref para MediaRecorder
  const audioChunksRef = useRef<Blob[]>([]); // << NUEVO: Ref para almacenar chunks de audio
  const audioStreamRef = useRef<MediaStream | null>(null); // << NUEVO: Ref para el stream del mic
  const audioRef = useRef<HTMLAudioElement | null>(null); // << NUEVO: Ref para el elemento <audio>
  const chatEndRef = useRef<HTMLDivElement>(null); // Para scroll automático (se mantiene por si acaso, pero no se usará para scroll)
  // << NUEVO: Ref para el contenedor scrollable del chat >>
  const chatContainerRef = useRef<HTMLDivElement>(null);
  
  // << NUEVO: Referencia para el video >>
  const videoRef = useRef<HTMLVideoElement>(null);
  // << NUEVO: Ref para el textarea para comprobar el foco >>
  const textAreaRef = useRef<HTMLTextAreaElement>(null);
  
  // << NUEVO: Efecto para hacer scroll automático en el chat >>
  useEffect(() => {
    // Usar setTimeout para asegurar que el DOM se actualice antes de calcular scrollHeight
    const timer = setTimeout(() => {
      if (chatContainerRef.current) { // Verificar nulidad aquí también
        chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
      }
    }, 0); // Retraso 0 para ejecutar después del render actual
    
    // Limpiar el timeout si el componente se desmonta o las dependencias cambian
    return () => clearTimeout(timer);
  }, [messages, isThinking]); // Se activa cuando cambian los mensajes o el estado de "pensando"
  
  // Función para limpiar errores
  const clearError = () => setAppError({ type: null, message: null });

  // << NUEVO: Función para alternar visibilidad del chat >>
  const toggleChatVisibility = () => {
      setIsChatVisible(prev => !prev);
  };
  
  // <<< INICIO: Funciones Manejadoras de Pistas de Audio >>>
  const handleTrackSubscribed = (track: RemoteTrack, publication: RemoteTrackPublication, participant: RemoteParticipant) => {
    if (!roomRef.current || participant.identity === roomRef.current.localParticipant.identity || track.kind !== Track.Kind.Audio) {
       console.log(`Ignorando pista: Local=${participant.identity === roomRef.current?.localParticipant.identity}, Kind=${track.kind}, Identity=${participant.identity}`);
      return;
    }
    const elementId = `audio-${participant.identity}-${track.sid}`;
    if (document.getElementById(elementId)) {
        console.log(`Audio element ${elementId} ya existe.`);
        return;
    }
    console.log(`Adjuntando pista de audio REMOTA de: ${participant.identity} (Track SID: ${track.sid})`);
    const audioElement = track.attach();
    audioElement.id = elementId;
    document.body.appendChild(audioElement);
  };

  const handleTrackUnsubscribed = (track: RemoteTrack, publication: RemoteTrackPublication, participant: RemoteParticipant) => {
    if (!roomRef.current || participant.identity === roomRef.current.localParticipant.identity || track.kind !== Track.Kind.Audio) {
      return;
    }
    const elementId = `audio-${participant.identity}-${track.sid}`;
    const audioElement = document.getElementById(elementId) as HTMLAudioElement | null;
    if (audioElement) {
      console.log(`Desadjuntando pista de audio de: ${participant.identity} (Track SID: ${track.sid})`);
      track.detach(audioElement);
      audioElement.remove();
    }
  };
  
  const handleParticipantDisconnected = (participant: RemoteParticipant) => {
      console.log(`Limpiando audios del participante desconectado: ${participant.identity}`);
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
      });
  };
  // <<< FIN: Funciones Manejadoras de Pistas de Audio >>>

  // --- Inicialización y Conexión a LiveKit ---
  
  // Función para obtener el token de LiveKit
  const getLiveKitToken = useCallback(async () => {
    clearError(); // Limpiar errores previos
    try {
      const roomName = 'ai-mental-health-chat'; 
      const participantName = `User_${Math.random().toString(36).substring(7)}`;
      
      const response = await fetch(`/api/livekit-token?room=${roomName}&participant=${participantName}`);
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({})); // Intenta obtener datos del error
        throw new Error(errorData.error || `Error del servidor al obtener token: ${response.statusText}`);
      }
      const data = await response.json();
      if (!data.token) throw new Error("Token no recibido del servidor."); // Validación extra
      setLiveKitToken(data.token);
      return data.token;
    } catch (error) {
      console.error("Error fetching LiveKit token:", error);
      setConnectionState('error');
      setAppError({ type: 'livekit', message: error instanceof Error ? error.message : 'Error desconocido al obtener token.' });
      return null;
    }
  }, []);
  
  // Conectar a la sala de LiveKit
  useEffect(() => {
    const connectToRoom = async (token: string) => { 
      if (connectionState !== 'connected') {
        setConnectionState('connecting');
        clearError();
        const room = new Room({
          adaptiveStream: true,
          dynacast: true,
          publishDefaults: {
            audioPreset: { maxBitrate: 32_000 },
            dtx: true,
          },
        });
        
        roomRef.current = room;
        
        room
          .on(RoomEvent.Connected, () => {
            console.log('Conectado a la sala LiveKit');
            setConnectionState('connected');
            clearError();
            console.log('Micrófono local NO habilitado automáticamente al conectar.');
          })
          .on(RoomEvent.Disconnected, (reason) => {
            console.log('Desconectado de la sala LiveKit:', reason);
            setConnectionState('disconnected');
            if (conversationActive) { 
            setAppError({ type: 'livekit', message: 'Desconectado del chat de voz.' });
            }
            roomRef.current = null;
          })
          .on(RoomEvent.TrackSubscribed, handleTrackSubscribed)
          .on(RoomEvent.TrackUnsubscribed, handleTrackUnsubscribed)
          .on(RoomEvent.ParticipantDisconnected, handleParticipantDisconnected);
          
        try {
          const livekitUrl = process.env.NEXT_PUBLIC_LIVEKIT_URL;
          if (!livekitUrl) {
             const errorMsg = "URL de LiveKit no configurada (Cliente).";
             console.error(errorMsg);
             setConnectionState('error');
             setAppError({ type: 'livekit', message: errorMsg });
             return; 
          }
          await room.connect(livekitUrl, token); 
        } catch (error) {
          console.error("Error al conectar con LiveKit:", error);
          setConnectionState('error');
          setAppError({ type: 'livekit', message: error instanceof Error ? error.message : 'Error desconocido al conectar.' });
        }
      }
    };
    
    const initializeConnection = async () => {
        if (!liveKitToken && connectionState === 'disconnected') {
            const token = await getLiveKitToken();
            if (token) { 
                connectToRoom(token);
            } else {
                 console.log("Fallo al obtener token de LiveKit, no se intentará conectar.");
            }
        }
    };

    initializeConnection();

    // <<< Modificar la función de limpieza >>>
    return () => {
      if (roomRef.current) {
        console.log("Cleanup de useEffect de LiveKit...");
        // Desadjuntar audios remotos ANTES de desconectar (esto está bien)
        roomRef.current.remoteParticipants.forEach(p => handleParticipantDisconnected(p));

        // Intentar desconectar solo si está conectado
        if (roomRef.current.state === 'connected') {
            console.log("Llamando a disconnect() desde cleanup del useEffect...");
            roomRef.current.disconnect(); // Dejar que el evento 'Disconnected' maneje la limpieza final de la ref
        } else {
             console.log("Cleanup de useEffect de LiveKit: Sala no existe (ref ya es null).");
        }
      } else {
        console.log("Cleanup de useEffect de LiveKit: Sala no existe (ref ya es null).");
      }
      // << Limpiar audio al desmontar >>
      if (audioRef.current) {
          audioRef.current.pause();
          audioRef.current.onended = null; // Remover listeners
          audioRef.current.onerror = null;
          audioRef.current = null;
      }
    };
  }, [getLiveKitToken, connectionState, liveKitToken]); // << MODIFICADO: Eliminar conversationActive de las dependencias >>

  // --- Funciones de Base de Datos (API Calls) ---
  const saveMessage = useCallback(async (message: Message) => {
    if (!activeSessionId) {
      console.warn("Intento de guardar mensaje sin sesión activa (API).");
      // Consider removing setAppError here, as it might be too noisy if it happens frequently
      // during initial setup before activeSessionId is set.
      // setAppError({ type: null, message: "Error interno: No hay sesión activa para guardar mensaje." });
      return; // Exit early if no active session
    }

    fetch('/api/messages', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        // << CORREGIDO: Enviar chatSessionId en lugar de sessionId >>
        chatSessionId: activeSessionId,
        sender: message.isUser ? 'user' : 'ai',
        content: message.text,
      }),
    })
    .then(async (res) => {
        if (!res.ok) {
          const errorData = await res.json().catch(()=>({}));
          console.error(`Error API guardando mensaje (${res.status}):`, errorData.error || res.statusText);
          setAppError({ type: null, message: "No se pudo guardar el mensaje. Tu progreso podría no registrarse." });
                } else {
            console.log(`Mensaje (${message.isUser ? 'user' : 'ai'}) guardado en sesión ${activeSessionId}.`);
        }
    })
    .catch(err => {
        console.error("Error de red al guardar mensaje:", err);
        setAppError({ type: null, message: "Error de conexión al guardar mensaje." });
    });

  }, [activeSessionId]);


  const endSession = useCallback(async () => {
    if (!activeSessionId) {
      console.warn("Intento de finalizar sesión sin ID activo (API).");
      return;
    }
    if (isSessionClosed) {
      console.log("La sesión ya está marcada como cerrada localmente.");
      return;
    }

    const sessionToEndId = activeSessionId;
    console.log(`Finalizando sesión ${sessionToEndId} vía API...`);

    // Mark as closed locally immediately for UI responsiveness
    setIsSessionClosed(true); 
    // Optionally reset other states like isListening, isProcessing etc. here if needed
    setIsListening(false);
    setIsProcessing(false);
    setIsSpeaking(false);
    setCurrentSpeakingId(null);
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
        mediaRecorderRef.current.stop();
    }
     if (audioRef.current) {
         audioRef.current.pause();
         audioRef.current = null;
     }
    
    // Reset session-specific states
    setActiveSessionId(null);
    setSessionStartTime(null);
    setIsFirstInteraction(true); // Reset for next session
    setPendingAiMessage(null); 
    
    // Make API call to mark session ended and trigger summary
    fetch(`/api/sessions/${sessionToEndId}`, {
      method: 'PUT',
    })
    .then(async (res) => {
      if (!res.ok) {
        const errorData = await res.json().catch(()=>({}));
        console.error(`Error API finalizando sesión ${sessionToEndId} (${res.status}):`, errorData.error || res.statusText);
        // Don't unset isSessionClosed here, keep UI closed
        setAppError({ type: null, message: "Error al finalizar y guardar la sesión en el servidor." });
            } else {
        console.log(`Sesión ${sessionToEndId} marcada como finalizada en BD.`);
        // Now trigger summary generation
        console.log(`Solicitando resumen para sesión ${sessionToEndId}...`);
        fetch('/api/summarize', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ chatSessionId: sessionToEndId }),
        })
        .then(async (summaryRes) => {
            if (!summaryRes.ok) {
              const errorData = await summaryRes.json().catch(()=>({}));
              console.error(`Error en la API de resumen (${summaryRes.status}):`, errorData.error || summaryRes.statusText);
              // Handle summary error - maybe log it, no need for user-facing error unless critical
            } else {
              const data = await summaryRes.json();
              console.log(`Resumen solicitado exitosamente para ${sessionToEndId}. Resumen: ${data.summary?.substring(0,50)}...`);
              // Update initialContext for potential next session *immediately*?
              // Maybe better to fetch it on next load/start. Let's rely on initial fetch for now.
              // setInitialContext(data.summary);
            }
        })
        .catch(err => {
            console.error("Error de red al solicitar resumen:", err);
             // Handle network error for summary
        });
      }
    })
    .catch(err => {
        console.error("Error de red al finalizar sesión:", err);
        // Don't unset isSessionClosed here
        setAppError({ type: null, message: "Error de conexión al finalizar la sesión." });
    });

  }, [activeSessionId, isSessionClosed]); // Dependencies for endSession

  // --- Procesamiento con OpenAI y Reproducción de Audio (TTS - OpenAI API) ---
  
  // Función para reproducir audio desde URL
  // << MODIFICADO: Acepta flag opcional para cierre >>
  const playAudio = useCallback((url: string, messageId: string, isClosingAudio = false) => {
    if (audioRef.current) {
      audioRef.current.pause(); // Detener audio anterior si existe
      audioRef.current.onended = null; // Limpiar listeners anteriores
      audioRef.current.onerror = null;
      audioRef.current = null; // Limpiar la referencia anterior
    }
    clearError(); // Limpiar errores previos de TTS
    const audio = new Audio(url);
    audioRef.current = audio;
    setCurrentSpeakingId(messageId);
    setIsSpeaking(true);
    // << NUEVO: Quitar thinking justo antes de reproducir >>
    setIsThinking(false);
    // NO establecer setIsThinking(false) aquí todavía

    // << MODIFICADO: Lógica onended para manejar cierre Y thinking >>
    audio.onended = () => {
      console.log("Audio terminado:", messageId);
      setIsSpeaking(false);
      setCurrentSpeakingId(null);
      // setIsThinking(false); // << ELIMINADO: Ya no se controla aquí >>
      audioRef.current = null; // Limpiar ref
      
      // If it was the closing audio, trigger the session end logic NOW
      if (isClosingAudio) {
        console.log("Audio de cierre finalizado. Finalizando sesión...");
        endSession(); // Call endSession after closing audio finishes
      } else {
         // If not closing audio, maybe enable listening again? Depends on flow.
         // For now, do nothing extra. User can click mic again.
      }
    };
    audio.onerror = (e) => {
      console.error("Error al reproducir audio:", url, e);
      setAppError({ type: 'tts', message: 'Error al reproducir el archivo de audio.' });
      setIsSpeaking(false);
      setCurrentSpeakingId(null);
      // setIsThinking(false); // << ELIMINADO: Ya no se controla aquí >>
      audioRef.current = null; // Limpiar ref
      // If closing audio playback fails, still force end the session
      if (isClosingAudio) {
          console.warn("Error al reproducir audio de cierre. Forzando finalización de sesión.");
          endSession(); // Call endSession even if closing audio fails to play
      }
    };
    audio.play().catch(e => { // Manejar error de autoplay
        console.error("Error al iniciar la reproducción:", e);
        const playErrorMessage = e.name === 'NotAllowedError' 
            ? 'No se pudo iniciar la reproducción del audio. Puede requerir interacción del usuario.'
            : 'Error al iniciar la reproducción del audio.';
        setAppError({ type: 'tts', message: playErrorMessage });
        setIsSpeaking(false);
        setCurrentSpeakingId(null);
        // setIsThinking(false); // << ELIMINADO: Ya no se controla aquí >>
        audioRef.current = null;
        // If play() fails for closing audio, still force end the session
        if (isClosingAudio) {
            console.warn("Error al iniciar reproducción de audio de cierre. Forzando finalización de sesión.");
            endSession(); // Call endSession if play() fails for closing audio
        }
    });
  }, [endSession]); // Mantener endSession dependency


  // Función para enviar mensaje a la API de OpenAI y luego a la API TTS
  const getOpenAIResponse = useCallback(async (userMessage: string) => {
    if (!activeSessionId) {
        console.error("Intento de llamar a OpenAI sin sesión activa.");
        setAppError({ type: 'openai', message: "Error: No se puede enviar mensaje sin sesión activa." });
        setIsThinking(false);
        return;
    }
    
    const timeRunningOutFlag = isTimeRunningOut; // Capture state before potential reset
    if (timeRunningOutFlag) {
        console.log("Enviando flag isTimeRunningOut=true a OpenAI");
        // Reset flag immediately after capturing it for the current request
        setIsTimeRunningOut(false); 
    }
    
    setIsThinking(true); // Indicate processing starts
    setIsProcessing(false); // Ensure transcription processing state is off
    clearError(); 
    setPendingAiMessage(null); // << LIMPIAR mensaje pendiente >>
    
    const shouldIntroduceFlow = isFirstInteraction;
    // Use initialContext only on the very first interaction of the session
    const contextToSend = isFirstInteraction ? initialContext : null; 
    
    try {
      // Prepare history, limiting length
      const historyToSend = messages
          .map(msg => ({ role: msg.isUser ? 'user' : 'assistant' as const, content: msg.text }))
          .slice(-HISTORY_LENGTH); // Ensure history has correct format and length

      const requestBody = {
        message: userMessage,
        history: historyToSend,
        sessionStartTime: sessionStartTime, // Send timestamp if available
        introduceFlow: shouldIntroduceFlow, // <<< CORREGIDO: Usar asignación completa
        initialContext: contextToSend, // Send previous summary if first interaction
        userProfile: userProfile ? { // Send profile if available
            username: userProfile.username,
            avatarUrl: userProfile.avatarUrl 
        } : null,
        sessionId: activeSessionId, // Send current session ID
        isTimeRunningOut: timeRunningOutFlag // << AÑADIDO: Enviar la bandera a la API
      };

      console.log("Enviando a /api/openai:", { message: userMessage, historyCount: historyToSend.length, introduceFlow: shouldIntroduceFlow, hasContext: !!contextToSend, hasProfile: !!userProfile, sessionId: activeSessionId, isTimeRunningOut: timeRunningOutFlag });

      const response = await fetch('/api/openai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Error del servidor OpenAI: ${response.status}`);
      }
      
      // Mark that the first interaction has happened
      if (shouldIntroduceFlow) {
        setIsFirstInteraction(false);
        console.log("Flag isFirstInteraction establecido en false después de la primera llamada a OpenAI.");
      }

      const data = await response.json();
      const aiText = data.response;
      const suggestedVideoData = data.suggestedVideo; // Get potential video suggestion
      
      if (!aiText) {
        setIsThinking(false); // << AÑADIDO: Asegurar quitar thinking si no hay texto >>
        throw new Error("Respuesta vacía recibida de OpenAI.");
      }

      // Create the AI message object
      const incomingAiMessage: Message = {
        id: `ai-${Date.now()}`, // Use a more distinct ID format
        text: aiText,
        isUser: false,
        timestamp: new Date().toLocaleTimeString('es-ES', { hour: 'numeric', minute: 'numeric', hour12: true }),
        suggestedVideo: suggestedVideoData || undefined, // Add video if present
      };
      
      // Add AI message text to chat immediately for better perceived responsiveness
      // setMessages(prev => [...prev, incomingAiMessage]);
      // saveMessage(incomingAiMessage); // Save AI message to DB
      setPendingAiMessage(incomingAiMessage); // << GUARDAR en estado pendiente >>
      
      // Check if this is a closing message BEFORE generating TTS
      const lowerAiText = aiText.toLowerCase();
      // TEMPORALMENTE DESHABILITADO: No confiar solo en frases para cerrar.
      // const isClosingMessage = CLOSING_PHRASES.some(phrase => lowerAiText.includes(phrase.toLowerCase()));
      const isClosingMessage = false; // <-- Forzar a false para evitar cierre prematuro por frases
      console.log(`Mensaje de IA recibido. ¿Es de cierre? ${isClosingMessage} (Cierre por frases deshabilitado)`);

      // --- TTS Generation ---
      try {
        console.log("Solicitando TTS para la respuesta de IA...");
        const ttsResponse = await fetch('/api/tts', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text: aiText })
        });

        if (ttsResponse.ok) {
          const { audioId } = await ttsResponse.json();
          if (audioId) {
             const audioUrlToPlay = `/api/audio/${audioId}`;
             console.log(`TTS generado (${audioId}), añadiendo mensaje y reproduciendo audio...`);

             // << MOVIDO Y CORREGIDO: Añadir mensaje a UI y guardar ANTES de reproducir >>
             // Usar directamente incomingAiMessage, ya que pendingAiMessage puede ser null aquí según los logs.
             setMessages(prev => [...prev, incomingAiMessage]); // Usar incomingAiMessage
             saveMessage(incomingAiMessage);                   // Usar incomingAiMessage
             // Limpiar el estado pendiente ahora que se ha usado.
             setPendingAiMessage(null);

             // << NUEVO: Quitar thinking DESPUÉS de añadir mensaje y ANTES de reproducir >>
             setIsThinking(false);

             // Play the audio. playAudio ahora manejará setIsThinking(false)
             // Pasar el valor (ahora siempre false) de isClosingMessage
             playAudio(audioUrlToPlay, incomingAiMessage.id, isClosingMessage);
             // setIsThinking(false); // << ELIMINADO de aquí >>
          } else {
             // TTS API succeeded but didn't return an audioId
             throw new Error("ID de audio no recibido del endpoint TTS.");
          }
        } else {
          // TTS API request failed
          const errorData = await ttsResponse.json().catch(() => ({}));
          // << NUEVO: Quitar thinking aquí también si TTS falla ANTES de intentar reproducir >>
          setIsThinking(false);
          throw new Error(errorData.error || `Error del servidor TTS: ${ttsResponse.status}`);
        }
      } catch (ttsError) {
          // Catch errors during TTS fetch or processing
          //setIsThinking(false); // Se mueve arriba para quitarlo antes
          console.error("Error al obtener o procesar audio TTS:", ttsError);
          setAppError({ type: 'tts', message: ttsError instanceof Error ? ttsError.message : 'Error desconocido en TTS.' });
          // Don't try to play audio if TTS failed
          setIsSpeaking(false);
          setCurrentSpeakingId(null);
          // Si TTS falla, y isClosingMessage *era* true (ahora siempre false), no forzará cierre aquí
          // if (isClosingMessage) { // <-- Esta condición ahora siempre será false
          //   console.warn("Fallo TTS para mensaje de cierre. Forzando finalización de sesión.");
          //   endSession();
          // }
      }
      // --- End TTS Generation ---

    } catch (error) {
      // Catch errors from the OpenAI API call itself
      setIsThinking(false); // Stop thinking indicator on OpenAI error
      console.error("Error al obtener respuesta de OpenAI:", error);
      setAppError({ type: 'openai', message: error instanceof Error ? error.message : 'Error desconocido al contactar OpenAI.' });
      // Ensure speaking state is reset if an error occurred before TTS
      setIsSpeaking(false); 
      setCurrentSpeakingId(null);
    } 
  }, [activeSessionId, isFirstInteraction, initialContext, messages, sessionStartTime, userProfile, saveMessage, playAudio, endSession, pendingAiMessage, isTimeRunningOut]); // << AÑADIDO isTimeRunningOut a dependencias >>


  // --- Controladores de Interacción del Usuario (Micrófono, Texto) ---

  // Called when STT processing is complete
  const handleTranscriptionResult = useCallback((finalTranscript: string) => {
      console.log(`Procesando transcripción final: "${finalTranscript}"`);
      if (finalTranscript.trim() && conversationActive && activeSessionId) {
        const newMessage: Message = {
          id: `user-${Date.now()}`, // Use a more distinct ID format
          text: finalTranscript.trim(), // Trim whitespace
          isUser: true,
          timestamp: new Date().toLocaleTimeString('es-ES', { hour: 'numeric', minute: 'numeric', hour12: true }),
        };
        setMessages(prev => [...prev, newMessage]); // Add user message to chat
        saveMessage(newMessage); // Save user message to DB
        getOpenAIResponse(finalTranscript.trim()); // Send transcript to OpenAI
      } else {
          console.log("Transcripción descartada (vacía, no activa, o sin sesión ID).");
      }
      // Reset push-to-talk state if it was active
      if (isPushToTalkActive) { 
          setIsPushToTalkActive(false); 
      }
  }, [conversationActive, activeSessionId, isPushToTalkActive, saveMessage, getOpenAIResponse]); // Added dependencies


  const handleStartListening = useCallback(async () => {
    if (isListening || isProcessing || isSpeaking || isSessionClosed || !conversationActive) return; // Prevent starting if busy, closed, or not active
    
    clearError();
    // Stop any currently playing AI audio
    if (audioRef.current) { 
      console.log("Deteniendo audio de IA para permitir escucha...");
      audioRef.current.pause();
      audioRef.current = null;
      setIsSpeaking(false); 
      setCurrentSpeakingId(null);
    }
    
    // Ensure previous MediaRecorder is stopped and stream closed (safety check)
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
        console.warn("MediaRecorder ya estaba grabando? Deteniendo...");
        mediaRecorderRef.current.stop();
    }
    if (audioStreamRef.current) {
        console.warn("Stream de audio previo existía? Deteniendo pistas...");
        audioStreamRef.current.getTracks().forEach(track => track.stop());
        audioStreamRef.current = null;
    }

    console.log("Iniciando grabación de audio (MediaRecorder)...");
    setIsListening(true); // Set listening state
    audioChunksRef.current = []; // Reset audio chunks buffer

    let recorder: MediaRecorder; // Declarar recorder fuera del bloque try

    try {
        // Request microphone access
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        audioStreamRef.current = stream; // Store stream reference

        // Attempt to use preferred mimeType, fall back if necessary
        const options = { mimeType: 'audio/webm;codecs=opus' }; 
        // let recorder; // Mover declaración arriba
        try {
            recorder = new MediaRecorder(stream, options);
            console.log(`Usando mimeType: ${recorder.mimeType}`);
        } catch (e) {
            console.warn("MimeType 'audio/webm;codecs=opus' no soportado, usando default:", e);
            try {
                 recorder = new MediaRecorder(stream); // Fallback to default
                 console.log(`Usando mimeType por defecto: ${recorder.mimeType}`);
            } catch (e2) {
                 console.error("MediaRecorder no soportado en este navegador:", e2);
                 throw new Error("Tu navegador no soporta la grabación de audio necesaria.");
            }
        }
        mediaRecorderRef.current = recorder; // Store recorder reference

        // Event handler for when audio data is available
        recorder.ondataavailable = (event) => {
            if (event.data.size > 0) {
                audioChunksRef.current.push(event.data);
            }
        };

        // Event handler for when recording stops
        recorder.onstop = async () => {
            setIsListening(false); // Update listening state
            setIsPushToTalkActive(false); // Ensure push-to-talk visual cue is off
            
            console.log("Grabación detenida. Procesando chunks...");
            
            if (audioChunksRef.current.length === 0) {
                console.warn("No se grabaron datos de audio.");
                 // Stop processing indicator if it was somehow turned on
                setIsProcessing(false); 
                // Clean up stream tracks if they weren't closed automatically
                if (audioStreamRef.current) {
                    audioStreamRef.current.getTracks().forEach(track => track.stop());
                    audioStreamRef.current = null;
                 }
                return; // Don't send empty audio
            }
            
            // Combine recorded chunks into a single Blob
            const audioBlob = new Blob(audioChunksRef.current, { type: recorder.mimeType || 'audio/webm' });
            audioChunksRef.current = []; // Clear the buffer

            // Indicate that STT processing is starting
            setIsProcessing(true); 
            console.log(`Enviando ${audioBlob.size} bytes a /api/stt...`);

            // Prepare form data for STT API
            const formData = new FormData();
            formData.append('audio', audioBlob, 'user_audio.webm'); // Use a filename
            
            try {
                // Call the STT API endpoint
                const response = await fetch('/api/stt', {
                    method: 'POST',
                    body: formData, 
                });

                if (response.ok) {
                    const data = await response.json();
                    if (data.transcription) {
                        console.log("Transcripción recibida del backend:", data.transcription);
                        // Process the successful transcription
                        handleTranscriptionResult(data.transcription);
                    } else {
                         // Handle case where API succeeded but returned no transcription
                         console.warn("Backend STT respondió OK pero sin transcripción.");
                         setAppError({ type: 'stt', message: 'No se pudo obtener la transcripción.' });
                    }
                } else {
                    // Handle STT API errors (e.g., 4xx, 5xx)
                    const errorData = await response.json().catch(() => ({})); // Try to parse error details
                    console.error("Error del backend STT:", response.status, errorData);
                    setAppError({ type: 'stt', message: `Error del servidor STT: ${errorData.error || response.statusText}` });
                }
            } catch (fetchError: any) {
                // Handle network errors during STT API call
                console.error("Error de red llamando a /api/stt:", fetchError);
                setAppError({ type: 'stt', message: `Error de conexión STT: ${fetchError.message || 'Error desconocido'}` });
            } finally {
                // Ensure processing indicator is turned off regardless of success/failure
                setIsProcessing(false); 
                 // Clean up the audio stream tracks after processing is done
            if (audioStreamRef.current) {
                audioStreamRef.current.getTracks().forEach(track => track.stop());
                audioStreamRef.current = null;
            }
                 console.log("Procesamiento STT finalizado (éxito o error).");
            }
        }; // End of onstop handler

        // Start recording
        recorder.start();
        console.log("MediaRecorder iniciado, estado:", recorder.state);
        
    } catch (error: any) {
        // Catch errors during getUserMedia or MediaRecorder initialization
        console.error("Error al iniciar MediaRecorder:", error);
        setAppError({ type: 'stt', message: `Error al acceder al micrófono: ${error.message}` });
        // Reset states if setup failed
        setIsListening(false);
        setIsPushToTalkActive(false);
        // Clean up stream if it was partially obtained
        if (audioStreamRef.current) {
            audioStreamRef.current.getTracks().forEach(track => track.stop());
            audioStreamRef.current = null;
        }
    }
  }, [isListening, isProcessing, isSpeaking, isSessionClosed, conversationActive, handleTranscriptionResult]); // Added dependencies
  
  // Function to manually stop listening (e.g., user clicks mic button again)
  const handleStopListening = useCallback(() => {
    if (!isListening || !mediaRecorderRef.current || mediaRecorderRef.current.state !== 'recording') {
        console.log("Intento de detener escucha cuando no se está grabando.");
        return;
    }
    
    console.log("Deteniendo MediaRecorder manualmente (handleStopListening)...");
    mediaRecorderRef.current.stop(); // Trigger the onstop event handler
    // No need to set isListening(false) here, onstop will handle it.
  }, [isListening]); // Dependency


  // Handler for sending text messages via the input field
  const handleSendTextMessage = useCallback((event: FormEvent) => {
    event.preventDefault(); // Prevent default form submission
    
    const trimmedInput = textInput.trim();
    
    // Check if input is valid and conversation is in a state to accept messages
    if (trimmedInput && conversationActive && !isProcessing && !isSpeaking && !isListening && !isSessionClosed && activeSessionId) {
      // Stop any playing audio immediately
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
        setIsSpeaking(false);
        setCurrentSpeakingId(null);
      }
      
      // Create the user message object
      const newMessage: Message = {
        id: `user-${Date.now()}`,
        text: trimmedInput,
        isUser: true,
        timestamp: new Date().toLocaleTimeString('es-ES', { hour: 'numeric', minute: 'numeric', hour12: true }),
      };
      
      // Add message to UI, save to DB, and send to OpenAI
      setMessages(prev => [...prev, newMessage]);
      saveMessage(newMessage);
      getOpenAIResponse(trimmedInput);
      
      // Clear the input field
      setTextInput('');
    } else {
        console.log("Envío de mensaje de texto ignorado. Condiciones no cumplidas:", { trimmedInput, conversationActive, isProcessing, isSpeaking, isListening, isSessionClosed, activeSessionId });
    }
  }, [textInput, conversationActive, isProcessing, isSpeaking, isListening, isSessionClosed, activeSessionId, saveMessage, getOpenAIResponse]); // Added dependencies


  // Function to start a new conversation session
  const handleStartConversation = useCallback(async () => {
    // Ensure user is authenticated
    if (!session?.user?.id || authStatus !== 'authenticated') {
      setAppError({ type: null, message: "Debes iniciar sesión para comenzar." });
      return;
    }
    // Prevent starting if already active or TTS isn't ready
    if (conversationActive || !isReadyToStart) {
        console.warn("Intento de iniciar conversación cuando ya está activa o no está lista.");
        return;
    }

    clearError();
    setIsSessionClosed(false); // Ensure session is marked as open
    setIsTimeRunningOut(false); // << AÑADIDO: Resetear la bandera al iniciar nueva sesión
    setIsFirstInteraction(true); // Reset interaction flag for the new session
    setTextInput(''); // Clear any previous text input
    // Clear previous messages *except* potentially the greeting if we want to keep it?
    // Let's clear all messages for a fresh start. The greeting useEffect will run again if needed,
    // but typically we play the audio immediately, so clearing is fine.
     if (messages.length > 0 && messages[0].id.startsWith('greeting-')) {
         // Keep the greeting text if it's the only message
         setMessages([messages[0]]);
      } else {
         setMessages([]); // Clear messages for a new session
     }
    
    try {
      console.log("Llamando a API para crear nueva sesión de chat...");
      const response = await fetch('/api/sessions', {
        method: 'POST',
        // No body needed, user is identified by session cookie
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Error ${response.status} al crear sesión en API`);
      }

      const data = await response.json();
      if (!data.id) {
        throw new Error("La API de sesiones no devolvió un ID válido.");
      }

      setActiveSessionId(data.id); // Store the new session ID
      console.log(`Nueva sesión de API creada con ID: ${data.id}`);

      // Now that session ID is set, mark conversation as active and play greeting
          setConversationActive(true); 
      setSessionStartTime(Date.now()); // Record start time

      if (initialAudioUrl && greetingMessageId) {
        console.log("Comenzando conversación y reproduciendo saludo inicial...");
        // Play the pre-generated greeting audio. Don't mark as closing audio.
        playAudio(initialAudioUrl, greetingMessageId, false); 
      } else {
        // This case should ideally not happen if isReadyToStart is true, but handle it.
        console.warn("Intento de iniciar conversación, pero falta URL o ID de audio de saludo.");
        // Conversation is active, but no audio will play initially. User needs to speak/type.
      }

      // Fetch latest summary and profile again in case they changed?
      // Or rely on the initial fetch? Let's rely on initial fetch for now.
      // Consider refetching if profile updates were possible without page reload.

    } catch (error) {
      console.error("Error en handleStartConversation:", error);
      const message = error instanceof Error ? error.message : "No se pudo iniciar la nueva sesión. Inténtalo de nuevo.";
      setAppError({ type: null, message });
      // Reset state if session creation failed
      setActiveSessionId(null);
      setConversationActive(false); 
      setSessionStartTime(null);
    }
  }, [session, authStatus, conversationActive, isReadyToStart, initialAudioUrl, greetingMessageId, playAudio, messages]); // Added messages to dependency array

  // --- useEffects for Initialization, Push-to-Talk, Timeout, and Video ---

  // << MOVED AND REFINED: useEffect for initial greeting preparation & data fetching >>
  useEffect(() => {
    // Only prepare greeting if user is authenticated, not already prepared, and conversation hasn't started
    if (authStatus !== 'authenticated' || isReadyToStart || conversationActive || messages.length > 0) {
        return;
    }
    
      console.log("Ejecutando useEffect para preparar saludo inicial...");
      const prepareInitialGreeting = async () => {
        let initialGreetingText = ""; // Initialize greeting text
        let personalizedLog = false; // Flag for logging

        // Check if it's the very first session (or history count is unavailable)
        if (totalPreviousSessions === null || totalPreviousSessions === 0) {
             // --- First Session Greeting ---
             initialGreetingText = "Hola";
             let firstName = "";
             // Try to get first name for the first greeting too
             if (userProfile?.username) {
                 firstName = userProfile.username.split(' ')[0];
             } else if (session?.user?.name) {
                  firstName = session.user.name.split(' ')[0];
             }
             if (firstName) {
                 initialGreetingText += `, ${firstName}`;
             }
             initialGreetingText += ". Soy María. Estoy aquí para escucharte y ofrecerte apoyo. ¿Cómo te sientes hoy?";
             // console.log("Generando audio para saludo inicial (Primera Sesión) (sin reproducir)..."); // Logged below

        } else {
            // --- Subsequent Session Greeting (Personalized) ---
            personalizedLog = true; // Mark for personalized log message
            let greeting = "Hola";
            let firstName = "";
            // Extract First Name
            if (userProfile?.username) {
                firstName = userProfile.username.split(' ')[0]; // Get first part
            } else if (session?.user?.name) {
                 firstName = session.user.name.split(' ')[0]; // Fallback
            }
            if (firstName) {
                greeting += `, ${firstName}`;
            }
            greeting += ". Soy María."; // Add the fixed part of the intro

            // Context Integration & Personalized Follow-up
            if (initialContext) {
                // Try to identify the main feeling/situation based on keywords
                let feelingMention = "que estabas lidiando con ansiedad"; // Default feeling mention
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

                // Identify explored techniques
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
                 // Fallback for subsequent sessions if context is somehow missing
                 greeting += " Qué bueno tenerte de vuelta. ¿Cómo te has sentido desde nuestra última conversación?";
            }
            initialGreetingText = greeting; // Final constructed greeting text
        }

        // --- Common logic for both first and subsequent sessions ---
        const msgId = `greeting-${Date.now()}`;
        setGreetingMessageId(msgId); // Save ID to associate with audio later

        const initialMessage: Message = {
            id: msgId,
            text: initialGreetingText, // Use the determined greeting text
            isUser: false,
            timestamp: new Date().toLocaleTimeString('es-ES', { hour: 'numeric', minute: 'numeric', hour12: true }),
        };
        setMessages([initialMessage]); // Display greeting text immediately

        // Log appropriately
        console.log(`Generando audio para saludo inicial ${personalizedLog ? 'PERSONALIZADO' : '(Primera Sesión)'} (sin reproducir)...`);
        
        // TTS Generation (using the determined initialGreetingText)
        try {
            const ttsResponse = await fetch('/api/tts', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ text: initialGreetingText }) // Send the correct greeting text to TTS
            });
            if (ttsResponse.ok) {
                const ttsData = await ttsResponse.json();
                if (ttsData.audioId) {
                    setInitialAudioUrl(`/api/audio/${ttsData.audioId}`); // Store URL for later playback
                    setIsReadyToStart(true); // Mark as ready to start conversation
                    console.log("Audio de saludo preparado y listo.");
            } else {
                    throw new Error("ID de audio no recibido del TTS.");
                }
            } else {
                const errorData = await ttsResponse.json().catch(() => ({}));
                throw new Error(errorData.error || `Error del servidor TTS para saludo: ${ttsResponse.status}`);
            }
        } catch (ttsError) {
            console.error("Error generando TTS inicial:", ttsError);
            setAppError({ type: 'tts', message: ttsError instanceof Error ? ttsError.message : 'Error generando TTS inicial.' });
            setInitialAudioUrl(null);
            setIsReadyToStart(false); // Cannot start if TTS failed
            // Keep the text message displayed even if audio fails
        }
    };
    
    // Fetch profile and latest summary when authenticated
    const fetchInitialData = async () => {
        // << NUEVO: Reiniciar contador >>
        setTotalPreviousSessions(null);
        try {
            console.log("Fetching initial data (profile, summary, and session count)...");
            // << MODIFICADO: Añadir llamada a historial para obtener contador >>
            const [profileRes, summaryRes, historyRes] = await Promise.all([
                fetch('/api/profile'),
                fetch('/api/sessions/latest-summary'),
                fetch('/api/chat-sessions/history?page=1&pageSize=1') // Pedimos solo 1 para obtener metadata
            ]);

            if (profileRes.ok) {
                const profileData = await profileRes.json();
                setUserProfile(profileData);
                 console.log("Perfil de usuario cargado:", profileData.username);
            } else {
                 console.warn(`Error al cargar el perfil: ${profileRes.status}`);
                 setUserProfile(null); // Ensure profile is null if fetch fails
            }

            if (summaryRes.ok) {
                const summaryData = await summaryRes.json();
                setInitialContext(summaryData.summary);
                console.log(`Resumen de sesión anterior cargado: ${summaryData.summary ? summaryData.summary.substring(0, 50) + '...' : 'Ninguno'}`);
            } else {
                 console.warn(`Error al cargar resumen anterior: ${summaryRes.status}`);
                 setInitialContext(null); // Ensure context is null if fetch fails
            }

            // << NUEVO: Procesar respuesta del historial para obtener contador >>
            if (historyRes.ok) {
                const historyData: { data: any[]; pagination: HistoryPagination } = await historyRes.json();
                setTotalPreviousSessions(historyData.pagination.totalItems);
                 console.log(`Total de sesiones previas cargado: ${historyData.pagination.totalItems}`);
            } else {
                 console.warn(`Error al cargar contador de sesiones: ${historyRes.status}`);
                 setTotalPreviousSessions(0); // Asumir 0 si hay error? O null? Mejor null y manejarlo en UI
            }


            // Now that we have profile/context (or tried to get them), prepare the greeting
            prepareInitialGreeting();

        } catch (error) {
            console.error("Error de red al obtener datos iniciales (perfil/resumen/contador):", error);
            setAppError({ type: null, message: "Error de red al cargar datos iniciales." });
             // << NUEVO: Establecer contador a 0 en caso de error de red >>
             setTotalPreviousSessions(0);
            // Still try to prepare greeting even if profile/summary/count fails
            prepareInitialGreeting();
        }
    };

    fetchInitialData();

  }, [authStatus, conversationActive, isReadyToStart, messages.length]); // << MODIFICADO: Quitado messages.length como dependencia innecesaria aquí >>

  // Effect for handling Push-to-Talk (Spacebar)
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Ignore if modifier keys are pressed or if input field has focus
      if (event.repeat || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || textAreaRef.current === document.activeElement) {
        return; 
      }
      // Start listening only if Space is pressed, not already listening/processing/speaking, and conversation is active
      if (event.code === 'Space' && !isListening && !isProcessing && !isSpeaking && conversationActive && !isSessionClosed) {
      event.preventDefault(); 
        setIsPushToTalkActive(true); // Set visual indicator state
        handleStartListening(); // Start the listening process
      }
    };

    const handleKeyUp = (event: KeyboardEvent) => {
       // Stop listening only if Space is released and we were listening via push-to-talk
      if (event.code === 'Space' && isListening && isPushToTalkActive) {
      event.preventDefault();
        handleStopListening(); // Stop the listening process
        // isPushToTalkActive will be reset in the MediaRecorder's onstop handler
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [isListening, isProcessing, isSpeaking, isPushToTalkActive, conversationActive, isSessionClosed, handleStartListening, handleStopListening]); // Dependencies

  // Effect for the session timeout with warning
  useEffect(() => {
    let warningTimeoutId: NodeJS.Timeout | null = null;
    let finalTimeoutId: NodeJS.Timeout | null = null;
    
    // Set timeouts only if conversation is active, has a start time, and is not already closed
    if (conversationActive && sessionStartTime && !isSessionClosed) {
      const SESSION_DURATION_MS = 20 * 60 * 1000; // 20 minutes
      const WARNING_THRESHOLD_MS = 18 * 60 * 1000; // 18 minutes warning
      const now = Date.now();
      const elapsedTime = now - sessionStartTime;
      
      const remainingWarningTime = WARNING_THRESHOLD_MS - elapsedTime;
      const remainingFinalTime = SESSION_DURATION_MS - elapsedTime;

      // Set Warning Timeout
      if (remainingWarningTime > 0) {
        console.log(`Estableciendo timeout de ADVERTENCIA para ${Math.round(remainingWarningTime / 1000)}s restantes.`);
        warningTimeoutId = setTimeout(() => {
          console.log("Tiempo de advertencia (18 min) alcanzado. Estableciendo flag...");
          // Set the flag. The next interaction will trigger the AI's closing remarks.
          setIsTimeRunningOut(true); 
        }, remainingWarningTime);
      } else if (!isTimeRunningOut && elapsedTime >= WARNING_THRESHOLD_MS) {
          // If warning time already passed when effect runs (e.g., refresh), set flag immediately
          console.log("Tiempo de advertencia ya había pasado. Estableciendo flag...");
          setIsTimeRunningOut(true);
      }

      // Set Final Timeout
      if (remainingFinalTime > 0) {
        console.log(`Estableciendo timeout FINAL para ${Math.round(remainingFinalTime / 1000)}s restantes.`);
        finalTimeoutId = setTimeout(() => {
          console.log("Tiempo máximo de sesión (20 min) alcanzado. Finalizando...");
          setAppError({ type: null, message: "La sesión ha finalizado automáticamente (20 min)." });
          endSession(); // Trigger the session end process
        }, remainingFinalTime);
      } else {
        // If final time already passed, end immediately
        console.log("Tiempo máximo de sesión ya había expirado. Finalizando...");
        // Check again if it's *already* closed
        if (!isSessionClosed) { 
             setAppError({ type: null, message: "La sesión ha finalizado automáticamente (20 min)." });
             endSession();
        }
      }
    } else {
         // Log why timeouts are not being set (optional)
         // console.log("Timeouts no establecidos: conversación inactiva, sin hora de inicio, o sesión cerrada.");
    }

    // Cleanup function to clear the timeouts
    return () => {
      if (warningTimeoutId) {
        console.log("Limpiando timeout de advertencia activo.");
        clearTimeout(warningTimeoutId);
      }
      if (finalTimeoutId) {
        console.log("Limpiando timeout final activo.");
        clearTimeout(finalTimeoutId);
      }
    };
    // Dependencies: only re-run if conversation starts/stops or session ends
  }, [conversationActive, sessionStartTime, isSessionClosed, endSession]); 


  // --- Effect for Video Source ---
   useEffect(() => {
        if (videoRef.current) {
            // << MODIFICADO: Usar nombres de archivo existentes >>
            videoRef.current.src = isSpeaking ? '/videos/voz.mp4' : '/videos/mute.mp4';
            videoRef.current.load(); // Load the new source
            videoRef.current.play().catch(e => console.error("Error playing video:", e)); // Attempt to play
        }
    }, [isSpeaking]); // Dependency on isSpeaking state

  // --- Renderizado ---
  return (
    <div className="relative flex flex-1 h-[calc(100vh-64px)] bg-neutral-100 dark:bg-neutral-900 overflow-hidden">

      {/* Display de Errores (Banner Superior) */}
      {appError.message && (
        <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-[64px] left-1/2 transform -translate-x-1/2 z-50 w-full max-w-lg p-3 bg-red-100 dark:bg-red-900/90 border-b border-red-300 dark:border-red-700 shadow-md flex items-center justify-between"
        >
          <div className="flex items-center">
            <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-300 mr-2 flex-shrink-0" />
            <span className="text-sm text-red-800 dark:text-red-200">{appError.message}</span>
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

      {/* Panel de Chat (Izquierda) */}
      <AnimatePresence>
        {isChatVisible && (
            <motion.div
              key="chat-panel"
              initial={{ x: '-100%', opacity: 0 }}
              animate={{ x: '0%', opacity: 1 }}
              exit={{ x: '-100%', opacity: 0 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              // << MODIFICADO: Añadir relative para posicionar botón dentro >>
              className="relative w-full md:w-1/3 flex flex-col h-full bg-neutral-100 dark:bg-neutral-900 border-r border-neutral-200 dark:border-neutral-700"
            >
              {/* << MOVIDO: Botón dentro del panel >> */}
              {/* Se muestra solo si la conversación está activa */}
              {conversationActive && (
                <button
                  onClick={toggleChatVisibility}
                  className="absolute top-1/2 -right-5 transform -translate-y-1/2 z-20 p-2 bg-neutral-200 dark:bg-neutral-700 rounded-full shadow-md hover:bg-neutral-300 dark:hover:bg-neutral-600 transition-colors"
                  aria-label={isChatVisible ? "Ocultar chat" : "Mostrar chat"}
                >
                  <ChevronsLeft className="h-5 w-5 text-neutral-700 dark:text-neutral-200" />
                </button>
              )}

              {/* Área de Mensajes */}
              <div 
                ref={chatContainerRef} // Referencia para scroll
                className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4 scroll-smooth bg-white dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-700 relative"
              >
                {/* Placeholder si no hay mensajes */}
                {messages.length === 0 && !isThinking ? (
                    <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="flex flex-col items-center justify-center h-full text-center text-neutral-500 dark:text-neutral-400"
                    >
                    <MessageSquare className="w-12 h-12 mb-4 text-neutral-400 dark:text-neutral-500" />
                    <h2 className="text-lg font-medium text-neutral-700 dark:text-neutral-200 mb-2">
                        {authStatus === 'authenticated' ? 'Esperando para comenzar...' : 'Inicia sesión para empezar.'}
                    </h2>
                    {/* NUEVO: Mostrar contadores de sesión cuando está autenticado */}
                    {(authStatus as string) === 'authenticated' && (
                      <div className="mb-4">
                        {totalPreviousSessions !== null ? (
                          <>
                            <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-1">
                              Has completado {totalPreviousSessions} {totalPreviousSessions === 1 ? 'sesión previa' : 'sesiones previas'}.
                            </p>
                            <p className="text-sm font-semibold text-neutral-700 dark:text-neutral-300">
                              Estás por iniciar tu sesión número {totalPreviousSessions + 1}.
                            </p>
                          </>
                        ) : (
                          <p className="text-sm flex items-center justify-center">
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Cargando historial...
                          </p>
                        )}
                        {initialContext && (
                          <p className="mt-3 text-xs italic text-neutral-500 dark:text-neutral-500 max-w-md mx-auto">
                            Contexto anterior: "{initialContext.substring(0, 80)}{initialContext.length > 80 ? '...' : ''}"
                          </p>
                        )}
                      </div>
                    )}
                    <p className="text-sm">
                        {(authStatus as string) === 'authenticated'
                          ? 'Cuando estés listo, pulsa "Comenzar tu sesión".'
                           : 'Usa el menú superior para acceder.'}
                    </p>
                    </motion.div>
                ) : (
                    // Mapeo de mensajes
                    messages.map((msg) => (
                    <TranscribedResponse
                        key={msg.id}
                        text={msg.text}
                        isUser={msg.isUser}
                        timestamp={msg.timestamp}
                        isHighlighted={currentSpeakingId === msg.id} // Resaltar si la IA está hablando este mensaje
                        suggestedVideo={msg.suggestedVideo} // Pasar datos del video sugerido
                        // Usar avatar del perfil si está disponible, si no el de Google, si no el default
                        avatarUrl={msg.isUser ? (userProfile?.avatarUrl || session?.user?.image || '/default-avatar.png') : undefined} 
                    />
                    ))
                )}
                 {/* Indicador de "Pensando..." */}
                {isThinking && <ThinkingIndicator />} 
                 {/* Referencia invisible para scroll (opcional si scroll-smooth funciona bien) */}
                <div ref={chatEndRef} />
              </div>

              {/* Área de Input (Texto y Micrófono) */}
              <div className="p-4 bg-white dark:bg-neutral-800 border-t border-neutral-200 dark:border-neutral-700">
                 <form onSubmit={handleSendTextMessage} className="flex items-center space-x-3">
                    {/* Input de Texto */}
                    <textarea
                    ref={textAreaRef} // Referencia para comprobar foco (push-to-talk)
                    value={textInput}
                    onChange={(e) => setTextInput(e.target.value)}
                    placeholder={
                        !conversationActive ? "Inicia una conversación..." :
                        isSessionClosed ? "Sesión finalizada." : 
                        isListening ? "Escuchando..." :
                        isProcessing ? "Procesando..." :
                        isSpeaking ? "Hablando..." :
                        isThinking ? "Pensando..." :
                        "Escribe o pulsa [Espacio]..."
                    }
                    rows={1}
                    className="flex-1 resize-none p-2 border border-neutral-300 dark:border-neutral-600 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary-500 bg-neutral-50 dark:bg-neutral-700 text-neutral-800 dark:text-neutral-100 placeholder-neutral-400 dark:placeholder-neutral-500 disabled:opacity-60 disabled:cursor-not-allowed text-sm"
                    onKeyDown={(e) => {
                        // Enviar con Enter (sin Shift)
                        if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSendTextMessage(e as unknown as FormEvent);
                        }
                    }}
                    // Deshabilitar si se está escuchando, procesando, hablando, pensando, o la sesión está cerrada/inactiva
                    disabled={!conversationActive || isListening || isProcessing || isSpeaking || isSessionClosed || isThinking}
                    />
                    {/* Botón de Micrófono */}
                    <button 
                    type="button"
                    onClick={isListening ? handleStopListening : handleStartListening} 
                    // Deshabilitar si procesando, hablando, sesión cerrada/inactiva o pensando
                    disabled={!conversationActive || isProcessing || isSpeaking || isSessionClosed || isThinking}
                    className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-neutral-800 ${ 
                        isListening // Estilo si escuchando (Rojo)
                        ? 'bg-red-500 hover:bg-red-600 text-white focus:ring-red-400' 
                        : 'bg-primary-600 hover:bg-primary-700 text-white focus:ring-primary-500' // Estilo normal
                    } ${
                        // Anillo verde si Push-to-Talk activo
                        (isPushToTalkActive) ? 'ring-4 ring-offset-0 ring-green-400 scale-110' : '' 
                    } ${
                        // Opacidad si deshabilitado
                        (!conversationActive || isProcessing || isSpeaking || isSessionClosed || isThinking) ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                    aria-label={isListening ? "Detener micrófono" : "Activar micrófono"}
                    >
                     {/* Icono Micrófono o Loader si está procesando STT */}
                     {isProcessing ? <Loader2 className="h-5 w-5 animate-spin" /> : <Mic className="h-5 w-5" />}
                    </button>
                    {/* Botón Enviar Texto */}
                    <button
                    type="submit"
                     // Deshabilitar si input vacío, escuchando, procesando, hablando, sesión cerrada/inactiva o pensando
                    disabled={!textInput.trim() || !conversationActive || isListening || isProcessing || isSpeaking || isSessionClosed || isThinking}
                    className="w-10 h-10 rounded-full flex items-center justify-center bg-primary-600 text-white hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 dark:focus:ring-offset-neutral-800 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity"
                    aria-label="Enviar mensaje"
                    >
                    {/* Icono Enviar */}
                        <Send className="h-5 w-5" />
                    </button>
                 </form>
                  {/* Botón para Iniciar Nueva Sesión o Mensaje Push-to-Talk */}
                  {isSessionClosed ? (
                    // Mostrar botón "Ir al Perfil" si la sesión está cerrada
                    <div className="text-center mt-3">
                      <Link 
                        href="/settings/profile" 
                        passHref 
                        legacyBehavior // Important for nesting custom components like Button
                      >
                        {/* Anchor tag provided by Link legacyBehavior */}
                        <Button 
                          // Remove the 'as="a"' prop
                          className="bg-secondary-600 hover:bg-secondary-700 text-white px-4 py-2 rounded-lg text-sm font-semibold shadow focus:outline-none focus:ring-2 focus:ring-secondary-500 focus:ring-offset-2 dark:focus:ring-offset-neutral-800 transition-colors cursor-pointer"
                        >
                          Ver Historial en Perfil
                        </Button>
                      </Link>
                    </div>
                  ) : (
                     // Mostrar mensaje "Mantén [Espacio]" si la sesión está activa
                     <p className={`text-xs mt-2 text-center text-neutral-500 dark:text-neutral-400 ${!conversationActive ? 'opacity-50' : ''}`}>
                          {conversationActive ? 'Mantén pulsada la tecla [Espacio] para hablar.' : 'Inicia la conversación para activar el micrófono.'}
                      </p>
                  )}
              </div>
            </motion.div>
        )}
      </AnimatePresence>

      {/* Panel de Video (Derecha) */}
      <div className={`relative flex flex-col items-center justify-center flex-1 h-full bg-white dark:bg-neutral-800 transition-all duration-300 ease-in-out p-4 md:p-6 ${isChatVisible ? 'md:w-2/3' : 'w-full'}`}>
        {/* Contenedor del video con sombra y bordes redondeados */}
        <div className="relative w-full h-full rounded-lg overflow-hidden shadow-lg bg-black"> 
          <video
            ref={videoRef} // Referencia al elemento video
            key={isSpeaking ? 'speaking' : 'idle'} // Cambiar key fuerza recarga de video si fuentes son diferentes
            autoPlay // Reproducir automáticamente
            loop // Repetir video
            muted // Silenciado (requerido para autoplay en muchos navegadores)
            playsInline // Para reproducción inline en iOS
            className="w-full h-full object-cover" // Estilo para cubrir contenedor
            // src={isSpeaking ? '/videos/maria-speaking.mp4' : '/videos/maria-idle.mp4'} // Fuente inicial (ahora manejado por useEffect)
          >
            Tu navegador no soporta el elemento de video. 
          </video>
          {/* Indicador de estado (Opcional, superpuesto sobre el video) */}
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

      {/* Controles de Micrófono Flotantes (cuando el chat está oculto) */}
      {!isChatVisible && conversationActive && !isSessionClosed && (
          <div className={`absolute bottom-0 left-0 right-0 z-20 bg-gradient-to-t from-black/70 via-black/50 to-transparent pb-4 pt-12 pointer-events-none`}>
             <div className={`mx-auto px-4 max-w-md pointer-events-auto`}> {/* Enable pointer events here */}
                <div className={`p-4 rounded-t-lg bg-transparent flex justify-center`}> 
                    {/* Botón de Micrófono Flotante */}
                    <button 
                    type="button"
                    onClick={isListening ? handleStopListening : handleStartListening} 
                    // Deshabilitar si procesando o hablando (sesión cerrada/inactiva ya cubierto por el condicional padre)
                    disabled={isProcessing || isSpeaking || isThinking} 
                    className={`w-14 h-14 rounded-full flex items-center justify-center transition-all duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-neutral-900 shadow-lg ${ 
                        isListening // Estilo si escuchando (Rojo + grande)
                        ? 'bg-red-500 hover:bg-red-600 text-white focus:ring-red-400 scale-110' 
                        : 'bg-primary-600 hover:bg-primary-700 text-white focus:ring-primary-500' // Estilo normal
                    } ${
                        // Anillo verde si Push-to-Talk activo
                        (isPushToTalkActive) ? 'ring-4 ring-offset-0 ring-green-400 scale-110' : '' 
                    } ${
                        // Opacidad si deshabilitado
                        (isProcessing || isSpeaking || isThinking) ? 'opacity-60 cursor-not-allowed' : ''
                    }`}
                    aria-label={isListening ? "Detener micrófono" : "Activar micrófono"}
                    >
                    {/* Icono Micrófono o Loader */}
                    {isProcessing ? <Loader2 className="h-6 w-6 animate-spin" /> : <Mic className="h-6 w-6" />}
                    </button>
                 </div>
                 {/* Mensaje Push-to-Talk Flotante */}
                 <p className={`text-xs mt-1 text-center text-neutral-200 drop-shadow-sm pointer-events-none`}>
                        Mantén [Espacio] para hablar.
                    </p>
             </div>
          </div>
      )}

      {/* Error Display using the component (Optional alternative placement) */}
      {/* <AnimatePresence>
         <ErrorDisplay error={appError} onClose={clearError} />
      </AnimatePresence> */}

      {/* Overlay/Blur Inicial (cubriendo video y chat si no está activo) */}
      {!conversationActive && (
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-black/50 backdrop-blur-md text-white">
          {/* Mensaje de Bienvenida */} 
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="text-center p-8"
          >
            {/* Bienvenida Condicional */} 
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Bienvenido
              {/* Mostrar nombre con animación si está cargado y autenticado */}
              {authStatus === 'authenticated' && userProfile?.username && (
                 <motion.span 
                   initial={{ opacity: 0, x: -10 }}
                   animate={{ opacity: 1, x: 0 }}
                   transition={{ delay: 0.3, duration: 0.5 }}
                   className="ml-2"
                 >
                   , {userProfile.username}
                 </motion.span>
               )}
            </h2> {/* << CORREGIDO: Cerrar la etiqueta h2 aquí >> */}
            
            {/* Mostrar estado de carga si no está listo el saludo TTS o auth está cargando */}
            {(authStatus === 'loading' || !isReadyToStart) && authStatus !== 'unauthenticated' && (
              <div className="mt-4 text-center">
                <Loader2 className="h-8 w-8 mb-4 mx-auto animate-spin text-primary-400" />
                <p className="text-neutral-300">{authStatus === 'loading' ? 'Cargando datos de sesión...' : 'Preparando IA...'}</p>
              </div>
            )}
            
            {/* Botón para iniciar (solo si autenticado y listo) */} 
            {authStatus === 'authenticated' && (
               <button
                 onClick={handleStartConversation}
                 disabled={!isReadyToStart || isSessionClosed} // Deshabilitar si no está listo o la sesión anterior acaba de cerrar
                 className="button-glow mt-8 inline-flex items-center justify-center whitespace-nowrap rounded-md text-lg font-semibold ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 h-11 px-8 shadow-soft hover:shadow-soft-lg transform hover:-translate-y-1 bg-primary-600 hover:bg-primary-700 text-white disabled:opacity-50 disabled:cursor-not-allowed"
               >
                 {isReadyToStart ? 'Comenzar tu sesión' : <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Preparando...</>}
                </button>
            )}
             {/* Mensaje si no está autenticado */}
             {authStatus === 'unauthenticated' && (
                <div className="mt-6 text-center">
                    <AlertCircle className="h-8 w-8 mb-4 mx-auto text-yellow-400" />
                    <p className="text-neutral-300">Debes iniciar sesión para comenzar.</p>
                 </div>
             )}
          </motion.div>
        </div>
      )}

      {/* << MOVIDO: Botón ocultar/mostrar fuera del panel de chat, pero bajo el overlay >> */}
      {/* Se muestra solo si la conversación está activa y el chat NO está visible */}
      {conversationActive && !isChatVisible && (
        <button
          onClick={toggleChatVisibility}
          // << MODIFICADO: Posicionamiento a la izquierda, z-index 5 para estar sobre video pero bajo overlay (z-10) >>
          className="absolute top-1/2 left-4 transform -translate-y-1/2 z-5 p-2 bg-neutral-200 dark:bg-neutral-700 rounded-full shadow-md hover:bg-neutral-300 dark:hover:bg-neutral-600 transition-colors"
          aria-label="Mostrar chat"
        >
          <ChevronsRight className="h-5 w-5 text-neutral-700 dark:text-neutral-200" />
        </button>
      )}

    </div>
  );
}

export default VoiceChatContainer;