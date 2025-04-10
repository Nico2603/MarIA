import React from 'react';
import { motion } from 'framer-motion';

interface TranscribedResponseProps {
  text: string;
  isUser: boolean;
  isHighlighted?: boolean;
  timestamp?: string;
  tags?: string[];
}

const TranscribedResponse: React.FC<TranscribedResponseProps> = ({
  text,
  isUser,
  isHighlighted = false,
  timestamp,
  tags = []
}) => {
  // Renderizar las etiquetas con colores según categoría
  const renderTags = () => {
    if (!tags || tags.length === 0) return null;
    
    return (
      <div className="flex flex-wrap gap-1 mt-2">
        {tags.map((tag, index) => {
          let bgColor = 'bg-neutral-100 text-neutral-600';
          
          // Asignar colores según categoría
          if (tag === 'ansiedad' || tag.includes('ansiedad')) {
            bgColor = 'bg-blue-100 text-blue-700';
          } else if (tag === 'depresión' || tag.includes('depres')) {
            bgColor = 'bg-purple-100 text-purple-700';
          } else if (tag.includes('panico')) {
            bgColor = 'bg-red-100 text-red-700';
          } else if (tag.includes('suicid')) {
            bgColor = 'bg-red-200 text-red-800';
          } else if (tag.includes('sueno') || tag.includes('dormir')) {
            bgColor = 'bg-indigo-100 text-indigo-700';
          }
          
          return (
            <span 
              key={index} 
              className={`px-2 py-0.5 rounded-full text-xs font-medium ${bgColor}`}
            >
              {tag}
            </span>
          );
        })}
      </div>
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`}
    >
      <div className={`max-w-[85%] ${isUser ? 'order-1' : 'order-2'}`}>
        {/* Indicador de quién habla */}
        <div className="mb-1 text-sm font-medium text-neutral-500">
          {isUser ? 'Tú' : 'Asistente de Ansiedad y Depresión'}
        </div>
        
        {/* Contenedor del mensaje */}
        <div 
          className={`rounded-xl p-4 ${
            isUser 
              ? 'bg-primary-600 text-white' 
              : 'bg-white border border-neutral-200 shadow-sm text-neutral-800'
          } ${isHighlighted ? 'ring-2 ring-primary-300' : ''}`}
        >
          {/* Texto del mensaje */}
          <div className="whitespace-pre-wrap">
            {text}
            {isHighlighted && (
              <motion.span
                animate={{ opacity: [0, 1, 0] }}
                transition={{ duration: 1, repeat: Infinity }}
              >▋</motion.span>
            )}
          </div>
          
          {/* Mostrar etiquetas solo para mensajes del asistente */}
          {!isUser && renderTags()}
          
          {/* Timestamp */}
          <div className={`text-xs mt-2 ${
            isUser ? 'text-blue-100' : 'text-neutral-400'
          }`}>
            {timestamp}
          </div>
          
          {/* Pequeño indicador de audio solo para los mensajes del asistente cuando está hablando */}
          {!isUser && isHighlighted && (
            <div className="flex space-x-1 mt-2">
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
          
          {/* Disclaimer para mensajes del asistente */}
          {!isUser && (
            <div className="mt-3 text-xs text-neutral-400 italic">
              Este asistente está especializado en ansiedad y depresión pero no sustituye a un profesional.
            </div>
          )}
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
};

export default TranscribedResponse; 