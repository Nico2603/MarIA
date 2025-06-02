'use client';

import { useCallback, Dispatch, FormEvent, RefObject, useEffect } from 'react';
import { DataPacket_Kind, RemoteParticipant, Room, LocalParticipant, Track, TrackPublication, RoomEvent } from 'livekit-client';
import { Room as LiveKitRoom } from 'livekit-client';
import type { Message, VoiceChatAction, VoiceChatState, ExtendedUserProfile } from '@/types'; // Actualizado para usar types consolidados
import { useError } from '@/contexts/ErrorContext'; // Asegúrate que la ruta es correcta
import { AGENT_IDENTITY, isValidAgent } from '@/lib/constants/agents';

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
  isReadyToStart: boolean; // <--- Añadido
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
  isReadyToStart, // <--- Añadido
}: UseLiveKitDataChannelEventsProps) {
  const { setError: setAppError, clearError } = useError();

  // Función de depuración para verificar la comunicación con el backend
  const debugBackendCommunication = useCallback(() => {
    if (room && room.localParticipant) {
      const localTrackPublications = Array.from(room.localParticipant.trackPublications.values());
      console.log('[DebugBackend] LocalParticipant track publications:', localTrackPublications);
      
      const remoteParticipantIdentities = Array.from(room.remoteParticipants.values()).map((p: RemoteParticipant) => p.identity);
      console.log('[DebugBackend] Remote participants:', remoteParticipantIdentities);
      
      const validAgents = remoteParticipantIdentities.filter(identity => isValidAgent(identity));
      console.log('[DebugBackend] Valid agents found:', validAgents);
      
      if (validAgents.length === 0) {
        console.warn('[DebugBackend] ⚠️ No se encontraron agentes válidos conectados');
        setAppError('agent', 'No hay agentes conectados. Verifica la configuración del backend.');
      } else {
        console.log('[DebugBackend] ✅ Agentes válidos detectados, limpiando errores de agente');
        // Solo limpiar el error si es de tipo 'agent'
        setAppError('agent', null);
      }
    }
  }, [room, setAppError]);

  // Función para verificar agentes con delay inicial
  const checkAgentsWithDelay = useCallback(() => {
    // Verificar inmediatamente
    debugBackendCommunication();
    
    // Verificar después de 2 segundos para dar tiempo a que se conecten los agentes
    setTimeout(() => {
      debugBackendCommunication();
    }, 2000);
    
    // Verificar después de 5 segundos como verificación final
    setTimeout(() => {
      debugBackendCommunication();
    }, 5000);
  }, [debugBackendCommunication]);

  useEffect(() => {
    const debugAgentValidation = () => {
      if (!room) return;

      const localParticipant = room.localParticipant;
      const remoteParticipants = Array.from(room.remoteParticipants.values());
      const validAgents = remoteParticipants.filter(p => p.identity && isValidAgent(p.identity));

      // Solo reportar si hay problemas reales
      if (validAgents.length === 0 && conversationActive) {
        console.warn(`[DebugBackend] No hay agentes válidos en conversación activa`);
      } else if (validAgents.length > 0) {
        clearError();
      }
    };

    const handleParticipantConnected = (participant: RemoteParticipant) => {
      if (isValidAgent(participant.identity)) {
        clearError();
      }
    };

    const handleParticipantDisconnected = (participant: RemoteParticipant) => {
      // Verificar agentes después de un breve delay
      setTimeout(debugAgentValidation, 1000);
    };

    if (room) {
      // Configurar listeners de eventos
      room.on(RoomEvent.ParticipantConnected, handleParticipantConnected);
      room.on(RoomEvent.ParticipantDisconnected, handleParticipantDisconnected);
      
      // Ejecutar debug solo cuando hay conversación activa
      if (conversationActive) {
        const intervalId = setInterval(debugAgentValidation, 10000); // Cada 10 segundos
        debugAgentValidation();
        
        return () => {
          clearInterval(intervalId);
          room.off(RoomEvent.ParticipantConnected, handleParticipantConnected);
          room.off(RoomEvent.ParticipantDisconnected, handleParticipantDisconnected);
        };
      } else {
        return () => {
          room.off(RoomEvent.ParticipantConnected, handleParticipantConnected);
          room.off(RoomEvent.ParticipantDisconnected, handleParticipantDisconnected);
        };
      }
    }
  }, [room, clearError, conversationActive]);

  const handleDataReceived = useCallback((payload: Uint8Array, participant?: RemoteParticipant, kind?: DataPacket_Kind) => {
    if (kind === DataPacket_Kind.RELIABLE && participant && isValidAgent(participant.identity)) {
      try {
        const rawData = new TextDecoder().decode(payload);
        const event = JSON.parse(rawData);

        // Mapear eventos de Tavus al formato esperado
        let mappedEvent = event;
        
        if (event.message_type && event.event_type) {
          // Mapear eventos de Tavus a nuestro formato
          switch (event.event_type) {
            case 'conversation.replica.started_speaking':
              mappedEvent = {
                type: 'tts_started',
                payload: {
                  messageId: event.inference_id || `tavus-${Date.now()}`,
                  timestamp: new Date().toISOString()
                }
              };
              
              // Para Tavus, cuando empieza a hablar, crear un mensaje placeholder
              if (isProcessing) {
                const aiMessage: Message = { 
                  id: mappedEvent.payload.messageId,
                  text: "María está respondiendo...",
                  isUser: false, 
                  timestamp: new Date().toLocaleTimeString('es-ES', { hour: 'numeric', minute: 'numeric', hour12: true })
                };
                dispatch({ type: 'ADD_MESSAGE', payload: aiMessage });
                dispatch({ type: 'SET_THINKING', payload: false });
                dispatch({ type: 'SET_PROCESSING', payload: false });
              }
              break;
              
            case 'conversation.replica.stopped_speaking':
              mappedEvent = {
                type: 'tts_ended',
                payload: {
                  messageId: event.inference_id || `tavus-${Date.now()}`,
                  isClosing: false,
                  timestamp: new Date().toISOString()
                }
              };
              break;
              
            case 'conversation.user.started_speaking':
            case 'conversation.user.stopped_speaking':
              return; // No procesar, es solo informativo
              
            case 'conversation.response':
            case 'conversation.replica.response':
              // Si Tavus envía el texto de la respuesta en este evento
              if (event.properties && event.properties.text) {
                mappedEvent = {
                  type: 'ai_response_generated',
                  payload: {
                    id: event.inference_id || `tavus-text-${Date.now()}`,
                    text: event.properties.text,
                    timestamp: new Date().toISOString()
                  }
                };
              } else {
                return;
              }
              break;
              
            case 'system.replica_joined':
            case 'system.replica_present':
              return; // No procesar estos eventos
              
            default:
              // Evento no mapeado
              mappedEvent = null;
          }
        }
        
        // Verificar si el evento fue mapeado correctamente
        if (!mappedEvent) {
          return;
        }
        
        // Procesar el evento mapeado
        switch (mappedEvent.type) {
          case 'initial_greeting_message':
            if (mappedEvent.payload && mappedEvent.payload.text) {
              const greetingMsg: Message = {
                id: mappedEvent.payload.id || `greeting-${Date.now()}`,
                text: mappedEvent.payload.text,
                isUser: false,
                timestamp: new Date().toLocaleTimeString('es-ES', { hour: 'numeric', minute: 'numeric', hour12: true }),
              };
              
              dispatch({ type: 'SET_MESSAGES', payload: [greetingMsg] });
              dispatch({ type: 'SET_GREETING_MESSAGE_ID', payload: greetingMsg.id });
            }
            break;
            
          case 'user_transcription_result':
            if (mappedEvent.payload && mappedEvent.payload.transcript) {
              const userMessage: Message = { 
                id: `user-voice-${Date.now()}`, 
                text: mappedEvent.payload.transcript, 
                isUser: true, 
                timestamp: new Date().toLocaleTimeString('es-ES', { hour: 'numeric', minute: 'numeric', hour12: true })
              };
              dispatch({ type: 'ADD_MESSAGE', payload: userMessage });
              
              if (isListening) {
                dispatch({ type: 'SET_LISTENING', payload: false });
              }
              
              dispatch({ type: 'SET_PROCESSING', payload: true });
              dispatch({ type: 'SET_THINKING', payload: true });
            }
            break;
            
          case 'ai_response_generated':
            // Limpiar timeout si existe
            if ((window as any).currentMessageTimeoutId) {
              clearTimeout((window as any).currentMessageTimeoutId);
              (window as any).currentMessageTimeoutId = null;
            }
            
            if (mappedEvent.payload && mappedEvent.payload.text && mappedEvent.payload.text.trim()) {
              const aiMessage: Message = { 
                  id: mappedEvent.payload.id || `ai-${Date.now()}`, 
                  text: mappedEvent.payload.text.trim(), 
                  isUser: false, 
                  timestamp: new Date().toLocaleTimeString('es-ES', { hour: 'numeric', minute: 'numeric', hour12: true }), 
                  suggestedVideo: mappedEvent.payload.suggestedVideo || undefined 
              };
              dispatch({ type: 'ADD_MESSAGE', payload: aiMessage });
              dispatch({ type: 'SET_THINKING', payload: false });
              dispatch({ type: 'SET_PROCESSING', payload: false }); // Limpiar estado de procesamiento
            } else {
              dispatch({ type: 'SET_THINKING', payload: false });
              dispatch({ type: 'SET_PROCESSING', payload: false });
            }
            break;
            
          case 'tts_started':
            if (mappedEvent.payload && mappedEvent.payload.messageId) {
              dispatch({ type: 'SET_CURRENT_SPEAKING_ID', payload: mappedEvent.payload.messageId });
              dispatch({ type: 'SET_SPEAKING', payload: true });
              dispatch({ type: 'SET_THINKING', payload: false });
              dispatch({ type: 'SET_PROCESSING', payload: false }); // Limpiar procesamiento cuando inicia TTS
              if (mappedEvent.payload.messageId === greetingMessageId && !isReadyToStart) {
                dispatch({ type: 'SET_READY_TO_START', payload: true });
              }
            }
            break;
            
          case 'tts_ended':
            if (mappedEvent.payload && mappedEvent.payload.messageId) {
              if (currentSpeakingId === mappedEvent.payload.messageId) {
                dispatch({ type: 'SET_SPEAKING', payload: false });
                dispatch({ type: 'SET_CURRENT_SPEAKING_ID', payload: null });

                if (mappedEvent.payload.messageId === greetingMessageId && 
                    conversationActive && 
                    !isListening && 
                    !isProcessing && 
                    !isSessionClosed) {
                  setTimeout(() => {
                    dispatch({ type: 'SET_LISTENING', payload: true });
                  }, 500);
                }

                if (mappedEvent.payload.isClosing) {
                  endSession(); 
                }
              }
            }
            break;
            
          default:
            if (mappedEvent.type && mappedEvent.type !== 'undefined') {
              const expectedEvents = [
                'initial_greeting_message', 
                'user_transcription_result', 
                'ai_response_generated', 
                'tts_started', 
                'tts_ended'
              ];
              
              if (!expectedEvents.includes(mappedEvent.type)) {
                console.log(`[LiveKit] 🆕 Nuevo tipo de evento recibido: ${mappedEvent.type}`, mappedEvent.payload);
              }
            } else {
              console.warn('[LiveKit] ⚠️ Evento recibido sin tipo válido:', mappedEvent);
            }
        }
      } catch (e) {
        console.error("[DataChannelHook] ❌ Error procesando DataChannel del agente Maria:", e);
        console.error("Raw payload:", new TextDecoder().decode(payload));
        setAppError('agent', 'Error procesando datos del agente.'); // Especificar tipo de error
      }
    } else {
      console.log('[handleDataReceived] Datos ignorados - no son del agente esperado:', {
        kind,
        participantIdentity: participant?.identity,
        expectedIdentity: AGENT_IDENTITY,
        isValidAgent: participant ? isValidAgent(participant.identity) : false,
        isReliable: kind === DataPacket_Kind.RELIABLE
      });
    }
  }, [
    dispatch, 
    conversationActive, 
    greetingMessageId, 
    currentSpeakingId, 
    endSession, 
    setAppError,
    isReadyToStart,
    isListening,
    isProcessing,
    isSessionClosed,
  ]);

  const handleSendTextMessage = useCallback(async (messageText: string) => {
    const trimmedInput = messageText.trim();
    
    console.log('[handleSendTextMessage] 🔍 Iniciando envío de texto:', {
      trimmedInput: !!trimmedInput,
      inputLength: trimmedInput.length,
      conversationActive,
      isProcessing,
      isSpeaking,
      isSessionClosed,
      activeSessionId,
      roomExists: !!roomRef.current,
      localParticipantExists: !!roomRef.current?.localParticipant,
    });
    
    if (!trimmedInput) {
      console.warn('[handleSendTextMessage] ❌ Texto vacío, cancelando envío');
      return;
    }

    if (!conversationActive) {
      console.warn('[handleSendTextMessage] ❌ Conversación no activa');
      setAppError('api', "Debes iniciar una conversación primero.");
      return;
    }

    if (isSessionClosed) {
      console.warn('[handleSendTextMessage] ❌ Sesión cerrada');
      setAppError('api', "La sesión ha terminado. Inicia una nueva conversación.");
      return;
    }

    if (!activeSessionId) {
      console.warn('[handleSendTextMessage] ❌ Sin ID de sesión activa');
      setAppError('api', "Error de sesión. Reinicia la conversación.");
      return;
    }

    if (!roomRef.current || !roomRef.current.localParticipant) {
      console.warn('[handleSendTextMessage] ❌ Sin conexión LiveKit');
      setAppError('api', "Error de conexión. Verifica tu conexión a internet.");
      return;
    }

    // Verificar si ya está procesando algo
    if (isProcessing || isSpeaking) {
      console.warn('[handleSendTextMessage] ⏳ Sistema ocupado:', { isProcessing, isSpeaking });
      setAppError('api', isProcessing ? "Espera a que termine de procesar el mensaje anterior." : "Espera a que María termine de hablar.");
      return;
    }

    try {
      console.log(`[handleSendTextMessage] ✅ Condiciones cumplidas, enviando texto: "${trimmedInput}"`);
      console.log(`[handleSendTextMessage] Session ID activa: ${activeSessionId}`);
      
      // Primero agregar el mensaje del usuario a la UI
      const userMessage: Message = { 
        id: `user-text-${Date.now()}`,
        text: trimmedInput,
        isUser: true,
        timestamp: new Date().toLocaleTimeString('es-ES', { hour: 'numeric', minute: 'numeric', hour12: true })
      };
      
      console.log('[handleSendTextMessage] 📝 Agregando mensaje del usuario a la UI:', userMessage);
      dispatch({ type: 'ADD_MESSAGE', payload: userMessage });
      dispatch({ type: 'SET_TEXT_INPUT', payload: '' }); // Limpiar input inmediatamente
      
      // Marcar como procesando ANTES de enviar
      dispatch({ type: 'SET_PROCESSING', payload: true });
      dispatch({ type: 'SET_THINKING', payload: true });
      
      const payload = JSON.stringify({ 
        message_type: "conversation",
        event_type: "conversation.respond",
        conversation_id: activeSessionId,
        properties: {
          text: trimmedInput
        }
      });
      
      console.log('[handleSendTextMessage] 📤 Payload a enviar al backend (formato Tavus):', payload);
      
      await roomRef.current.localParticipant.publishData(
        new TextEncoder().encode(payload), 
        { reliable: true }
      );
      
      console.log('[handleSendTextMessage] ✅ Mensaje enviado exitosamente via DataChannel');
      console.log('[handleSendTextMessage] ⏳ Esperando respuesta del backend...');

      // Timeout más largo para verificar si el backend responde
      const responseTimeoutId = setTimeout(() => {
        console.warn('[handleSendTextMessage] ⚠️ Backend no respondió en 45 segundos');
        dispatch({ type: 'SET_THINKING', payload: false });
        dispatch({ type: 'SET_PROCESSING', payload: false });
        setAppError('api', 'El sistema está tardando en responder. Verifica tu conexión o intenta de nuevo.');
      }, 45000); // Aumentar a 45 segundos

      // Almacenar el timeout ID para poder limpiarlo desde ai_response_generated
      (window as any).currentMessageTimeoutId = responseTimeoutId;

    } catch (error) {
      console.error("[handleSendTextMessage] ❌ Error al enviar mensaje de texto:", error);
      
      // Limpiar estados si hay error
      dispatch({ type: 'SET_THINKING', payload: false });
      dispatch({ type: 'SET_PROCESSING', payload: false });
      
      // Mostrar error específico
      if (error instanceof Error) {
        if (error.message.includes('network') || error.message.includes('connection')) {
          setAppError('api', "Error de conexión. Verifica tu internet e intenta de nuevo.");
        } else {
          setAppError('api', "Error al enviar tu mensaje. Intenta de nuevo.");
        }
      } else {
        setAppError('api', "Error inesperado. Intenta de nuevo.");
      }
    }
  }, [
    dispatch, conversationActive, isProcessing, isSpeaking, isSessionClosed,
    activeSessionId, roomRef, setAppError
  ]);

  return { handleDataReceived, handleSendTextMessage };
}