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
import { Send, AlertCircle, Mic } from 'lucide-react';

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: string;
  // Ya no necesitamos tags ni topic, OpenAI manejará el contexto
}

// Nuevo estado para la conexión de LiveKit y Errores
type ConnectionState = 'disconnected' | 'connecting' | 'connected' | 'error';
type AppError = { type: 'livekit' | 'openai' | 'stt' | 'tts' | null; message: string | null };

const VoiceChatContainer: React.FC = () => {
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
  
  const roomRef = useRef<Room | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null); // << NUEVO: Ref para MediaRecorder
  const audioChunksRef = useRef<Blob[]>([]); // << NUEVO: Ref para almacenar chunks de audio
  const audioStreamRef = useRef<MediaStream | null>(null); // << NUEVO: Ref para el stream del mic
  const audioRef = useRef<HTMLAudioElement | null>(null); // << NUEVO: Ref para el elemento <audio>
  const chatEndRef = useRef<HTMLDivElement>(null); // Para scroll automático
  
  // << NUEVO: Referencia para el video >>
  const videoRef = useRef<HTMLVideoElement>(null);
  // << NUEVO: Ref para el textarea para comprobar el foco >>
  const textAreaRef = useRef<HTMLTextAreaElement>(null);
  
  // Función para limpiar errores
  const clearError = () => setAppError({ type: null, message: null });
  
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
             console.log("Cleanup: No se llama a disconnect() (estado no 'connected').");
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
  }, [getLiveKitToken, connectionState, liveKitToken]);

  // << MODIFICADO: useEffect para saludo inicial (solo prepara y marca como listo) >>
  useEffect(() => {
    // Prevenir ejecución si ya hay mensajes o la conversación ya está activa
    if (messages.length > 0 || conversationActive) {
        return;
    }
    
    const prepareInitialGreeting = async () => {
        const initialGreetingText = "Hola, soy María, tu asistente virtual de IA para la ansiedad. Estoy aquí para escucharte y ofrecerte apoyo. ¿Cómo te sientes hoy?";
        const msgId = `greeting-${Date.now()}`;
        setGreetingMessageId(msgId); // Guardar ID del saludo
        
        // Añadir mensaje a UI
        const newMessage: Message = {
            id: msgId,
            text: initialGreetingText,
            isUser: false,
            timestamp: new Date().toLocaleTimeString(),
        };
        setMessages([newMessage]);
        // No marcar como 'speaking' aún
        
        console.log("Generando audio para saludo inicial (sin reproducir)...");
        try {
            const ttsResponse = await fetch('/api/tts', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ text: initialGreetingText })
            });

            if (ttsResponse.ok) {
                const { audioId } = await ttsResponse.json();
                if (audioId) {
                    console.log("Audio de saludo preparado, ID:", audioId);
                    setInitialAudioUrl(`/api/audio/${audioId}`); // Construir URL dinámica
                    setGreetingMessageId(msgId); // Guardar ID del mensaje también
                    setIsReadyToStart(true); // Marcar como listo para empezar
          } else {
                    throw new Error("ID de audio no recibido para saludo.");
                }
            } else {
                const errorData = await ttsResponse.json().catch(() => ({}));
                throw new Error(errorData.error || `Error del servidor TTS para saludo: ${ttsResponse.status}`);
            }
        } catch (ttsError) {
            console.error("Error generando TTS inicial:", ttsError);
            setAppError({ type: 'tts', message: ttsError instanceof Error ? ttsError.message : 'Error generando TTS inicial.' });
            setInitialAudioUrl(null);
            setIsReadyToStart(false); // Marcar como no listo si hay error
        }
    };

    prepareInitialGreeting();

  }, []); // Ejecutar solo al montar

  // --- Procesamiento con OpenAI y Reproducción de Audio (TTS - OpenAI API) ---
  
  // Función para reproducir audio desde URL
  const playAudio = (url: string, messageId: string) => {
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

    audio.onended = () => {
      console.log("Audio terminado:", messageId);
      setIsSpeaking(false);
      setCurrentSpeakingId(null);
      audioRef.current = null; // Limpiar ref
    };
    audio.onerror = (e) => {
      console.error("Error al reproducir audio:", url, e);
      setAppError({ type: 'tts', message: 'Error al reproducir el archivo de audio.' });
      setIsSpeaking(false);
      setCurrentSpeakingId(null);
      audioRef.current = null; // Limpiar ref
    };
    audio.play().catch(e => { // Manejar error de autoplay
        console.error("Error al iniciar la reproducción:", e);
        // Mostrar el error específico de autoplay si es el caso
        const playErrorMessage = e.name === 'NotAllowedError' 
            ? 'No se pudo iniciar la reproducción del audio. Puede requerir interacción del usuario.'
            : 'Error al iniciar la reproducción del audio.';
        setAppError({ type: 'tts', message: playErrorMessage });
        setIsSpeaking(false);
        setCurrentSpeakingId(null);
        audioRef.current = null;
    });
  };

  // Función para enviar mensaje a la API de OpenAI y luego a la API TTS
  const getOpenAIResponse = async (userMessage: string) => {
    setIsProcessing(true);
    clearError(); // Limpiar errores previos
    try {
      // 1. Obtener respuesta de texto de OpenAI
      const response = await fetch('/api/openai', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: userMessage }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Error del servidor OpenAI: ${response.status}`);
      }

      const data = await response.json();
      const aiText = data.response;
      if (!aiText) throw new Error("Respuesta vacía de OpenAI.");

      // Añadir la respuesta del asistente al historial
      const newMessage: Message = {
        id: Date.now().toString(),
        text: aiText,
        isUser: false,
        timestamp: new Date().toLocaleTimeString(),
      };
      setMessages(prevMessages => [...prevMessages, newMessage]);
      setCurrentSpeakingId(newMessage.id); // Marcar como "pensando en hablar"
      setIsProcessing(false); // Termina procesamiento de OpenAI
      
      // 2. Obtener ID de audio TTS para la respuesta
      try {
        const ttsResponse = await fetch('/api/tts', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text: aiText }) // Enviar el texto obtenido
        });

        if (ttsResponse.ok) {
          const { audioId } = await ttsResponse.json();
          if (audioId) {
             const audioUrlToPlay = `/api/audio/${audioId}`; // Construir URL dinámica
             playAudio(audioUrlToPlay, newMessage.id); // Reproducir el audio
          } else {
             throw new Error("ID de audio no recibido del endpoint TTS.");
          }
        } else {
          const errorData = await ttsResponse.json().catch(() => ({}));
          throw new Error(errorData.error || `Error del servidor TTS: ${ttsResponse.status}`);
        }
      } catch (ttsError) {
          console.error("Error al obtener o reproducir audio TTS:", ttsError);
          setAppError({ type: 'tts', message: ttsError instanceof Error ? ttsError.message : 'Error desconocido en TTS.' });
          // Si falla el TTS, al menos el texto está visible
          setIsSpeaking(false);
          setCurrentSpeakingId(null);
      }

    } catch (error) {
      console.error("Error al obtener respuesta de OpenAI:", error);
      setAppError({ type: 'openai', message: error instanceof Error ? error.message : 'Error desconocido al contactar OpenAI.' });
      setIsProcessing(false); // Asegurarse de resetear estado si falla OpenAI
      setIsSpeaking(false);
      setCurrentSpeakingId(null);
    }
    // No necesitamos `finally` aquí porque `isProcessing` se maneja antes de la llamada a TTS
  };
  
  // --- Controladores de Interacción del Avatar --- (Modificados para llamar a /api/stt)

  const handleStartListening = useCallback(async () => {
    // << Añadir comprobación para no iniciar si ya está escuchando >>
    if (isListening || isProcessing || isSpeaking) return;
    
    clearError();
    if (audioRef.current) { 
      audioRef.current.pause();
      audioRef.current = null;
      setIsSpeaking(false); 
      setCurrentSpeakingId(null);
    }
    
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
        mediaRecorderRef.current.stop();
    }
    if (audioStreamRef.current) {
        audioStreamRef.current.getTracks().forEach(track => track.stop());
        audioStreamRef.current = null;
    }

    console.log("Iniciando grabación de audio (MediaRecorder)...");
    setIsListening(true); // Marcar como escuchando
    audioChunksRef.current = []; 

    try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        audioStreamRef.current = stream; 

        const options = { mimeType: 'audio/webm;codecs=opus' }; 
        let recorder;
        try {
            recorder = new MediaRecorder(stream, options);
        } catch (e) {
            console.warn("MimeType audio/webm no soportado, usando default:", e);
            try {
                 recorder = new MediaRecorder(stream); 
            } catch (e2) {
                 console.error("MediaRecorder no soportado:", e2);
                 throw new Error("Tu navegador no soporta la grabación de audio necesaria.");
            }
        }
        mediaRecorderRef.current = recorder;

        recorder.ondataavailable = (event) => {
            if (event.data.size > 0) {
                audioChunksRef.current.push(event.data);
            }
        };

        recorder.onstop = async () => {
            // << SOLO cambiar isListening a false aquí si NO fue iniciado por PTT >>
            // if (!isPushToTalkActive) {
            //     setIsListening(false);
            // }
            // << MEJOR: Siempre poner isListening a false al parar >>
            setIsListening(false); 
            setIsPushToTalkActive(false); // Resetear PTT siempre al parar
            
            console.log("Grabación detenida, enviando audio al backend STT...");
            
            if (audioChunksRef.current.length === 0) {
                console.warn("No se grabó audio.");
                 // No necesitamos hacer nada más, ya no está escuchando
                return;
            }
            
            const audioBlob = new Blob(audioChunksRef.current, { type: recorder.mimeType || 'audio/webm' });
            audioChunksRef.current = [];
            setIsProcessing(true); // Indicar STT

            const formData = new FormData();
            formData.append('audio', audioBlob, 'audio.webm'); 
            try {
                console.log(`Enviando ${audioBlob.size} bytes a /api/stt...`);
                const response = await fetch('/api/stt', {
                    method: 'POST',
                    body: formData, 
                });

                if (response.ok) {
                    const data = await response.json();
                    if (data.transcription) {
                        console.log("Transcripción recibida del backend:", data.transcription);
                        handleTranscriptionResult(data.transcription);
                    } else {
                         console.warn("Backend STT no devolvió transcripción.");
                         setAppError({ type: 'stt', message: 'No se pudo obtener la transcripción del backend.' });
                    }
                } else {
                    const errorData = await response.json().catch(() => ({}));
                    console.error("Error del backend STT:", response.status, errorData);
                    setAppError({ type: 'stt', message: `Error del servidor STT: ${errorData.error || response.statusText}` });
                }
            } catch (fetchError: any) {
                console.error("Error de red llamando a /api/stt:", fetchError);
                setAppError({ type: 'stt', message: `Error de conexión STT: ${fetchError.message || 'Error desconocido'}` });
            } finally {
                setIsProcessing(false); 
                // setIsListening(false); // <<-- Ya se hizo al inicio del onstop
            }
            
            if (audioStreamRef.current) {
                audioStreamRef.current.getTracks().forEach(track => track.stop());
                audioStreamRef.current = null;
            }
        };

        recorder.start();
        console.log("MediaRecorder iniciado, estado:", recorder.state);
    } catch (error: any) {
        console.error("Error al iniciar MediaRecorder:", error);
        setAppError({ type: 'stt', message: `Error al acceder al micrófono: ${error.message}` });
        setIsListening(false);
        setIsPushToTalkActive(false); // Resetear PTT en error
        if (audioStreamRef.current) {
            audioStreamRef.current.getTracks().forEach(track => track.stop());
            audioStreamRef.current = null;
        }
    }
  }, [isListening, isProcessing, isSpeaking]); // << Añadir dependencias
  
  const handleStopListening = useCallback(() => {
    // << Añadir comprobación para no parar si no está escuchando >>
    if (!isListening || !mediaRecorderRef.current || mediaRecorderRef.current.state !== 'recording') return;
    
    console.log("Deteniendo MediaRecorder (handleStopListening)...");
    mediaRecorderRef.current.stop(); // Esto disparará el evento onstop
    // No cambiamos isListening aquí, se hace en onstop
  }, [isListening]); // << Añadir dependencia

  // << Función para manejar resultado transcripción (sin cambios internos) >>
  const handleTranscriptionResult = (finalTranscript: string) => {
      console.log(`Procesando transcripción: "${finalTranscript}"`);
        const newMessage: Message = {
          id: Date.now().toString(),
        text: finalTranscript,
          isUser: true,
          timestamp: new Date().toLocaleTimeString(),
        };
        setMessages(prevMessages => [...prevMessages, newMessage]);
      getOpenAIResponse(finalTranscript);
  };

  // Función para enviar mensajes de texto (Sin cambios)
  const handleSendTextMessage = (event: FormEvent) => {
    event.preventDefault();
    
    if (textInput.trim()) {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
        setIsSpeaking(false);
        setCurrentSpeakingId(null);
      }
      const newMessage: Message = {
        id: Date.now().toString(),
        text: textInput.trim(),
        isUser: true,
        timestamp: new Date().toLocaleTimeString(),
      };
      setMessages(prevMessages => [...prevMessages, newMessage]);
      getOpenAIResponse(textInput.trim());
      setTextInput('');
    }
  };

  // << NUEVO: Handler para el botón "Comenzar" >>
  const handleStartConversation = () => {
      if (initialAudioUrl && greetingMessageId) {
          console.log("Comenzando conversación y reproduciendo saludo...");
          setConversationActive(true); // Ocultar overlay
          playAudio(initialAudioUrl, greetingMessageId); // Reproducir saludo
      } else {
          console.warn("Intento de iniciar conversación sin audio de saludo listo.");
          // Opcionalmente, iniciar sin audio o mostrar un error diferente
          setConversationActive(true); // Ocultar overlay de todas formas
      }
  };

  // << NUEVO: useEffect para controlar la fuente del video >>
  useEffect(() => {
    if (videoRef.current) {
      const newSrc = isSpeaking ? '/videos/voz.mp4' : '/videos/mute.mp4';
      if (videoRef.current.currentSrc !== newSrc) {
         console.log(`Cambiando video a: ${newSrc}`);
         videoRef.current.src = newSrc;
         // Intentar cargar y reproducir de nuevo si es necesario
         videoRef.current.load(); 
         videoRef.current.play().catch(error => {
            console.warn("Error al intentar reproducir el nuevo video:", error);
            // Esto puede pasar si el usuario no ha interactuado aún
         });
      }
    }
  }, [isSpeaking]);

  // << NUEVO: useEffect para manejar Push-to-Talk (Espacio) >>
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Comprobar si el foco está en el textarea
      if (document.activeElement === textAreaRef.current) {
        return; // Permitir escribir espacios en el textarea
      }

      // Comprobar si la tecla es Espacio y si se puede iniciar la escucha
      if (event.code === 'Space' && !isListening && !isProcessing && !isSpeaking) {
        event.preventDefault(); // Prevenir scroll de página u otra acción default
        console.log("Push-to-Talk (Espacio) presionado - Iniciando escucha...");
        setIsPushToTalkActive(true); // Marcar que fue iniciado por PTT
        handleStartListening();
      }
    };

    const handleKeyUp = (event: KeyboardEvent) => {
       // Comprobar si el foco está en el textarea
       if (document.activeElement === textAreaRef.current) {
        return; 
      }
      
      // Comprobar si la tecla es Espacio y si la escucha fue iniciada por PTT
      if (event.code === 'Space' && isPushToTalkActive) {
         event.preventDefault();
         console.log("Push-to-Talk (Espacio) liberado - Deteniendo escucha...");
         // setIsPushToTalkActive(false); // Se resetea en el onStop del recorder
         handleStopListening();
      }
    };

    // Añadir listeners
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    // Limpiar listeners al desmontar
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      // Asegurarse de detener la escucha si el componente se desmonta mientras PTT está activo
      if (isPushToTalkActive && mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
          console.log("Cleanup PTT: Deteniendo grabación por desmontaje");
          mediaRecorderRef.current.stop();
      }
    };
  }, [isListening, isProcessing, isSpeaking, isPushToTalkActive, handleStartListening, handleStopListening]); // << Dependencias clave

  // --- Renderizado ---
  return (
    <div className="relative flex flex-1 h-[calc(100vh-64px)] bg-neutral-100 dark:bg-neutral-900">

      {/* << NUEVO: Overlay y Botón Comenzar >> */}
      <AnimatePresence>
          {!conversationActive && (
              <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="absolute inset-0 z-40 flex items-center justify-center bg-black/30 backdrop-blur-sm"
                  aria-hidden="true"
              >
                  <motion.button
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: isReadyToStart ? 1 : 0.5, scale: 1 }}
                      transition={{ delay: 0.2 }}
                      onClick={handleStartConversation}
                      disabled={!isReadyToStart} // Deshabilitar hasta que el audio esté listo
                      className="px-6 py-3 bg-primary-600 text-white rounded-lg text-lg font-semibold shadow-lg hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 focus:ring-offset-black/30 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                      {isReadyToStart ? 'Comenzar conversación' : 'Preparando saludo...'}
                  </motion.button>
              </motion.div>
          )}
      </AnimatePresence>

      {/* Error Banner */}
      {appError.message && (
        <div className="fixed top-16 left-1/2 transform -translate-x-1/2 z-50 w-full max-w-md p-4 bg-red-100 dark:bg-red-900 border border-red-300 dark:border-red-700 rounded-lg shadow-lg flex items-center justify-between">
          <div className="flex items-center">
            <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-300 mr-2" />
            <span className="text-sm text-red-700 dark:text-red-200">{appError.message}</span>
          </div>
          <button onClick={clearError} className="text-red-500 dark:text-red-400 hover:text-red-700 dark:hover:text-red-200">
             &times;
          </button>
        </div>
      )}

      {/* Panel Izquierdo: Chat Area */}
      <div className="w-full md:w-1/3 flex flex-col">
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {messages.length === 0 ? (
            // Mensaje Inicial
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="flex flex-col items-center justify-center h-full text-center text-neutral-500 dark:text-neutral-400"
            >
              <svg className="w-16 h-16 mb-4 text-neutral-400 dark:text-neutral-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"></path></svg>
              <h2 className="text-xl font-medium text-neutral-700 dark:text-neutral-200 mb-2">Hola, soy tu asistente de IA.</h2>
              <p>Haz clic en el micrófono o <span className="font-semibold">mantén [Espacio]</span> para hablar.</p> {/* << Indicador PTT */}
            </motion.div>
          ) : (
            // Historial de Chat
            messages.map((msg) => (
              <TranscribedResponse
                key={msg.id}
                text={msg.text}
                isUser={msg.isUser}
                timestamp={msg.timestamp}
                isHighlighted={currentSpeakingId === msg.id}
              />
            ))
          )}
          <div ref={chatEndRef} /> {/* Referencia para scroll */}
        </div>

        {/* Input Area */} 
        <div className="p-4 bg-white dark:bg-neutral-800 border-t border-neutral-200 dark:border-neutral-700">
          <form onSubmit={handleSendTextMessage} className="flex items-center space-x-3">
            <textarea
              ref={textAreaRef} // << Añadir ref al textarea
              value={textInput}
              onChange={(e) => setTextInput(e.target.value)}
              placeholder="Escribe tu mensaje aquí..."
              rows={1}
              className="flex-1 resize-none p-2 border border-neutral-300 dark:border-neutral-600 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary-500 bg-neutral-50 dark:bg-neutral-700 text-neutral-800 dark:text-neutral-100 placeholder-neutral-400 dark:placeholder-neutral-500"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSendTextMessage(e as unknown as FormEvent);
                }
              }}
              disabled={isListening || isProcessing || isSpeaking} // << Deshabilitar si está hablando
            />
            {/* Botón Micrófono (Actualizado onClick) */}
            <button 
              type="button"
              onClick={isListening ? handleStopListening : handleStartListening} // << Usar las nuevas funciones
              disabled={isProcessing || isSpeaking} // << Deshabilitar si está procesando O hablando (sin cambios)
              className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-neutral-800 ${ 
                isListening 
                ? 'bg-red-500 hover:bg-red-600 text-white focus:ring-red-400' 
                : 'bg-primary-600 hover:bg-primary-700 text-white focus:ring-primary-500'
                // << NUEVO: Feedback visual si PTT está activo (opcional) >>
              } ${(isPushToTalkActive) ? 'ring-4 ring-offset-0 ring-green-400' : '' }
                ${(isProcessing || isSpeaking) ? 'opacity-50 cursor-not-allowed' : ''}`} // << Actualizar estado disabled
              aria-label={isListening ? "Detener micrófono" : "Activar micrófono"}
            >
              <Mic className="h-5 w-5" />
            </button>
            {/* Botón Enviar */}
            <button
              type="submit"
              disabled={!textInput.trim() || isListening || isProcessing || isSpeaking} // << Deshabilitar si está hablando
              className="w-10 h-10 rounded-full flex items-center justify-center bg-primary-600 text-white hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 dark:focus:ring-offset-neutral-800 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity"
              aria-label="Enviar mensaje"
            >
              {(isProcessing || (isSpeaking && !audioRef.current)) ? ( // Mostrar spinner si procesa OpenAI o si TTS está inicializando
                <div className="w-5 h-5 border-2 border-t-transparent border-white rounded-full animate-spin"></div>
              ) : (
                <Send className="h-5 w-5" />
              )}
            </button>
          </form>
           {/* << NUEVO: Indicador textual PTT (opcional) >>*/}
           <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-2 text-center">
                Mantén pulsada la tecla [Espacio] para hablar.
            </p>
        </div>
      </div>

      {/* Panel Derecho: Video Avatar */}
      <div className="hidden md:flex md:w-2/3 p-6 flex-col items-center justify-center bg-white dark:bg-neutral-800 border-l border-neutral-200 dark:border-neutral-700">
        {/* << ELIMINAR el div contenedor >> */}
        {/* <div className="max-w-sm w-full flex items-center justify-center"> */}
          {/* << NUEVO: Elemento Video (ahora hijo directo) >> */}
          <video
            ref={videoRef}
            key={isSpeaking ? 'speaking' : 'muted'} // Fuerza el re-renderizado al cambiar de estado si src no es suficiente
            // src se establecerá en el useEffect
            autoPlay
            loop
            muted // Importante para autoplay en muchos navegadores
            playsInline // Importante para iOS
            className="w-full h-auto rounded-lg object-cover shadow-lg max-h-full" // Ajusta estilos - añadido max-h-full para seguridad
            // Podrías añadir un poster con una imagen inicial si quieres: poster="/images/avatar_poster.jpg" 
          >
            {/* Fallback por si el navegador no soporta video */}
            Tu navegador no soporta el elemento de video. 
          </video>
        {/* </div> */}
      </div>

    </div>
  );
};

export default VoiceChatContainer; 