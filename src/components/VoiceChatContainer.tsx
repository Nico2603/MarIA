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
import { Send, AlertCircle } from 'lucide-react';

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
  
  // Función para limpiar errores
  const clearError = () => setAppError({ type: null, message: null });
  
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
        clearError(); // Limpiar errores al intentar conectar
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
            clearError(); // Limpiar errores de conexión al conectar exitosamente
            room.localParticipant.setMicrophoneEnabled(true);
          })
          .on(RoomEvent.Disconnected, (reason) => {
            console.log('Desconectado de la sala LiveKit:', reason);
            setConnectionState('disconnected');
            setAppError({ type: 'livekit', message: 'Desconectado del chat de voz.' });
            roomRef.current = null;
          })
          .on(RoomEvent.TrackSubscribed, 
            (track: RemoteTrack, publication: RemoteTrackPublication, participant: RemoteParticipant) => { 
             if (track.kind === Track.Kind.Audio) {
                const audioElement = track.attach();
                if (audioElement) {
                    document.body.appendChild(audioElement);
                }
             }
          });
          
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
        if (!liveKitToken && connectionState === 'disconnected') { // Solo intentar si está desconectado
            const token = await getLiveKitToken();
            if (token) { 
                connectToRoom(token);
            } else {
                 console.log("Fallo al obtener token de LiveKit, no se intentará conectar.");
            }
        }
    };

    initializeConnection();

    return () => {
      roomRef.current?.disconnect();
    };
  }, [getLiveKitToken, connectionState, liveKitToken]); // Añadir liveKitToken para reintentar si cambia

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
      utterance.lang = 'es-CO'; // Voz de Colombia
      utterance.rate = 1.0;
      utterance.pitch = 1.0;
      
      // Buscar voz es-CO o es-419 (Latam) o es-ES como fallback
      const voices = window.speechSynthesis.getVoices();
      const preferredVoices = voices.filter(voice => 
          voice.lang === 'es-CO' || voice.lang === 'es-419' || voice.lang === 'es-ES'
      );
      // Seleccionar la primera voz preferida encontrada o una genérica en español
      utterance.voice = preferredVoices[0] || voices.find(voice => voice.lang.startsWith('es')) || null;
      
      if (!utterance.voice) {
          console.warn("No se encontró voz en español, usando predeterminada.");
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

  const handleStartListening = () => {
    clearError(); 
    if (isSpeaking) {
       window.speechSynthesis.cancel();
       setIsSpeaking(false);
       setCurrentSpeakingId(null);
    }
    if (recognitionRef.current && connectionState === 'connected') {
      try {
        setUserInput(''); 
        recognitionRef.current.start();
        setIsListening(true);
      } catch (error) {
        console.error('Error al iniciar reconocimiento:', error);
        setAppError({ type: 'stt', message: 'No se pudo iniciar el reconocimiento de voz.' });
      }
    } else if (connectionState !== 'connected') {
        console.warn('LiveKit no está conectado.');
        setAppError({ type: 'livekit', message: 'El chat de voz no está conectado.' });
        // Intentar obtener token de nuevo si estamos desconectados para disparar el useEffect de conexión
        if (connectionState === 'disconnected') getLiveKitToken(); 
    } else {
      console.warn('Reconocimiento de voz no está listo.');
      setAppError({ type: 'stt', message: 'El reconocimiento de voz no está disponible.' });
    }
  };
  
  // Modificado para recibir el texto final directamente desde el evento onresult
  const handleStopListening = (finalTranscript: string) => {
    setIsListening(false);
    if (finalTranscript.trim()) {
      const userMessage: Message = {
        id: Date.now().toString(),
        text: finalTranscript.trim(),
        isUser: true,
        timestamp: new Date().toLocaleTimeString(),
      };
      setMessages(prevMessages => [...prevMessages, userMessage]);
      
      // Enviar a OpenAI
      getOpenAIResponse(finalTranscript.trim());
      
      setUserInput(''); // Limpiar input visual
    }
  };

  // <<< Nueva función para enviar mensajes de texto >>>
  const handleSendTextMessage = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const messageText = textInput.trim();
    if (messageText) {
      clearError(); // Limpiar errores al enviar
      const userMessage: Message = {
        id: Date.now().toString(),
        text: messageText,
        isUser: true,
        timestamp: new Date().toLocaleTimeString(),
      };
      setMessages(prevMessages => [...prevMessages, userMessage]);
      
      // Enviar a OpenAI
      getOpenAIResponse(messageText);
      
      setTextInput(''); // Limpiar input de texto
    }
  };

  // --- Renderizado ---
  return (
    <div className="flex flex-col h-full">
      {/* Banner de Error General */}
      {appError.message && (
          <div className={`p-3 text-center text-white text-sm ${appError.type === 'livekit' ? 'bg-red-600' : 'bg-yellow-600'} flex items-center justify-center space-x-2`}>
              <AlertCircle className="w-5 h-5"/>
              <span>{appError.message}</span>
              <button onClick={clearError} className="ml-4 text-xs underline">Descartar</button>
          </div>
      )}
      <div className="flex flex-col md:flex-row h-full flex-1 relative">
        {/* Panel izquierdo */}
        <div className="w-full md:w-1/3 p-6 flex flex-col items-center justify-center bg-white dark:bg-neutral-800 border-r border-neutral-200 dark:border-neutral-700"> {/* dark: aplicado */}
          <div className="max-w-sm w-full">
            <div className="mb-8 text-center">
              <h2 className="text-2xl font-medium text-neutral-800 dark:text-neutral-100 mb-2">Asistente Virtual</h2>
              <p className="text-neutral-500 dark:text-neutral-400">
                Presiona el micrófono para hablar
              </p>
            </div>
            
            <InteractiveVoiceAvatar
              isListening={isListening}
              isProcessing={isProcessing}
              isSpeaking={isSpeaking}
              onStartListening={handleStartListening}
              // handleStopListening ahora se llama internamente desde onresult con texto final
              onStopListening={() => { if (recognitionRef.current) recognitionRef.current.stop(); }} // Para el botón explícito
              size="lg"
            />
            
            {isListening && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/30 border border-blue-100 dark:border-blue-800 rounded-lg text-center min-h-[60px]"
              >
                <p className="text-neutral-800 dark:text-neutral-200 font-medium mb-1">Escuchando...</p>
                <p className="text-neutral-600 dark:text-neutral-300 italic">
                  {userInput || "..."}
                </p>
              </motion.div>
            )}
             {isProcessing && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-6 p-4 bg-yellow-50 dark:bg-yellow-900/30 border border-yellow-100 dark:border-yellow-800 rounded-lg text-center min-h-[60px]"
              >
                 <p className="text-neutral-800 dark:text-neutral-200 font-medium mb-1">Procesando...</p>
              </motion.div>
            )}

            {/* <<< Ocultar Consejos si está escuchando >>> */}
            {!isListening && (
            <div className="mt-8 bg-neutral-50 dark:bg-neutral-700 rounded-lg p-4 text-sm text-neutral-600 dark:text-neutral-300">
                <h3 className="font-medium text-neutral-700 dark:text-neutral-100 mb-2">Consejos:</h3>
              <ul className="space-y-2">
                  <li className="flex items-start"><span className="text-primary-500 mr-2">•</span><span>Habla claro y cerca del micrófono.</span></li>
                  <li className="flex items-start"><span className="text-primary-500 mr-2">•</span><span>Espera a que termine de hablar antes de responder.</span></li>
                  <li className="flex items-start"><span className="text-primary-500 mr-2">•</span><span>Recuerda que soy una IA, no un terapeuta real.</span></li>
              </ul>
            </div>
            )}
          </div>
        </div>
        
        {/* Panel derecho (con chat y nuevo input) */}
        <div className="flex-1 flex flex-col bg-neutral-50 dark:bg-neutral-850 overflow-hidden">
          {/* Historial de Mensajes */}
          <div className="flex-1 overflow-y-auto p-4 pb-20">
            <div className="max-w-3xl mx-auto space-y-6">
                {messages.map((msg) => (
                  <TranscribedResponse
                    key={msg.id}
                    text={msg.text}
                    isUser={msg.isUser}
                    isHighlighted={currentSpeakingId === msg.id}
                    timestamp={msg.timestamp}
                  // Ya no pasamos tags
                  />
                ))}
              {messages.length === 0 && (
              <div className="text-center text-neutral-500 dark:text-neutral-400 py-12">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-neutral-300 dark:text-neutral-600 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/>
                </svg>
                    <p className="text-lg">Hola, soy tu asistente de IA.</p>
                    <p className="mt-2">Haz clic en el micrófono para comenzar.</p>
              </div>
            )}
            </div>
          </div>

          {/* <<< Input de Texto Fijo Abajo >>> */}
          <div className="sticky bottom-0 left-0 right-0 p-4 bg-neutral-100 dark:bg-neutral-800 border-t border-neutral-200 dark:border-neutral-700">
            <form onSubmit={handleSendTextMessage} className="max-w-3xl mx-auto flex items-center space-x-2">
              <input
                type="text"
                value={textInput}
                onChange={(e) => setTextInput(e.target.value)}
                placeholder="Escribe tu mensaje aquí..."
                className="flex-1 px-4 py-2 border border-neutral-300 dark:border-neutral-600 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-neutral-700 text-neutral-900 dark:text-neutral-100 placeholder-neutral-400 dark:placeholder-neutral-500"
                disabled={isProcessing || isListening} // Deshabilitar mientras procesa o escucha
              />
              <button 
                type="submit"
                className="bg-blue-600 hover:bg-blue-700 text-white rounded-full p-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-neutral-800"
                disabled={!textInput.trim() || isProcessing || isListening}
              >
                <Send className="w-5 h-5" />
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VoiceChatContainer; 