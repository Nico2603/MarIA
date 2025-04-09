import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import InteractiveVoiceAvatar from './InteractiveVoiceAvatar';
import TranscribedResponse from './TranscribedResponse';

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: string;
}

const VoiceChatContainer: React.FC = () => {
  // Estados para controlar las diferentes fases de la conversación
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [currentSpeakingId, setCurrentSpeakingId] = useState<string | null>(null);
  const [userInput, setUserInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  
  // Referencia para el reconocimiento de voz (simulado para la demo)
  const recognitionRef = useRef<any>(null);
  const speechSynthesisRef = useRef<any>(null);
  
  // Inicializar el reconocimiento de voz (Web Speech API) - simulado para la demo
  useEffect(() => {
    // Comprobar si el navegador soporta la API de reconocimiento de voz
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      // @ts-ignore - La definición de tipos para SpeechRecognition no está incluida en TypeScript por defecto
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = 'es-ES';
      
      recognitionRef.current.onresult = (event: any) => {
        const transcript = Array.from(event.results)
          .map((result: any) => result[0])
          .map((result: any) => result.transcript)
          .join('');
        
        setUserInput(transcript);
      };
      
      recognitionRef.current.onend = () => {
        // Solo detener el estado de escucha si no fue una interrupción intencionada
        if (isListening) {
          handleStopListening();
        }
      };
    }
    
    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (error) {
          console.error('Error al detener el reconocimiento de voz:', error);
        }
      }
    };
  }, [isListening]);
  
  // Simular respuestas del asistente
  const simulateAssistantResponse = (userMessage: string) => {
    setIsProcessing(true);
    
    // Simular un tiempo de procesamiento
    setTimeout(() => {
      setIsProcessing(false);
      
      // Generar una respuesta simple basada en palabras clave
      let response = '';
      const lowercasedInput = userMessage.toLowerCase();
      
      if (lowercasedInput.includes('hola') || lowercasedInput.includes('saludos') || lowercasedInput.includes('buenos días')) {
        response = '¡Hola! Soy tu asistente de salud mental. ¿Cómo puedo ayudarte hoy?';
      } else if (lowercasedInput.includes('ansiedad') || lowercasedInput.includes('estres') || lowercasedInput.includes('estrés')) {
        response = 'La ansiedad es una respuesta natural del cuerpo ante situaciones estresantes. Algunas técnicas que pueden ayudarte son la respiración profunda, el mindfulness y el ejercicio regular. Si sientes que tu ansiedad interfiere significativamente con tu vida diaria, te recomendaría buscar ayuda profesional.';
      } else if (lowercasedInput.includes('depresión') || lowercasedInput.includes('depresion') || lowercasedInput.includes('triste')) {
        response = 'Sentirse triste o deprimido puede ser muy difícil. Es importante que sepas que no estás solo/a. Te recomendaría hablar con amigos de confianza o familiares sobre cómo te sientes, y considerar buscar ayuda profesional con un psicólogo o psiquiatra que pueda ofrecerte el apoyo adecuado.';
      } else if (lowercasedInput.includes('dormir') || lowercasedInput.includes('insomnio') || lowercasedInput.includes('sueño')) {
        response = 'Los problemas de sueño pueden afectar significativamente tu bienestar. Algunas recomendaciones incluyen mantener un horario regular de sueño, crear una rutina relajante antes de acostarte, limitar la cafeína y las pantallas antes de dormir, y asegurarte de que tu entorno de sueño sea cómodo y tranquilo.';
      } else {
        response = 'Gracias por compartir eso conmigo. ¿Podrías contarme un poco más sobre cómo te sientes al respecto? Estoy aquí para escucharte y ofrecerte apoyo.';
      }
      
      // Añadir la respuesta a los mensajes
      const newMessage: Message = {
        id: Date.now().toString(),
        text: response,
        isUser: false,
        timestamp: new Date().toLocaleTimeString(),
      };
      
      setMessages(prevMessages => [...prevMessages, newMessage]);
      setCurrentSpeakingId(newMessage.id);
      
      // Simular la síntesis de voz
      speakText(response, newMessage.id);
    }, 1500);
  };
  
  // Función para sintetizar voz (Text-to-Speech)
  const speakText = (text: string, messageId: string) => {
    // Comprobar si el navegador soporta la API de síntesis de voz
    if ('speechSynthesis' in window) {
      // Cancelar cualquier síntesis en curso
      window.speechSynthesis.cancel();
      
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'es-ES';
      utterance.rate = 1.0;
      utterance.pitch = 1.0;
      
      // Configurar una voz española si está disponible
      const voices = window.speechSynthesis.getVoices();
      const spanishVoice = voices.find(voice => voice.lang === 'es-ES');
      if (spanishVoice) {
        utterance.voice = spanishVoice;
      }
      
      setIsSpeaking(true);
      
      utterance.onend = () => {
        setIsSpeaking(false);
        setCurrentSpeakingId(null);
      };
      
      window.speechSynthesis.speak(utterance);
      speechSynthesisRef.current = utterance;
    } else {
      console.log('La síntesis de voz no es compatible con este navegador.');
      setIsSpeaking(false);
      setCurrentSpeakingId(null);
    }
  };
  
  // Funciones para controlar el inicio y fin de la escucha
  const handleStartListening = () => {
    setIsListening(true);
    setUserInput('');
    
    if (recognitionRef.current) {
      try {
        recognitionRef.current.start();
      } catch (error) {
        console.error('Error al iniciar el reconocimiento de voz:', error);
      }
    } else {
      // Simulación para navegadores sin soporte
      console.log('Simulando reconocimiento de voz...');
    }
  };
  
  const handleStopListening = () => {
    setIsListening(false);
    
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (error) {
        console.error('Error al detener el reconocimiento de voz:', error);
      }
    }
    
    // Si hay texto reconocido, enviarlo como mensaje
    if (userInput.trim()) {
      const message: Message = {
        id: Date.now().toString(),
        text: userInput,
        isUser: true,
        timestamp: new Date().toLocaleTimeString(),
      };
      
      setMessages(prevMessages => [...prevMessages, message]);
      
      // Procesar la respuesta del asistente
      simulateAssistantResponse(userInput);
      
      // Limpiar el input
      setUserInput('');
    }
  };
  
  // Detener la síntesis de voz si el usuario comienza a hablar
  useEffect(() => {
    if (isListening && isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      setCurrentSpeakingId(null);
    }
  }, [isListening, isSpeaking]);
  
  return (
    <div className="flex flex-col h-full">
      <div className="flex flex-col md:flex-row h-full">
        {/* Panel izquierdo para el avatar y controles, ocupa 1/3 en escritorio */}
        <div className="w-full md:w-1/3 p-6 flex flex-col items-center justify-center bg-white">
          <div className="max-w-sm w-full">
            <div className="mb-8 text-center">
              <h2 className="text-2xl font-medium text-neutral-800 mb-2">Asistente de Salud Mental</h2>
              <p className="text-neutral-500">
                Habla conmigo para recibir orientación y apoyo en temas de salud mental
              </p>
            </div>
            
            <InteractiveVoiceAvatar
              isListening={isListening}
              isProcessing={isProcessing}
              isSpeaking={isSpeaking}
              onStartListening={handleStartListening}
              onStopListening={handleStopListening}
              size="lg"
            />
            
            {/* Texto reconocido en tiempo real */}
            {isListening && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-6 p-4 bg-blue-50 border border-blue-100 rounded-lg text-center"
              >
                <p className="text-neutral-800 font-medium mb-1">Te estoy escuchando...</p>
                <p className="text-neutral-600 italic">
                  {userInput || "Esperando que hables..."}
                </p>
              </motion.div>
            )}
            
            {/* Consejos de uso */}
            <div className="mt-8 bg-neutral-50 rounded-lg p-4 text-sm text-neutral-600">
              <h3 className="font-medium text-neutral-700 mb-2">Sugerencias:</h3>
              <ul className="space-y-2">
                <li className="flex items-start">
                  <span className="text-primary-500 mr-2">•</span>
                  <span>Habla claramente y a un ritmo normal</span>
                </li>
                <li className="flex items-start">
                  <span className="text-primary-500 mr-2">•</span>
                  <span>Puedes preguntar sobre ansiedad, depresión o problemas de sueño</span>
                </li>
                <li className="flex items-start">
                  <span className="text-primary-500 mr-2">•</span>
                  <span>Recuerda que esta es una herramienta de apoyo, no sustituye a un profesional</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
        
        {/* Panel derecho para la transcripción de mensajes, ocupa 2/3 en escritorio */}
        <div className="w-full md:w-2/3 border-t md:border-t-0 md:border-l border-neutral-200 flex flex-col">
          <TranscribedResponse 
            responses={messages} 
            currentSpeaking={currentSpeakingId} 
          />
        </div>
      </div>
    </div>
  );
};

export default VoiceChatContainer; 