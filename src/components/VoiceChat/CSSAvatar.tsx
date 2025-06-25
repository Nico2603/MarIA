'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export interface AvatarState {
  isListening: boolean;
  isSpeaking: boolean;
  isThinking: boolean;
  isProcessing: boolean;
  conversationActive: boolean;
  isSessionClosed: boolean;
}

interface CSSAvatarProps extends AvatarState {
  size?: number;
  className?: string;
}

// Componente principal del avatar
const CSSAvatar: React.FC<CSSAvatarProps> = ({ 
  size = 150, 
  className = "",
  isListening,
  isSpeaking,
  isThinking,
  isProcessing,
  conversationActive,
  isSessionClosed
}) => {
  // Determinar el color de fondo según el estado
  let bgColor = 'from-blue-400 to-blue-600'; // Por defecto
  if (isSessionClosed) {
    bgColor = 'from-gray-400 to-gray-600';
  } else if (isSpeaking) {
    bgColor = 'from-green-400 to-green-600';
  } else if (isListening) {
    bgColor = 'from-red-400 to-red-600';
  } else if (isThinking || isProcessing) {
    bgColor = 'from-yellow-400 to-orange-500';
  } else if (!conversationActive) {
    bgColor = 'from-purple-400 to-purple-600';
  }
  
  const eyeSize = size * 0.12;
  const eyeOffset = size * 0.15;
  const mouthWidth = size * 0.25;
  const mouthHeight = size * 0.08;
  
  return (
    <div className={`relative ${className}`}>
      {/* Avatar principal */}
      <motion.div
        className={`relative bg-gradient-to-br ${bgColor} rounded-full shadow-2xl border-4 border-white/20 backdrop-blur-sm overflow-hidden`}
        style={{ width: size, height: size }}
        animate={{
          scale: isSpeaking ? [1, 1.1, 1] : isListening ? [1, 1.05, 1] : 1,
        }}
        transition={{
          duration: isSpeaking ? 0.5 : isListening ? 1 : 2,
          repeat: (isSpeaking || isListening) ? Infinity : 0,
          ease: "easeInOut"
        }}
      >
        {/* Efecto de brillo interno */}
        <div className="absolute inset-2 bg-white/10 rounded-full" />
        
        {/* Ojos */}
        <motion.div
          className="absolute bg-slate-800 rounded-full"
          style={{
            width: eyeSize,
            height: eyeSize,
            left: `calc(50% - ${eyeOffset}px - ${eyeSize/2}px)`,
            top: `calc(50% - ${eyeSize/2}px - ${size * 0.05}px)`,
          }}
          animate={{
            scaleY: isThinking || isProcessing ? [1, 0.3, 1] : isSpeaking ? [1, 0.8, 1] : 1,
            scaleX: isListening ? 1.1 : 1
          }}
          transition={{
            duration: isThinking || isProcessing ? 1 : isSpeaking ? 0.3 : 0.5,
            repeat: (isThinking || isProcessing || isSpeaking) ? Infinity : 0
          }}
        />
        
        <motion.div
          className="absolute bg-slate-800 rounded-full"
          style={{
            width: eyeSize,
            height: eyeSize,
            right: `calc(50% - ${eyeOffset}px - ${eyeSize/2}px)`,
            top: `calc(50% - ${eyeSize/2}px - ${size * 0.05}px)`,
          }}
          animate={{
            scaleY: isThinking || isProcessing ? [1, 0.3, 1] : isSpeaking ? [1, 0.8, 1] : 1,
            scaleX: isListening ? 1.1 : 1
          }}
          transition={{
            duration: isThinking || isProcessing ? 1 : isSpeaking ? 0.3 : 0.5,
            repeat: (isThinking || isProcessing || isSpeaking) ? Infinity : 0
          }}
        />
        
        {/* Boca */}
        <motion.div
          className="absolute bg-slate-800 rounded-full"
          style={{
            left: `calc(50% - ${mouthWidth/2}px)`,
            top: `calc(50% + ${size * 0.15}px)`,
          }}
          animate={{
            width: isSpeaking ? [mouthWidth * 0.8, mouthWidth * 1.2, mouthWidth * 0.8] 
                  : isListening ? mouthWidth * 0.8 
                  : isThinking || isProcessing ? mouthWidth * 0.6 
                  : mouthWidth,
            height: isSpeaking ? [mouthHeight, mouthHeight * 1.5, mouthHeight]
                  : isListening ? mouthHeight * 1.2
                  : isThinking || isProcessing ? mouthHeight * 0.4
                  : mouthHeight * 0.6,
          }}
          transition={{
            duration: isSpeaking ? 0.2 : 0.5,
            repeat: isSpeaking ? Infinity : 0,
            ease: "easeInOut"
          }}
        />
        
        {/* Ondas cuando habla */}
        <AnimatePresence>
          {isSpeaking && (
            <>
              {[1, 2, 3].map((i) => (
                <motion.div
                  key={i}
                  className="absolute inset-0 border-2 border-white/30 rounded-full"
                  initial={{ scale: 1, opacity: 0.6 }}
                  animate={{ scale: 1.5 + i * 0.2, opacity: 0 }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    delay: i * 0.2,
                    ease: "easeOut"
                  }}
                />
              ))}
            </>
          )}
        </AnimatePresence>
        
        {/* Partículas cuando piensa */}
        <AnimatePresence>
          {(isThinking || isProcessing) && (
            <div className="absolute inset-0">
              {[1, 2, 3].map((i) => (
                <motion.div
                  key={i}
                  className="absolute w-2 h-2 bg-white/60 rounded-full"
                  style={{
                    left: `${30 + i * 20}%`,
                    top: `${20}%`,
                  }}
                  animate={{ 
                    y: [-5, -15, -5], 
                    opacity: [0, 1, 0],
                    scale: [0.8, 1.2, 0.8]
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    delay: i * 0.3,
                    ease: "easeInOut"
                  }}
                />
              ))}
            </div>
          )}
        </AnimatePresence>
      </motion.div>
      
      {/* Indicadores de estado */}
      <AnimatePresence>
        {isListening && (
          <motion.div
            className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 bg-red-500/90 text-white px-3 py-1 rounded-full text-xs font-medium backdrop-blur-sm"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
          >
            🎤 Escuchando...
          </motion.div>
        )}
        
        {isSpeaking && (
          <motion.div
            className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 bg-green-500/90 text-white px-3 py-1 rounded-full text-xs font-medium backdrop-blur-sm"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
          >
            🗣️ Hablando...
          </motion.div>
        )}
        
        {(isThinking || isProcessing) && (
          <motion.div
            className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 bg-yellow-500/90 text-white px-3 py-1 rounded-full text-xs font-medium backdrop-blur-sm"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
          >
            💭 Pensando...
          </motion.div>
        )}
        
        {!conversationActive && !isSessionClosed && (
          <motion.div
            className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 bg-purple-500/90 text-white px-3 py-1 rounded-full text-xs font-medium backdrop-blur-sm"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
          >
            ✨ Listo para hablar
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CSSAvatar; 