'use client';

/*
 * PÁGINA DE CHAT INTERACTIVO
 * 
 * Esta página funciona como bot conversacional completo con:
 * - Chat de texto (textarea y botón de envío)
 * - Botones de toggle de visibilidad del chat
 * - Panel lateral del chat con mensajes
 * - Botón de micrófono para conversación por voz
 * - Push-to-talk con tecla [Espacio]
 * - Video avatar de Tavus
 * - Procesamiento de audio y respuestas por voz
 * 
 * Todas las funcionalidades están activas para una experiencia completa.
 */

import React from 'react';
import VoiceChatContainer from '@/components/VoiceChat/VoiceChatContainer';
import { ErrorProvider } from '@/contexts/ErrorContext';

export default function ChatPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <ErrorProvider>
        <VoiceChatContainer />
      </ErrorProvider>
    </div>
  );
} 