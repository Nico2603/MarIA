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
}

export function useReadyToStart({
  authStatus,
  connectionState,
  discoveredParticipant,
  greetingMessageId,
  conversationActive,
  activeTracks = [],
}: UseReadyToStartProps): boolean {
  // Avatar CSS no requiere timeouts de carga - lógica simplificada
  const isReady = useMemo(() => {
    // Si ya hay una conversación activa, siempre está listo
    if (conversationActive) {
      return true;
    }

    // Con avatar CSS, solo necesitamos verificar criterios básicos
    return authStatus === 'authenticated' && 
           connectionState === LiveKitConnectionState.Connected &&
           discoveredParticipant !== null;
  }, [
    authStatus, 
    connectionState, 
    discoveredParticipant, 
    conversationActive
  ]);

  // Log simplificado para debugging 
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      console.log('[useReadyToStart] Estado:', {
        authStatus,
        connectionState: connectionState.toString(),
        hasParticipant: !!discoveredParticipant,
        participantIdentity: discoveredParticipant?.identity,
        conversationActive,
        isReady,
      });
    }
  }, [authStatus, connectionState, discoveredParticipant, conversationActive, isReady]);

  return isReady;
} 