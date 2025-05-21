'use client';

import { useCallback, Dispatch, FormEvent, RefObject, useEffect } from 'react';
import { DataPacket_Kind, RemoteParticipant, Room, LocalParticipant, Track, TrackPublication } from 'livekit-client';
import type { Message } from '@/types/message'; // Asegúrate que la ruta es correcta
import { useError } from '@/contexts/ErrorContext'; // Asegúrate que la ruta es correcta
import type { VoiceChatAction } from '@/reducers/voiceChatReducer'; // Importar VoiceChatAction

const AGENT_IDENTITY = "Maria-TTS-Bot"; // Considerar mover a un archivo de constantes compartido

interface UseLiveKitDataChannelEventsProps {
  dispatch: Dispatch<VoiceChatAction>; // Usar dispatch
  conversationActive: boolean; // Para la lógica de isReadyToStart
  greetingMessageId: string | null; // Para la lógica de isReadyToStart
  currentSpeakingId: string | null; // Para la lógica de tts_ended
  endSession: (notify?: boolean, reason?: string) => void; // Para session_should_end_signal y tts_ended isClosing
  isProcessing: boolean; // Necesario para la lógica de envío
  isListening: boolean;
  isSpeaking: boolean; // Prop requerida para la lógica de envío
  isSessionClosed: boolean;
  activeSessionId: string | null;
  roomRef: RefObject<Room | null>;
  room: Room | null; // Añadido room como prop para el useEffect
}

