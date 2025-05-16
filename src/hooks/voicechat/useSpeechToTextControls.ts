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
    if (isListening || isProcessing || isSpeaking || isSessionClosed || !conversationActive) return;
    clearError();
    if (roomRef.current && roomRef.current.localParticipant) {
        try {
            await roomRef.current.localParticipant.setMicrophoneEnabled(true);
            console.log("Micrófono local habilitado para LiveKit (STT).");
            setIsListening(true);
        } catch (error) {
            console.error("Error al habilitar el micrófono para LiveKit STT:", error);
            setAppError('stt', 'Error al activar el micrófono para la transcripción.');
            setIsListening(false);
            return;
        }
    } else {
        console.warn("LiveKit Room o LocalParticipant no disponible para iniciar STT.");
        setAppError('livekit', 'Conexión no lista para iniciar transcripción.');
        return;
    }
  }, [isListening, isProcessing, isSpeaking, isSessionClosed, conversationActive, clearError, setAppError, roomRef, setIsListening]);
  
  const handleStopListening = useCallback(() => {
    if (!isListening) {
        console.log("Intento de detener escucha cuando no se está grabando (STT).");
        return;
    }
    console.log("Deteniendo escucha para STT (LiveKit)...");
    if (roomRef.current && roomRef.current.localParticipant) {
        roomRef.current.localParticipant.setMicrophoneEnabled(false)
            .then(() => console.log("Micrófono local deshabilitado (STT)."))
            .catch(error => {
                console.error("Error al deshabilitar micrófono para LiveKit STT:", error);
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