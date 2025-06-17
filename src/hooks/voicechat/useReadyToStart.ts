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
  const [fallbackReady, setFallbackReady] = useState(false);

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
      }, 2000); // Incremento a 2 segundos para dar más tiempo

      return () => clearTimeout(stabilizationTimer);
    } else {
      setIsSystemStable(false);
    }
  }, [connectionState, discoveredParticipant]);

  // Fallback timeout - si el sistema lleva mucho tiempo sin estar listo, forzar ready
  useEffect(() => {
    if (connectionState === LiveKitConnectionState.Connected && discoveredParticipant && isSystemStable) {
      const fallbackTimer = setTimeout(() => {
        console.log('[useReadyToStart] Timeout de seguridad activado - forzando ready state');
        setFallbackReady(true);
      }, 8000); // 8 segundos total desde que está estable

      return () => clearTimeout(fallbackTimer);
    } else {
      setFallbackReady(false);
    }
  }, [connectionState, discoveredParticipant, isSystemStable]);

  // Lógica mejorada para determinar si está listo
  const isReady = useMemo(() => {
    // Si ya hay una conversación activa, siempre está listo
    if (conversationActive) {
      return true;
    }

    // Criterios básicos para que el sistema esté listo
    const basicCriteria = 
      authStatus === 'authenticated' && 
      connectionState === LiveKitConnectionState.Connected &&
      discoveredParticipant !== null &&
      isSystemStable;

    if (!basicCriteria) {
      return false;
    }

    // Si el fallback está activado, forzar ready sin importar otras condiciones
    if (fallbackReady) {
      return true;
    }

    // Si hay Tavus disponible, preferir esperar a que el video esté cargado,
    // pero si pasan 5 segundos desde que está estable, permitir continuar de todos modos
    if (hasTavusVideoTrack) {
      // Si el video está cargado, está listo
      if (tavusVideoLoaded) {
        return true;
      }
      
      // Si no está cargado pero el sistema lleva tiempo estable, continuar
      // Esto evita quedarse esperando indefinidamente
      return isSystemStable; // Ya incluye un delay de 2s, suficiente para la mayoría de casos
    }

    // Si no hay Tavus, está listo para que el usuario inicie manualmente
    return true;
  }, [
    authStatus, 
    connectionState, 
    discoveredParticipant, 
    conversationActive,
    isSystemStable,
    hasTavusVideoTrack,
    tavusVideoLoaded,
    fallbackReady
  ]);

  // Log para debugging (solo en desarrollo)
  useEffect(() => {
    console.log('[useReadyToStart] Estado detallado:', {
      authStatus,
      connectionState: connectionState.toString(),
      hasParticipant: !!discoveredParticipant,
      participantIdentity: discoveredParticipant?.identity,
      conversationActive,
      isSystemStable,
      fallbackReady,
      hasTavusVideoTrack,
      tavusVideoLoaded,
      isReady,
      activeTracksCount: activeTracks.length,
      activeTracks: activeTracks.map(t => ({ identity: t.identity, kind: t.kind, source: t.source }))
    });
  }, [
    authStatus, 
    connectionState, 
    discoveredParticipant, 
    conversationActive, 
    isSystemStable,
    fallbackReady,
    hasTavusVideoTrack,
    tavusVideoLoaded,
    isReady,
    activeTracks
  ]);

  return isReady;
} 