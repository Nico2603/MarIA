import React, { useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface ResponseItem {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: string;
}

interface TranscribedResponseProps {
  responses: ResponseItem[];
  currentSpeaking: string | null;
}

const TranscribedResponse: React.FC<TranscribedResponseProps> = ({ 
  responses,
  currentSpeaking
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Auto-scroll al último mensaje
  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [responses]);
  
  // Si no hay respuestas aún, mostrar un mensaje de bienvenida
  if (responses.length === 0) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-8 text-center">
        <div className="text-neutral-400">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto mb-4 opacity-30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
          </svg>
          <h3 className="text-xl font-medium mb-2 text-neutral-600">Tu conversación aparecerá aquí</h3>
          <p className="text-neutral-500">
            Presiona el botón del micrófono para comenzar a hablar con el asistente
          </p>
        </div>
      </div>
    );
  }
  
  // Agrupar mensajes consecutivos del mismo interlocutor
  const groupedResponses: ResponseItem[][] = [];
  let currentGroup: ResponseItem[] = [];
  
  responses.forEach((response, index) => {
    if (index === 0 || response.isUser !== responses[index - 1].isUser) {
      if (currentGroup.length > 0) {
        groupedResponses.push(currentGroup);
      }
      currentGroup = [response];
    } else {
      currentGroup.push(response);
    }
  });
  
  if (currentGroup.length > 0) {
    groupedResponses.push(currentGroup);
  }
  
  return (
    <div 
      ref={containerRef}
      className="flex-1 overflow-y-auto p-6 bg-gradient-to-b from-blue-50 to-white"
    >
      <div className="max-w-3xl mx-auto space-y-8">
        <AnimatePresence>
          {groupedResponses.map((group, groupIndex) => {
            const isUser = group[0].isUser;
            
            return (
              <motion.div 
                key={group[0].id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`max-w-[85%] ${isUser ? 'order-1' : 'order-2'}`}>
                  {/* Indicador de quién habla */}
                  <div className="mb-2 text-sm font-medium text-neutral-500">
                    {isUser ? 'Tú' : 'Asistente AI'}
                  </div>
                  
                  {/* Contenedor de mensajes */}
                  <div className={`rounded-2xl p-5 ${
                    isUser 
                      ? 'bg-primary-600 text-white' 
                      : 'bg-white border border-neutral-200 shadow-sm text-neutral-800'
                  }`}>
                    <div className="space-y-4">
                      {group.map((response, index) => (
                        <div key={response.id}>
                          {/* Texto del mensaje */}
                          <div className="prose prose-sm max-w-none">
                            {currentSpeaking === response.id ? (
                              // Mostrar text con efecto de "typing" cuando está hablando
                              <p>
                                {response.text}
                                <motion.span
                                  animate={{ opacity: [0, 1, 0] }}
                                  transition={{ duration: 1, repeat: Infinity }}
                                >▋</motion.span>
                              </p>
                            ) : (
                              <p>{response.text}</p>
                            )}
                          </div>
                          
                          {/* Timestamp y separador entre mensajes */}
                          <div className="mt-2 flex items-center justify-between">
                            <div className={`text-xs ${
                              isUser ? 'text-blue-100' : 'text-neutral-400'
                            }`}>
                              {response.timestamp}
                            </div>
                            
                            {/* Pequeño indicador de audio solo para los mensajes del asistente */}
                            {!isUser && currentSpeaking === response.id && (
                              <div className="flex space-x-1">
                                <motion.div
                                  animate={{ height: [3, 8, 3] }}
                                  transition={{ duration: 0.5, repeat: Infinity }}
                                  className="w-0.5 bg-primary-500 rounded-full"
                                />
                                <motion.div
                                  animate={{ height: [4, 12, 4] }}
                                  transition={{ duration: 0.5, repeat: Infinity, delay: 0.1 }}
                                  className="w-0.5 bg-primary-500 rounded-full"
                                />
                                <motion.div
                                  animate={{ height: [2, 6, 2] }}
                                  transition={{ duration: 0.5, repeat: Infinity, delay: 0.2 }}
                                  className="w-0.5 bg-primary-500 rounded-full"
                                />
                              </div>
                            )}
                          </div>
                          
                          {/* Separador entre mensajes del mismo grupo */}
                          {index < group.length - 1 && (
                            <div className={`my-4 border-t ${
                              isUser ? 'border-blue-500' : 'border-neutral-100'
                            }`} />
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                
                {/* Avatar o indicador */}
                <div className={`w-8 h-8 rounded-full overflow-hidden flex-shrink-0 ${
                  isUser ? 'order-2 ml-3' : 'order-1 mr-3'
                }`}>
                  {isUser ? (
                    <div className="w-full h-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold">
                      T
                    </div>
                  ) : (
                    <div className="w-full h-full bg-primary-100 flex items-center justify-center text-primary-600">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                      </svg>
                    </div>
                  )}
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default TranscribedResponse; 