'use client';

import { useCallback, Dispatch, FormEvent, RefObject, useEffect, useRef } from 'react';
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
  messages: Message[]; // Añadido para evitar duplicados
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
  messages, // Añadido para evitar duplicados
}: UseLiveKitDataChannelEventsProps) {
  const { setError: setAppError, clearError } = useError();
  
  // Contador para monitorear mensajes de IA procesados
  const aiMessageCountRef = useRef(0);
  const lastProcessedMessageId = useRef<string | null>(null);

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
        setAppError('agent', 'El agente María no está conectado. Verifica que el backend esté ejecutándose correctamente.');
      } else {
        console.log('[DebugBackend] ✅ Agentes válidos detectados, limpiando errores de agente');
        // Solo limpiar el error si es de tipo 'agent'
        setAppError('agent', null);
      }
    }
  }, [room, setAppError]);

  // Función para verificar agentes con delay inicial y tiempos más largos
  const checkAgentsWithDelay = useCallback(() => {
    // Verificar inmediatamente
    debugBackendCommunication();
    
    // Verificar después de 3 segundos para dar tiempo a que se conecten los agentes
    setTimeout(() => {
      debugBackendCommunication();
    }, 3000);
    
    // Verificar después de 8 segundos como verificación final
    setTimeout(() => {
      debugBackendCommunication();
    }, 8000);
    
    // Verificación adicional después de 15 segundos para casos lentos
    setTimeout(() => {
      debugBackendCommunication();
    }, 15000);
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
        
        // DEBUG ADICIONAL: Log cada evento recibido con timestamp
        const currentTime = new Date().toLocaleTimeString();
        console.log(`[DataChannel] 🕐 [${currentTime}] Evento recibido:`, {
          eventType: event.type || event.event_type || 'DESCONOCIDO',
          messageId: event.id || event.inference_id || 'SIN_ID',
          hasText: !!(event.text || event.properties?.text),
          textPreview: (event.text || event.properties?.text || '').substring(0, 50),
          isInitialGreeting: event.isInitialGreeting || event.properties?.isInitialGreeting || false,
          fullEventKeys: Object.keys(event),
          messagesCount: messages.length,
          lastMessageIsUser: messages.length > 0 ? messages[messages.length - 1].isUser : 'N/A'
        });
        
        // CRÍTICO: Log especial para ai_response_generated
        if (event.type === 'ai_response_generated' || event.event_type?.includes('response')) {
          console.log(`[DataChannel] 🚨 EVENTO AI_RESPONSE_GENERATED DETECTADO:`, {
            isDirectFormat: !!event.type,
            isTavusFormat: !!event.event_type,
            rawEvent: event,
            currentMessagesInChat: messages.length,
            processingState: isProcessing,
            thinkingState: isSessionClosed
          });
        }

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
              console.log(`[DataChannel] 📝 Transcripción del usuario recibida del backend: "${mappedEvent.payload.transcript}"`);
              
              // Solo procesar si el mensaje no existe ya en el chat
              // Esto evita duplicados cuando el usuario escribió texto (no habló)
              const existingUserMessage = messages.find(m => 
                m.isUser && m.text.trim() === mappedEvent.payload.transcript.trim()
              );
              
              if (!existingUserMessage) {
                const userMessage: Message = { 
                  id: `user-voice-${Date.now()}`, 
                  text: mappedEvent.payload.transcript, 
                  isUser: true, 
                  timestamp: new Date().toLocaleTimeString('es-ES', { hour: 'numeric', minute: 'numeric', hour12: true })
                };
                
                console.log(`[DataChannel] ➕ Agregando transcripción de voz del usuario al chat:`, userMessage);
                dispatch({ type: 'ADD_MESSAGE', payload: userMessage });
                
                if (isListening) {
                  dispatch({ type: 'SET_LISTENING', payload: false });
                }
                
                dispatch({ type: 'SET_PROCESSING', payload: true });
                dispatch({ type: 'SET_THINKING', payload: true });
              } else {
                console.log(`[DataChannel] 🔄 Transcripción duplicada ignorada (usuario ya escribió este texto)`);
              }
            }
            break;
            
          case 'ai_response_generated':
            console.log(`[DataChannel] 🎯 PROCESANDO AI_RESPONSE_GENERATED - Inicio del caso`);
            
            // Limpiar timeouts si existen
            if ((window as any).currentMessageTimeoutId) {
              clearTimeout((window as any).currentMessageTimeoutId);
              (window as any).currentMessageTimeoutId = null;
            }
            
            // Limpiar timeout de emergencia si existe
            if ((window as any).emergencyTimeoutId) {
              clearTimeout((window as any).emergencyTimeoutId);
              (window as any).emergencyTimeoutId = null;
              console.log(`[DataChannel] ✅ Timeout de emergencia limpiado - Respuesta de IA recibida`);
            }
            
            // Manejar tanto formato directo como formato con payload
            const responseText = mappedEvent.text || (mappedEvent.payload && mappedEvent.payload.text) || '';
            const responseId = mappedEvent.id || (mappedEvent.payload && mappedEvent.payload.id) || `ai-${Date.now()}`;
            const isInitialGreeting = mappedEvent.isInitialGreeting || (mappedEvent.payload && mappedEvent.payload.isInitialGreeting) || false;
            const suggestedVideo = mappedEvent.suggestedVideo || (mappedEvent.payload && mappedEvent.payload.suggestedVideo);
            const richContent = mappedEvent.richContent || (mappedEvent.payload && mappedEvent.payload.richContent);
            
            console.log(`[DataChannel] 🔍 DEBUG ai_response_generated DETALLADO:`, {
              hasPayload: !!mappedEvent.payload,
              mappedEventText: mappedEvent.text,
              payloadText: mappedEvent.payload?.text,
              finalText: responseText,
              responseId,
              isInitialGreeting,
              suggestedVideo,
              richContent,
              fullEvent: mappedEvent,
              messagesInChatBefore: messages.length,
              currentGreetingId: greetingMessageId
            });
            
            console.log(`[DataChannel] 🎭 TIPO DE RESPUESTA: ${isInitialGreeting ? 'SALUDO INICIAL' : 'RESPUESTA POSTERIOR'}`);
            console.log(`[DataChannel] 📊 ESTADO DEL CHAT: ${messages.length} mensajes existentes`);
            
            if (responseText && responseText.trim()) {
              const messageId = responseId;
              const messageText = responseText.trim();
              
              // TEMPORAL: Lógica de duplicados más permisiva para respuestas posteriores
              const existingMessage = messages.find(m => {
                // Duplicado exacto por ID (siempre verificar)
                if (m.id === messageId) {
                  console.log(`[DataChannel] 🔍 Mensaje encontrado por ID: ${messageId}`);
                  return true;
                }
                
                // Para el saludo inicial, verificar duplicados por contenido
                if (isInitialGreeting && !m.isUser && m.text.trim() === messageText.trim()) {
                  console.log(`[DataChannel] 🔍 Duplicado de saludo inicial detectado por contenido`);
                  return true;
                }
                
                // TEMPORAL: Para respuestas posteriores, ser MUY permisivo
                // Solo bloquear si es exactamente el mismo mensaje muy reciente (menos de 1 segundo)
                if (!isInitialGreeting && !m.isUser && 
                    m.text.trim() === messageText.trim() && 
                    Math.abs(Date.now() - new Date(m.timestamp || '').getTime()) < 1000) {
                  console.log(`[DataChannel] 🔍 Duplicado muy reciente detectado (1s): ${messageText.substring(0, 30)}...`);
                  return true;
                }
                
                return false;
              });
              
              console.log(`[DataChannel] 🔍 VERIFICACIÓN DE DUPLICADOS:`, {
                existingMessage: !!existingMessage,
                isInitialGreeting,
                messageId,
                messageText: messageText.substring(0, 50),
                totalMessagesInChat: messages.length
              });
              
              const aiMessage: Message = { 
                  id: messageId, 
                  text: messageText, 
                  isUser: false, 
                  timestamp: new Date().toLocaleTimeString('es-ES', { hour: 'numeric', minute: 'numeric', hour12: true }), 
                  suggestedVideo: suggestedVideo || undefined,
                  richContent: richContent || undefined
              };
              
              if (existingMessage) {
                console.log(`[DataChannel] 🔄 Actualizando respuesta de IA existente:`, aiMessage);
                console.log(`[DataChannel] 🎤 Texto EXACTO actualizado en chat: "${messageText}"`);
                console.log(`[DataChannel] 🔊 Este texto actualizado será/fue convertido a voz por TTS`);
                console.log(`[DataChannel] 📤 DESPACHANDO UPDATE_MESSAGE...`);
                dispatch({ type: 'UPDATE_MESSAGE', payload: aiMessage });
                console.log(`[DataChannel] ✅ UPDATE_MESSAGE despachado exitosamente`);
              } else {
                // Incrementar contador de mensajes procesados
                aiMessageCountRef.current += 1;
                lastProcessedMessageId.current = messageId;
                
                console.log(`[DataChannel] ➕ Agregando NUEVA respuesta de IA (#${aiMessageCountRef.current}):`, aiMessage);
                console.log(`[DataChannel] 🎤 Texto EXACTO que se mostrará en chat: "${messageText}"`);
                console.log(`[DataChannel] 🔊 Este mismo texto será convertido a voz por el sistema TTS`);
                console.log(`[DataChannel] 📝 TRANSCRIPCIÓN COMPLETA: Cada respuesta de audio de IA se muestra como texto`);
                console.log(`[DataChannel] 📊 CONTADOR DE MENSAJES: Total procesados = ${aiMessageCountRef.current}`);
                console.log(`[DataChannel] 📤 DESPACHANDO ADD_MESSAGE...`);
                console.log(`[DataChannel] 📋 Mensaje a agregar:`, {
                  id: aiMessage.id,
                  text: aiMessage.text.substring(0, 100),
                  isUser: aiMessage.isUser,
                  timestamp: aiMessage.timestamp,
                  isInitialGreeting: isInitialGreeting
                });
                
                // TEMPORAL: Verificar si dispatch funciona agregando mensaje de prueba primero
                if (!isInitialGreeting) {
                  console.log(`[DataChannel] 🧪 PRUEBA: Agregando mensaje de prueba para verificar dispatch`);
                  const testMessage = {
                    id: `test-${Date.now()}`,
                    text: `[PRUEBA] Respuesta de IA recibida: ${messageText.substring(0, 50)}...`,
                    isUser: false,
                    timestamp: new Date().toLocaleTimeString('es-ES', { hour: 'numeric', minute: 'numeric', hour12: true })
                  };
                  dispatch({ type: 'ADD_MESSAGE', payload: testMessage });
                  console.log(`[DataChannel] 🧪 Mensaje de prueba despachado`);
                  
                  // Esperar un momento y luego agregar el mensaje real
                  setTimeout(() => {
                    console.log(`[DataChannel] 📤 Ahora agregando mensaje REAL...`);
                    dispatch({ type: 'ADD_MESSAGE', payload: aiMessage });
                    console.log(`[DataChannel] ✅ ADD_MESSAGE REAL despachado exitosamente`);
                  }, 500);
                } else {
                  // Para el saludo inicial, proceder normalmente
                  dispatch({ type: 'ADD_MESSAGE', payload: aiMessage });
                  console.log(`[DataChannel] ✅ ADD_MESSAGE despachado exitosamente`);
                }
              }
              
              console.log(`[DataChannel] 🎥 Video detectado en payload:`, suggestedVideo);
              console.log(`[DataChannel] 🎨 Contenido enriquecido detectado:`, richContent);
              
              // Si es el saludo inicial, establecer greetingMessageId
              if (isInitialGreeting && !greetingMessageId) {
                console.log('[DataChannel] 📢 Recibido saludo inicial, estableciendo greetingMessageId:', aiMessage.id);
                console.log('[DataChannel] 🎯 SALUDO INICIAL - Texto que se muestra en chat y se convierte a voz:', messageText);
                console.log(`[DataChannel] 📤 DESPACHANDO SET_GREETING_MESSAGE_ID...`);
                dispatch({ type: 'SET_GREETING_MESSAGE_ID', payload: aiMessage.id });
                console.log(`[DataChannel] ✅ SET_GREETING_MESSAGE_ID despachado`);
              } else if (!isInitialGreeting) {
                console.log('[DataChannel] 💬 RESPUESTA POSTERIOR - Texto transcrito y mostrado en chat:', messageText);
                console.log(`[DataChannel] 🎉 RESPUESTA POSTERIOR PROCESADA EXITOSAMENTE`);
              }
              
              console.log(`[DataChannel] 🧠 Limpiando estados: THINKING = false, PROCESSING = false`);
              dispatch({ type: 'SET_THINKING', payload: false });
              dispatch({ type: 'SET_PROCESSING', payload: false });
              console.log(`[DataChannel] ✅ Estados limpiados correctamente`);
              
              console.log(`[DataChannel] 🎯 PROCESAMIENTO ai_response_generated COMPLETADO para ID: ${messageId}`);
            } else {
              console.warn(`[DataChannel] Respuesta de IA sin texto válido:`, {
                responseText,
                responseId,
                isInitialGreeting,
                fullMappedEvent: mappedEvent
              });
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

                // CORREGIDO: No activar micrófono automáticamente
                // El usuario debe usar push-to-talk o el botón del micrófono
                if (mappedEvent.payload.messageId === greetingMessageId) {
                  console.log(`[DataChannel] ✅ Saludo inicial terminó - Usuario debe usar push-to-talk o botón para responder`);
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
    isReadyToStart,
    messages
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
    
    // TEMPORAL: Agregar timeout para detectar si no llegan respuestas
    const responseTimeoutId = setTimeout(() => {
      console.warn(`[DataChannel] ⚠️ PROBLEMA DETECTADO: No se recibió respuesta de IA en 10 segundos`);
      console.log(`[DataChannel] 🧪 Agregando mensaje de emergencia para verificar que el chat funciona`);
      
      const emergencyMessage = {
        id: `emergency-${Date.now()}`,
        text: `[DEBUG] No se recibió respuesta de IA. Mensaje enviado: "${trimmedInput.substring(0, 50)}..." - Verificar backend.`,
        isUser: false,
        timestamp: new Date().toLocaleTimeString('es-ES', { hour: 'numeric', minute: 'numeric', hour12: true })
      };
      
      dispatch({ type: 'ADD_MESSAGE', payload: emergencyMessage });
      dispatch({ type: 'SET_THINKING', payload: false });
      dispatch({ type: 'SET_PROCESSING', payload: false });
      
      console.log(`[DataChannel] 🚨 Mensaje de emergencia agregado - Si esto aparece en el chat, el dispatch funciona`);
    }, 10000); // 10 segundos
    
    // Almacenar el timeout para poder limpiarlo desde ai_response_generated
    (window as any).emergencyTimeoutId = responseTimeoutId;
    
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
        type: "submit_user_text",
        text: trimmedInput,
        sessionId: activeSessionId
      });
      
      console.log('[handleSendTextMessage] 📤 Payload a enviar al backend:', payload);
      
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