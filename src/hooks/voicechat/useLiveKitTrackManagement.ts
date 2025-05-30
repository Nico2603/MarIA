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

const AGENT_IDENTITY = "Maria-TTS-Bot";

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
    const isAgent = participant.identity === AGENT_IDENTITY;
    const newTrackInfo: ActiveTrackInfo = {
      id: `${participant.sid}-${publication.trackSid}`,
      participant: participant as Participant,
      publication: publication as TrackPublication,
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
    setActiveTracks((prevTracks) => prevTracks.filter(t => !(t.publication?.trackSid === trackSid && t.identity === participantIdentity)));
  }, []);

  const handleTrackSubscribed = useCallback((track: RemoteTrack, publication: RemoteTrackPublication, participant: RemoteParticipant) => {
    console.log(`[LiveKitTrackMgmt] Track Subscribed: ${track.kind} from ${participant.identity} (Source: ${publication.source}, SID: ${publication.trackSid})`);
    
    const localParticipant = roomRef.current?.localParticipant;

    if (
      localParticipant &&
      publication.kind === Track.Kind.Video &&
      participant.identity === localParticipant.identity
    ) {
      console.log(
        `[LiveKitTrackMgmt] Ignorando vídeo local: Identity=${participant.identity}`
      );
      return;
    }

    addTrack(track, publication, participant);
    console.log(`[LiveKitTrackMgmt] Pista añadida a activeTracks: Kind=${track.kind}, Identity=${participant.identity}, Source=${publication.source}`);

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