import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import InteractiveVoiceAvatar from './InteractiveVoiceAvatar';
import TranscribedResponse from './TranscribedResponse';

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: string;
  tags?: string[]; // Etiquetas para categorizar los mensajes
}

// Tipos de temas permitidos
type MessageTopic = 'ansiedad' | 'depresión' | 'off-topic';

const VoiceChatContainer: React.FC = () => {
  // Estados para controlar las diferentes fases de la conversación
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [currentSpeakingId, setCurrentSpeakingId] = useState<string | null>(null);
  const [userInput, setUserInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentTopic, setCurrentTopic] = useState<MessageTopic | null>(null);
  
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

  // Función para categorizar mensajes según su contenido
  const categorizarMensaje = (texto: string): { topic: MessageTopic, tags: string[] } => {
    const textoLower = texto.toLowerCase();
    let topic: MessageTopic = 'off-topic';
    const tags: string[] = [];
    
    // Palabras clave para ansiedad
    const keywordsAnsiedad = [
      'ansiedad', 'ansioso', 'ansiosa', 'nervios', 'nervioso', 'nerviosa', 'angustia', 
      'preocupación', 'preocupado', 'preocupada', 'pánico', 'ataque', 'estrés', 
      'estresado', 'estresada', 'inquieto', 'inquieta', 'miedo', 'temeroso', 'temerosa'
    ];
    
    // Palabras clave para depresión
    const keywordsDepresion = [
      'depresión', 'depresion', 'deprimido', 'deprimida', 'triste', 'tristeza', 
      'desánimo', 'desanimado', 'desanimada', 'melancolía', 'melancólico', 'melancólica', 
      'sin ganas', 'sin energía', 'cansado', 'cansada', 'pesimista', 'desesperanza',
      'insomnio', 'dormir', 'no duermo', 'suicida', 'suicidio', 'matarme'
    ];
    
    // Revisar si el mensaje contiene palabras clave de ansiedad
    if (keywordsAnsiedad.some(word => textoLower.includes(word))) {
      topic = 'ansiedad';
      
      // Etiquetas específicas para ansiedad
      if (textoLower.includes('pánico') || textoLower.includes('ataque')) {
        tags.push('ataques-panico');
      }
      if (textoLower.includes('social') || textoLower.includes('gente')) {
        tags.push('ansiedad-social');
      }
      if (textoLower.includes('respira') || textoLower.includes('respirar')) {
        tags.push('tecnicas-respiracion');
      }
      
      // Etiqueta general
      tags.push('ansiedad');
    }
    
    // Revisar si el mensaje contiene palabras clave de depresión
    if (keywordsDepresion.some(word => textoLower.includes(word))) {
      topic = 'depresión';
      
      // Etiquetas específicas para depresión
      if (textoLower.includes('suicid') || textoLower.includes('matarme')) {
        tags.push('pensamientos-suicidas');
      }
      if (textoLower.includes('dormir') || textoLower.includes('insomnio')) {
        tags.push('problemas-sueno');
      }
      if (textoLower.includes('energia') || textoLower.includes('cansad')) {
        tags.push('falta-energia');
      }
      
      // Etiqueta general
      tags.push('depresión');
    }
    
    return { topic, tags };
  };
  
  // Generar respuesta para redirigir la conversación a temas de ansiedad o depresión
  const generarRespuestaRedireccion = (): string => {
    const respuestasRedireccion = [
      "Entiendo que quieras hablar sobre ese tema. Sin embargo, me especializo en brindar apoyo para ansiedad y depresión. ¿Te gustaría que habláramos sobre cómo manejar síntomas de ansiedad o depresión que puedas estar experimentando?",
      "Agradezco que compartas eso conmigo. Mi función principal es apoyarte con temas relacionados a la ansiedad y depresión. ¿Hay algo específico sobre estos temas que te preocupe actualmente?",
      "Comprendo que ese tema es importante para ti. Mi especialidad es proporcionar orientación sobre ansiedad y depresión. ¿Te puedo ayudar con información o estrategias para manejar alguno de estos estados emocionales?",
      "Gracias por compartir eso. Estoy diseñado principalmente para asistir con temas de ansiedad y depresión. ¿Quizás podríamos hablar sobre cómo estos pueden estar afectando tu bienestar emocional?"
    ];
    
    // Seleccionar una respuesta aleatoria
    return respuestasRedireccion[Math.floor(Math.random() * respuestasRedireccion.length)];
  };
  
  // Simular respuestas del asistente
  const simulateAssistantResponse = (userMessage: string) => {
    setIsProcessing(true);
    
    // Simular un tiempo de procesamiento
    setTimeout(() => {
      setIsProcessing(false);
      
      // Categorizar el mensaje del usuario
      const { topic, tags } = categorizarMensaje(userMessage);
      
      // Actualizar el tema actual de la conversación
      setCurrentTopic(topic);
      
      // Generar una respuesta basada en el tema y las etiquetas
      let response = '';
      
      if (topic === 'ansiedad') {
        if (tags.includes('ataques-panico')) {
          response = 'Los ataques de pánico pueden ser muy angustiantes. Durante un ataque, intenta respirar lentamente (inhala por 4 segundos, mantén 2 segundos, exhala por 6 segundos). Recuerda que los síntomas físicos no son peligrosos aunque se sientan intensos. Si experimentas ataques frecuentes, te recomendaría consultar con un especialista en salud mental que pueda ofrecerte técnicas específicas para tu situación.';
        } else if (tags.includes('ansiedad-social')) {
          response = 'La ansiedad social puede hacer que las interacciones sean difíciles. Algunas estrategias que pueden ayudar incluyen la exposición gradual a situaciones sociales, desafiar pensamientos negativos y técnicas de relajación. Un enfoque terapéutico como la terapia cognitivo-conductual ha demostrado ser muy efectivo para este tipo de ansiedad.';
        } else if (tags.includes('tecnicas-respiracion')) {
          response = 'La respiración diafragmática es una técnica efectiva para reducir la ansiedad. Coloca una mano en tu pecho y otra en tu abdomen. Respira profundamente por la nariz, asegurándote que sea tu abdomen el que se expande, no tu pecho. Exhala lentamente por la boca. Practica esto durante 5-10 minutos varias veces al día para notar beneficios.';
        } else {
          response = 'La ansiedad es una respuesta natural del cuerpo ante situaciones estresantes. Algunas técnicas que pueden ayudarte son la respiración profunda, el mindfulness y el ejercicio regular. Si experimentas síntomas persistentes como preocupación excesiva, problemas para dormir o tensión muscular, te recomendaría buscar ayuda profesional con un especialista en salud mental.';
        }
      } else if (topic === 'depresión') {
        if (tags.includes('pensamientos-suicidas')) {
          response = 'Me preocupa mucho lo que estás compartiendo. Es muy importante que sepas que no estás solo/a y que hay ayuda disponible. Por favor, contacta inmediatamente con un servicio de emergencia como el 123 (Colombia) o busca atención médica urgente. Estos pensamientos son temporales y con el apoyo adecuado puedes superarlos. Tu vida es valiosa y hay profesionales preparados para ayudarte en este momento difícil.';
        } else if (tags.includes('problemas-sueno')) {
          response = 'Los problemas de sueño son comunes en la depresión. Algunas recomendaciones incluyen mantener un horario regular, evitar cafeína y pantallas antes de dormir, y crear un ambiente tranquilo. Si los problemas persisten, un profesional de la salud mental puede ayudarte con técnicas específicas o considerar opciones de tratamiento adicionales.';
        } else if (tags.includes('falta-energia')) {
          response = 'La falta de energía y la fatiga son síntomas frecuentes de la depresión. Aunque parezca contradictorio, la actividad física moderada puede ayudar a aumentar tus niveles de energía. Comienza con actividades pequeñas y ve aumentando gradualmente. También es importante revisar tus patrones de sueño y alimentación. Un profesional de la salud mental puede ofrecerte estrategias adicionales para manejar este síntoma.';
        } else {
          response = 'La depresión es un trastorno que afecta cómo te sientes, piensas y manejas las actividades diarias. Síntomas comunes incluyen tristeza persistente, pérdida de interés en actividades que solías disfrutar y cambios en apetito o sueño. Es importante que sepas que no estás solo/a y que la depresión tiene tratamiento. Te recomendaría buscar ayuda profesional con un psicólogo o psiquiatra especializado.';
        }
      } else {
        // Respuesta para redirigir la conversación si está fuera de tema
        response = generarRespuestaRedireccion();
      }
      
      // Añadir la respuesta a los mensajes
      const newMessage: Message = {
        id: Date.now().toString(),
        text: response,
        isUser: false,
        timestamp: new Date().toLocaleTimeString(),
        tags: tags
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
      // Categorizar el mensaje para asignar etiquetas
      const { tags } = categorizarMensaje(userInput);
      
      const message: Message = {
        id: Date.now().toString(),
        text: userInput,
        isUser: true,
        timestamp: new Date().toLocaleTimeString(),
        tags: tags
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
              <h2 className="text-2xl font-medium text-neutral-800 mb-2">Asistente de Ansiedad y Depresión</h2>
              <p className="text-neutral-500">
                Habla conmigo para recibir orientación y apoyo específico en ansiedad y depresión
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
                  <span>Puedes consultar sobre síntomas de ansiedad o depresión</span>
                </li>
                <li className="flex items-start">
                  <span className="text-primary-500 mr-2">•</span>
                  <span>Mi especialidad es brindar información y apoyo en ansiedad y depresión</span>
                </li>
                <li className="flex items-start">
                  <span className="text-primary-500 mr-2">•</span>
                  <span>Recuerda que soy una herramienta de apoyo, no sustituyo a un profesional</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
        
        {/* Panel derecho para las transcripciones, ocupa 2/3 en escritorio */}
        <div className="flex-1 bg-neutral-50 overflow-y-auto p-4">
          {/* Mostrar todas las respuestas transcritas */}
          <div className="max-w-3xl mx-auto">
            {messages.length > 0 ? (
              <div className="space-y-6">
                {messages.map((msg) => (
                  <TranscribedResponse
                    key={msg.id}
                    text={msg.text}
                    isUser={msg.isUser}
                    isHighlighted={currentSpeakingId === msg.id}
                    timestamp={msg.timestamp}
                    tags={msg.tags}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center text-neutral-500 py-12">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-12 w-12 mx-auto text-neutral-300 mb-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                  />
                </svg>
                <p className="text-lg">Tu sesión enfocada en ansiedad y depresión</p>
                <p className="mt-2">
                  Haz clic en el botón de micrófono para comenzar a hablar
                </p>
              </div>
            )}
            
            {/* Espacio adicional al final para que el scroll muestre el contenido completo */}
            {messages.length > 0 && <div className="h-24" />}
          </div>
        </div>
      </div>
    </div>
  );
};

export default VoiceChatContainer; 