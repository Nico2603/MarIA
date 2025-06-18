'use client';

import { useCallback, useRef, Dispatch } from 'react';
import { Room, LocalParticipant } from 'livekit-client';
import { Session } from 'next-auth';
import { useRouter } from 'next/navigation';
import { useError } from '@/contexts/ErrorContext';
import { useNotifications } from '@/utils/notifications';
import type { Message, VoiceChatAction } from '@/types';

interface UseConversationSessionManagerProps {
  session: Session | null;
  authStatus: string;
  conversationActive: boolean;
  isReadyToStart: boolean;
  messages: Message[]; // Necesario para la lógica de reinicio de mensajes
  activeSessionId: string | null; 
  isSessionClosed: boolean;
  roomRef: React.RefObject<any>; 
  audioStreamRef: React.MutableRefObject<MediaStream | null>; 
  disconnectFromLiveKit?: () => Promise<void>; 
  
  setAppError: ReturnType<typeof useError>['setError'];
  showNotification: ReturnType<typeof useNotifications>['showNotification'];
  dispatch: Dispatch<VoiceChatAction>; // Usar dispatch
  onShowFeedbackModal?: () => void; // Callback para mostrar modal de feedback
  setAutoRedirectInProgress?: (value: boolean) => void; // Nuevo: para controlar redirecciones automáticas
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
  onShowFeedbackModal, // Recibir callback para modal
  setAutoRedirectInProgress, // Recibir setAutoRedirectInProgress
}: UseConversationSessionManagerProps) {
  const { clearError } = useError();
  const router = useRouter();

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

    // Verificar si hay un mensaje de saludo inicial pendiente
    const initialMessages = messages.length > 0 && messages[0].id.startsWith('greeting-') 
      ? [messages[0]] 
      : [];
    
    console.log('[ConversationSessionManager] Iniciando conversación con mensajes iniciales:', initialMessages);
    console.log('[ConversationSessionManager] Username para saludo:', session?.user?.name);
    
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
      
      // Añadir un delay para asegurar que el backend procese el saludo inicial
      setTimeout(() => {
        if (isReadyToStart) {
          console.log("Conversación iniciada. El backend debería enviar el saludo inicial automáticamente.");
          console.log("Si no aparece el saludo en 5 segundos, verificar configuración del backend.");
        } else {
          console.warn("Intento de iniciar conversación, pero la preparación del saludo (bot TTS) podría no estar completa.");
        }
      }, 1000);
      
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

  const endSession = useCallback(async (notify = true, reason?: string, shouldRedirect = true) => {
    if (isSessionClosed) {
      console.log("La sesión ya está marcada como cerrada localmente. No se tomarán más acciones en endSession.");
      return;
    }
    
    console.log(`[ConversationSessionManager] 🔄 Finalizando sesión:`, {
      notify,
      reason,
      shouldRedirect,
      hasOnShowFeedbackModal: !!onShowFeedbackModal,
      sessionId: activeSessionId
    });
    
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

    // Mostrar modal de feedback o redirigir al perfil
    // REDIRECCIÓN ROBUSTA - Directa con fallback
    const executeRedirection = () => {
      console.log(`[ConversationSessionManager] ↗️ Ejecutando redirección al perfil del usuario`);
      try {
        router.push('/settings/profile?fromChat=true&showFeedback=true');
        console.log(`[ConversationSessionManager] ✅ Redirección con router.push() exitosa`);
      } catch (error) {
        console.error(`[ConversationSessionManager] ❌ Error en router.push():`, error);
        console.log(`[ConversationSessionManager] 🔄 Intentando fallback con window.location.href`);
        // Fallback robusto
        try {
          window.location.href = '/settings/profile?fromChat=true&showFeedback=true';
          console.log(`[ConversationSessionManager] ✅ Redirección con window.location.href exitosa`);
        } catch (fallbackError) {
          console.error(`[ConversationSessionManager] ❌ Error crítico en redirección:`, fallbackError);
        }
      }
    };
    
    if (reason === "conversación completada") {
      console.log(`[ConversationSessionManager] 🤖 Conversación completada - Mostrando modal de feedback obligatorio`);
      
      // Para conversaciones completadas por María, SIEMPRE mostrar modal de feedback
      if (onShowFeedbackModal) {
        console.log(`[ConversationSessionManager] 📋 Activando modal de feedback`);
        
        // Activar flag para prevenir redirecciones conflictivas
        if (setAutoRedirectInProgress) {
          setAutoRedirectInProgress(true);
          console.log(`[ConversationSessionManager] 🚩 Flag de redirección automática activado`);
        }
        
        try {
          onShowFeedbackModal();
          console.log(`[ConversationSessionManager] ✅ Modal de feedback activado exitosamente`);
        } catch (modalError) {
          console.error(`[ConversationSessionManager] ❌ Error al mostrar modal:`, modalError);
          // Si el modal falla, redirección de emergencia
          console.log(`[ConversationSessionManager] 🆘 Redirección de emergencia`);
          setTimeout(() => {
            executeRedirection();
          }, 1000);
        }
      } else {
        console.log(`[ConversationSessionManager] ⚠️ onShowFeedbackModal no disponible - Redirección directa`);
        setTimeout(() => {
          executeRedirection();
        }, 1000);
      }
    } else if (shouldRedirect) {
      // Para otros tipos de cierre con redirección solicitada
      console.log(`[ConversationSessionManager] 👤 Cierre manual/otro - Priorizando experiencia de usuario`);
      if (onShowFeedbackModal) {
        console.log(`[ConversationSessionManager] 📋 Mostrando modal de feedback primero`);
        try {
          onShowFeedbackModal();
          // Redirección de respaldo por si el modal falla
          setTimeout(() => {
            console.log(`[ConversationSessionManager] ⏰ Redirección de respaldo ejecutada`);
            executeRedirection();
          }, 10000); // 10 segundos de respaldo
        } catch (modalError) {
          console.log(`[ConversationSessionManager] ⚠️ Modal falló, redirección inmediata`);
          setTimeout(executeRedirection, 1000);
        }
      } else {
        // Sin modal disponible, redirección directa
        setTimeout(executeRedirection, 1000);
      }
    } else {
      console.log(`[ConversationSessionManager] 🚫 shouldRedirect=false, no se realizará redirección`);
    }
  }, [
    activeSessionId, isSessionClosed, disconnectFromLiveKit, roomRef, audioStreamRef,
    setAppError, showNotification, dispatch, router, onShowFeedbackModal, setAutoRedirectInProgress // Añadir onShowFeedbackModal y setAutoRedirectInProgress a las dependencias
  ]);

  const redirectToProfile = useCallback(() => {
    console.log("Redirigiendo al perfil del usuario desde modal...");
    router.push('/settings/profile?fromChat=true&showFeedback=true');
  }, [router]);

  return { handleStartConversation, endSession, redirectToProfile };
} 