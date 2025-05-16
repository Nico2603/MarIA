'use client';

import { useState, useEffect, useCallback, useRef, Dispatch, SetStateAction } from 'react';
import { Room, RoomEvent, ConnectionState as LiveKitConnectionState, RemoteParticipant, RemoteTrack, RemoteTrackPublication, Participant, Track } from 'livekit-client';
import { useSession } from 'next-auth/react';
import { useError } from '@/contexts/ErrorContext';
import { useLiveKitRoom } from '@/hooks/useLiveKitRoom'; // Asumiendo que este es el hook base

export interface UseLiveKitConnectionManagerResult {
  room: Room | null;
  liveKitToken: string | null;
  connectionState: LiveKitConnectionState;
  connectToLiveKit: () => Promise<void>; // Asumiendo tipo, puede necesitar ajuste si useLiveKitRoom lo define diferente
  disconnectFromLiveKit: () => Promise<void>; // Asumiendo tipo
  setLiveKitToken: Dispatch<SetStateAction<string | null>>;
  setConnectionState: Dispatch<SetStateAction<LiveKitConnectionState>>;
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
  onDataReceived?: (...args: any[]) => void;
}

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
  const [liveKitToken, setLiveKitToken] = useState<string | null>(null);
  const [connectionState, setConnectionState] = useState<LiveKitConnectionState>(LiveKitConnectionState.Disconnected);
  const roomRef = useRef<Room | null>(null);

  const getLiveKitToken = useCallback(async (participantIdentity: string, signal: AbortSignal) => {
    clearError();
    try {
      const roomName = 'ai-mental-health-chat';
      const queryParams = new URLSearchParams({
        room: roomName,
        participant: participantIdentity,
      });

      if (session?.user?.id) queryParams.append('userId', session.user.id);
      if (initialContext) queryParams.append('latestSummary', initialContext);
      if (activeSessionId) queryParams.append('chatSessionId', activeSessionId);

      const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL;
      const response = await fetch(`${apiBase}/api/livekit-token?${queryParams.toString()}`, {
        method: 'GET',
        signal,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.error || `Error del servidor al obtener token: ${response.statusText}`;
        setAppError('livekit', errorMessage);
        return null;
      }
      const data = await response.json();
      if (!data.token) {
        setAppError('livekit', "Token no recibido del servidor.");
        return null;
      }
      return data.token;
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        return null;
      }
      console.error("[LKCM] Error fetching LiveKit token:", error);
      setAppError('livekit', error instanceof Error ? error.message : 'Error desconocido al obtener token.');
      return null;
    }
  }, [session?.user?.id, initialContext, activeSessionId, clearError, setAppError]);

  useEffect(() => {
    if (authStatus !== 'authenticated' || !session?.user?.id || liveKitToken) {
      if (authStatus !== 'authenticated' && liveKitToken) {
        console.log('[LKCM] No autenticado o token ya existe, limpiando token de LiveKit si existe y no auth.');
        setLiveKitToken(null);
      }
      return;
    }
    
    if (connectionState !== LiveKitConnectionState.Disconnected) {
      return;
    }

    const controller = new AbortController();
    const { signal } = controller;

    console.log('[LKCM] Efecto de conexión: Intentando inicializar conexión LiveKit...');

    const participantDisplayName = session.user.name || 'Usuario';
    const participantIdentifier = `${participantDisplayName}_${session.user.id.substring(0, 8)}`;

    console.log(`[LKCM] Obteniendo token para la identidad: ${participantIdentifier}`);

    getLiveKitToken(participantIdentifier, signal)
      .then(token => {
        if (token && !signal.aborted) {
          console.log('[LKCM] Token obtenido. Estableciendo token para useLiveKitRoom.');
          setLiveKitToken(token);
        } else if (signal.aborted) {
          console.log('[LKCM] Obtención de token abortada (después de la llamada).');
        } else {
          console.log('[LKCM] No se obtuvo token (respuesta nula o vacía de getLiveKitToken).');
        }
      })
      .catch(error => {
        if (!(error instanceof Error && error.name === 'AbortError')) {
          console.error('[LKCM] Error en la cadena de promesa de getLiveKitToken (catch del efecto):', error);
        }
      });

    return () => {
      console.log('[LKCM] Efecto de conexión: Limpieza - Abortando operaciones pendientes.');
      controller.abort();
    };
  }, [
    authStatus, 
    session?.user?.id, 
    getLiveKitToken, 
    liveKitToken, 
    connectionState
  ]);

  const { room, connect, disconnect } = useLiveKitRoom({
    token: liveKitToken, 
    liveKitUrl: process.env.NEXT_PUBLIC_LIVEKIT_URL || '',
    onConnected: (connectedRoom) => {
      console.log("[LKCM] Conectado a LiveKit exitosamente.");
      roomRef.current = connectedRoom;
      setConnectionState(LiveKitConnectionState.Connected);
      if (onConnected) onConnected(connectedRoom);
    },
    onDisconnected: () => {
      console.log("[LKCM] Desconectado de LiveKit.");
      roomRef.current = null;
      setLiveKitToken(null);
      setConnectionState(LiveKitConnectionState.Disconnected);
      if (onDisconnected) onDisconnected();
    },
    onConnectionError: (err: Error) => {
      console.error("[LKCM] Error de conexión de LiveKit Room:", err);
      setAppError('livekit', `Error de LiveKit Room: ${err.message}`);
      setLiveKitToken(null);
      setConnectionState(LiveKitConnectionState.Disconnected); 
      if (onConnectionError) onConnectionError(err);
    },
    onDataReceived,
  });

  useEffect(() => {
    if (room !== roomRef.current) {
      roomRef.current = room;
    }
  }, [room]);

  useEffect(() => {
    const currentRoom = roomRef.current;
    if (!currentRoom || connectionState !== LiveKitConnectionState.Connected) {
      return;
    }
    console.log("[LKCM] Adjuntando listeners de track/participante a la room:", currentRoom.name);

    const typedHandleTrackSubscribed = (
        track: RemoteTrack, 
        publication: RemoteTrackPublication, 
        participant: RemoteParticipant
    ) => handleTrackSubscribed(track, publication, participant);

    const typedHandleTrackUnsubscribed = (
        track: RemoteTrack, 
        publication: RemoteTrackPublication, 
        participant: RemoteParticipant
    ) => handleTrackUnsubscribed(track, publication, participant);

    const typedHandleParticipantDisconnected = (
        participant: RemoteParticipant
    ) => handleParticipantDisconnected(participant);

    currentRoom
      .on(RoomEvent.TrackSubscribed, typedHandleTrackSubscribed)
      .on(RoomEvent.TrackUnsubscribed, typedHandleTrackUnsubscribed)
      .on(RoomEvent.ParticipantDisconnected, typedHandleParticipantDisconnected);

    return () => {
      if (currentRoom) {
        console.log("[LKCM] Limpiando listeners de track/participante de la room:", currentRoom.name);
        currentRoom
          .off(RoomEvent.TrackSubscribed, typedHandleTrackSubscribed)
          .off(RoomEvent.TrackUnsubscribed, typedHandleTrackUnsubscribed)
          .off(RoomEvent.ParticipantDisconnected, typedHandleParticipantDisconnected);
      }
    };
  }, [roomRef.current, connectionState, handleTrackSubscribed, handleTrackUnsubscribed, handleParticipantDisconnected]);

  return { 
    room: roomRef.current, 
    liveKitToken, 
    connectionState, 
    connectToLiveKit: connect, 
    disconnectFromLiveKit: disconnect, 
    setLiveKitToken, 
    setConnectionState 
  };
} 