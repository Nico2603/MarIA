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
import { TrackReference } from './useMediaAttachment';

const AGENT_IDENTITY = "Maria-TTS-Bot";

export interface ActiveTrackInfo {
  id: string;
  trackRef: TrackReference;
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
    const isAgent = participant.identity === AGENT_IDENTITY;
    const newTrackInfo: ActiveTrackInfo = {
      id: `${participant.sid}-${publication.trackSid}`,
      trackRef: {
        participant: participant as Participant,
        publication: publication as TrackPublication,
        source: publication.source,
      },
      kind: track.kind,
      identity: participant.identity,
      isAgent,
      source: publication.source,
    };

    setActiveTracks((prevTracks) => {
      if (prevTracks.find(t => t.id === newTrackInfo.id)) {
        return prevTracks;
      }
      return [...prevTracks, newTrackInfo];
    });
  }, []);

  const removeTrack = useCallback((trackSid: string, participantIdentity: string, trackKind: Track.Kind) => {
    setActiveTracks((prevTracks) => prevTracks.filter(t => !(t.trackRef.publication?.trackSid === trackSid && t.identity === participantIdentity)));
  }, []);

  const handleTrackSubscribed = useCallback((track: RemoteTrack, publication: RemoteTrackPublication, participant: RemoteParticipant) => {
    console.log(`Track Subscribed: ${track.kind} from ${participant.identity} (Source: ${publication.source})`);
    const isAgent = participant.identity === AGENT_IDENTITY;
    const isLocalParticipant = roomRef.current && participant.identity === roomRef.current.localParticipant.identity;

    if (isAgent && track.kind === Track.Kind.Audio) {
      addTrack(track, publication, participant);
      console.log(`Audio del agente ${participant.identity} añadido a activeTracks.`);
    }
    else if (isAgent && track.kind === Track.Kind.Video) {
      addTrack(track, publication, participant);
      console.log(`Video del agente ${participant.identity} añadido a activeTracks.`);
    }
    else if (!isAgent && !isLocalParticipant && track.kind === Track.Kind.Audio) {
      addTrack(track, publication, participant);
      console.log(`Audio remoto de ${participant.identity} añadido a activeTracks.`);
    }
    else {
      console.log(`Ignorando pista suscrita: Local=${isLocalParticipant}, Kind=${track.kind}, Identity=${participant.identity}, Source=${publication.source}`);
    }
  }, [addTrack, roomRef]);

  const handleTrackUnsubscribed = useCallback((track: RemoteTrack, publication: RemoteTrackPublication, participant: RemoteParticipant) => {
    console.log(`Track Unsubscribed: ${track.kind} from ${participant.identity}`);
    removeTrack(publication.trackSid, participant.identity, track.kind);
  }, [removeTrack]);

  const handleParticipantDisconnected = useCallback((participant: RemoteParticipant) => {
    console.log(`Participant Disconnected: ${participant.identity}. Eliminando sus pistas de activeTracks.`);
    setActiveTracks((prevTracks) => {
      return prevTracks.filter(t => t.identity !== participant.identity);
    });
  }, []);

  return {
    activeTracks,
    handleTrackSubscribed,
    handleTrackUnsubscribed,
    handleParticipantDisconnected,
  };
} 