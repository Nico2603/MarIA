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
  conversationActive,
}: UseReadyToStartProps): boolean {
  // Lógica simplificada: listo cuando está autenticado y conectado
  const isReady = useMemo(() => {
    if (conversationActive) {
      return true;
    }
    
    return authStatus === 'authenticated' && 
           connectionState === LiveKitConnectionState.Connected;
  }, [authStatus, connectionState, conversationActive]);

  return isReady;
} 