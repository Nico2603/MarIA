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
import { useError, AppError } from '@/contexts/ErrorContext';

export interface UseLiveKitConnectionManagerResult {
  room: Room | null;
  connectionState: LiveKitConnectionState;
  disconnectFromLiveKit: () => Promise<void>;
}

interface UseLiveKitConnectionManagerProps {
  initialContext: string | null;
  activeSessionId: string | null;
  userProfile: { id?: string; username?: string | null; email?: string | null } | null;
  onConnected?: (room: Room) => void;
  onDisconnected?: () => void;
  onConnectionError?: (error: Error) => void;
  handleTrackSubscribed: (track: RemoteTrack, publication: RemoteTrackPublication, participant: RemoteParticipant) => void;
  handleTrackUnsubscribed: (track: RemoteTrack, publication: RemoteTrackPublication, participant: RemoteParticipant) => void;
  handleParticipantDisconnected: (participant: RemoteParticipant) => void;
  onDataReceived?: (payload: Uint8Array, participant?: RemoteParticipant, kind?: DataPacket_Kind, topic?: string) => void;
}

const LIVEKIT_ROOM_NAME = 'ai-mental-health-chat';

export function useLiveKitConnectionManager({
  initialContext,
  activeSessionId,
  userProfile,
  onConnected,
  onDisconnected,
  onConnectionError,
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
  
  const liveKitUrlRef = useRef(process.env.NEXT_PUBLIC_LIVEKIT_URL || '');

  const sessionRef = useRef(session);
  const userProfileRef = useRef(userProfile);
  const initialContextRef = useRef(initialContext);
  const activeSessionIdRef = useRef(activeSessionId);

  useEffect(() => {
    sessionRef.current = session;
    userProfileRef.current = userProfile;
    initialContextRef.current = initialContext;
    activeSessionIdRef.current = activeSessionId;
  }, [session, userProfile, initialContext, activeSessionId]);

  const currentRoomRef = useRef<Room | null>(null);
  useEffect(() => {
    currentRoomRef.current = room;
  }, [room]);

  const onConnectedRef = useRef(onConnected);
  const onDisconnectedRef = useRef(onDisconnected);
  const onConnectionErrorRef = useRef(onConnectionError);
  const handleTrackSubscribedRef = useRef(handleTrackSubscribed);
  const handleTrackUnsubscribedRef = useRef(handleTrackUnsubscribed);
  const handleParticipantDisconnectedRef = useRef(handleParticipantDisconnected);
  const onDataReceivedRef = useRef(onDataReceived);

  useEffect(() => {
    onConnectedRef.current = onConnected;
    onDisconnectedRef.current = onDisconnected;
    onConnectionErrorRef.current = onConnectionError;
    handleTrackSubscribedRef.current = handleTrackSubscribed;
    handleTrackUnsubscribedRef.current = handleTrackUnsubscribed;
    handleParticipantDisconnectedRef.current = handleParticipantDisconnected;
    onDataReceivedRef.current = onDataReceived;
  }, [onConnected, onDisconnected, onConnectionError, handleTrackSubscribed, handleTrackUnsubscribed, handleParticipantDisconnected, onDataReceived]);

  const getLiveKitToken = useCallback(async (participantIdentity: string, signal: AbortSignal) => {
    clearError();
    console.log('[LKCM] getLiveKitToken: Solicitando token...');
    try {
      const queryParams = new URLSearchParams({
        room: LIVEKIT_ROOM_NAME,
        participant: participantIdentity,
      });

      if (sessionRef.current?.user?.id) queryParams.append('userId', sessionRef.current.user.id);
      if (initialContextRef.current) queryParams.append('latestSummary', initialContextRef.current);
      if (activeSessionIdRef.current) queryParams.append('chatSessionId', activeSessionIdRef.current);

      const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL;
      if (!apiBase) {
        console.error('[LKCM] getLiveKitToken: NEXT_PUBLIC_API_BASE_URL no está configurado.');
        setAppError('livekit', 'La URL base de la API no está configurada.');
        return null;
      }
      
      const response = await fetch(`${apiBase}/api/livekit-token?${queryParams.toString()}`, {
        method: 'GET',
        signal,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: `Error del servidor al obtener token: ${response.status}` }));
        const errorMessage = errorData.error || errorData.message || `Error ${response.status} al obtener token.`;
        console.error('[LKCM] getLiveKitToken: Error en respuesta del servidor:', errorMessage, errorData);
        setAppError('api', errorMessage);
        return null;
      }
      const data = await response.json();
      if (!data.token) {
        console.error('[LKCM] getLiveKitToken: Token no recibido del servidor.');
        setAppError('api', "Token no recibido del servidor en la respuesta JSON.");
        return null;
      }
      console.log('[LKCM] getLiveKitToken: Token obtenido exitosamente.');
      return data.token as string;
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        console.log('[LKCM] getLiveKitToken: Solicitud de token abortada.');
        return null;
      }
      console.error("[LKCM] getLiveKitToken: Excepción al obtener token:", error);
      setAppError('api', error instanceof Error ? error.message : 'Error desconocido al obtener token.');
      return null;
    }
  }, [session?.user?.id, initialContext, activeSessionId, clearError, setAppError]);

  const disconnectFromLiveKit = useCallback(async () => {
    console.log('[LKCM] disconnectFromLiveKit: Intentando desconectar...');
    if (currentRoomRef.current) {
      try {
        await currentRoomRef.current.disconnect();
        console.log('[LKCM] disconnectFromLiveKit: Desconexión de la sala completada.');
      } catch (error) {
        console.error('[LKCM] disconnectFromLiveKit: Error al desconectar de la sala:', error);
        // Opcionalmente, manejar el error de desconexión aquí
      }
    }
    // Asegurarse de que estos estados se actualicen solo después de la desconexión
    setRoom(null); 
    setConnectionState(LiveKitConnectionState.Disconnected);
    setIsConnecting(false); 
  }, []); // No hay dependencias ya que currentRoomRef es un ref y las funciones de estado no cambian

  useEffect(() => {
    const abortController = new AbortController();
    const { signal } = abortController;

    const connectToRoom = async () => {
      if (isConnecting || currentRoomRef.current) {
        console.log('[LKCM] connectToRoom: Ya está conectando o conectado. Saltando.');
        return;
      }
      
      setIsConnecting(true);
      setConnectionState(LiveKitConnectionState.Connecting);
      console.log('[LKCM] connectToRoom: Iniciando conexión...');

      if (!sessionRef.current?.user?.id) {
        console.error('[LKCM] connectToRoom: ID de usuario no disponible en sesión.');
        setIsConnecting(false);
        setConnectionState(LiveKitConnectionState.Disconnected);
        if (!signal.aborted) {
          setAppError('livekit', 'ID de usuario no disponible para conectar.');
        }
        return;
      }

      const participantName = userProfileRef.current?.username || sessionRef.current.user.name || 'Usuario';
      const participantIdentity = `${participantName}_${sessionRef.current.user.id.substring(0, 8)}`;
      
      console.log(`[LKCM] connectToRoom: Identidad del participante: ${participantIdentity}`);

      const token = await getLiveKitToken(participantIdentity, signal);

      if (signal.aborted) {
        console.log('[LKCM] connectToRoom: Operación abortada (getLiveKitToken o antes).');
        // setIsConnecting(false); // No es necesario si la limpieza del efecto principal lo maneja
        // setConnectionState(LiveKitConnectionState.Disconnected);
        return;
      }

      if (!token) {
        console.error('[LKCM] connectToRoom: No se pudo obtener el token. No se puede conectar.');
        setIsConnecting(false);
        setConnectionState(LiveKitConnectionState.Disconnected);
        // setAppError ya se llamaría dentro de getLiveKitToken
        return;
      }

      console.log('[LKCM] connectToRoom: Token obtenido, intentando conectar a la sala de LiveKit...');
      
      const roomOptions: RoomOptions = {
        // Opciones de sala si son necesarias
        // Ejemplo: enableDynacast: true, adaptiveStream: true
      };
      const newRoomInstance = new Room(roomOptions);

      newRoomInstance
        .on(RoomEvent.ConnectionStateChanged, (state: LiveKitConnectionState) => {
          if (signal.aborted && state !== LiveKitConnectionState.Disconnected) {
            console.log('[LKCM] RoomEvent.ConnectionStateChanged: Abortado, ignorando cambio de estado a menos que sea Disconnected', state);
            return;
          }
          console.log('[LKCM] RoomEvent.ConnectionStateChanged:', state);
          setConnectionState(state); // Actualiza el estado de conexión general
          if (state === LiveKitConnectionState.Connected) {
            console.log('[LKCM] Conectado exitosamente a la sala:', newRoomInstance.name);
            currentRoomRef.current = newRoomInstance; // Actualiza el ref primero
            setRoom(newRoomInstance); // Luego el estado
            setIsConnecting(false);
            if (onConnectedRef.current) onConnectedRef.current(newRoomInstance);
          } else if (state === LiveKitConnectionState.Disconnected) {
            console.log('[LKCM] Desconectado de la sala (evento ConnectionStateChanged).');
            currentRoomRef.current = null;
            setRoom(null);
            setIsConnecting(false); // Asegurarse de resetear isConnecting
            if (onDisconnectedRef.current) onDisconnectedRef.current();
          }
        })
        .on(RoomEvent.TrackSubscribed, (track, publication, participant) => {
          if (signal.aborted) return;
          console.log('[LKCM] RoomEvent.TrackSubscribed:', track.source, 'por', participant.identity);
          if (handleTrackSubscribedRef.current) handleTrackSubscribedRef.current(track, publication, participant);
        })
        .on(RoomEvent.TrackUnsubscribed, (track, publication, participant) => {
          if (signal.aborted) return;
          console.log('[LKCM] RoomEvent.TrackUnsubscribed:', track.source, 'por', participant.identity);
          if (handleTrackUnsubscribedRef.current) handleTrackUnsubscribedRef.current(track, publication, participant);
        })
        .on(RoomEvent.ParticipantDisconnected, (participant) => {
          if (signal.aborted) return;
          console.log('[LKCM] RoomEvent.ParticipantDisconnected:', participant.identity);
          if (handleParticipantDisconnectedRef.current) handleParticipantDisconnectedRef.current(participant);
        })
        .on(RoomEvent.DataReceived, (payload, participant, kind, topic) => {
          if (signal.aborted) return;
          console.log('[LKCM] RoomEvent.DataReceived del participante:', participant?.identity, 'topic:', topic);
          if (onDataReceivedRef.current) onDataReceivedRef.current(payload, participant, kind, topic);
        })
        .on(RoomEvent.SignalConnected, () => {
            if (signal.aborted) return;
            console.log('[LKCM] RoomEvent.SignalConnected: Conexión de señal establecida.');
        })
        .on(RoomEvent.Disconnected, (reason) => {
            // Este evento puede ser redundante si ConnectionStateChanged ya maneja Disconnected
            // Pero es bueno tenerlo por si acaso y para logging específico de la razón.
            console.log('[LKCM] RoomEvent.Disconnected - Razón:', reason);
            if (!signal.aborted) {
              currentRoomRef.current = null;
              setRoom(null);
              setIsConnecting(false);
              setConnectionState(LiveKitConnectionState.Disconnected);
              if (onDisconnectedRef.current) onDisconnectedRef.current();
            }
        })
        .on(RoomEvent.Reconnecting, () => {
            if (signal.aborted) return;
            console.log('[LKCM] RoomEvent.Reconnecting: Intentando reconectar...');
            setConnectionState(LiveKitConnectionState.Reconnecting);
        })
        .on(RoomEvent.Reconnected, () => {
            if (signal.aborted) return;
            console.log('[LKCM] RoomEvent.Reconnected: Reconectado exitosamente.');
            setConnectionState(LiveKitConnectionState.Connected);
            // No es necesario llamar a setRoom aquí si la instancia de la sala no cambió.
            // Y onConnectedRef.current ya se habría llamado la primera vez.
        });

      try {
        console.log('[LKCM] connectToRoom: Conectando con URL:', liveKitUrlRef.current, 'y token.');
        await newRoomInstance.connect(liveKitUrlRef.current, token, { autoSubscribe: true });
        console.log('[LKCM] connectToRoom: newRoomInstance.connect() PROMESA RESUELTA.');
        // El estado 'Connected' se maneja en el evento ConnectionStateChanged
      } catch (error) {
        if (signal.aborted) {
          console.log('[LKCM] connectToRoom: Conexión abortada durante el intento de conexión.');
          // La limpieza se encargará de los estados
          return;
        }
        console.error('[LKCM] connectToRoom: Error al conectar a la sala de LiveKit:', error);
        if (onConnectionErrorRef.current) {
            onConnectionErrorRef.current(error instanceof Error ? error : new Error('Error desconocido al conectar'));
        }
        // Asegurar la limpieza del estado si la conexión falla
        currentRoomRef.current = null;
        setRoom(null);
        setIsConnecting(false);
        setConnectionState(LiveKitConnectionState.Disconnected);
        setAppError('livekit', error instanceof Error ? error.message : 'Fallo al conectar con LiveKit.');
      }
    };

    // Lógica principal del efecto
    if (!liveKitUrlRef.current) {
        console.error("[LKCM] FATAL: NEXT_PUBLIC_LIVEKIT_URL no está configurado. La conexión no es posible.");
        if (!signal.aborted) {
          setAppError('livekit', 'NEXT_PUBLIC_LIVEKIT_URL no está configurado.');
        }
        return;
    } else {
        // console.log('[LKCM] LiveKit URL configurada:', liveKitUrlRef.current); // Log menos verboso
    }

    if (authStatus === 'authenticated' && sessionRef.current?.user?.id) {
      if (!currentRoomRef.current && !isConnecting && connectionState === LiveKitConnectionState.Disconnected) {
        console.log('[LKCM] Efecto principal: Autenticado, sin sala, no conectando y desconectado. Intentando conectar...');
        connectToRoom();
      } else if (currentRoomRef.current && connectionState !== LiveKitConnectionState.Connected && !isConnecting) {
        // Esto podría ser una condición donde estamos desconectados inesperadamente pero aún tenemos una referencia a la sala.
        // O un estado inconsistente.
        console.warn('[LKCM] Efecto principal: Sala existe pero no está conectada y no está conectando. Estado:', connectionState);
        // Considerar una acción aquí, como intentar reconectar o limpiar.
        // Por ahora, solo lo logueamos para observar.
      }
    } else if (authStatus !== 'authenticated' && currentRoomRef.current) {
      console.log('[LKCM] Efecto principal: No autenticado pero hay una sala. Desconectando...');
      disconnectFromLiveKit();
    } else if (authStatus === 'loading') {
      console.log('[LKCM] Efecto principal: Sesión cargando, esperando...');
    }

    return () => {
      console.log('[LKCM] Efecto principal: Limpieza.');
      abortController.abort(); // Aborta cualquier fetch o proceso en curso
      setIsConnecting(false); // Asegurar que isConnecting se resetee en la limpieza
      if (currentRoomRef.current) {
        console.log('[LKCM] Efecto principal: Limpieza - Desconectando de la sala existente.');
        // Llamar a disconnect directamente en la instancia de la sala sin esperar
        // ya que el componente podría desmontarse.
        currentRoomRef.current.disconnect();
        currentRoomRef.current = null; 
        setRoom(null);
        setConnectionState(LiveKitConnectionState.Disconnected);
      }
    };
  // Reducir las dependencias para evitar bucles. 
  // Las dependencias que cambian muy a menudo (session, userProfile, etc.) se manejan con refs.
  // authStatus es importante para reaccionar a cambios de login/logout.
  // connectionState e isConnecting son importantes para la lógica de control de conexión/desconexión.
  // room se usa indirectamente a través de currentRoomRef para la condición de si ya hay una sala.
  }, [authStatus, session?.user?.id]); 

  return { room, connectionState, disconnectFromLiveKit };
} 