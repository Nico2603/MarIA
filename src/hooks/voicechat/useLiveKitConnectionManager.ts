'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { 
    Room, 
    RoomEvent, 
    ConnectionState as LiveKitConnectionState, 
    RemoteParticipant, 
    RemoteTrack, 
    RemoteTrackPublication,
    Participant,
    Track,
    DataPacket_Kind,
    RoomOptions,
    VideoPresets,
} from 'livekit-client';
import { useSession } from 'next-auth/react';
import { useError } from '@/contexts/ErrorContext';

export interface UseLiveKitConnectionManagerResult {
  room: Room | null;
  connectionState: LiveKitConnectionState;
  disconnectFromLiveKit: () => Promise<void>;
  targetParticipant: RemoteParticipant | null;
}

interface UseLiveKitConnectionManagerProps {
  initialContext: string | null;
  activeSessionId: string | null;
  userProfile: { id?: string; username?: string | null; email?: string | null } | null;
  targetParticipantIdentity?: string;
  onConnected?: (room: Room) => void;
  onDisconnected?: () => void;
  onConnectionError?: (error: Error) => void;
  onTargetParticipantFound?: (participant: RemoteParticipant) => void;
  handleTrackSubscribed: (track: RemoteTrack, publication: RemoteTrackPublication, participant: RemoteParticipant) => void;
  handleTrackUnsubscribed: (track: RemoteTrack, publication: RemoteTrackPublication, participant: RemoteParticipant) => void;
  handleParticipantDisconnected: (participant: RemoteParticipant) => void;
  onDataReceived?: (payload: Uint8Array, participant?: RemoteParticipant, kind?: DataPacket_Kind, topic?: string) => void;
}

const LIVEKIT_ROOM_NAME = 'ai-mental-health-chat';

// Global para detectar múltiples instancias simultáneas
let activeManagerInstances = 0;
let globalConnectionAttempt = 0;

