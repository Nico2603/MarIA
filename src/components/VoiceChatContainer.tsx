import React, { useState, useEffect, useRef, useCallback, FormEvent } from 'react';
import { motion } from 'framer-motion';
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
import InteractiveVoiceAvatar from './InteractiveVoiceAvatar';
import TranscribedResponse from './TranscribedResponse';
import { Send, AlertCircle, Mic } from 'lucide-react';

// Definir explícitamente la interfaz para los eventos de Web Speech API
// ya que los tipos globales pueden no estar disponibles
interface SpeechRecognitionEvent extends Event {
    results: SpeechRecognitionResultList;
    resultIndex: number;
}

interface SpeechRecognitionErrorEvent extends Event {
    error: string;
}

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
  const [isSpeaking, setIsSpeaking] = useState(false); // Para TTS del navegador
  const [currentSpeakingId, setCurrentSpeakingId] = useState<string | null>(null);
  const [userInput, setUserInput] = useState('');
  const [textInput, setTextInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [connectionState, setConnectionState] = useState<ConnectionState>('disconnected');
  const [liveKitToken, setLiveKitToken] = useState<string | null>(null);
  const [appError, setAppError] = useState<AppError>({ type: null, message: null }); // <<< Estado para errores
  
  const roomRef = useRef<Room | null>(null);
  const recognitionRef = useRef<any>(null); // Web Speech API para STT
  const speechSynthesisRef = useRef<SpeechSynthesisUtterance | null>(null); // Web Speech API para TTS
  const chatEndRef = useRef<HTMLDivElement>(null); // Para scroll automático
  
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
            setAppError({ type: 'livekit', message: 'Desconectado del chat de voz.' });
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
    };
  }, [getLiveKitToken, connectionState, liveKitToken]);

  // --- Reconocimiento de Voz (STT - Web Speech API) ---
  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false; 
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = 'es-CO'; 
      
      recognitionRef.current.onresult = (event: SpeechRecognitionEvent) => { 
        let interimTranscript = '';
        let finalTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          } else {
            interimTranscript += event.results[i][0].transcript;
          }
        }
        setUserInput(interimTranscript || finalTranscript);
        if (finalTranscript) {
           handleStopListening(finalTranscript); 
        }
      };
      
      recognitionRef.current.onerror = (event: SpeechRecognitionErrorEvent) => { 
        console.error('Error en reconocimiento de voz:', event.error);
        setAppError({ type: 'stt', message: `Error STT: ${event.error}` });
        setIsListening(false);
      };

      recognitionRef.current.onend = () => {
        if (isListening) {
             setIsListening(false); 
        }
      };
    } else {
        console.warn("Web Speech Recognition no soportado en este navegador.");
    }

  }, []); // Ejecutar solo una vez para configurar

  // --- Procesamiento con OpenAI y Síntesis de Voz (TTS - Web Speech API) ---
  
  // Función para enviar mensaje a la API de OpenAI
  const getOpenAIResponse = async (userMessage: string) => {
    setIsProcessing(true);
    clearError(); // Limpiar errores previos
    try {
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

      // Añadir la respuesta del asistente
      const newMessage: Message = {
        id: Date.now().toString(),
        text: aiText,
        isUser: false,
        timestamp: new Date().toLocaleTimeString(),
      };
      setMessages(prevMessages => [...prevMessages, newMessage]);
      setCurrentSpeakingId(newMessage.id);
      
      // Usar TTS del navegador para leer la respuesta
      speakText(aiText, newMessage.id);

    } catch (error) {
      console.error("Error al obtener respuesta de OpenAI:", error);
      setAppError({ type: 'openai', message: error instanceof Error ? error.message : 'Error desconocido al contactar OpenAI.' });
    } finally {
      setIsProcessing(false);
    }
  };

  // Función para sintetizar voz (TTS)
  const speakText = (text: string, messageId: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      clearError(); // Limpiar errores previos de TTS
      
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'es-CO'; // Preferencia idioma Colombia
      utterance.rate = 1.0;
      utterance.pitch = 1.0;
      
      // Buscar voces disponibles
      const voices = window.speechSynthesis.getVoices();
      
      // Filtrar por idioma (es-CO, es-419, es-ES) y priorizar femenino
      const preferredVoices = voices.filter(voice => 
          (voice.lang === 'es-CO' || voice.lang === 'es-419' || voice.lang === 'es-ES')
      );
      
      // Intentar encontrar una voz femenina dentro de las preferidas
      let selectedVoice = preferredVoices.find(voice => 
          voice.name.toLowerCase().includes('female') || 
          voice.name.toLowerCase().includes('mujer') || 
          voice.name.toLowerCase().includes('femenino') // Añadir más términos si es necesario
      );
      
      // Si no se encuentra femenina, tomar la primera preferida (CO, 419, ES)
      if (!selectedVoice) {
          selectedVoice = preferredVoices[0];
      }
      
      // Si no hay ninguna preferida, buscar cualquier voz en español
      if (!selectedVoice) {
           selectedVoice = voices.find(voice => voice.lang.startsWith('es'));
      }
      
      utterance.voice = selectedVoice || null; // Asignar la voz encontrada o null (predeterminada)
      
      if (selectedVoice) {
          console.log(`Voz TTS seleccionada: ${selectedVoice.name} (${selectedVoice.lang})`);
      } else {
          console.warn("No se encontró voz en español preferida o genérica, usando predeterminada del sistema.");
      }
      
      setIsSpeaking(true);
      
      utterance.onstart = () => {
          setCurrentSpeakingId(messageId);
          setIsSpeaking(true);
      };
      
      utterance.onend = () => {
        setIsSpeaking(false);
        setCurrentSpeakingId(null);
      };
      
      utterance.onerror = (event) => {
          console.error('Error en síntesis de voz:', event);
          setAppError({ type: 'tts', message: `Error TTS: ${event.error}` });
          setIsSpeaking(false);
          setCurrentSpeakingId(null);
      };

      try {
        window.speechSynthesis.speak(utterance);
        speechSynthesisRef.current = utterance;
      } catch (error) {
          console.error("Error al llamar a speechSynthesis.speak:", error);
          setAppError({ type: 'tts', message: 'No se pudo iniciar la síntesis de voz.' });
          setIsSpeaking(false);
          setCurrentSpeakingId(null);
      }
    } else {
      console.warn('Speech Synthesis no soportado.');
      setAppError({ type: 'tts', message: 'Síntesis de voz no soportada por tu navegador.'});
      setIsSpeaking(false);
      setCurrentSpeakingId(null);
    }
  };
  
  // --- Controladores de Interacción del Avatar ---

  const handleStartListening = async () => {
    clearError();
    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      setCurrentSpeakingId(null);
    }
    
    if (!roomRef.current || connectionState !== 'connected') {
        setAppError({ type: 'livekit', message: 'Chat de voz no conectado. Espera o intenta reconectar.' });
        if (connectionState === 'disconnected') {
             getLiveKitToken();
        }
        return;
    }

    try {
        console.log("Habilitando micrófono local...");
        await roomRef.current.localParticipant.setMicrophoneEnabled(true);
        console.log("Micrófono local habilitado.");
    } catch (error) {
        console.error("Error al habilitar micrófono local:", error);
        setAppError({ type: 'livekit', message: 'No se pudo habilitar el micrófono.' });
        return;
    }

    if (recognitionRef.current) {
      try {
        console.log("Iniciando reconocimiento de voz (STT)...");
        setIsListening(true);
        setUserInput(''); 
        recognitionRef.current.start();
      } catch (error) {
        console.error("Error al iniciar reconocimiento STT:", error);
        setAppError({ type: 'stt', message: 'No se pudo iniciar el reconocimiento de voz.' });
        setIsListening(false);
        try {
          await roomRef.current.localParticipant.setMicrophoneEnabled(false);
          console.log("Micrófono local deshabilitado por fallo de STT.");
        } catch (micError) {
          console.error("Error al deshabilitar micrófono tras fallo STT:", micError);
        }
      }
    }
  };
  
  const handleStopListening = async (finalTranscript: string) => {
    if (recognitionRef.current && isListening) {
      console.log("Deteniendo reconocimiento de voz (STT)...");
      recognitionRef.current.stop();
      setIsListening(false);
      
      if (roomRef.current && roomRef.current.localParticipant) {
        try {
            console.log("Deshabilitando micrófono local...");
            await roomRef.current.localParticipant.setMicrophoneEnabled(false);
            console.log("Micrófono local deshabilitado.");
        } catch (error) {
            console.error("Error al deshabilitar micrófono local:", error);
        }
      }
      
      if (finalTranscript.trim()) {
        const newMessage: Message = {
          id: Date.now().toString(),
          text: finalTranscript.trim(),
          isUser: true,
          timestamp: new Date().toLocaleTimeString(),
        };
        setMessages(prevMessages => [...prevMessages, newMessage]);
        getOpenAIResponse(finalTranscript.trim());
      }
      setUserInput('');
    }
  };

  // <<< Nueva función para enviar mensajes de texto >>>
  const handleSendTextMessage = (event: FormEvent) => {
    event.preventDefault();
    if (textInput.trim()) {
      if (isSpeaking) {
        window.speechSynthesis.cancel();
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

  // Scroll automático al final del chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // --- Renderizado ---
  return (
    <div className="flex flex-1 h-[calc(100vh-64px)] bg-neutral-100 dark:bg-neutral-900">

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
              <p>Haz clic en el micrófono o escribe para comenzar.</p>
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
              disabled={isListening || isProcessing}
            />
            {/* Botón Micrófono */}
            <button 
              type="button"
              onClick={isListening ? () => handleStopListening(userInput) : handleStartListening}
              disabled={isProcessing} // Deshabilitar si OpenAI está procesando
              className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-neutral-800 ${ 
                isListening 
                ? 'bg-red-500 hover:bg-red-600 text-white focus:ring-red-400' 
                : 'bg-primary-600 hover:bg-primary-700 text-white focus:ring-primary-500'
              } ${isProcessing ? 'opacity-50 cursor-not-allowed' : ''}`}
              aria-label={isListening ? "Detener micrófono" : "Activar micrófono"}
            >
              <Mic className="h-5 w-5" />
            </button>
            {/* Botón Enviar */}
            <button
              type="submit"
              disabled={!textInput.trim() || isListening || isProcessing}
              className="w-10 h-10 rounded-full flex items-center justify-center bg-primary-600 text-white hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 dark:focus:ring-offset-neutral-800 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity"
              aria-label="Enviar mensaje"
            >
              {isProcessing ? (
                <div className="w-5 h-5 border-2 border-t-transparent border-white rounded-full animate-spin"></div>
              ) : (
                <Send className="h-5 w-5" />
              )}
            </button>
          </form>
        </div>
      </div>

      {/* Panel Derecho: Avatar Placeholder (para futuro video) */}
      <div className="hidden md:flex md:w-2/3 p-6 flex-col items-center justify-center bg-white dark:bg-neutral-800 border-l border-neutral-200 dark:border-neutral-700">
        <div className="max-w-sm w-full flex flex-col items-center justify-center h-full">
            {/* Solo el avatar interactivo */}
            <InteractiveVoiceAvatar 
                isListening={isListening}
                isSpeaking={isSpeaking}
                isProcessing={isProcessing}
                onStartListening={handleStartListening}
                onStopListening={() => handleStopListening(userInput)}
                size="lg"
            />
        </div>
        {/* Se eliminaron: Título, Subtítulo, Botón Micrófono redundante, Consejos, Copyright */}
      </div>

    </div>
  );
};

export default VoiceChatContainer; 