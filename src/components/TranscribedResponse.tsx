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
  userName?: string | null;
  messageId?: string;
}

const TranscribedResponse: React.FC<TranscribedResponseProps> = ({
  text,
  isUser,
  isHighlighted = false,
  timestamp,
  tags = [],
  suggestedVideo,
  avatarUrl,
  userName,
  messageId,
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
      className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4 items-end`}
    >
      {/* Avatar o indicador */}
      <div className={`w-10 h-10 rounded-full overflow-hidden flex-shrink-0 ${
        isUser ? 'order-2 ml-3' : 'order-1 mr-3'
      } shadow-md`}>
        {isUser ? (
          avatarUrl ? (
            <Image 
              src={avatarUrl}
              alt="Avatar del usuario"
              width={40}
              height={40}
              className="w-full h-full object-cover"
              onError={(e) => {
                console.log('[TranscribedResponse] Error loading user avatar, falling back to placeholder');
                e.currentTarget.style.display = 'none';
              }}
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-bold text-lg shadow-inner">
              {/* Mostrar iniciales del nombre del usuario */}
              {userName ? 
                userName.split(' ').map(name => name.charAt(0)).join('').slice(0, 2).toUpperCase() : 
                'U'
              }
            </div>
          )
        ) : (
          <div className="w-full h-full bg-primary-100 flex items-center justify-center text-primary-600">
            <Image 
                src="/img/MarIA.png" 
                alt="MarIA Avatar"
                width={40}
                height={40}
                className="w-full h-full object-cover" 
                onError={(e) => {
                  console.log('[TranscribedResponse] Error loading MarIA avatar');
                  e.currentTarget.style.display = 'none';
                }}
            />
          </div>
        )}
      </div>

      <div className={`max-w-[75%] md:max-w-[65%] ${isUser ? 'order-1' : 'order-2'}`}>
        {/* Contenedor del mensaje */}
        <div 
          data-message-id={messageId}
          className={`rounded-xl px-4 py-3 ${
            isUser 
              ? 'bg-primary-600 text-white shadow-md' 
              : 'bg-white border border-neutral-200 dark:bg-neutral-700 dark:border-neutral-600 shadow-md text-neutral-800 dark:text-neutral-100'
          } ${isHighlighted ? 'ring-2 ring-primary-400 dark:ring-primary-500' : ''}`}
        >
          {/* Texto del mensaje */}
          <div className="whitespace-pre-wrap text-sm">
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
            isUser ? 'text-blue-100' : 'text-neutral-500 dark:text-neutral-400'
          }`}>
            {timestamp}
          </div>
          
          {/* Disclaimer para mensajes del asistente */}
          {!isUser && (
            <div className="mt-2 pt-2 border-t border-neutral-200 dark:border-neutral-600 text-xs text-neutral-600 dark:text-neutral-400 italic">
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
    </motion.div>
  );
};

export default TranscribedResponse;