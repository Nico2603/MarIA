import { ConnectionState, DisconnectReason, LocalAudioTrack, Room, RoomEvent, RoomOptions, VideoPresets, RemoteParticipant, DataPacket_Kind, Track, createLocalAudioTrack } from 'livekit-client';
import { useEffect, useState, useRef, useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { setAppError } from '@/store/slices/appErrorSlice';
import { selectUser } from '@/store/slices/userSlice';

// Define las props del hook
interface UseLiveKitConnectionManagerProps {
  liveKitUrl: string;
  liveKitToken: string | null;
  onRoomConnected?: (room: Room) => void;
  onRoomDisconnected?: () => void;
  onDataReceived?: (payload: Uint8Array, kind: string, participant?: any) => void;
  onTrackSubscribed?: (track: any, publication: any, participant: any) => void;
  onTrackUnsubscribed?: (track: any, publication: any, participant: any) => void;
}

export const useLiveKitConnectionManager = ({
  liveKitUrl,
  liveKitToken,
  onRoomConnected,
  onRoomDisconnected,
  onDataReceived,
  onTrackSubscribed,
  onTrackUnsubscribed,
}: UseLiveKitConnectionManagerProps) => {
  const [room, setRoom] = useState<Room | null>(null);
  const [connectionState, setConnectionState] = useState<ConnectionState>(ConnectionState.Disconnected);
  const [isConnecting, setIsConnecting] = useState(false);
  const dispatch = useAppDispatch();
  const user = useAppSelector(selectUser); // Obtener el usuario para el nombre del participante

  const roomOptions = useRef<RoomOptions>({
    adaptiveStream: true,
    dynacast: true,
    videoCaptureDefaults: {
      resolution: VideoPresets.h720.resolution,
    },
    publishDefaults: {
      videoEncoding: VideoPresets.h1080.encoding,
      // simulcast: true, // Habilitar simulcast si es necesario
    },
  });

  const connectToRoom = useCallback(async () => {
    if (!liveKitToken || !liveKitUrl || !user?.id) {
      console.warn('[LKCM] Token, URL o ID de usuario no disponibles. No se puede conectar.');
      dispatch(setAppError('livekit', 'Faltan datos para la conexión a LiveKit.'));
      return;
    }
    if (room && connectionState !== ConnectionState.Disconnected) {
      console.log('[LKCM] Ya conectado o conectando.');
      return;
    }

    console.log('[LKCM] Intentando conectar a la sala de LiveKit...');
    setIsConnecting(true);
    setConnectionState(ConnectionState.Connecting);

    const newRoomInstance = new Room(roomOptions.current);

    const onConnectionStateChanged = (state: ConnectionState) => {
      console.log('[LKCM] Connection state changed:', state);
      setConnectionState(state);
      setIsConnecting(state === ConnectionState.Connecting);

      if (state === ConnectionState.Connected) {
        console.log(`[LKCM] Connected to room ${newRoomInstance.name}`);
        setRoom(newRoomInstance);
        if (onRoomConnected) {
          onRoomConnected(newRoomInstance);
        }

        // Publicar el micrófono si no hay pistas de audio locales
        if (newRoomInstance.localParticipant.audioTrackPublications.size === 0) {
          createLocalAudioTrack({})
            .then((micTrack: LocalAudioTrack) => {
              return newRoomInstance.localParticipant.publishTrack(micTrack);
            })
            .then(() => {
              console.log('[LKCM] Micrófono publicado correctamente');
            })
            .catch((err: any) => {
              console.error('[LKCM] Error publicando micrófono:', err);
              dispatch(setAppError('livekit', `No pude activar el micrófono: ${err}`));
            });
        }
      } else if (state === ConnectionState.Disconnected) {
        console.log('[LKCM] Disconnected from room');
        if (room) {
          room.off(RoomEvent.TrackSubscribed, handleTrackSubscribed);
          room.off(RoomEvent.TrackUnsubscribed, handleTrackUnsubscribed);
          if (onDataReceived) room.off(RoomEvent.DataReceived, onDataReceived as any);
          room.off(RoomEvent.Disconnected, onDisconnected);
        }
        setRoom(null);
        if (onRoomDisconnected) {
          onRoomDisconnected();
        }
      }
    };
    
    const handleTrackSubscribed = (track: Track, publication: any, participant: RemoteParticipant) => {
      console.log('[LKCM] Track Subscribed:', track, publication, participant);
      if (onTrackSubscribed) {
        onTrackSubscribed(track, publication, participant);
      }
    };

    const handleTrackUnsubscribed = (track: Track, publication: any, participant: RemoteParticipant) => {
      console.log('[LKCM] Track Unsubscribed:', track, publication, participant);
      if (onTrackUnsubscribed) {
        onTrackUnsubscribed(track, publication, participant);
      }
    };

    const internalHandleDataReceived = (payload: Uint8Array, participant?: RemoteParticipant, kind?: DataPacket_Kind, topic?: string) => {
      console.log('[LKCM] Data Received:', kind, payload, participant, topic);
      if (onDataReceived) {
        const kindStr = kind !== undefined ? DataPacket_Kind[kind] : 'UNKNOWN';
        onDataReceived(payload, kindStr, participant);
      }
    };

    const onDisconnected = (reason?: DisconnectReason) => {
        console.log('[LKCM] Disconnected from room (event):', reason);
        onConnectionStateChanged(ConnectionState.Disconnected);
    };

    newRoomInstance
      .on(RoomEvent.ConnectionStateChanged, onConnectionStateChanged)
      .on(RoomEvent.TrackSubscribed, handleTrackSubscribed)
      .on(RoomEvent.TrackUnsubscribed, handleTrackUnsubscribed)
      .on(RoomEvent.DataReceived, internalHandleDataReceived)
      .on(RoomEvent.Disconnected, onDisconnected);

    try {
      await newRoomInstance.connect(liveKitUrl, liveKitToken, {
        // participantIdentity: user.name || user.id, // Opción alternativa
        // Si la identidad está en el token, no se necesita aquí.
        // No es necesario pasar 'identity' o 'participantName' aquí si tu versión no lo admite
      });
      console.log('[LKCM] Conexión exitosa a la sala:', newRoomInstance.name);
    } catch (error: any) {
      console.error('[LKCM] Error conectando a LiveKit:', error);
      dispatch(setAppError('livekit', `Error al conectar con LiveKit: ${error.message || error}`));
      onConnectionStateChanged(ConnectionState.Disconnected);
      if (newRoomInstance) {
        await newRoomInstance.disconnect().catch(disconnectError => {
             console.error('[LKCM] Error during forced disconnect:', disconnectError);
        });
      }
    }
  }, [liveKitToken, liveKitUrl, user, room, connectionState, dispatch, onRoomConnected, onRoomDisconnected, onDataReceived, onTrackSubscribed, onTrackUnsubscribed]);

  const disconnectFromLiveKit = useCallback(async () => {
    if (room) {
      console.log('[LKCM] Desconectando de la sala...');
      await room.disconnect();
      console.log('[LKCM] Desconectado.');
    }
  }, [room]);

  // Limpieza al desmontar el componente
  useEffect(() => {
    return () => {
      if (room && connectionState !== ConnectionState.Disconnected) {
        console.log('[LKCM] Desmontando componente, desconectando de la sala...');
        room.disconnect().then(() => {
            console.log('[LKCM] Desconectado al desmontar componente.');
        }).catch(e => {
            console.error('[LKCM] Error al desconectar al desmontar:', e);
        });
      }
    };
  }, [room, connectionState]);

  return { room, connectionState, isConnecting, connectToRoom, disconnectFromLiveKit };
}; 