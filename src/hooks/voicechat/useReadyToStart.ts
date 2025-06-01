import { useEffect, useState } from 'react';
import { ConnectionState as LiveKitConnectionState, Track } from 'livekit-client';
import type { RemoteParticipant } from 'livekit-client';

interface UseReadyToStartProps {
  authStatus: string; // 'authenticated', 'loading', 'unauthenticated'
  connectionState: LiveKitConnectionState;
  discoveredParticipant: RemoteParticipant | null;
  greetingMessageId: string | null;
  currentSpeakingId: string | null;
  isSpeaking: boolean;
  conversationActive: boolean; // Para evitar que se ponga "listo" si ya hay una conversación
  activeTracks?: Array<{ identity: string; kind: Track.Kind; source: Track.Source; publication?: any }>; // Mejorado con publication
}

export function useReadyToStart({
  authStatus,
  connectionState,
  discoveredParticipant,
  greetingMessageId,
  currentSpeakingId,
  isSpeaking,
  conversationActive,
  activeTracks = [], // Con valor por defecto
}: UseReadyToStartProps): boolean {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const userAuthenticated = authStatus === 'authenticated';
    const livekitConnected = connectionState === LiveKitConnectionState.Connected;
    const agentDiscovered = discoveredParticipant !== null;
    
    // Verificación más estricta para Tavus: debe tener tanto video como audio completamente cargados
    const isTavusAgent = discoveredParticipant?.identity === 'tavus-avatar-agent';
    let tavusCompletelyLoaded = false;
    
    if (isTavusAgent) {
      const tavusVideoTrack = activeTracks.find(t => 
        t.identity === 'tavus-avatar-agent' && 
        t.kind === Track.Kind.Video && 
        t.source === Track.Source.Camera
      );
      
      const tavusAudioTrack = activeTracks.find(t => 
        t.identity === 'tavus-avatar-agent' && 
        t.kind === Track.Kind.Audio
      );
      
      // El avatar está completamente cargado solo si tiene tanto video como audio
      tavusCompletelyLoaded = !!(tavusVideoTrack && tavusAudioTrack);
      
      console.log('[useReadyToStart] Verificando carga completa de Tavus:', {
        hasVideo: !!tavusVideoTrack,
        hasAudio: !!tavusAudioTrack,
        completelyLoaded: tavusCompletelyLoaded,
        totalTracks: activeTracks.length
      });
    } else {
      // Si no es Tavus, consideramos que está listo (para otros tipos de agentes)
      tavusCompletelyLoaded = true;
    }

    // Condición 1: Verificación básica de conexión y avatar completamente cargado
    const basicConditionsMet = 
      userAuthenticated &&
      livekitConnected &&
      agentDiscovered &&
      tavusCompletelyLoaded &&
      !conversationActive;

    // Condición 2: Verificación adicional de que el saludo se haya reproducido correctamente
    const greetingCompleted = greetingMessageId && !currentSpeakingId && !isSpeaking;
    const advancedConditionsMet = 
      basicConditionsMet &&
      greetingCompleted;

    // El usuario estará listo solo cuando se cumplan las condiciones básicas
    // El saludo puede usarse como verificación adicional pero no es obligatorio para estar "listo"
    const shouldBeReady = basicConditionsMet;

    if (shouldBeReady !== isReady) {
      setIsReady(shouldBeReady);
      
      if (shouldBeReady) {
        console.log('[useReadyToStart] ✅ Sistema completamente cargado y listo para iniciar conversación', {
          userAuthenticated,
          livekitConnected,
          agentDiscovered,
          agentIdentity: discoveredParticipant?.identity,
          tavusCompletelyLoaded,
          greetingCompleted,
          totalActiveTracks: activeTracks.length
        });
      } else {
        console.log('[useReadyToStart] ⏳ Sistema aún cargando, esperando condiciones:', {
          userAuthenticated,
          livekitConnected,
          agentDiscovered,
          agentIdentity: discoveredParticipant?.identity,
          tavusCompletelyLoaded,
          conversationActive,
          activeTracks: activeTracks.map(t => ({ identity: t.identity, kind: t.kind, source: t.source }))
        });
      }
    }
  }, [
    authStatus,
    connectionState,
    discoveredParticipant,
    greetingMessageId,
    currentSpeakingId,
    isSpeaking,
    conversationActive,
    activeTracks,
    isReady,
  ]);

  return isReady;
} 