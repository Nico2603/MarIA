import React from 'react';
import { motion } from 'framer-motion';
import { Video } from 'lucide-react';
import Image from 'next/image';

interface TranscribedResponseProps {
  text: string;
  isUser: boolean;
  isHighlighted?: boolean;
  timestamp?: string;
  tags?: string[];
  suggestedVideo?: { title: string; url: string };
  avatarUrl?: string;
}

const TranscribedResponse: React.FC<TranscribedResponseProps> = ({
  text,
  isUser,
  isHighlighted = false,
  timestamp,
  tags = [],
  suggestedVideo,
  avatarUrl,
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
      initial={{ opacity: 0, x: isUser ? 20 : -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`}
    >
      <div className={`max-w-[85%] ${isUser ? 'order-1' : 'order-2'}`}>
        {/* Indicador de quién habla */}
        <div className="mb-1 text-sm font-medium text-neutral-500">
          {isUser ? 'Tú' : 'María'}
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
          
          {/* Disclaimer para mensajes del asistente */}
          {!isUser && (
            <div className="mt-3 text-xs text-neutral-400 italic">
              Este asistente está especializado en ansiedad para el contexto colombiano, pero no sustituye a un profesional.
            </div>
          )}

          {/* Botón para video sugerido */}
          {!isUser && suggestedVideo && (
            <div className="mt-3 pt-3 border-t border-neutral-200">
              <a 
                href={suggestedVideo.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md shadow-sm text-white bg-secondary-600 hover:bg-secondary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-secondary-500 transition-colors"
              >
                <Video className="-ml-0.5 mr-1.5 h-4 w-4" aria-hidden="true" />
                {suggestedVideo.title}
              </a>
            </div>
          )}
        </div>
      </div>
      
      {/* Avatar o indicador */}
      <div className={`w-8 h-8 rounded-full overflow-hidden flex-shrink-0 ${
        isUser ? 'order-2 ml-3' : 'order-1 mr-3'
      }`}>
        {isUser ? (
          avatarUrl ? (
            <Image 
              src={avatarUrl}
              alt="Avatar del usuario"
              width={32}
              height={32}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold">
              T
            </div>
          )
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