import { useEffect, useState } from 'react';
import { ConnectionState as LiveKitConnectionState } from 'livekit-client';
import type { RemoteParticipant } from 'livekit-client';

interface UseReadyToStartProps {
  authStatus: string; // 'authenticated', 'loading', 'unauthenticated'
  connectionState: LiveKitConnectionState;
  discoveredParticipant: RemoteParticipant | null;
  greetingMessageId: string | null;
  currentSpeakingId: string | null;
  isSpeaking: boolean;
  conversationActive: boolean; // Para evitar que se ponga "listo" si ya hay una conversación
}

export function useReadyToStart({
  authStatus,
  connectionState,
  discoveredParticipant,
  greetingMessageId,
  currentSpeakingId,
  isSpeaking,
  conversationActive,
}: UseReadyToStartProps): boolean {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const userAuthenticated = authStatus === 'authenticated';
    const livekitConnected = connectionState === LiveKitConnectionState.Connected;
    const agentDiscovered = discoveredParticipant !== null;
    // Condición 1: Basada en conexión y descubrimiento del agente (más temprana)
    const conditionsMetForInitialReady = 
      userAuthenticated &&
      livekitConnected &&
      agentDiscovered &&
      !conversationActive;

    // Condición 2: Basada en el saludo completado (más tardía, confirma que el bot está listo)
    const greetingHasPlayed = greetingMessageId && !currentSpeakingId && !isSpeaking;
    const conditionsMetForGreetingReady = 
      userAuthenticated &&
      livekitConnected &&
      greetingHasPlayed && 
      !conversationActive; // Asegurarse que no esté ya activa la conversación
      // agentDiscovered también es implícito aquí, ya que el saludo no debería ocurrir sin agente

    // Se considera listo si CUALQUIERA de las condiciones se cumple.
    // La primera condición (agentDiscovered) permite mostrar la UI de "listo" antes.
    // La segunda (greetingHasPlayed) es una confirmación más fuerte.
    // En la práctica, el dispatch de SET_READY_TO_START en el componente principal
    // podría usar la segunda condición para la notificación "María está lista".
    if (conditionsMetForInitialReady || conditionsMetForGreetingReady) {
      if (!isReady) {
        setIsReady(true);
        console.log('[useReadyToStart] Conditions met, setting isReady to true.', { conditionsMetForInitialReady, conditionsMetForGreetingReady });
      }
    } else {
      if (isReady) {
        setIsReady(false);
        console.log('[useReadyToStart] Conditions no longer met, setting isReady to false.');
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
    isReady, // Incluir isReady para evitar bucles si la lógica interna lo cambiara y re-evaluara
  ]);

  return isReady;
} 