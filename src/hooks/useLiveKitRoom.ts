import { useState, useEffect, useRef } from 'react';
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
  const [currentConnectionState, setCurrentConnectionState] = useState<LiveKitConnectionState>(
    LiveKitConnectionState.Disconnected
  );

  useEffect(() => {
    let didCancel = false; // Para manejar limpieza en efectos asíncronos

    if (!token) {
      if (roomRef.current && roomRef.current.state !== LiveKitConnectionState.Disconnected) {
        console.log('[useLiveKitRoom] Token es null, desconectando sala existente...');
        roomRef.current.disconnect(true).then(() => {
          if (!didCancel) {
             setCurrentConnectionState(LiveKitConnectionState.Disconnected);
          }
        });
      }
      // Asegurarse que roomRef se limpia si no hay token
      // roomRef.current = null; // Esto se hace en el .on(RoomEvent.Disconnected) o en el cleanup
      return;
    }

    // Si ya existe una sala y está conectada o conectando, y el token no ha cambiado esencialmente
    // (esto es difícil de determinar solo con el token string si la sala/identidad subyacente es la misma)
    // Por ahora, si hay un token, y no hay sala, o la sala está desconectada, intentamos conectar.
    // Si hay una sala conectada y llega un nuevo token, el efecto se re-ejecutará,
    // la limpieza desconectará la sala anterior, y se conectará una nueva.

    console.log('[useLiveKitRoom] useEffect activado con token.');
    
    const newRoom = new Room({
      adaptiveStream: true,
      dynacast: true,
      publishDefaults: audioPublishDefaults,
    });

    setCurrentConnectionState(LiveKitConnectionState.Connecting);
    // console.log('[useLiveKitRoom] Estado interno: Connecting');

    newRoom
      .on(RoomEvent.Connected, () => {
        if (didCancel) return;
        console.log('[useLiveKitRoom] Conectado a la sala LiveKit.');
        roomRef.current = newRoom;
        setCurrentConnectionState(LiveKitConnectionState.Connected);
        if (onConnected) {
          onConnected(newRoom);
        }
      })
      .on(RoomEvent.Disconnected, (reason: DisconnectReason | undefined) => {
        if (didCancel && roomRef.current !== newRoom) {
            // Si didCancel es true, y esta no es la sala que este efecto creó (ej. una sala antigua siendo desconectada por cleanup)
            // no deberíamos tocar el estado de la sala actual o llamar a onDisconnected del padre para esta sala antigua.
            console.log('[useLiveKitRoom] Evento Disconnected de sala anterior ignorado en cleanup.');
            return;
        }
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
        if (didCancel) return;
        if (onTrackSubscribed) onTrackSubscribed(track, pub, p, newRoom);
      })
      .on(RoomEvent.TrackUnsubscribed, (track, pub, p) => {
        if (didCancel) return;
        if (onTrackUnsubscribed) onTrackUnsubscribed(track, pub, p, newRoom);
      })
      .on(RoomEvent.ParticipantDisconnected, (p) => {
        if (didCancel) return;
        if (onParticipantDisconnected) onParticipantDisconnected(p, newRoom);
      })
      .on(RoomEvent.DataReceived, (payload, p, kind, topic) => {
        if (didCancel) return;
        if (onDataReceived) onDataReceived(payload, p, kind, topic, newRoom);
      });

    newRoom
      .connect(liveKitUrl, token)
      .then(() => {
        if (didCancel) {
            // Si se canceló mientras se conectaba, desconectar esta nueva sala
            console.log('[useLiveKitRoom] Conexión exitosa pero didCancel es true, desconectando nueva sala.');
            newRoom.disconnect(true);
            return;
        }
        // El evento 'Connected' ya maneja el estado y el callback onConnected
        // roomRef.current = newRoom; // Se establece en RoomEvent.Connected
        console.log('[useLiveKitRoom] room.connect() promesa resuelta.');
      })
      .catch((error: Error) => {
        if (didCancel) {
            console.log('[useLiveKitRoom] Error de conexión pero didCancel es true, ignorando.');
            return;
        }
        console.error('[useLiveKitRoom] Error al conectar con LiveKit:', error);
        setCurrentConnectionState(LiveKitConnectionState.Disconnected);
        if (roomRef.current === newRoom) { // Solo limpiar ref si es la sala actual que falló
             roomRef.current = null;
        }
        if (onConnectionError) {
          onConnectionError(error);
        }
      });

    return () => {
      didCancel = true;
      console.log('[useLiveKitRoom] Cleanup: Desconectando sala...');
      // Desconectar la sala que este efecto específico creó y está gestionando.
      // No usar roomRef.current directamente aquí si roomRef.current pudo haber sido
      // sobreescrito por una ejecución posterior del efecto antes de que esta limpieza se ejecute.
      newRoom.disconnect(true);
      if (roomRef.current === newRoom) { // Solo limpiar la ref si sigue siendo la sala de este efecto.
        roomRef.current = null;
      }
    };
  // Las dependencias deben incluir todos los props que, si cambian, requieren re-conectar
  // o re-adjuntar manejadores.
  }, [
    token, 
    liveKitUrl, 
    audioPublishDefaults, // Si esto puede cambiar y requiere recrear la sala
    onConnected, 
    onDisconnected, 
    onTrackSubscribed, 
    onTrackUnsubscribed,
    onParticipantDisconnected,
    onDataReceived,
    onConnectionError
  ]);

  return { room: roomRef.current, connectionState: currentConnectionState };
}; 