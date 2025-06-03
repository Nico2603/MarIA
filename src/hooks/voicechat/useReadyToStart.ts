import { useEffect, useState, useMemo } from 'react';
import { ConnectionState as LiveKitConnectionState, Track } from 'livekit-client';
import type { RemoteParticipant } from 'livekit-client';

interface UseReadyToStartProps {
  authStatus: string;
  connectionState: LiveKitConnectionState;
  discoveredParticipant: RemoteParticipant | null;
  greetingMessageId: string | null;
  currentSpeakingId: string | null;
  isSpeaking: boolean;
  conversationActive: boolean;
  activeTracks?: Array<{ identity: string; kind: Track.Kind; source: Track.Source; publication?: any }>;
  tavusVideoLoaded?: boolean;
}

export function useReadyToStart({
  authStatus,
  connectionState,
  discoveredParticipant,
  greetingMessageId,
  conversationActive,
  activeTracks = [],
  tavusVideoLoaded = false,
}: UseReadyToStartProps): boolean {
  const [isSystemStable, setIsSystemStable] = useState(false);

  // Verificar si hay video tracks de Tavus disponibles
  const hasTavusVideoTrack = useMemo(() => {
    return activeTracks.some(track => 
      track.identity === 'tavus-avatar-agent' && 
      track.kind === Track.Kind.Video && 
      track.source === Track.Source.Camera
    );
  }, [activeTracks]);

  // Estabilizar el sistema después de la conexión
  useEffect(() => {
    if (connectionState === LiveKitConnectionState.Connected && discoveredParticipant) {
      const stabilizationTimer = setTimeout(() => {
        setIsSystemStable(true);
      }, 1500); // Dar tiempo para que todo se estabilice

      return () => clearTimeout(stabilizationTimer);
    } else {
      setIsSystemStable(false);
    }
  }, [connectionState, discoveredParticipant]);

  // Lógica mejorada para determinar si está listo
  const isReady = useMemo(() => {
    // Si ya hay una conversación activa, siempre está listo
    if (conversationActive) {
      return true;
    }

    // Criterios básicos
    const basicCriteria = 
      authStatus === 'authenticated' && 
      connectionState === LiveKitConnectionState.Connected &&
      discoveredParticipant !== null &&
      isSystemStable;

    if (!basicCriteria) {
      return false;
    }

    // Si hay Tavus disponible, esperar a que el video esté cargado
    if (hasTavusVideoTrack) {
      return tavusVideoLoaded;
    }

    // Si no hay Tavus o el video ya está cargado, está listo
    return true;
  }, [
    authStatus, 
    connectionState, 
    discoveredParticipant, 
    conversationActive,
    isSystemStable,
    hasTavusVideoTrack,
    tavusVideoLoaded
  ]);

  // Log para debugging (solo en desarrollo)
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      console.log('[useReadyToStart] Estado:', {
        authStatus,
        connectionState,
        hasParticipant: !!discoveredParticipant,
        conversationActive,
        isSystemStable,
        hasTavusVideoTrack,
        tavusVideoLoaded,
        isReady
      });
    }
  }, [
    authStatus, 
    connectionState, 
    discoveredParticipant, 
    conversationActive, 
    isSystemStable,
    hasTavusVideoTrack,
    tavusVideoLoaded,
    isReady
  ]);

  return isReady;
} 