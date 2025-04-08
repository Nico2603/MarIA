import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface AgentAvatarProps {
  isActive: boolean;
  isPulsing?: boolean;
  isAnimated?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

const AgentAvatar: React.FC<AgentAvatarProps> = ({
  isActive = true,
  isPulsing = true,
  isAnimated = true,
  size = 'md',
}) => {
  const [mood, setMood] = useState<'neutral' | 'thinking' | 'happy'>('neutral');
  
  // Simulamos cambios de estado de ánimo del agente para la animación
  useEffect(() => {
    if (isAnimated) {
      const timer = setInterval(() => {
        const moods: ('neutral' | 'thinking' | 'happy')[] = ['neutral', 'thinking', 'happy'];
        const randomMood = moods[Math.floor(Math.random() * moods.length)];
        setMood(randomMood);
      }, 5000);
      
      return () => clearInterval(timer);
    }
  }, [isAnimated]);
  
  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'w-8 h-8';
      case 'lg':
        return 'w-16 h-16';
      case 'md':
      default:
        return 'w-12 h-12';
    }
  };
  
  const renderFace = () => {
    switch (mood) {
      case 'thinking':
        return (
          <g>
            <circle cx="12" cy="9" r="3.5" fill="#2C8A94" />
            <path
              d="M8 15c0 0 1.5 2 4 2s4-2 4-2"
              stroke="#2C8A94"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
            <circle cx="9" cy="9" r="1" fill="white" />
            <circle cx="15" cy="9" r="1" fill="white" />
          </g>
        );
      case 'happy':
        return (
          <g>
            <path
              d="M8 12c0 0 1.5 3 4 3s4-3 4-3"
              stroke="#2C8A94"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
            <circle cx="9" cy="9" r="1.5" fill="#2C8A94" />
            <circle cx="15" cy="9" r="1.5" fill="#2C8A94" />
          </g>
        );
      case 'neutral':
      default:
        return (
          <g>
            <circle cx="9" cy="9" r="1.5" fill="#2C8A94" />
            <circle cx="15" cy="9" r="1.5" fill="#2C8A94" />
            <path
              d="M9 15h6"
              stroke="#2C8A94"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          </g>
        );
    }
  };

  return (
    <div className={`relative ${getSizeClasses()}`}>
      <AnimatePresence mode="wait">
        <motion.div
          key={mood}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          transition={{ duration: 0.3 }}
          className="w-full h-full"
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="w-full h-full"
          >
            {/* Círculo de fondo */}
            <motion.circle
              cx="12"
              cy="12"
              r="12"
              className={`${isActive ? 'fill-secondary-100' : 'fill-neutral-200'}`}
              animate={
                isPulsing && isActive
                  ? {
                      scale: [1, 1.05, 1],
                      opacity: [0.7, 1, 0.7],
                    }
                  : {}
              }
              transition={{
                duration: 3,
                repeat: Infinity,
                repeatType: 'reverse',
              }}
            />
            
            {/* Cara del avatar */}
            {renderFace()}
          </svg>
        </motion.div>
      </AnimatePresence>
      
      {/* Indicador de estado activo */}
      {isActive && (
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
          }}
          className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white"
        />
      )}
    </div>
  );
};

export default AgentAvatar; 