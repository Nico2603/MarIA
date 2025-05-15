import { useState, useEffect, useRef, useCallback } from 'react';
import {
  Room,
  RoomEvent,
  RemoteParticipant,
  RemoteTrackPublication,
  RemoteTrack,
  ConnectionState as LiveKitConnectionState,
  ConnectionError,
  DataPacket_Kind,
  Track,
} from 'livekit-client';
import type { DisconnectReason } from '@livekit/protocol';

interface UseLiveKitRoomProps {
  liveKitUrl: string;
  token: string | null;
  audioPublishDefaults?: {
    audioPreset: { maxBitrate: number };
    dtx: boolean;
  };
  onConnected?: (room: Room) => void;
  onDisconnected?: (reason?: DisconnectReason | undefined) => void;
  onTrackSubscribed?: (
    track: RemoteTrack,
    publication: RemoteTrackPublication,
    participant: RemoteParticipant,
    room: Room
  ) => void;
  onTrackUnsubscribed?: (
    track: RemoteTrack,
    publication: RemoteTrackPublication,
    participant: RemoteParticipant,
    room: Room
  ) => void;
  onParticipantDisconnected?: (participant: RemoteParticipant, room: Room) => void;
  onDataReceived?: (
    payload: Uint8Array,
    participant?: RemoteParticipant,
    kind?: DataPacket_Kind,
    topic?: string,
    room?: Room
  ) => void;
  onConnectionError?: (error: Error) => void;
}

interface UseLiveKitRoomReturn {
  room: Room | null;
  connectionState: LiveKitConnectionState;
  connect: () => Promise<void>;
  disconnect: () => Promise<void>;
}

export const useLiveKitRoom = ({
  liveKitUrl,
  token,
  audioPublishDefaults = { // Valores por defecto como en VoiceChatContainer
    audioPreset: { maxBitrate: 32_000 },
    dtx: true,
  },
  onConnected,
  onDisconnected,
  onTrackSubscribed,
  onTrackUnsubscribed,
  onParticipantDisconnected,
  onDataReceived,
  onConnectionError,
}: UseLiveKitRoomProps): UseLiveKitRoomReturn => {
  const roomRef = useRef<Room | null>(null);
  const newRoomRef = useRef<Room | null>(null);
  const [currentConnectionState, setCurrentConnectionState] = useState<LiveKitConnectionState>(
    LiveKitConnectionState.Disconnected
  );

  // Esta función configura una nueva sala con todos los event listeners
  const setupNewRoom = useCallback(() => {
    if (!token || !liveKitUrl) return null;

    const newRoom = new Room({
      adaptiveStream: true,
      dynacast: true,
      publishDefaults: audioPublishDefaults,
    });

    newRoom
      .on(RoomEvent.Connected, () => {
        console.log('[useLiveKitRoom] Conectado a la sala LiveKit.');
        roomRef.current = newRoom;
        setCurrentConnectionState(LiveKitConnectionState.Connected);
        if (onConnected) {
          onConnected(newRoom);
        }
      })
      .on(RoomEvent.Disconnected, (reason: DisconnectReason | undefined) => {
        console.log('[useLiveKitRoom] Desconectado de la sala LiveKit:', reason);
        if (roomRef.current === newRoom) { // Solo limpiar ref si es la sala actual
            roomRef.current = null;
        }
        setCurrentConnectionState(LiveKitConnectionState.Disconnected);
        if (onDisconnected) {
          onDisconnected(reason);
        }
      })
      .on(RoomEvent.TrackSubscribed, (track, pub, p) => {
        if (onTrackSubscribed) onTrackSubscribed(track, pub, p, newRoom);
      })
      .on(RoomEvent.TrackUnsubscribed, (track, pub, p) => {
        if (onTrackUnsubscribed) onTrackUnsubscribed(track, pub, p, newRoom);
      })
      .on(RoomEvent.ParticipantDisconnected, (p) => {
        if (onParticipantDisconnected) onParticipantDisconnected(p, newRoom);
      })
      .on(RoomEvent.DataReceived, (payload, p, kind, topic) => {
        if (onDataReceived) onDataReceived(payload, p, kind, topic, newRoom);
      });

    return newRoom;
  }, [token, liveKitUrl, audioPublishDefaults, onConnected, onDisconnected, onTrackSubscribed, onTrackUnsubscribed, onParticipantDisconnected, onDataReceived]);

  // Conectar explícitamente a la sala
  const connect = useCallback(async () => {
    if (!token || !liveKitUrl) {
      console.warn('[useLiveKitRoom] Intento de conectar sin token o URL.');
      return;
    }

    if (roomRef.current && roomRef.current.state === LiveKitConnectionState.Connected) {
      console.log('[useLiveKitRoom] Ya conectado, ignorando solicitud de conexión.');
      return;
    }

    setCurrentConnectionState(LiveKitConnectionState.Connecting);
    
    try {
      // Crear una nueva sala si no existe o está desconectada
      if (!newRoomRef.current) {
        newRoomRef.current = setupNewRoom();
      }
      
      if (!newRoomRef.current) {
        throw new Error('No se pudo crear la sala de LiveKit');
      }
      
      await newRoomRef.current.connect(liveKitUrl, token);
      console.log('[useLiveKitRoom] Conexión manual exitosa a LiveKit.');
      // El evento Connected actualizará roomRef.current
    } catch (error) {
      console.error('[useLiveKitRoom] Error en conexión manual a LiveKit:', error);
      setCurrentConnectionState(LiveKitConnectionState.Disconnected);
      if (onConnectionError && error instanceof Error) {
        onConnectionError(error);
      }
      // Limpiar referencias si hay error
      if (newRoomRef.current && roomRef.current !== newRoomRef.current) {
        newRoomRef.current = null;
      }
    }
  }, [token, liveKitUrl, setupNewRoom, onConnectionError]);

  // Desconectar explícitamente de la sala
  const disconnect = useCallback(async () => {
    if (roomRef.current) {
      console.log('[useLiveKitRoom] Desconectando manualmente de LiveKit...');
      await roomRef.current.disconnect(true);
      // El evento Disconnected limpiará roomRef.current
    } else {
      console.log('[useLiveKitRoom] No hay sala activa para desconectar.');
    }
  }, []);

  // Limpieza al desmontar
  useEffect(() => {
    return () => {
      if (roomRef.current) {
        console.log('[useLiveKitRoom] Limpieza al desmontar: desconectando sala...');
        roomRef.current.disconnect(true);
        roomRef.current = null;
      }
      if (newRoomRef.current) {
        newRoomRef.current = null;
      }
    };
  }, []);

  return { 
    room: roomRef.current, 
    connectionState: currentConnectionState,
    connect,
    disconnect 
  };
}; 