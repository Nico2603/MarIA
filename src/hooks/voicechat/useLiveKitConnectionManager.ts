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

      if (session?.user?.id) queryParams.append('userId', session.user.id);
      if (initialContext) queryParams.append('latestSummary', initialContext);
      if (activeSessionId) queryParams.append('chatSessionId', activeSessionId);

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
      await currentRoomRef.current.disconnect();
    }
    setRoom(null);
    setConnectionState(LiveKitConnectionState.Disconnected);
    setIsConnecting(false);
  }, []);

  useEffect(() => {
    if (!liveKitUrlRef.current) {
        console.error("[LKCM] FATAL: NEXT_PUBLIC_LIVEKIT_URL no está configurado. La conexión no es posible.");
        setAppError('livekit', 'NEXT_PUBLIC_LIVEKIT_URL no está configurado.');
        return;
    } else {
        console.log('[LKCM] LiveKit URL configurada:', liveKitUrlRef.current);
    }

    if (authStatus !== 'authenticated' || !session?.user?.id || currentRoomRef.current || isConnecting) {
      if (currentRoomRef.current && authStatus !== 'authenticated') {
        console.log('[LKCM] Usuario no autenticado pero hay una sala. Desconectando...');
        disconnectFromLiveKit();
      }
      return;
    }

    const controller = new AbortController();
    const { signal } = controller;

    const connectToRoom = async () => {
      setIsConnecting(true);
      setConnectionState(LiveKitConnectionState.Connecting);
      console.log('[LKCM] connectToRoom: Iniciando conexión...');

      if (!session?.user?.id) {
        console.error('[LKCM] connectToRoom: ID de usuario no disponible en sesión.');
        setIsConnecting(false);
        setConnectionState(LiveKitConnectionState.Disconnected);
        setAppError('livekit', 'ID de usuario no disponible para conectar.');
        return;
      }

      const participantName = userProfile?.username || session.user.name || 'Usuario';
      const participantIdentity = `${participantName}_${session.user.id.substring(0, 8)}`;
      
      console.log(`[LKCM] connectToRoom: Identidad del participante: ${participantIdentity}`);

      const token = await getLiveKitToken(participantIdentity, signal);

      if (signal.aborted) {
        console.log('[LKCM] connectToRoom: Operación abortada antes de conectar.');
        setIsConnecting(false);
        setConnectionState(LiveKitConnectionState.Disconnected);
        return;
      }

      if (!token) {
        console.error('[LKCM] connectToRoom: No se pudo obtener el token. No se puede conectar.');
        setIsConnecting(false);
        setConnectionState(LiveKitConnectionState.Disconnected);
        return;
      }

      console.log('[LKCM] connectToRoom: Token obtenido, intentando conectar a la sala de LiveKit...');
      
      const roomOptions: RoomOptions = {};
      const newRoomInstance = new Room(roomOptions);

      newRoomInstance
        .on(RoomEvent.ConnectionStateChanged, (state: LiveKitConnectionState) => {
          console.log('[LKCM] RoomEvent.ConnectionStateChanged:', state);
          setConnectionState(state);
          if (state === LiveKitConnectionState.Connected) {
            console.log('[LKCM] Conectado exitosamente a la sala:', newRoomInstance.name);
            setRoom(newRoomInstance);
            setIsConnecting(false);
            if (onConnectedRef.current) onConnectedRef.current(newRoomInstance);
          } else if (state === LiveKitConnectionState.Disconnected) {
            console.log('[LKCM] Desconectado de la sala.');
            setRoom(null);
            setIsConnecting(false);
            if (onDisconnectedRef.current) onDisconnectedRef.current();
          }
        })
        .on(RoomEvent.TrackSubscribed, (track, publication, participant) => {
          console.log('[LKCM] RoomEvent.TrackSubscribed:', track.source, 'por', participant.identity);
          if (handleTrackSubscribedRef.current) handleTrackSubscribedRef.current(track, publication, participant);
        })
        .on(RoomEvent.TrackUnsubscribed, (track, publication, participant) => {
          console.log('[LKCM] RoomEvent.TrackUnsubscribed:', track.source, 'por', participant.identity);
          if (handleTrackUnsubscribedRef.current) handleTrackUnsubscribedRef.current(track, publication, participant);
        })
        .on(RoomEvent.ParticipantDisconnected, (participant) => {
          console.log('[LKCM] RoomEvent.ParticipantDisconnected:', participant.identity);
          if (handleParticipantDisconnectedRef.current) handleParticipantDisconnectedRef.current(participant);
        })
        .on(RoomEvent.DataReceived, (payload, participant, kind, topic) => {
          console.log('[LKCM] RoomEvent.DataReceived del participante:', participant?.identity, 'topic:', topic);
          if (onDataReceivedRef.current) onDataReceivedRef.current(payload, participant, kind, topic);
        })
        .on(RoomEvent.SignalConnected, () => {
            console.log('[LKCM] RoomEvent.SignalConnected: Conexión de señal establecida.');
        })
        .on(RoomEvent.Disconnected, (reason) => {
            console.log('[LKCM] RoomEvent.Disconnected - Razón:', reason);
            setRoom(null);
            setIsConnecting(false);
            setConnectionState(LiveKitConnectionState.Disconnected);
            if (onDisconnectedRef.current) onDisconnectedRef.current();
        })
        .on(RoomEvent.Reconnecting, () => {
            console.log('[LKCM] RoomEvent.Reconnecting: Intentando reconectar...');
            setConnectionState(LiveKitConnectionState.Reconnecting);
        })
        .on(RoomEvent.Reconnected, () => {
            console.log('[LKCM] RoomEvent.Reconnected: Reconectado exitosamente.');
            setConnectionState(LiveKitConnectionState.Connected);
            if (!currentRoomRef.current && newRoomInstance.state === LiveKitConnectionState.Connected) { 
                setRoom(newRoomInstance);
             }
        });

      try {
        await newRoomInstance.connect(liveKitUrlRef.current, token, {});
        console.log('[LKCM] connectToRoom: Llamada a room.connect() completada.');
      } catch (error) {
        console.error('[LKCM] connectToRoom: Error al conectar a la sala:', error);
        setIsConnecting(false);
        setConnectionState(LiveKitConnectionState.Disconnected);
        const connectError = error instanceof Error ? error : new Error('Error desconocido al conectar');
        if (onConnectionErrorRef.current) {
          onConnectionErrorRef.current(connectError);
        } else {
          setAppError('livekit', connectError.message);
        }
        await newRoomInstance.disconnect();
        setRoom(null);
      }
    };

    connectToRoom();

    return () => {
      console.log('[LKCM] Efecto principal: Limpieza.');
      controller.abort();
      const roomToDisconnect = currentRoomRef.current;
      if (roomToDisconnect) {
        console.log('[LKCM] Limpieza del efecto: Desconectando de la sala existente.');
        roomToDisconnect.disconnect();
      }
      setIsConnecting(false); 
    };
  }, [
    authStatus, 
    session?.user?.id,
    session?.user?.name,
    userProfile,
    activeSessionId, 
    initialContext,   
    getLiveKitToken,
    isConnecting,
    disconnectFromLiveKit, 
    setAppError 
  ]);

  return { 
    room,
    connectionState, 
    disconnectFromLiveKit,
  };
} 