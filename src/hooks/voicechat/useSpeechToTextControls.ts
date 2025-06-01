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
}

export function useSpeechToTextControls({
  isListening,
  isProcessing,
  isSpeaking,
  isSessionClosed,
  conversationActive,
  roomRef,
  setIsListening,
}: UseSpeechToTextControlsProps) {
  const { setError: setAppError, clearError } = useError();

  const handleStartListening = useCallback(async () => {
    console.log('[useSpeechToTextControls] handleStartListening called. Conditions:', {
      isListening,
      isProcessing,
      isSpeaking,
      isSessionClosed,
      conversationActive,
      roomExists: !!roomRef.current,
      localParticipantExists: !!roomRef.current?.localParticipant
    });
    
    if (isListening || isProcessing || isSpeaking || isSessionClosed || !conversationActive) {
      console.log('[useSpeechToTextControls] handleStartListening: Condiciones no cumplidas, return early');
      return;
    }
    
    clearError();
    if (roomRef.current && roomRef.current.localParticipant) {
        try {
            await roomRef.current.localParticipant.setMicrophoneEnabled(true);
            console.log("[useSpeechToTextControls] Micrófono local habilitado para LiveKit (STT).");
            console.log("[useSpeechToTextControls] Verificando permisos de micrófono...");
            
            // Verificar que tenemos permisos de micrófono
            try {
              const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
              console.log("[useSpeechToTextControls] Permisos de micrófono confirmados");
              stream.getTracks().forEach(track => track.stop()); // Limpiar el stream de prueba
            } catch (permissionError) {
              console.error("[useSpeechToTextControls] Error de permisos de micrófono:", permissionError);
              setAppError('permissions', 'Se requieren permisos de micrófono para usar la función de voz.');
              return;
            }
            
            setIsListening(true);
        } catch (error) {
            console.error("[useSpeechToTextControls] Error al habilitar el micrófono para LiveKit STT:", error);
            setAppError('stt', 'Error al activar el micrófono para la transcripción.');
            setIsListening(false);
            return;
        }
    } else {
        console.warn("[useSpeechToTextControls] LiveKit Room o LocalParticipant no disponible para iniciar STT.");
        setAppError('livekit', 'Conexión no lista para iniciar transcripción.');
        return;
    }
  }, [isListening, isProcessing, isSpeaking, isSessionClosed, conversationActive, clearError, setAppError, roomRef, setIsListening]);
  
  const handleStopListening = useCallback(() => {
    console.log('[useSpeechToTextControls] handleStopListening called. isListening:', isListening);
    
    if (!isListening) {
        console.log("[useSpeechToTextControls] Intento de detener escucha cuando no se está grabando (STT).");
        return;
    }
    console.log("[useSpeechToTextControls] Deteniendo escucha para STT (LiveKit)...");
    if (roomRef.current && roomRef.current.localParticipant) {
        roomRef.current.localParticipant.setMicrophoneEnabled(false)
            .then(() => console.log("[useSpeechToTextControls] Micrófono local deshabilitado (STT)."))
            .catch(error => {
                console.error("[useSpeechToTextControls] Error al deshabilitar micrófono para LiveKit STT:", error);
                setAppError('stt', 'Error al desactivar el micrófono.');
            });
    }
    setIsListening(false);
  }, [isListening, setAppError, roomRef, setIsListening]);

  return {
    handleStartListening,
    handleStopListening,
  };
} 