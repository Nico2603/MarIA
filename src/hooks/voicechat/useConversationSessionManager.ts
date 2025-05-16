'use client';

import { useCallback, Dispatch, MutableRefObject } from 'react';
import type { Session } from 'next-auth';
import { useError } from '@/contexts/ErrorContext';
import { useNotifications } from '@/hooks/useNotifications';
import type { Message } from '@/types/message';
import type { VoiceChatAction } from '@/reducers/voiceChatReducer'; // Importar VoiceChatAction

interface UseConversationSessionManagerProps {
  session: Session | null;
  authStatus: string;
  conversationActive: boolean;
  isReadyToStart: boolean;
  messages: Message[]; // Necesario para la lógica de reinicio de mensajes
  activeSessionId: string | null; 
  isSessionClosed: boolean;
  roomRef: React.RefObject<any>; 
  audioStreamRef: MutableRefObject<MediaStream | null>; 
  disconnectFromLiveKit?: () => Promise<void>; 
  
  setAppError: ReturnType<typeof useError>['setError'];
  showNotification: ReturnType<typeof useNotifications>['showNotification'];
  dispatch: Dispatch<VoiceChatAction>; // Usar dispatch
}

export function useConversationSessionManager({
  session,
  authStatus,
  conversationActive,
  isReadyToStart,
  messages, // Se mantiene para la lógica de reseteo de mensajes
  activeSessionId,
  isSessionClosed,
  roomRef,
  audioStreamRef,
  disconnectFromLiveKit,
  setAppError,
  showNotification,
  dispatch, // Recibir dispatch
}: UseConversationSessionManagerProps) {
  const { clearError } = useError();

  const handleStartConversation = useCallback(async () => {
    if (!session?.user?.id || authStatus !== 'authenticated') {
      setAppError('api', "Debes iniciar sesión para comenzar."); // Especificar el tipo de error
      return;
    }
    if (conversationActive || !isReadyToStart) {
        console.warn("Intento de iniciar conversación cuando ya está activa o no está lista.");
        return;
    }
    clearError();
    dispatch({ type: 'SET_SESSION_CLOSED', payload: false });
    dispatch({ type: 'SET_TIME_RUNNING_OUT', payload: false }); 
    dispatch({ type: 'SET_FIRST_INTERACTION', payload: true });
    dispatch({ type: 'SET_TEXT_INPUT', payload: '' });

    const initialMessages = messages.length > 0 && messages[0].id.startsWith('greeting-') 
      ? [messages[0]] 
      : [];
    dispatch({ type: 'SET_MESSAGES', payload: initialMessages });
    
    try {
      console.log("Llamando a API para crear nueva sesión de chat...");
      const response = await fetch('/api/sessions', { method: 'POST' });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Error ${response.status} al crear sesión en API`);
      }
      const data = await response.json();
      if (!data.id) throw new Error("La API de sesiones no devolvió un ID válido.");
      
      dispatch({ 
        type: 'START_CONVERSATION_SUCCESS', 
        payload: { 
          sessionId: data.id, 
          startTime: Date.now(),
          initialMessages: initialMessages // Usar los mensajes iniciales ya definidos
        } 
      });
      
      if (isReadyToStart) {
          console.log("Conversación iniciada. El bot TTS debería reproducir el saludo inicial.");
      } else {
        console.warn("Intento de iniciar conversación, pero la preparación del saludo (bot TTS) podría no estar completa.");
      }
      showNotification("Iniciando nueva conversación...", "info");
    } catch (error: any) {
      console.error("Error en handleStartConversation:", error);
      const message = error instanceof Error ? error.message : "No se pudo iniciar la nueva sesión. Inténtalo de nuevo.";
      setAppError('api', message); // Especificar el tipo de error
      dispatch({ type: 'SET_ACTIVE_SESSION_ID', payload: null });
      dispatch({ type: 'SET_CONVERSATION_ACTIVE', payload: false }); 
      dispatch({ type: 'SET_SESSION_START_TIME', payload: null });
      showNotification(`Error al iniciar la conversación: ${error.message}`, "error");
    }
  }, [
    session, authStatus, conversationActive, isReadyToStart, messages, clearError, 
    setAppError, showNotification, dispatch // Añadir dispatch a las dependencias
  ]);

  const endSession = useCallback(async (notify = true, reason?: string) => {
    if (isSessionClosed) {
      console.log("La sesión ya está marcada como cerrada localmente. No se tomarán más acciones en endSession.");
      return;
    }
    
    console.log(`Finalizando sesión localmente... (ID Sesión API: ${activeSessionId})`);
    dispatch({ type: 'END_SESSION_SUCCESS' }); // Esta acción se encarga de los estados relevantes

    if (roomRef.current && roomRef.current.localParticipant) {
      try {
        await roomRef.current.localParticipant.setMicrophoneEnabled(false);
        console.log("Micrófono local deshabilitado al finalizar sesión.");
      } catch (error) {
        console.error("Error al deshabilitar micrófono al finalizar sesión:", error);
        setAppError('livekit', "Error al deshabilitar micrófono.");
      }
    }
    if (audioStreamRef.current) {
      audioStreamRef.current.getTracks().forEach(track => track.stop());
      audioStreamRef.current = null;
    }
    
    // Las siguientes acciones ya están cubiertas por END_SESSION_SUCCESS o no son necesarias aquí
    // dispatch({ type: 'SET_SESSION_START_TIME', payload: null });
    // dispatch({ type: 'SET_FIRST_INTERACTION', payload: true });
    // dispatch({ type: 'SET_PENDING_AI_MESSAGE', payload: null });

    if (roomRef.current && roomRef.current.state === 'connected' && disconnectFromLiveKit) {
      console.log("Desconectando de LiveKit para finalizar sesión...");
      try {
        await disconnectFromLiveKit();
        console.log("Desconexión de LiveKit completada exitosamente.");
      } catch (error) {
        console.error("Error al desconectar de LiveKit:", error);
        setAppError('livekit', "Error al desconectar de la sala.");
      }
    }
    console.log("Proceso de finalización de sesión en frontend completado.");

    if (notify) {
      const message = reason
        ? `Sesión terminada: ${reason}`
        : "Sesión terminada.";
      showNotification(message, "info");
    }
  }, [
    activeSessionId, isSessionClosed, disconnectFromLiveKit, roomRef, audioStreamRef,
    setAppError, showNotification, dispatch // Añadir dispatch a las dependencias
  ]);

  return { handleStartConversation, endSession };
} 