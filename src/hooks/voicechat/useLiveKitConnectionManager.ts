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
  userProfile: { username?: string | null } | null;
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

  const getLiveKitToken = useCallback(async (participantName: string, signal: AbortSignal) => {
    clearError();
    try {
      const roomName = 'ai-mental-health-chat';
      const queryParams = new URLSearchParams({
        room: roomName,
        participant: participantName,
      });

      if (session?.user?.id) queryParams.append('userId', session.user.id);
      const currentUsername = userProfile?.username || session?.user?.name || 'Usuario Invitado';
      queryParams.append('username', currentUsername);
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
        setConnectionState(LiveKitConnectionState.Disconnected);
        return null;
      }
      const data = await response.json();
      if (!data.token) {
        setAppError('livekit', "Token no recibido del servidor.");
        return null;
      }
      setLiveKitToken(data.token);
      return data.token;
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        console.log("Solicitud de token de LiveKit cancelada.");
        return null;
      }
      console.error("Error fetching LiveKit token:", error);
      setConnectionState(LiveKitConnectionState.Disconnected);
      setAppError('livekit', error instanceof Error ? error.message : 'Error desconocido al obtener token.');
      return null;
    }
  }, [session?.user?.id, userProfile?.username, session?.user?.name, initialContext, activeSessionId, clearError, setAppError]);

  const { room, connect: connectToLiveKit, disconnect: disconnectFromLiveKit } = useLiveKitRoom({
    token: liveKitToken,
    liveKitUrl: process.env.NEXT_PUBLIC_LIVEKIT_URL || '',
    onConnected: (connectedRoom) => {
      console.log("Conectado a LiveKit exitosamente (desde hook manager).");
      roomRef.current = connectedRoom;
      setConnectionState(LiveKitConnectionState.Connected);
      setAppError('livekit', null);
      if (onConnected) onConnected(connectedRoom);
    },
    onDisconnected: () => {
      console.log("Desconectado de LiveKit (desde hook manager).");
      roomRef.current = null;
      setConnectionState(LiveKitConnectionState.Disconnected);
      if (onDisconnected) onDisconnected();
    },
    onConnectionError: (err: Error) => {
      console.error("Error de LiveKit Room (desde hook manager):", err);
      setAppError('livekit', `Error de LiveKit: ${err.message}`);
      setConnectionState(LiveKitConnectionState.Disconnected);
      if (onConnectionError) onConnectionError(err);
    },
    onDataReceived,
  });

  useEffect(() => {
    roomRef.current = room;
  }, [room]);

  useEffect(() => {
    const currentRoom = roomRef.current;
    if (!currentRoom) {
      console.log("useLiveKitConnectionManager: No hay room para adjuntar listeners de track/participante.");
      return;
    }
    console.log("useLiveKitConnectionManager: Adjuntando listeners de track/participante a la room:", currentRoom.name);

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
        console.log("useLiveKitConnectionManager: Limpiando listeners de track/participante de la room:", currentRoom.name);
        currentRoom
          .off(RoomEvent.TrackSubscribed, typedHandleTrackSubscribed)
          .off(RoomEvent.TrackUnsubscribed, typedHandleTrackUnsubscribed)
          .off(RoomEvent.ParticipantDisconnected, typedHandleParticipantDisconnected);
      }
    };
  }, [roomRef.current, handleTrackSubscribed, handleTrackUnsubscribed, handleParticipantDisconnected]);

  useEffect(() => {
    if (
      authStatus !== "authenticated" ||
      !session?.user?.id ||
      connectionState !== LiveKitConnectionState.Disconnected ||
      liveKitToken
    ) {
      return;
    }

    const controller = new AbortController();
    const { signal } = controller;

    (async () => {
      if (authStatus !== "authenticated" || !session || !session.user || !session.user.id) {
        return;
      }
      const currentUser = session.user;
      try {
        console.log("LiveKit Connection Manager: Intentando inicializar conexión...");
        const userName = currentUser.name || "Usuario";
        const identity = `${userName}_${currentUser.id.slice(0, 8)}`;
        
        console.log(`LiveKit Connection Manager: Obteniendo token para la identidad: ${identity}`);
        const token = await getLiveKitToken(identity, signal);

        if (token && !signal.aborted) {
          console.log("LiveKit Connection Manager: Token obtenido. useLiveKitRoom debería conectarse.");
        } else if (signal.aborted) {
          console.log("LiveKit Connection Manager: La obtención del token fue abortada.");
        } else {
          console.log("LiveKit Connection Manager: No se obtuvo token, no se conectará.");
        }
      } catch (e) {
        if (e instanceof Error && e.name === 'AbortError') {
          console.log("LiveKit Connection Manager: Fallo al conectar (AbortError)", e);
        } else {
          console.error("LiveKit Connection Manager: Fallo al conectar:", e);
        }
      }
    })();

    return () => {
      console.log("LiveKit Connection Manager: Limpiando efecto - Abortando controlador.");
      controller.abort();
    };
  }, [
    authStatus,
    session?.user?.id,
    getLiveKitToken,   
    connectionState,
    liveKitToken
  ]);

  return {
    room: roomRef.current,
    liveKitToken,
    connectionState,
    connectToLiveKit,
    disconnectFromLiveKit,
    setLiveKitToken,
    setConnectionState
  };
} 