export function useLiveKitDataChannelEvents({
  dispatch, // Recibir dispatch
  conversationActive,
  greetingMessageId,
  currentSpeakingId,
  endSession,
  isProcessing,
  isListening,
  isSpeaking,
  isSessionClosed,
  activeSessionId,
  roomRef,
  room, // Recibir room
}: UseLiveKitDataChannelEventsProps) {
  const { setError: setAppError } = useError();

  useEffect(() => {
    if (room && room.localParticipant) {
      const localTrackPublications = Array.from(room.localParticipant.trackPublications.values());
      console.log('[LiveKit] LocalParticipant track publications (all types):', localTrackPublications);
      
      const remoteParticipantIdentities = Array.from(room.remoteParticipants.values()).map((p: RemoteParticipant) => p.identity);
      console.log('[LiveKit] Remote participants identities:', remoteParticipantIdentities);
    }
  }, [room]); // Ejecutar cuando room cambie

  const handleDataReceived = useCallback((payload: Uint8Array, participant?: RemoteParticipant, kind?: DataPacket_Kind) => {
    if (kind === DataPacket_Kind.RELIABLE && participant && participant.identity === AGENT_IDENTITY) {
      try {
        const event = JSON.parse(new TextDecoder().decode(payload));
        console.log('[handleDataReceived]> Raw event:', event); // Log general para todos los eventos recibidos del agente
        switch (event.type) {
          case 'initial_greeting_message':
            console.log('[LiveKit] initial_greeting_message payload:', event.payload);
            console.log('→ greetingMessageId before dispatch:', greetingMessageId);
            if (event.payload && event.payload.text) {
              const greetingMsg: Message = {
                id: event.payload.id || `greeting-${Date.now()}`,
                text: event.payload.text,
                isUser: false,
                timestamp: new Date().toLocaleTimeString('es-ES', { hour: 'numeric', minute: 'numeric', hour12: true }),
              };
              dispatch({ type: 'SET_MESSAGES', payload: [greetingMsg] });
              dispatch({ type: 'SET_GREETING_MESSAGE_ID', payload: greetingMsg.id });
              console.log('→ greetingMessageId after dispatch:', greetingMsg.id);
            }
            break;
          case 'user_transcription_result':
            if (event.payload && event.payload.transcript) {
              const userMessage: Message = { 
                id: `user-${Date.now()}`, 
                text: event.payload.transcript, 
                isUser: true, 
                timestamp: new Date().toLocaleTimeString('es-ES', { hour: 'numeric', minute: 'numeric', hour12: true })
              };
              dispatch({ type: 'ADD_MESSAGE', payload: userMessage });
            }
            break;
          case 'ai_response_generated':
            if (event.payload && event.payload.text) {
              const aiMessage: Message = { 
                  id: event.payload.id || `ai-${Date.now()}`, 
                  text: event.payload.text, 
                  isUser: false, 
                  timestamp: new Date().toLocaleTimeString('es-ES', { hour: 'numeric', minute: 'numeric', hour12: true }), 
                  suggestedVideo: event.payload.suggestedVideo || undefined 
              };
              dispatch({ type: 'ADD_MESSAGE', payload: aiMessage });
              dispatch({ type: 'SET_THINKING', payload: false });
            }
            break;
          case 'tts_started':
            console.log('[LiveKit] tts_started messageId:', event.payload.messageId);
            console.log(' current greetingMessageId:', greetingMessageId);
            console.log(' conversationActive flag:', conversationActive);
            if (event.payload && event.payload.messageId) {
              dispatch({ type: 'SET_CURRENT_SPEAKING_ID', payload: event.payload.messageId });
              dispatch({ type: 'SET_SPEAKING', payload: true });
              dispatch({ type: 'SET_THINKING', payload: false });
              if (event.payload.messageId === greetingMessageId && !conversationActive) {
                dispatch({ type: 'SET_READY_TO_START', payload: true });
              }
            }
            break;
          case 'tts_ended':
            console.log('[LiveKit] tts_ended messageId:', event.payload.messageId, 'isClosing:', event.payload.isClosing);
            console.log(' currentSpeakingId before clear:', currentSpeakingId);
            if (event.payload && event.payload.messageId) {
              if (currentSpeakingId === event.payload.messageId) {
                dispatch({ type: 'SET_SPEAKING', payload: false });
                dispatch({ type: 'SET_CURRENT_SPEAKING_ID', payload: null });
                if (event.payload.isClosing) {
                  endSession(); 
                }
              }
            }
            break;
          case 'session_should_end_signal':
             endSession(); 
             break;
          default:
            // console.log("[DataChannel] Evento no manejado:", event.type);
        }
      } catch (e) {
        console.error("[DataChannelHook] Error procesando DataChannel del agente Maria:", e);
        setAppError('agent', 'Error procesando datos del agente.'); // Especificar tipo de error
      }
    }
  }, [
    dispatch, 
    conversationActive, 
    greetingMessageId, 
    currentSpeakingId, 
    endSession, 
    setAppError,
    // room // No es necesario aquí ya que el useEffect lo maneja y handleDataReceived se pasa a los listeners de la sala
  ]);

  const handleSendTextMessage = useCallback(async (messageText: string) => {
    const trimmedInput = messageText.trim();
    // La condición de !isListening se elimina porque el usuario puede escribir mientras el sistema escucha para transcribir.
    // Se asume que si el usuario envía texto, es una entrada explícita que debe tener prioridad.
    if (trimmedInput && conversationActive && !isProcessing && !isSpeaking && !isSessionClosed && activeSessionId && roomRef.current && roomRef.current.localParticipant) {
      console.log(`Enviando texto al agente Maria: \"${trimmedInput}\"`);
      try {
        const payload = JSON.stringify({ type: "submit_user_text", payload: { text: trimmedInput } });
        await roomRef.current.localParticipant.publishData(new TextEncoder().encode(payload), { reliable: true });
        
        // Añadir mensaje del usuario inmediatamente a la UI
        const userMessage: Message = { 
          id: `user-text-${Date.now()}`,
          text: trimmedInput,
          isUser: true,
          timestamp: new Date().toLocaleTimeString('es-ES', { hour: 'numeric', minute: 'numeric', hour12: true })
        };
        dispatch({ type: 'ADD_MESSAGE', payload: userMessage });
        dispatch({ type: 'SET_TEXT_INPUT', payload: '' }); // Limpiar input después de enviar
        dispatch({ type: 'SET_THINKING', payload: true });

      } catch (error) {
        console.error("Error al enviar mensaje de texto al agente vía DataChannel:", error);
        setAppError('api', "Error al enviar tu mensaje. Intenta de nuevo."); // Especificar tipo de error
        dispatch({ type: 'SET_THINKING', payload: false });
      }
    } else {
        console.log("Envío de mensaje de texto ignorado. Condiciones no cumplidas:", { trimmedInput, conversationActive, isProcessing, isSpeaking, /*isListening,*/ isSessionClosed, activeSessionId, roomExists: !!roomRef.current });
    }
  }, [
    dispatch, conversationActive, isProcessing, isSpeaking, /*isListening,*/ isSessionClosed,
    activeSessionId, roomRef, setAppError
  ]);

  return { handleDataReceived, handleSendTextMessage };
} 