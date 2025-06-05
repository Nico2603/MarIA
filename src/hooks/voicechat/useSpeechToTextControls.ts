'use client';

import { useCallback, Dispatch, SetStateAction, RefObject } from 'react';
import { Room } from 'livekit-client';
import { useError } from '@/contexts/ErrorContext'; // Ajusta la ruta si es necesario

interface UseSpeechToTextControlsProps {
  isListening: boolean;
  isProcessing: boolean;
  isSpeaking: boolean;
  isSessionClosed: boolean;
  conversationActive: boolean;
  roomRef: RefObject<Room | null>;
  setIsListening: (value: boolean) => void;
  tavusVideoLoaded?: boolean; // << NUEVO: Para verificar si el avatar está cargado
}

export function useSpeechToTextControls({
  isListening,
  isProcessing,
  isSpeaking,
  isSessionClosed,
  conversationActive,
  roomRef,
  setIsListening,
  tavusVideoLoaded = true, // << NUEVO: Por defecto true para compatibilidad
}: UseSpeechToTextControlsProps) {
  const { setError: setAppError, clearError } = useError();

  const handleStartListening = useCallback(async () => {
    // Verificar que el avatar esté completamente cargado antes de permitir usar el micrófono
    if (!isListening && !isProcessing && !isSpeaking && !isSessionClosed && 
        conversationActive && roomRef.current?.localParticipant && tavusVideoLoaded) {
      setIsListening(true);
      
      try {
        await roomRef.current.localParticipant.setMicrophoneEnabled(true);
        
        // Verificar permisos de micrófono
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        stream.getTracks().forEach(track => track.stop());
        
      } catch (error) {
        console.error("[useSpeechToTextControls] Error al habilitar micrófono:", error);
        setIsListening(false);
        
        if (error instanceof Error) {
          if (error.name === 'NotAllowedError') {
            throw new Error('Permisos de micrófono denegados. Por favor, permite el acceso al micrófono.');
          } else if (error.name === 'NotFoundError') {
            throw new Error('No se encontró ningún micrófono. Verifica que tengas un micrófono conectado.');
          } else {
            throw new Error(`Error de micrófono: ${error.message}`);
          }
        } else {
          throw new Error('Error desconocido al acceder al micrófono.');
        }
      }
    }
  }, [isListening, isProcessing, isSpeaking, isSessionClosed, conversationActive, roomRef, setIsListening, tavusVideoLoaded]);

  const handleStopListening = useCallback(async () => {
    if (isListening) {
      setIsListening(false);
      
      if (roomRef.current?.localParticipant) {
        roomRef.current.localParticipant.setMicrophoneEnabled(false)
          .catch(error => console.error("[useSpeechToTextControls] Error al deshabilitar micrófono:", error));
      }
    }
  }, [isListening, roomRef, setIsListening]);

  return {
    handleStartListening,
    handleStopListening,
  };
} 