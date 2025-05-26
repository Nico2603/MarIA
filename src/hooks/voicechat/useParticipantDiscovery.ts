import { useState, useEffect, useCallback } from 'react';
import { Room, RemoteParticipant, RoomEvent, LocalParticipant, Participant } from 'livekit-client';

const AGENT_METADATA_ROLE_KEY = 'role';
const INTERACTIVE_AGENT_ROLE_VALUE = 'interactive_agent'; // O el valor que decidas usar

interface UseParticipantDiscoveryProps {
  room: Room | null;
  localParticipant?: LocalParticipant | null;
}

export function useParticipantDiscovery({ room, localParticipant }: UseParticipantDiscoveryProps) {
  const [discoveredParticipant, setDiscoveredParticipant] = useState<RemoteParticipant | null>(null);
  const [error, setError] = useState<string | null>(null);

  const findInteractiveAgent = useCallback((participants: Map<string, RemoteParticipant>): RemoteParticipant | null => {
    for (const p of Array.from(participants.values())) {
      if (p.identity === localParticipant?.identity) continue; // Ignorar al participante local

      try {
        if (p.metadata) {
          const metadata = JSON.parse(p.metadata);
          if (metadata[AGENT_METADATA_ROLE_KEY] === INTERACTIVE_AGENT_ROLE_VALUE) {
            console.log(`[useParticipantDiscovery] Interactive agent found via metadata: ${p.identity}`);
            return p;
          }
        }
      } catch (e) {
        console.warn(`[useParticipantDiscovery] Failed to parse metadata for participant ${p.identity}:`, e);
      }
      // Fallback o lógica adicional si es necesaria (ej. por identidad si no hay metadata)
      // Por ahora, solo buscamos por metadata.
    }
    return null;
  }, [localParticipant]);

  useEffect(() => {
    if (!room) {
      setDiscoveredParticipant(null);
      setError(null);
      return;
    }

    // Intentar encontrar el agente inmediatamente con los participantes actuales
    const existingAgent = findInteractiveAgent(room.remoteParticipants);
    if (existingAgent) {
      setDiscoveredParticipant(existingAgent);
      setError(null);
      return; // Agente encontrado, no es necesario escuchar más eventos por ahora
    } else {
      setDiscoveredParticipant(null); // Asegurar que esté nulo si no se encuentra
      console.log("[useParticipantDiscovery] No interactive agent found initially. Listening for new connections or metadata updates...");
    }
    
    const handleParticipantUpdate = (metadata_unused?: string, participant?: Participant) => {
      if (participant && participant instanceof RemoteParticipant && participant.identity !== localParticipant?.identity) {
         // Verificar si el participante actualizado es el agente interactivo
        try {
          if (participant.metadata) {
            const metadata = JSON.parse(participant.metadata);
            if (metadata[AGENT_METADATA_ROLE_KEY] === INTERACTIVE_AGENT_ROLE_VALUE) {
              console.log(`[useParticipantDiscovery] Interactive agent found/updated via metadata update: ${participant.identity}`);
              setDiscoveredParticipant(participant);
              setError(null);
              // Opcional: podrías dejar de escuchar si solo esperas un agente
            } else if (discoveredParticipant?.identity === participant.identity) {
              // Si el agente previamente descubierto cambia su metadata y ya no es el agente, resetear.
              setDiscoveredParticipant(null);
            }
          } else if (discoveredParticipant?.identity === participant.identity) {
             // Si el agente previamente descubierto pierde su metadata, resetear.
            setDiscoveredParticipant(null);
          }
        } catch (e) {
          console.warn(`[useParticipantDiscovery] Failed to parse metadata during update for participant ${participant.identity}:`, e);
        }
      }
    };

    const handleNewParticipantConnected = (participant: RemoteParticipant) => {
      if (participant.identity === localParticipant?.identity) return;
      
      try {
        if (participant.metadata) {
          const metadata = JSON.parse(participant.metadata);
          if (metadata[AGENT_METADATA_ROLE_KEY] === INTERACTIVE_AGENT_ROLE_VALUE) {
            console.log(`[useParticipantDiscovery] New interactive agent connected with metadata: ${participant.identity}`);
            setDiscoveredParticipant(participant);
            setError(null);
          }
        }
      } catch (e) {
        console.warn(`[useParticipantDiscovery] Failed to parse metadata for new participant ${participant.identity}:`, e);
      }
    };

    const handleParticipantDisconnected = (participant: RemoteParticipant) => {
      if (discoveredParticipant && participant.identity === discoveredParticipant.identity) {
        console.log(`[useParticipantDiscovery] Discovered agent ${participant.identity} disconnected.`);
        setDiscoveredParticipant(null);
        setError("El agente interactivo se ha desconectado.");
        // Volver a escuchar por si otro agente se conecta o uno existente se actualiza
      }
    };

    room.on(RoomEvent.ParticipantConnected, handleNewParticipantConnected);
    room.on(RoomEvent.ParticipantMetadataChanged, handleParticipantUpdate);
    room.on(RoomEvent.ParticipantDisconnected, handleParticipantDisconnected);
    // También es buena idea escuchar RoomEvent.ConnectionStateChanged por si la propia conexión a la sala cambia.

    return () => {
      room.off(RoomEvent.ParticipantConnected, handleNewParticipantConnected);
      room.off(RoomEvent.ParticipantMetadataChanged, handleParticipantUpdate);
      room.off(RoomEvent.ParticipantDisconnected, handleParticipantDisconnected);
    };
  }, [room, localParticipant, findInteractiveAgent, discoveredParticipant]);

  return { discoveredParticipant, error };
} 