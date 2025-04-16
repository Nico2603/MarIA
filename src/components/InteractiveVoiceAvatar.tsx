import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface InteractiveVoiceAvatarProps {
  isListening: boolean;
  isProcessing: boolean;
  isSpeaking: boolean;
  onStartListening: () => void;
  onStopListening: () => void;
  size?: 'md' | 'lg' | 'xl';
}

const InteractiveVoiceAvatar: React.FC<InteractiveVoiceAvatarProps> = ({
  isListening,
  isProcessing,
  isSpeaking,
  onStartListening,
  onStopListening,
  size = 'lg',
}) => {
  const [mood, setMood] = useState<'neutral' | 'thinking' | 'happy' | 'listening'>('neutral');
  const audioVisualizerRef = useRef<HTMLDivElement>(null);
  const audioAnimationInterval = useRef<number | null>(null);
  
  // Simulamos cambios de estado de ánimo del avatar basado en el estado
  useEffect(() => {
    if (isListening) {
      setMood('listening');
    } else if (isProcessing) {
      setMood('thinking');
    } else if (isSpeaking) {
      setMood('happy');
    } else {
      setMood('neutral');
    }
  }, [isListening, isProcessing, isSpeaking]);
  
  // Efecto para la animación del visualizador de audio
  useEffect(() => {
    const createRandomBars = () => {
      if (!audioVisualizerRef.current) return;
      
      const container = audioVisualizerRef.current;
      container.innerHTML = '';
      
      if (isListening || isSpeaking) {
        const numberOfBars = 12;
        for (let i = 0; i < numberOfBars; i++) {
          const bar = document.createElement('div');
          bar.className = 'bg-primary-500 rounded-full w-1 mx-0.5';
          const height = isListening 
            ? Math.floor(Math.random() * 20) + 5 
            : (isSpeaking ? Math.floor(Math.random() * 30) + 10 : 2);
          bar.style.height = `${height}px`;
          bar.style.transition = 'height 0.1s ease-in-out';
          container.appendChild(bar);
        }
      }
    };
    
    // Limpiar cualquier intervalo existente
    if (audioAnimationInterval.current !== null) {
      window.clearInterval(audioAnimationInterval.current);
      audioAnimationInterval.current = null;
    }
    
    // Crear y actualizar las barras de audio si está escuchando o hablando
    if (isListening || isSpeaking) {
      createRandomBars();
      audioAnimationInterval.current = window.setInterval(createRandomBars, 150);
    }
    
    return () => {
      if (audioAnimationInterval.current !== null) {
        window.clearInterval(audioAnimationInterval.current);
      }
    };
  }, [isListening, isSpeaking]);
  
  const getSizeClasses = () => {
    switch (size) {
      case 'md':
        return 'w-28 h-28';
      case 'lg':
        return 'w-40 h-40';
      case 'xl':
        return 'w-52 h-52';
      default:
        return 'w-40 h-40';
    }
  };
  
  const renderFace = () => {
    switch (mood) {
      case 'listening':
        return (
          <g>
            <circle cx="50" cy="40" r="8" fill="#3B82F6" />
            <circle cx="50" cy="40" r="16" fill="none" stroke="#3B82F6" strokeWidth="2" strokeOpacity="0.5" />
            <circle cx="50" cy="40" r="24" fill="none" stroke="#3B82F6" strokeWidth="1.5" strokeOpacity="0.3" />
            <motion.circle
              cx="50"
              cy="40"
              r="32"
              fill="none"
              stroke="#3B82F6"
              strokeWidth="1"
              strokeOpacity="0.2"
              initial={{ scale: 0.8, opacity: 0.2 }}
              animate={{ scale: 1.2, opacity: 0 }}
              transition={{
                repeat: Infinity,
                duration: 2,
                ease: "easeOut"
              }}
            />
            <ellipse cx="35" cy="55" rx="4" ry="5" fill="#334155" />
            <ellipse cx="65" cy="55" rx="4" ry="5" fill="#334155" />
            <path
              d="M 40 70 Q 50 80 60 70"
              stroke="#334155"
              strokeWidth="2.5"
              strokeLinecap="round"
              fill="none"
            />
          </g>
        );
      case 'thinking':
        return (
          <g>
            <circle cx="35" cy="45" r="4.5" fill="#334155" />
            <circle cx="65" cy="45" r="4.5" fill="#334155" />
            <path
              d="M 40 70 Q 50 65 60 70"
              stroke="#334155"
              strokeWidth="2.5"
              strokeLinecap="round"
              fill="none"
            />
            <motion.path
              d="M 20 30 Q 30 25 40 30 Q 50 35 60 30 Q 70 25 80 30"
              stroke="#64748B"
              strokeWidth="2"
              strokeLinecap="round"
              fill="none"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 1 }}
              transition={{
                duration: 2,
                repeat: Infinity,
                repeatType: "reverse",
                ease: "easeInOut"
              }}
            />
          </g>
        );
      case 'happy':
        return (
          <g>
            <circle cx="35" cy="45" r="4.5" fill="#334155" />
            <circle cx="65" cy="45" r="4.5" fill="#334155" />
            <path
              d="M 35 65 Q 50 75 65 65"
              stroke="#334155"
              strokeWidth="2.5"
              strokeLinecap="round"
              fill="none"
            />
            <motion.path
              d="M 25 40 Q 35 30 45 40"
              stroke="#64748B"
              strokeWidth="1.5"
              strokeLinecap="round"
              fill="none"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.2 }}
            />
            <motion.path
              d="M 55 40 Q 65 30 75 40"
              stroke="#64748B"
              strokeWidth="1.5"
              strokeLinecap="round"
              fill="none"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.2, delay: 0.1 }}
            />
          </g>
        );
      case 'neutral':
      default:
        return (
          <g>
            <circle cx="35" cy="45" r="4.5" fill="#334155" />
            <circle cx="65" cy="45" r="4.5" fill="#334155" />
            <path
              d="M 35 70 L 65 70"
              stroke="#334155"
              strokeWidth="2.5"
              strokeLinecap="round"
            />
          </g>
        );
    }
  };

  const handleAvatarClick = () => {
    if (isListening) {
      onStopListening();
    } else {
      onStartListening();
    }
  };

  return (
    <div className="flex flex-col items-center justify-center">
      <div className={`relative ${getSizeClasses()}`}>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.98 }}
          className="w-full h-full bg-transparent border-0 p-0 cursor-pointer focus:outline-none"
          onClick={handleAvatarClick}
          aria-label={isListening ? "Detener micrófono" : "Activar micrófono"}
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={mood}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="w-full h-full"
            >
              <svg
                viewBox="0 0 100 100"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="w-full h-full"
              >
                {/* Círculo de fondo con gradiente */}
                <defs>
                  <radialGradient
                    id="avatarGradient"
                    cx="50%"
                    cy="50%"
                    r="50%"
                    fx="50%"
                    fy="50%"
                  >
                    <stop offset="0%" stopColor="#F0F9FF" />
                    <stop offset="100%" stopColor="#DBEAFE" />
                  </radialGradient>
                </defs>
                <motion.circle
                  cx="50"
                  cy="50"
                  r="48"
                  fill="url(#avatarGradient)"
                  stroke={isListening ? "#3B82F6" : "#94A3B8"}
                  strokeWidth="2"
                  animate={
                    isListening
                      ? {
                          strokeWidth: [2, 3, 2],
                          scale: [1, 1.02, 1]
                        }
                      : {}
                  }
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    repeatType: "reverse",
                  }}
                />
                
                {/* Cara del avatar */}
                {renderFace()}
              </svg>
            </motion.div>
          </AnimatePresence>
          
          {/* Indicador de estado */}
          {(isListening || isProcessing || isSpeaking) && (
            <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 bg-white rounded-full px-3 py-1 shadow-md">
              <span className="text-xs font-medium">
                {isListening ? (
                  <span className="flex items-center text-primary-600">
                    <motion.span
                      animate={{ opacity: [0.5, 1, 0.5] }}
                      transition={{ duration: 1, repeat: Infinity }}
                      className="mr-1 text-red-500"
                    >●</motion.span> 
                    Escuchando...
                  </span>
                ) : isProcessing ? (
                  <span className="text-secondary-600">Procesando...</span>
                ) : isSpeaking ? (
                  <span className="text-emerald-600">Respondiendo...</span>
                ) : null}
              </span>
            </div>
          )}
        </motion.button>
      </div>
      
      {/* Visualización de audio */}
      <div ref={audioVisualizerRef} className="mt-4 h-8 flex items-end justify-center">
        {/* Las barras se generan dinámicamente aquí */}
      </div>
    </div>
  );
};

export default InteractiveVoiceAvatar; 