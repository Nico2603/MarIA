'use client';

/*
 * CONFIGURACIÓN TEMPORAL: MODO SOLO VOZ
 * 
 * Esta página está configurada temporalmente para funcionar únicamente
 * como bot conversacional por voz. Se han deshabilitado temporalmente:
 * - Chat de texto (textarea y botón de envío)
 * - Botones de toggle de visibilidad del chat
 * - Panel lateral del chat (siempre oculto)
 * 
 * Funcionalidades activas:
 * - Botón de micrófono para click
 * - Push-to-talk con tecla [Espacio]
 * - Video avatar de Tavus
 * - Procesamiento de audio y respuestas por voz
 * 
 * El código de texto está comentado y se puede restaurar fácilmente
 * cuando se requiera volver a incluir las funcionalidades de chat.
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