export function useLiveKitConnectionManager({
  initialContext,
  activeSessionId,
  userProfile,
  targetParticipantIdentity,
  onConnected,
  onDisconnected,
  onConnectionError,
  onTargetParticipantFound,
  handleTrackSubscribed,
  handleTrackUnsubscribed,
  handleParticipantDisconnected,
  onDataReceived,
}: UseLiveKitConnectionManagerProps): UseLiveKitConnectionManagerResult {
  const { data: session, status: authStatus } = useSession();
  const { setError: setAppError, clearError } = useError();
  
  const [room, setRoom] = useState<Room | null>(null);
  const [connectionState, setConnectionState] = useState<LiveKitConnectionState>(LiveKitConnectionState.Disconnected);
  const [isConnecting, setIsConnecting] = useState(false);
  const [targetParticipant, setTargetParticipant] = useState<RemoteParticipant | null>(null);
  
  const liveKitUrlRef = useRef(process.env.NEXT_PUBLIC_LIVEKIT_URL || '');
  const instanceIdRef = useRef<number>(0);
  const shouldAutoReconnectRef = useRef<boolean>(true);
  const connectionInProgressRef = useRef<boolean>(false);

  // Registrar esta instancia del hook
  useEffect(() => {
    activeManagerInstances++;
    instanceIdRef.current = activeManagerInstances;
    
    console.log(`[LKCM] Nueva instancia ${instanceIdRef.current} creada. Total activas: ${activeManagerInstances}`);
    
    return () => {
      activeManagerInstances = Math.max(0, activeManagerInstances - 1);
      console.log(`[LKCM] Instancia ${instanceIdRef.current} destruida. Total activas: ${activeManagerInstances}`);
    };
  }, []);

  // Refs estables para evitar re-renders
  const sessionRef = useRef(session);
  const userProfileRef = useRef(userProfile);
  const initialContextRef = useRef(initialContext);
  const activeSessionIdRef = useRef(activeSessionId);
  const currentRoomRef = useRef<Room | null>(null);
  const connectionAttemptRef = useRef<number>(0);

  // Actualizar refs cuando cambien las props
  useEffect(() => {
    sessionRef.current = session;
    userProfileRef.current = userProfile;
    initialContextRef.current = initialContext;
    activeSessionIdRef.current = activeSessionId;
  }, [session, userProfile, initialContext, activeSessionId]);

  useEffect(() => {
    currentRoomRef.current = room;
    setConnectionState(room?.state || LiveKitConnectionState.Disconnected);
  }, [room]);

  // Refs para callbacks para evitar dependencias circulares
  const onConnectedRef = useRef(onConnected);
  const onDisconnectedRef = useRef(onDisconnected);
  const onConnectionErrorRef = useRef(onConnectionError);
  const onTargetParticipantFoundRef = useRef(onTargetParticipantFound);
  const handleTrackSubscribedRef = useRef(handleTrackSubscribed);
  const handleTrackUnsubscribedRef = useRef(handleTrackUnsubscribed);
  const handleParticipantDisconnectedRef = useRef(handleParticipantDisconnected);
  const onDataReceivedRef = useRef(onDataReceived);

  useEffect(() => {
    onConnectedRef.current = onConnected;
    onDisconnectedRef.current = onDisconnected;
    onConnectionErrorRef.current = onConnectionError;
    onTargetParticipantFoundRef.current = onTargetParticipantFound;
    handleTrackSubscribedRef.current = handleTrackSubscribed;
    handleTrackUnsubscribedRef.current = handleTrackUnsubscribed;
    handleParticipantDisconnectedRef.current = handleParticipantDisconnected;
    onDataReceivedRef.current = onDataReceived;
  }, [onConnected, onDisconnected, onConnectionError, handleTrackSubscribed, handleTrackUnsubscribed, handleParticipantDisconnected, onDataReceived, onTargetParticipantFound]);

  const getLiveKitToken = useCallback(async (roomName: string, participantName: string): Promise<string> => {
    try {
      const queryParams = new URLSearchParams({
        room: roomName,
        participant: participantName,
        identity: participantName,
      });

      // Añadir metadata del usuario si está disponible
      if (userProfileRef.current?.id) {
        queryParams.set('userId', userProfileRef.current.id);
      }
      if (userProfileRef.current?.username) {
        queryParams.set('username', userProfileRef.current.username);
      }
      if (activeSessionIdRef.current) {
        queryParams.set('chatSessionId', activeSessionIdRef.current);
      }
      if (initialContextRef.current) {
        queryParams.set('latestSummary', initialContextRef.current);
      }

      const response = await fetch(`/api/livekit-token?${queryParams.toString()}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Token request failed: ${response.status} - ${errorText}`);
      }

      const data = await response.json();

      if (!data.token) {
        throw new Error('No token received from server');
      }

      return data.token;
    } catch (error) {
      console.error('[LKCM] Error obteniendo token de LiveKit:', error);
      throw error;
    }
  }, []);

  const disconnectFromLiveKit = useCallback(async () => {
    try {
      shouldAutoReconnectRef.current = false; // Prevenir auto-reconexión
      if (currentRoomRef.current && (
        currentRoomRef.current.state === LiveKitConnectionState.Connected || 
        currentRoomRef.current.state === LiveKitConnectionState.Connecting
      )) {
        console.log(`[LKCM] Instancia ${instanceIdRef.current} desconectando...`);
        await currentRoomRef.current.disconnect();
      }
    } catch (error) {
      console.error('[LKCM] Error al desconectar de LiveKit:', error);
    } finally {
      // Reset de estados independientemente del resultado
      setIsConnecting(false);
      setConnectionState(LiveKitConnectionState.Disconnected);
      setRoom(null);
      currentRoomRef.current = null;
      setTargetParticipant(null);
      connectionInProgressRef.current = false;
    }
  }, []);

  const connectToRoom = useCallback(async (sessionId: string, participantName: string) => {
    // Verificar si ya está conectando o conectado
    if (connectionInProgressRef.current || isConnecting || currentRoomRef.current?.state === LiveKitConnectionState.Connected) {
      console.log(`[LKCM] Instancia ${instanceIdRef.current} ya está conectando o conectado, ignorando nueva conexión`);
      return;
    }

    // Verificar si hay múltiples instancias activas
    if (activeManagerInstances > 1) {
      console.warn(`[LKCM] Detectadas ${activeManagerInstances} instancias activas. Solo la primera debería conectar.`);
      // Solo permitir conectar a la primera instancia para evitar conflictos
      if (instanceIdRef.current !== 1) {
        console.log(`[LKCM] Instancia ${instanceIdRef.current} cancelando conexión (no es la principal)`);
        return;
      }
    }

    // Incrementar contador de intentos para identificar reconexiones
    globalConnectionAttempt++;
    connectionAttemptRef.current = globalConnectionAttempt;
    const currentAttempt = connectionAttemptRef.current;
    
    console.log(`[LKCM] Instancia ${instanceIdRef.current} iniciando conexión ${currentAttempt} para sesión: ${sessionId}`);
    connectionInProgressRef.current = true;
    setIsConnecting(true);
    shouldAutoReconnectRef.current = true; // Permitir auto-reconexión futura

    try {
      // Desconectar cualquier sala anterior antes de crear una nueva
      if (currentRoomRef.current) {
        console.log('[LKCM] Desconectando sala anterior...');
        await currentRoomRef.current.disconnect();
        currentRoomRef.current = null;
        setRoom(null);
      }

      const participantIdentity = `${participantName}_${sessionId}`;
      const token = await getLiveKitToken(LIVEKIT_ROOM_NAME, participantIdentity);

      // Verificar si este intento aún es válido (no ha sido superado por otro)
      if (currentAttempt !== globalConnectionAttempt) {
        console.log(`[LKCM] Intento ${currentAttempt} cancelado por intento más reciente ${globalConnectionAttempt}`);
        setIsConnecting(false);
        connectionInProgressRef.current = false;
        return;
      }

      // Crear nueva instancia de Room
      const newRoom = new Room({
        adaptiveStream: true,
        dynacast: true,
        publishDefaults: {
          dtx: false,
          red: true,
          simulcast: false,
        },
      });

      // Configurar event listeners
      newRoom
        .on(RoomEvent.ConnectionStateChanged, (state: LiveKitConnectionState) => {
          console.log(`[LKCM] Instancia ${instanceIdRef.current} estado de conexión ${currentAttempt}: ${state}`);
          setConnectionState(state);
          
          if (state === LiveKitConnectionState.Connected) {
            currentRoomRef.current = newRoom; 
            setRoom(newRoom); 
            setIsConnecting(false);
            connectionInProgressRef.current = false;
            console.log(`[LKCM] Instancia ${instanceIdRef.current} conexión ${currentAttempt} exitosa`);
            
            if (onConnectedRef.current) onConnectedRef.current(newRoom);

            // Target participant discovery
            if (targetParticipantIdentity && newRoom) {
              let foundParticipant: RemoteParticipant | undefined = undefined;
              for (const p of Array.from(newRoom.remoteParticipants.values())) { 
                if (p.identity === targetParticipantIdentity) {
                  foundParticipant = p;
                  break;
                }
              }
              if (foundParticipant) {
                setTargetParticipant(foundParticipant);
                if (onTargetParticipantFoundRef.current) {
                  onTargetParticipantFoundRef.current(foundParticipant);
                }
              } else {
                const handleNewParticipant = (newP: Participant) => {
                  if (newP instanceof RemoteParticipant && newP.identity === targetParticipantIdentity) {
                    setTargetParticipant(newP);
                    if (onTargetParticipantFoundRef.current) {
                      onTargetParticipantFoundRef.current(newP);
                    }
                    newRoom.off(RoomEvent.ParticipantConnected, handleNewParticipant);
                  }
                };
                newRoom.on(RoomEvent.ParticipantConnected, handleNewParticipant);
              }
            }

          } else if (state === LiveKitConnectionState.Disconnected) {
            console.log(`[LKCM] Instancia ${instanceIdRef.current} desconectado ${currentAttempt}`);
            if (currentRoomRef.current === newRoom) {
              currentRoomRef.current = null;
              setRoom(null);
              setTargetParticipant(null);
            }
            setIsConnecting(false);
            connectionInProgressRef.current = false;
            if (onDisconnectedRef.current) onDisconnectedRef.current();
            
            // Solo reconectar automáticamente si está permitido
            if (shouldAutoReconnectRef.current && sessionRef.current?.user?.id) {
              console.log(`[LKCM] Instancia ${instanceIdRef.current} programando auto-reconexión...`);
              setTimeout(() => {
                if (shouldAutoReconnectRef.current && !currentRoomRef.current && sessionRef.current?.user?.id) {
                  const userProfile = userProfileRef.current;
                  const participantName = userProfile?.username || sessionRef.current?.user?.name || 'Usuario';
                  connectToRoom(sessionRef.current.user.id, participantName);
                }
              }, 2000); // Esperar 2 segundos antes de reconectar
            }
          }
        })
        .on(RoomEvent.TrackSubscribed, (track, publication, participant) => {
          if (handleTrackSubscribedRef.current) handleTrackSubscribedRef.current(track, publication, participant);
        })
        .on(RoomEvent.TrackUnsubscribed, (track, publication, participant) => {
          if (handleTrackUnsubscribedRef.current) handleTrackUnsubscribedRef.current(track, publication, participant);
        })
        .on(RoomEvent.ParticipantDisconnected, (participant) => {
          if (handleParticipantDisconnectedRef.current) handleParticipantDisconnectedRef.current(participant);
        })
        .on(RoomEvent.DataReceived, (payload, participant, kind, topic) => {
          if (onDataReceivedRef.current) onDataReceivedRef.current(payload, participant, kind, topic);
        })
        .on(RoomEvent.SignalConnected, () => {
          console.log(`[LKCM] Instancia ${instanceIdRef.current} señal conectada ${currentAttempt}`);
        })
        .on(RoomEvent.Disconnected, (reason) => {
          console.log(`[LKCM] Instancia ${instanceIdRef.current} evento Disconnected ${currentAttempt}, razón: ${reason}`);
          if (currentRoomRef.current === newRoom) {
            currentRoomRef.current = null;
            setRoom(null);
            setTargetParticipant(null);
          }
          setConnectionState(LiveKitConnectionState.Disconnected);
          setIsConnecting(false);
          if (onDisconnectedRef.current) onDisconnectedRef.current();
        })
        .on(RoomEvent.LocalTrackUnpublished, (publication, participant) => {
          // Track unpublished
        })
        .on(RoomEvent.ConnectionQualityChanged, (quality, participant) => {
          if (quality === 'poor') {
            console.warn('[LKCM] Poor connection quality for', participant.identity);
          }
        })
        .on(RoomEvent.MediaDevicesError, (error) => {
          console.error('[LKCM] RoomEvent.MediaDevicesError:', error.message);
          setAppError('livekit', `Error de dispositivos multimedia: ${error.message}`);
        })
        .on(RoomEvent.RoomMetadataChanged, (metadata) => {
          // Room metadata changed
        })
        .on(RoomEvent.Reconnecting, () => {
          setConnectionState(LiveKitConnectionState.Reconnecting);
        })
        .on(RoomEvent.Reconnected, () => {
          setConnectionState(LiveKitConnectionState.Connected);
        });

      try {
        console.log(`[LKCM] Instancia ${instanceIdRef.current} conectando a LiveKit ${currentAttempt}...`);
        await newRoom.connect(liveKitUrlRef.current, token, { autoSubscribe: true });
      } catch (error) {
        console.error(`[LKCM] Instancia ${instanceIdRef.current} error connecting to LiveKit ${currentAttempt}:`, error);
        if (onConnectionErrorRef.current) {
          onConnectionErrorRef.current(error instanceof Error ? error : new Error('Error desconocido al conectar'));
        }
        
        // Cleanup en caso de error
        if (currentRoomRef.current === newRoom) {
          currentRoomRef.current = null;
          setRoom(null);
        }
        setIsConnecting(false);
        setConnectionState(LiveKitConnectionState.Disconnected);
        setAppError('livekit', error instanceof Error ? error.message : 'Fallo al conectar con LiveKit.');
      }
    } catch (error) {
      console.error(`[LKCM] Instancia ${instanceIdRef.current} error al conectar a LiveKit ${currentAttempt}:`, error);
      setIsConnecting(false);
      setConnectionState(LiveKitConnectionState.Disconnected);
      setAppError('livekit', error instanceof Error ? error.message : 'Fallo al conectar con LiveKit.');
    }
  }, [getLiveKitToken, disconnectFromLiveKit, setAppError, targetParticipantIdentity]);

  // Effect principal de conexión - solo al montar
  useEffect(() => {
    console.log(`[LKCM] Instancia ${instanceIdRef.current} effect principal ejecutado`);
    
    // Solo intentar conectar al montar si tenemos la sesión
    if (session?.user?.id && authStatus === 'authenticated') {
      const userProfile = userProfileRef.current;
      const participantName = userProfile?.username || session?.user?.name || 'Usuario';
      
      console.log(`[LKCM] Instancia ${instanceIdRef.current} intentando conexión inicial...`);
      
      // Pequeño delay para asegurar que el componente esté completamente montado
      setTimeout(() => {
        if (shouldAutoReconnectRef.current && !currentRoomRef.current && session?.user?.id) {
          connectToRoom(session.user.id, participantName);
        }
      }, 500);
    }

    // Cleanup solo al desmontar
    return () => {
      console.log(`[LKCM] Instancia ${instanceIdRef.current} cleanup final por desmontaje`);
      shouldAutoReconnectRef.current = false;
      
      if (currentRoomRef.current?.state === LiveKitConnectionState.Connected) {
        console.log(`[LKCM] Instancia ${instanceIdRef.current} desconectando por desmontaje final`);
        currentRoomRef.current.disconnect().catch(error => 
          console.error("[LKCM] Error disconnecting during final cleanup:", error)
        );
      }
    };
  }, []); // Sin dependencias para que solo se ejecute al montar/desmontar

  // Effect separado para manejar cambios de sesión
  useEffect(() => {
    if (authStatus === 'authenticated' && session?.user?.id && !currentRoomRef.current && shouldAutoReconnectRef.current) {
      const userProfile = userProfileRef.current;
      const participantName = userProfile?.username || session?.user?.name || 'Usuario';
      
      console.log(`[LKCM] Instancia ${instanceIdRef.current} sesión disponible, intentando conexión...`);
      connectToRoom(session.user.id, participantName);
    } else if (authStatus === 'unauthenticated' && currentRoomRef.current) {
      console.log(`[LKCM] Instancia ${instanceIdRef.current} sesión perdida, desconectando...`);
      disconnectFromLiveKit();
    }
  }, [session?.user?.id, authStatus, connectToRoom, disconnectFromLiveKit]);

  return { room, connectionState, disconnectFromLiveKit, targetParticipant };
} 