'use client';

import { useState, useCallback, RefObject } from 'react';
import {
  RemoteTrack,
  RemoteTrackPublication,
  RemoteParticipant,
  Track,
  Room,
  Participant,
  TrackPublication,
} from 'livekit-client';
import { AGENT_IDENTITY, isValidAgent } from '@/lib/constants';

export interface LiveKitTrack {
  identity: string;
  kind: Track.Kind;
  source: Track.Source;
  publication?: RemoteTrackPublication;
}

export interface ActiveTrackInfo {
  id: string;
  participant: Participant;
  publication: TrackPublication;
  kind: Track.Kind;
  identity: string;
  isAgent: boolean;
  source: Track.Source;
}

interface UseLiveKitTrackManagementProps {
  roomRef: RefObject<Room | null>;
}

export function useLiveKitTrackManagement({
  roomRef
}: UseLiveKitTrackManagementProps) {
  const [activeTracks, setActiveTracks] = useState<ActiveTrackInfo[]>([]);

  const addTrack = useCallback((track: RemoteTrack, publication: RemoteTrackPublication, participant: RemoteParticipant) => {
    const isAgent = isValidAgent(participant.identity);
    const newTrackInfo: ActiveTrackInfo = {
      id: `${participant.sid}-${publication.trackSid}`,
      participant: participant as Participant,
      publication: publication as TrackPublication,
      kind: track.kind,
      identity: participant.identity,
      isAgent,
      source: publication.source,
    };

    // DEBUGGING: Log detallado para el avatar de Tavus
    if (participant.identity === 'tavus-avatar-agent') {
      console.log(`[TrackManagement] 🎬 TAVUS TRACK DETECTADO:`);
      console.log(`  - Participant: ${participant.identity}`);
      console.log(`  - Track Kind: ${track.kind}`);
      console.log(`  - Track Source: ${publication.source}`);
      console.log(`  - Track SID: ${publication.trackSid}`);
      console.log(`  - Track Attached: ${track.attachedElements.length > 0}`);
      console.log(`  - Publication State: ${publication.isSubscribed}`);
      console.log(`  - Is Video Track: ${track.kind === Track.Kind.Video}`);
      console.log(`  - Is Camera Source: ${publication.source === Track.Source.Camera}`);
    }

    setActiveTracks((prevTracks) => {
      if (prevTracks.find(t => t.id === newTrackInfo.id)) {
        console.log(`[TrackManagement] ⚠️ Track ya existe: ${newTrackInfo.id}`);
        return prevTracks;
      }
      
      const updatedTracks = [...prevTracks, newTrackInfo];
      
      // Log cuando se agrega un track de video del avatar
      if (participant.identity === 'tavus-avatar-agent' && track.kind === Track.Kind.Video) {
        console.log(`[TrackManagement] ✅ VIDEO TRACK DE TAVUS AGREGADO EXITOSAMENTE`);
        console.log(`[TrackManagement] 📊 Tracks activos actuales:`, updatedTracks.map(t => `${t.identity}:${t.kind}:${t.source}`));
      }
      
      return updatedTracks;
    });
  }, []);

  const removeTrack = useCallback((trackSid: string, participantIdentity: string, trackKind: Track.Kind) => {
    console.log(`[TrackManagement] ❌ Removiendo track: ${participantIdentity}:${trackKind}:${trackSid}`);
    
    setActiveTracks((prevTracks) => {
      const filtered = prevTracks.filter(t => !(t.publication?.trackSid === trackSid && t.identity === participantIdentity));
      
      if (participantIdentity === 'tavus-avatar-agent' && trackKind === Track.Kind.Video) {
        console.log(`[TrackManagement] ❌ VIDEO TRACK DE TAVUS REMOVIDO`);
        console.log(`[TrackManagement] 📊 Tracks restantes:`, filtered.map(t => `${t.identity}:${t.kind}:${t.source}`));
      }
      
      return filtered;
    });
  }, []);

  const handleTrackSubscribed = useCallback((track: RemoteTrack, publication: RemoteTrackPublication, participant: RemoteParticipant) => {
    const localParticipant = roomRef.current?.localParticipant;

    console.log(`[TrackManagement] 📡 Track suscrito:`);
    console.log(`  - Participant: ${participant.identity}`);
    console.log(`  - Track Kind: ${track.kind}`);
    console.log(`  - Track Source: ${publication.source}`);
    console.log(`  - Is Local: ${participant.identity === localParticipant?.identity}`);

    if (
      localParticipant &&
      publication.kind === Track.Kind.Video &&
      participant.identity === localParticipant.identity
    ) {
      console.log(`[TrackManagement] ⏭️ Ignorando track de video local`);
      return;
    }

    addTrack(track, publication, participant);

  }, [addTrack, roomRef]);

  const handleTrackUnsubscribed = useCallback((track: RemoteTrack, publication: RemoteTrackPublication, participant: RemoteParticipant) => {
    console.log(`[TrackManagement] 📤 Track desuscrito:`);
    console.log(`  - Participant: ${participant.identity}`);
    console.log(`  - Track Kind: ${track.kind}`);
    console.log(`  - Track Source: ${publication.source}`);
    
    removeTrack(publication.trackSid, participant.identity, track.kind);
  }, [removeTrack]);

  const handleParticipantDisconnected = useCallback((participant: RemoteParticipant) => {
    console.log(`[TrackManagement] 👋 Participante desconectado: ${participant.identity}`);
    
    setActiveTracks((prevTracks) => {
      const filtered = prevTracks.filter(t => t.identity !== participant.identity);
      
      if (participant.identity === 'tavus-avatar-agent') {
        console.log(`[TrackManagement] ❌ TAVUS AVATAR DESCONECTADO - Todos sus tracks removidos`);
      }
      
      return filtered;
    });
  }, []);

  return {
    activeTracks,
    handleTrackSubscribed,
    handleTrackUnsubscribed,
    handleParticipantDisconnected,
  };
} 