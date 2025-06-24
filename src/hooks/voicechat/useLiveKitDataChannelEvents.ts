'use client';

import { useCallback, Dispatch, FormEvent, RefObject, useEffect } from 'react';
import { DataPacket_Kind, RemoteParticipant, Room, LocalParticipant, Track, TrackPublication, RoomEvent } from 'livekit-client';
import { Room as LiveKitRoom } from 'livekit-client';
import type { Message, VoiceChatAction, VoiceChatState, ExtendedUserProfile } from '@/types'; // Actualizado para usar types consolidados
import { useError } from '@/contexts/ErrorContext'; // Asegúrate que la ruta es correcta
import { AGENT_IDENTITY, isValidAgent } from '@/lib/constants';

interface UseLiveKitDataChannelEventsProps {
  dispatch: Dispatch<VoiceChatAction>; // Usar dispatch
  conversationActive: boolean; // Para la lógica de isReadyToStart
  greetingMessageId: string | null; // Para la lógica de isReadyToStart
  currentSpeakingId: string | null; // Para la lógica de tts_ended
  endSession: (notify?: boolean, reason?: string, shouldRedirect?: boolean) => void; // Para session_should_end_signal y tts_ended isClosing
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
    console.log(`[DataChannel] 📨 Datos recibidos:`, {
      hasParticipant: !!participant,
      participantIdentity: participant?.identity,
      isReliable: kind === DataPacket_Kind.RELIABLE,
      payloadSize: payload?.length || 0,
      isValidAgent: participant ? isValidAgent(participant.identity) : false
    });
    
