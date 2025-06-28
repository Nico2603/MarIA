import React from 'react';
import { motion } from 'framer-motion';
import { Video, ExternalLink, FileText, Info, AlertTriangle, CheckCircle, Play, Image as ImageIcon, Star, Lightbulb, Activity } from 'lucide-react';
import Image from 'next/image';
import type { RichContent } from '@/types';

interface TranscribedResponseProps {
  text: string;
  isUser: boolean;
  isHighlighted?: boolean;
  timestamp?: string;
  tags?: string[];
  suggestedVideo?: { title: string; url: string }; // Deprecated, usar richContent
  richContent?: RichContent;
  avatarUrl?: string;
  userName?: string | null;
  messageId?: string;
  redirectToFeedback?: () => void;
}

const TranscribedResponse: React.FC<TranscribedResponseProps> = ({
  text,
  isUser,
  isHighlighted = false,
  timestamp,
  tags = [],
  suggestedVideo,
  richContent,
  avatarUrl,
  userName,
  messageId,
  redirectToFeedback,
}) => {
  // Debug para verificar que el contenido enriquecido llega correctamente
  if (!isUser && (suggestedVideo || richContent)) {
    console.log(`[TranscribedResponse] 🎨 Renderizando respuesta enriquecida:`, { suggestedVideo, richContent });
  }
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

  // Renderizar imágenes enriquecidas
  const renderRichImages = () => {
    if (!richContent?.images || richContent.images.length === 0) return null;

    return (
      <div className="mt-3 pt-3 border-t border-neutral-200 dark:border-neutral-600">
        <div className="space-y-3">
          {richContent.images.map((image, index) => (
            <div key={index} className="rounded-lg overflow-hidden border border-neutral-200 dark:border-neutral-600">
              <Image
                src={image.url}
                alt={image.alt || image.title}
                width={400}
                height={250}
                className="w-full h-auto"
                onError={(e) => {
                  console.log('[TranscribedResponse] Error loading rich image, hiding element');
                  e.currentTarget.closest('div')!.style.display = 'none';
                }}
              />
              <div className="p-2">
                <h4 className="text-sm font-medium text-neutral-900 dark:text-neutral-100">{image.title}</h4>
                {image.caption && (
                  <p className="text-xs text-neutral-600 dark:text-neutral-400 mt-1">{image.caption}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // Renderizar enlaces enriquecidos
  const renderRichLinks = () => {
    if (!richContent?.links || richContent.links.length === 0) return null;

    const getIconForLinkType = (type?: string) => {
      switch (type) {
        case 'article': return <FileText className="h-4 w-4" />;
        case 'resource': return <Star className="h-4 w-4" />;
        case 'guide': return <Lightbulb className="h-4 w-4" />;
        default: return <ExternalLink className="h-4 w-4" />;
      }
    };

    const getColorForLinkType = (type?: string) => {
      switch (type) {
        case 'article': return 'from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700';
        case 'resource': return 'from-green-500 to-green-600 hover:from-green-600 hover:to-green-700';
        case 'guide': return 'from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700';
        default: return 'from-neutral-500 to-neutral-600 hover:from-neutral-600 hover:to-neutral-700';
      }
    };

    return (
      <div className="mt-3 pt-3 border-t border-neutral-200 dark:border-neutral-600">
        <div className="space-y-2">
          {richContent.links.map((link, index) => (
            <a
              key={index}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className={`inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-gradient-to-r ${getColorForLinkType(link.type)} rounded-lg shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 w-full justify-center`}
            >
              {getIconForLinkType(link.type)}
              <span>{link.title}</span>
              <ExternalLink className="h-3 w-3" />
            </a>
          ))}
        </div>
      </div>
    );
  };

  // Renderizar botones interactivos
  const renderRichButtons = () => {
    if (!richContent?.buttons || richContent.buttons.length === 0) return null;

    const getColorForButtonStyle = (style?: string) => {
      switch (style) {
        case 'primary': return 'from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700';
        case 'secondary': return 'from-neutral-500 to-neutral-600 hover:from-neutral-600 hover:to-neutral-700';
        case 'success': return 'from-green-500 to-green-600 hover:from-green-600 hover:to-green-700';
        case 'warning': return 'from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700';
        case 'info': return 'from-cyan-500 to-cyan-600 hover:from-cyan-600 hover:to-cyan-700';
        default: return 'from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700';
      }
    };

    const getIconForButton = (icon?: string) => {
      switch (icon) {
        case 'play': return <Play className="h-4 w-4" />;
        case 'check': return <CheckCircle className="h-4 w-4" />;
        case 'info': return <Info className="h-4 w-4" />;
        case 'activity': return <Activity className="h-4 w-4" />;
        default: return null;
      }
    };

    const handleButtonClick = (action: string) => {
      console.log(`[TranscribedResponse] 🔘 Botón presionado: ${action}`);
      
      // Manejar acciones específicas
      if (action.startsWith('open_video:')) {
        const videoUrl = action.replace('open_video:', '');
        console.log(`[TranscribedResponse] 🎥 Abriendo video: ${videoUrl}`);
        window.open(videoUrl, '_blank', 'noopener,noreferrer');
      } else if (action.startsWith('open_link:')) {
        const linkUrl = action.replace('open_link:', '');
        console.log(`[TranscribedResponse] 🔗 Abriendo enlace: ${linkUrl}`);
        window.open(linkUrl, '_blank', 'noopener,noreferrer');
      } else if (action === 'open_feedback') {
        console.log(`[TranscribedResponse] 📝 Abriendo página de feedback`);
        if (redirectToFeedback) {
          redirectToFeedback();
        } else {
          console.warn(`[TranscribedResponse] ⚠️ redirectToFeedback no está disponible`);
        }
      } else {
        // Otras acciones personalizadas
        console.log(`[TranscribedResponse] ℹ️ Acción personalizada: ${action}`);
        // Aquí puedes implementar otras acciones específicas
        // Por ejemplo, mostrar un modal, navegar a otra página, etc.
      }
    };

    return (
      <div className="mt-3 pt-3 border-t border-neutral-200 dark:border-neutral-600">
        <div className="space-y-2">
          {richContent.buttons.map((button, index) => (
            <button
              key={index}
              onClick={() => handleButtonClick(button.action)}
              className={`inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-gradient-to-r ${getColorForButtonStyle(button.style)} rounded-lg shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 w-full justify-center`}
            >
              {getIconForButton(button.icon)}
              <span>{button.title}</span>
            </button>
          ))}
        </div>
      </div>
    );
  };

  // Renderizar tarjetas informativas
  const renderRichCards = () => {
    if (!richContent?.cards || richContent.cards.length === 0) return null;

    const getIconForCardType = (type?: string) => {
      switch (type) {
        case 'tip': return <Lightbulb className="h-5 w-5" />;
        case 'technique': return <Activity className="h-5 w-5" />;
        case 'exercise': return <Play className="h-5 w-5" />;
        case 'info': return <Info className="h-5 w-5" />;
        case 'warning': return <AlertTriangle className="h-5 w-5" />;
        default: return <Info className="h-5 w-5" />;
      }
    };

    const getColorForCardType = (type?: string) => {
      switch (type) {
        case 'tip': return 'border-yellow-200 bg-yellow-50 dark:border-yellow-700 dark:bg-yellow-900/20';
        case 'technique': return 'border-blue-200 bg-blue-50 dark:border-blue-700 dark:bg-blue-900/20';
        case 'exercise': return 'border-green-200 bg-green-50 dark:border-green-700 dark:bg-green-900/20';
        case 'info': return 'border-cyan-200 bg-cyan-50 dark:border-cyan-700 dark:bg-cyan-900/20';
        case 'warning': return 'border-orange-200 bg-orange-50 dark:border-orange-700 dark:bg-orange-900/20';
        default: return 'border-neutral-200 bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-900/20';
      }
    };

    const getTextColorForCardType = (type?: string) => {
      switch (type) {
        case 'tip': return 'text-yellow-700 dark:text-yellow-300';
        case 'technique': return 'text-blue-700 dark:text-blue-300';
        case 'exercise': return 'text-green-700 dark:text-green-300';
        case 'info': return 'text-cyan-700 dark:text-cyan-300';
        case 'warning': return 'text-orange-700 dark:text-orange-300';
        default: return 'text-neutral-700 dark:text-neutral-300';
      }
    };

    return (
      <div className="mt-3 pt-3 border-t border-neutral-200 dark:border-neutral-600">
        <div className="space-y-3">
          {richContent.cards.map((card, index) => (
            <div
              key={index}
              className={`rounded-lg border-2 p-4 ${getColorForCardType(card.type)}`}
            >
              <div className="flex items-start gap-3">
                <div className={`flex-shrink-0 ${getTextColorForCardType(card.type)}`}>
                  {getIconForCardType(card.type)}
                </div>
                <div className="flex-1">
                  <h4 className={`font-semibold text-sm ${getTextColorForCardType(card.type)}`}>
                    {card.title}
                  </h4>
                  <p className="text-sm text-neutral-600 dark:text-neutral-300 mt-1">
                    {card.content}
                  </p>
                  {card.items && card.items.length > 0 && (
                    <ul className="mt-2 space-y-1">
                      {card.items.map((item, itemIndex) => (
                        <li key={itemIndex} className="text-xs text-neutral-600 dark:text-neutral-400 flex items-start gap-2">
                          <CheckCircle className="h-3 w-3 mt-0.5 flex-shrink-0 text-green-500" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
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

          {/* Contenido enriquecido */}
          {!isUser && (
            <>
              {/* Video sugerido (compatibilidad hacia atrás) */}
              {suggestedVideo && suggestedVideo.url && suggestedVideo.title && (
                <div className="mt-3 pt-3 border-t border-neutral-200 dark:border-neutral-600">
                  <a 
                    href={suggestedVideo.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 rounded-lg shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 w-full justify-center"
                    title={`Ver video: ${suggestedVideo.title}`}
                  >
                    <Video className="h-4 w-4" aria-hidden="true" />
                    <span>Ver en YouTube</span>
                    <svg 
                      className="h-3 w-3" 
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                    >
                      <path 
                        strokeLinecap="round" 
                        strokeLinejoin="round" 
                        strokeWidth={2} 
                        d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" 
                      />
                    </svg>
                  </a>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1 text-center">
                    {suggestedVideo.title}
                  </p>
                </div>
              )}

              {/* Video desde richContent */}
              {richContent?.suggestedVideo && richContent.suggestedVideo.url && richContent.suggestedVideo.title && (
                <div className="mt-3 pt-3 border-t border-neutral-200 dark:border-neutral-600">
                  <a 
                    href={richContent.suggestedVideo.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 rounded-lg shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 w-full justify-center"
                    title={`Ver video: ${richContent.suggestedVideo.title}`}
                  >
                    <Video className="h-4 w-4" aria-hidden="true" />
                    <span>Ver en YouTube</span>
                    <ExternalLink className="h-3 w-3" />
                  </a>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1 text-center">
                    {richContent.suggestedVideo.title}
                  </p>
                </div>
              )}

              {/* Renderizar todas las respuestas enriquecidas */}
              {renderRichImages()}
              {renderRichLinks()}
              {renderRichButtons()}
              {renderRichCards()}
            </>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default TranscribedResponse;