import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import ChatBubble from './ChatBubble';
import ChatInput from './ChatInput';

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: string;
  hasResources?: boolean;
  resources?: {
    title: string;
    url: string;
    type: 'article' | 'contact' | 'guide';
  }[];
}

const ChatContainer: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: 'Hola, soy tu asistente especializado en ansiedad y depresión. Estoy aquí para escucharte y brindarte orientación inicial. Esta es tu sesión gratuita, ¿cómo puedo ayudarte hoy?',
      isUser: false,
      timestamp: new Date().toLocaleTimeString(),
    },
  ]);
  const [isProcessing, setIsProcessing] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const suggestedQuestions = [
    '¿Qué síntomas de ansiedad son comunes?',
    '¿Cómo distinguir tristeza de depresión?',
    'Técnicas para reducir la ansiedad',
    'Recursos para depresión en Colombia',
  ];

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = (text: string) => {
    // Añadir mensaje del usuario
    const userMessage: Message = {
      id: Date.now().toString(),
      text,
      isUser: true,
      timestamp: new Date().toLocaleTimeString(),
    };
    
    setMessages((prev) => [...prev, userMessage]);
    setIsProcessing(true);
    
    // Simular respuesta del asistente (aquí se integraría con OpenAI u otro backend)
    setTimeout(() => {
      let aiResponse: Message;
      
      // Respuestas simuladas basadas en palabras clave
      if (text.toLowerCase().includes('ansiedad')) {
        aiResponse = {
          id: (Date.now() + 1).toString(),
          text: 'La ansiedad es una respuesta natural ante situaciones estresantes, pero cuando se vuelve persistente puede afectar tu bienestar. Algunas técnicas que pueden ayudar son la respiración profunda, mindfulness y la actividad física regular. Si sientes que tu ansiedad interfiere con tus actividades diarias, te recomiendo consultar con un profesional especializado.',
          isUser: false,
          timestamp: new Date().toLocaleTimeString(),
          hasResources: true,
          resources: [
            {
              title: 'Técnicas de manejo de ansiedad',
              url: 'https://example.com/ansiedad',
              type: 'guide'
            },
            {
              title: 'Línea de apoyo emocional',
              url: 'tel:+123456789',
              type: 'contact'
            }
          ]
        };
      } else if (text.toLowerCase().includes('depresión') || text.toLowerCase().includes('depresion')) {
        aiResponse = {
          id: (Date.now() + 1).toString(),
          text: 'La depresión es un trastorno del estado de ánimo que afecta cómo te sientes, piensas y manejas las actividades diarias. Es importante que sepas que no estás solo/a y que la depresión tiene tratamiento. Te recomiendo buscar apoyo profesional a través de un psicólogo o psiquiatra que pueda ofrecerte el acompañamiento adecuado.',
          isUser: false,
          timestamp: new Date().toLocaleTimeString(),
          hasResources: true,
          resources: [
            {
              title: 'Señales de alerta de la depresión',
              url: 'https://example.com/depresion',
              type: 'article'
            },
            {
              title: 'Directorio de profesionales',
              url: 'https://example.com/directorio',
              type: 'guide'
            }
          ]
        };
      } else if (text.toLowerCase().includes('pago') || text.toLowerCase().includes('precio') || text.toLowerCase().includes('costo') || text.toLowerCase().includes('suscripción') || text.toLowerCase().includes('suscripcion')) {
        aiResponse = {
          id: (Date.now() + 1).toString(),
          text: 'Esta es tu sesión gratuita. Para continuar recibiendo apoyo, ofrecemos sesiones individuales por 40.000 COP o una suscripción mensual de 120.000 COP que incluye 4 sesiones al mes. Puedes encontrar más detalles en la página principal o preguntarme si necesitas más información.',
          isUser: false,
          timestamp: new Date().toLocaleTimeString(),
        };
      } else {
        aiResponse = {
          id: (Date.now() + 1).toString(),
          text: 'Gracias por compartir conmigo. Estoy especializado en brindar apoyo inicial para temas de ansiedad y depresión. ¿Hay algo específico sobre estos temas de lo que quieras hablar? Recuerda que esta es tu sesión gratuita.',
          isUser: false,
          timestamp: new Date().toLocaleTimeString(),
        };
      }
      
      setMessages((prev) => [...prev, aiResponse]);
      setIsProcessing(false);
    }, 2000);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-64px)]">
      {/* Área de chat */}
      <div className="flex-1 p-4 overflow-y-auto bg-neutral-50">
        <div className="container-app">
          <div className="max-w-3xl mx-auto">
            {messages.map((message) => (
              <ChatBubble
                key={message.id}
                message={message.text}
                isUser={message.isUser}
                timestamp={message.timestamp}
                hasResources={message.hasResources}
                resources={message.resources}
              />
            ))}
            
            {isProcessing && (
              <div className="flex justify-start mb-4">
                <div className="chat-bubble chat-bubble-ai flex items-center">
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3 }}
                    className="flex space-x-2"
                  >
                    <motion.div
                      animate={{ y: [0, -10, 0] }}
                      transition={{ duration: 1, repeat: Infinity, repeatType: 'loop', times: [0, 0.5, 1] }}
                      className="w-2 h-2 bg-secondary-400 rounded-full"
                    />
                    <motion.div
                      animate={{ y: [0, -10, 0] }}
                      transition={{ duration: 1, repeat: Infinity, repeatType: 'loop', delay: 0.2, times: [0, 0.5, 1] }}
                      className="w-2 h-2 bg-secondary-400 rounded-full"
                    />
                    <motion.div
                      animate={{ y: [0, -10, 0] }}
                      transition={{ duration: 1, repeat: Infinity, repeatType: 'loop', delay: 0.4, times: [0, 0.5, 1] }}
                      className="w-2 h-2 bg-secondary-400 rounded-full"
                    />
                  </motion.div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>
        </div>
      </div>
      
      {/* Área de input */}
      <div className="px-4 pb-4 bg-white">
        <div className="container-app">
          <div className="max-w-3xl mx-auto">
            <ChatInput
              onSendMessage={handleSendMessage}
              isProcessing={isProcessing}
              suggestedQuestions={suggestedQuestions}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatContainer; 