    if (kind === DataPacket_Kind.RELIABLE && participant && isValidAgent(participant.identity)) {
      try {
        const rawData = new TextDecoder().decode(payload);
        console.log(`[DataChannel] ✅ Mensaje VÁLIDO recibido del backend: Participante='${participant.identity}', Payload='${rawData}'`);
        
        const event = JSON.parse(rawData);

        // Mapear eventos de Tavus al formato esperado
        let mappedEvent = event;
        
        if (event.message_type && event.event_type) {
          console.log(`[DataChannel] Procesando evento Tavus: tipo='${event.message_type}', evento='${event.event_type}'`);
          
          // Mapear eventos de Tavus a nuestro formato
          switch (event.event_type) {
            case 'conversation.replica.started_speaking':
              mappedEvent = {
                type: 'tts_started',
                payload: {
                  messageId: event.inference_id || `speaking-${Date.now()}`
                }
              };
              console.log(`[DataChannel] Mapeando started_speaking -> tts_started:`, mappedEvent);
              break;
              
            case 'conversation.replica.stopped_speaking':
              mappedEvent = {
                type: 'tts_ended',
                payload: {
                  messageId: event.inference_id || `speaking-${Date.now()}`,
                  isClosing: event.properties?.isClosing || false
                }
              };
              console.log(`[DataChannel] Mapeando stopped_speaking -> tts_ended:`, mappedEvent);
              break;
              
            case 'conversation.replica.response':
              mappedEvent = {
                type: 'ai_response_generated',
                payload: {
                  id: event.inference_id,
                  text: event.properties?.text || '',
                  isInitialGreeting: event.properties?.isInitialGreeting || false,
                  suggestedVideo: event.properties?.suggestedVideo
                }
              };
              console.log(`[DataChannel] Mapeando response -> ai_response_generated:`, mappedEvent);
              break;

            // Eventos del sistema - manejar sin warnings
            case 'system.replica_joined':
              console.log(`[DataChannel] ✅ Sistema: Avatar se unió a la conversación`);
              return; // No procesar más, solo log
              
            case 'system.replica_present':
              // Este es un evento de heartbeat/confirmación de presencia
              // Solo mostrar log cada 10 intentos para reducir spam
              const attempt = event.properties?.attempt || 1;
              if (attempt === 1 || attempt % 10 === 0) {
                console.log(`[DataChannel] ✅ Sistema: Avatar presente (intento ${attempt})`);
              }
              return; // No procesar más
              
            case 'system.shutdown':
              console.log(`[DataChannel] ✅ Sistema: Conversación terminada`, event.properties);
              return; // No procesar más
              
            case 'system.replica_ready':
              console.log(`[DataChannel] ✅ Sistema: Avatar listo para interacción`);
              return; // No procesar más
              
            case 'system.heartbeat':
              // Heartbeat silencioso
              return; // No procesar más
              
            default:
              // Para otros eventos de sistema no reconocidos, solo hacer log informativo sin warning
              if (event.message_type === 'system') {
                console.log(`[DataChannel] ℹ️ Evento de sistema no manejado: ${event.event_type}`, event);
                return;
              }
              
              // Solo mostrar warning para eventos de conversación no reconocidos
              if (event.message_type === 'conversation') {
                console.warn(`[DataChannel] ⚠️ Evento de conversación no reconocido: '${event.event_type}'`, event);
              } else {
                console.log(`[DataChannel] ℹ️ Evento desconocido: tipo='${event.message_type}', evento='${event.event_type}'`, event);
              }
              return;
          }
        } else if (event.type) {
          // Evento en formato directo (no Tavus)
          console.log(`[DataChannel] Evento directo recibido: tipo='${event.type}'`);
          mappedEvent = event;
        } else {
          console.log(`[DataChannel] ℹ️ Mensaje recibido sin formato estándar:`, {
            tieneMessageType: !!event.message_type,
            tieneEventType: !!event.event_type,
            tieneType: !!event.type,
            evento: event
          });
          return;
        }
        
        // Verificar si el evento fue mapeado correctamente
        if (!mappedEvent || !mappedEvent.type) {
          console.log(`[DataChannel] ℹ️ Evento no pudo ser mapeado:`, mappedEvent);
          return;
        }
        
        console.log(`[DataChannel] Procesando evento mapeado: tipo='${mappedEvent.type}'`);
        
        // Procesar el evento mapeado
        switch (mappedEvent.type) {
          case 'user_transcription_result':
            if (mappedEvent.payload && mappedEvent.payload.transcript) {
              const userMessage: Message = { 
                id: `user-voice-${Date.now()}`, 
                text: mappedEvent.payload.transcript, 
                isUser: true, 
                timestamp: new Date().toLocaleTimeString('es-ES', { hour: 'numeric', minute: 'numeric', hour12: true })
              };
              
              // Solo agregar si no existe ya un mensaje similar reciente (evitar duplicados)
              // Esto pasa cuando el backend procesa el mensaje del usuario y lo reenvía
              console.log(`[DataChannel] 📝 Transcripción del usuario recibida del backend:`, userMessage);
              console.log(`[DataChannel] 🔍 Texto transcrito exacto: "${mappedEvent.payload.transcript}"`);
              
              // Agregar el mensaje del usuario al chat para mantener el flujo visual
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
              const messageId = mappedEvent.payload.id || `ai-${Date.now()}`;
              const messageText = mappedEvent.payload.text.trim();
              
              // Verificar si ya existe un mensaje con este ID (mensaje placeholder)
              const existingMessageElement = document.querySelector(`[data-message-id="${messageId}"]`);
              
              const aiMessage: Message = { 
                  id: messageId, 
                  text: messageText, 
                  isUser: false, 
                  timestamp: new Date().toLocaleTimeString('es-ES', { hour: 'numeric', minute: 'numeric', hour12: true }), 
                  suggestedVideo: mappedEvent.payload.suggestedVideo || undefined 
              };
              
              console.log(`[DataChannel] ${existingMessageElement ? 'Actualizando' : 'Agregando'} respuesta de IA:`, aiMessage);
              console.log(`[DataChannel] 🎤 Texto EXACTO que se mostrará en chat: "${messageText}"`);
              console.log(`[DataChannel] 🔊 Este mismo texto será convertido a voz por el sistema TTS`);
              console.log(`[DataChannel] 🎥 Video detectado en payload:`, mappedEvent.payload.suggestedVideo);
              
              if (existingMessageElement) {
                // Actualizar mensaje existente
                dispatch({ type: 'UPDATE_MESSAGE', payload: aiMessage });
              } else {
                // Agregar nuevo mensaje
                dispatch({ type: 'ADD_MESSAGE', payload: aiMessage });
              }
              
              // Si es el saludo inicial, establecer greetingMessageId
              if (mappedEvent.payload.isInitialGreeting && !greetingMessageId) {
                console.log('[DataChannel] 📢 Recibido saludo inicial, estableciendo greetingMessageId:', aiMessage.id);
                console.log('[DataChannel] 🎯 SALUDO INICIAL - Texto que se muestra en chat y se convierte a voz:', messageText);
                dispatch({ type: 'SET_GREETING_MESSAGE_ID', payload: aiMessage.id });
              }
              
              dispatch({ type: 'SET_THINKING', payload: false });
              dispatch({ type: 'SET_PROCESSING', payload: false });
            } else {
              console.warn(`[DataChannel] Respuesta de IA sin texto válido:`, mappedEvent.payload);
              dispatch({ type: 'SET_THINKING', payload: false });
              dispatch({ type: 'SET_PROCESSING', payload: false });
            }
            break;
            
          case 'tts_started':
            if (mappedEvent.payload && mappedEvent.payload.messageId) {
              console.log(`[DataChannel] TTS iniciado para mensaje:`, mappedEvent.payload.messageId);
              dispatch({ type: 'SET_CURRENT_SPEAKING_ID', payload: mappedEvent.payload.messageId });
              dispatch({ type: 'SET_SPEAKING', payload: true });
              dispatch({ type: 'SET_THINKING', payload: false });
              dispatch({ type: 'SET_PROCESSING', payload: false });
              
              if (mappedEvent.payload.messageId === greetingMessageId && !isReadyToStart) {
                console.log(`[DataChannel] Saludo inicial comenzó a reproducirse, marcando como listo`);
                dispatch({ type: 'SET_READY_TO_START', payload: true });
              }
            }
            break;
            
          case 'tts_ended':
            if (mappedEvent.payload && mappedEvent.payload.messageId) {
              console.log(`[DataChannel] TTS terminado para mensaje:`, mappedEvent.payload.messageId);
              console.log(`[DataChannel] 🔍 isClosing flag:`, mappedEvent.payload.isClosing); // Log adicional para debug
              
              if (currentSpeakingId === mappedEvent.payload.messageId) {
                dispatch({ type: 'SET_SPEAKING', payload: false });
                dispatch({ type: 'SET_CURRENT_SPEAKING_ID', payload: null });

                // Verificar si es mensaje de cierre ANTES de otras lógicas
                if (mappedEvent.payload.isClosing === true) {
                  console.log(`[DataChannel] 🚪 DETECTADO MENSAJE DE CIERRE - Iniciando secuencia de finalización`);
                  
                  // 1. BLOQUEAR INMEDIATAMENTE toda interacción del usuario
                  dispatch({ type: 'SET_SESSION_CLOSED', payload: true });
                  dispatch({ type: 'SET_CONVERSATION_ACTIVE', payload: false });
                  dispatch({ type: 'SET_LISTENING', payload: false });
                  dispatch({ type: 'SET_PROCESSING', payload: false });
                  
                  console.log(`[DataChannel] 🔒 Estados de bloqueo activados - Usuario no puede continuar interactuando`);
                  
                  // 2. Ejecutar endSession con parámetros específicos para mostrar modal
                  setTimeout(() => {
                    console.log(`[DataChannel] 🎯 Ejecutando endSession para mostrar modal de feedback`);
                    endSession(true, "conversación completada", false); // NO redirigir automáticamente, mostrar modal primero
                  }, 1000); // Tiempo mínimo para que termine el TTS
                  
                  return; // Salir temprano para evitar otras lógicas
                }

                if (mappedEvent.payload.messageId === greetingMessageId && 
                    conversationActive && 
                    !isListening && 
                    !isProcessing && 
                    !isSessionClosed) {
                  console.log(`[DataChannel] Saludo inicial terminó, activando modo de escucha`);
                  setTimeout(() => {
                    dispatch({ type: 'SET_LISTENING', payload: true });
                  }, 500);
                }
              }
            }
            break;
            
          default:
            if (mappedEvent.type && mappedEvent.type !== 'undefined') {
              const expectedEvents = [
                'user_transcription_result', 
                'ai_response_generated', 
                'tts_started', 
                'tts_ended'
              ];
              
              if (!expectedEvents.includes(mappedEvent.type)) {
                console.log(`[DataChannel] 🆕 Nuevo tipo de evento recibido: ${mappedEvent.type}`, mappedEvent.payload);
              }
            } else {
              console.log('[DataChannel] ℹ️ Evento recibido sin tipo válido:', mappedEvent);
            }
        }
      } catch (e) {
        console.error("[DataChannel] ❌ Error procesando mensaje del agente:", e);
        console.error("[DataChannel] Raw payload:", new TextDecoder().decode(payload));
        setAppError('agent', 'Error procesando datos del agente.');
      }
    } else {
      // Reducir spam de logs para participantes no válidos
      if (participant && !isValidAgent(participant.identity) && participant.identity !== 'tavus-avatar-agent') {
        console.log('[DataChannel] Datos ignorados - participante no válido:', {
          kind,
          participantIdentity: participant?.identity,
          isReliable: kind === DataPacket_Kind.RELIABLE
        });
      }
    }
  }, [
    dispatch, 
    conversationActive, 
    greetingMessageId, 
    currentSpeakingId, 
    endSession, 
    isProcessing, 
    isListening, 
    isSessionClosed, 
    setAppError,
    isReadyToStart
  ]);

  const handleSendTextMessage = useCallback(async (messageText: string, clearTextInput?: () => void) => {
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
      
      // LIMPIAR EL CAMPO DE TEXTO INMEDIATAMENTE DESPUÉS DE LA VALIDACIÓN
      if (clearTextInput) {
        console.log('[handleSendTextMessage] 🧹 Limpiando campo de texto...');
        clearTextInput();
      }
      
      // Agregar el mensaje del usuario a la UI inmediatamente
      const userMessage: Message = { 
        id: `user-sent-${Date.now()}`, 
        text: trimmedInput, 
        isUser: true, 
        timestamp: new Date().toLocaleTimeString('es-ES', { hour: 'numeric', minute: 'numeric', hour12: true })
      };
      
      console.log(`[handleSendTextMessage] 📝 Agregando mensaje del usuario a la UI:`, userMessage);
      console.log(`[handleSendTextMessage] 💬 Texto EXACTO que escribió el usuario: "${trimmedInput}"`);
      console.log(`[handleSendTextMessage] 🔄 Este texto se enviará al backend y aparecerá en el chat`);
      dispatch({ type: 'ADD_MESSAGE', payload: userMessage });
      
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