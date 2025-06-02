import React, { useRef, useEffect } from 'react';
import { Track } from 'livekit-client';
import { useMediaAttachment } from '@/hooks/voicechat/useMediaAttachment';

interface RemoteTrackPlayerProps {
  track: Track;
  id?: string;
  className?: string;
  autoPlay?: boolean;
  muted?: boolean;
  playsInline?: boolean;
  onLoadedData?: (event: React.SyntheticEvent<HTMLMediaElement, Event>) => void;
  onVideoLoaded?: () => void;
}

const RemoteTrackPlayer: React.FC<RemoteTrackPlayerProps> = ({
  track,
  id,
  className,
  autoPlay = true,
  muted = false,
  playsInline = true,
  onLoadedData,
  onVideoLoaded,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const videoLoadedCallbackFiredRef = useRef(false);
  
  useMediaAttachment({ track: track, containerRef });

  useEffect(() => {
    // Reset el flag cuando cambia el track
    videoLoadedCallbackFiredRef.current = false;
  }, [track.sid]);

  useEffect(() => {
    const currentContainer = containerRef.current;
    if (currentContainer) {
      const mediaElement = currentContainer.firstChild as HTMLMediaElement | null;
      if (mediaElement) {
        mediaElement.autoplay = autoPlay;
        mediaElement.muted = muted;
        if (id) mediaElement.id = id;
        if (playsInline && mediaElement instanceof HTMLVideoElement) {
          mediaElement.playsInline = playsInline;
        }
        
        // Aplicar estilos para video
        if (mediaElement instanceof HTMLVideoElement) {
          mediaElement.style.width = '100%';
          mediaElement.style.height = '100%';
          mediaElement.style.objectFit = 'cover';
          mediaElement.style.objectPosition = 'center top';
        }
        
        // Manejar onVideoLoaded específicamente para videos
        if (onVideoLoaded && mediaElement instanceof HTMLVideoElement) {
          const handleVideoLoaded = () => {
            if (mediaElement.readyState >= 3 && !videoLoadedCallbackFiredRef.current) { // HAVE_FUTURE_DATA o superior
              console.log('[RemoteTrackPlayer] 🎬 Video cargado detectado, disparando callback');
              videoLoadedCallbackFiredRef.current = true;
              onVideoLoaded();
            }
          };
          
          // Verificar si el video ya está listo inmediatamente
          if (mediaElement.readyState >= 3 && !videoLoadedCallbackFiredRef.current) {
            console.log('[RemoteTrackPlayer] 🎬 Video ya estaba listo, disparando callback inmediatamente');
            videoLoadedCallbackFiredRef.current = true;
            onVideoLoaded();
          }
          
          // Configurar event listeners para diferentes etapas de carga
          mediaElement.oncanplay = handleVideoLoaded;
          mediaElement.oncanplaythrough = handleVideoLoaded;
          
          // Manejar onLoadedData con el callback combinado
          const combinedLoadedDataHandler = (event: Event) => {
            if (onLoadedData) {
              onLoadedData(event as unknown as React.SyntheticEvent<HTMLMediaElement, Event>);
            }
            handleVideoLoaded();
          };
          
          mediaElement.onloadeddata = combinedLoadedDataHandler;
          
          // Log para debug
          console.log('[RemoteTrackPlayer] 🎬 Configurando event listeners para video:', {
            trackSid: track.sid,
            readyState: mediaElement.readyState,
            videoWidth: mediaElement.videoWidth,
            videoHeight: mediaElement.videoHeight
          });
        } else if (onLoadedData) {
          // Solo configurar onLoadedData si no es video o no hay onVideoLoaded
          mediaElement.onloadeddata = (event) => onLoadedData(event as unknown as React.SyntheticEvent<HTMLMediaElement, Event>);
        }
      }
    }
    
    return () => {
        if (currentContainer) {
            const mediaElement = currentContainer.firstChild as HTMLMediaElement | null;
            if (mediaElement) {
                mediaElement.onloadeddata = null;
                mediaElement.oncanplay = null;
                mediaElement.oncanplaythrough = null;
            }
        }
    }
  }, [track, autoPlay, muted, id, playsInline, onLoadedData, onVideoLoaded]);

  return (
    <div 
      ref={containerRef} 
      className={className}
      style={{ position: 'relative' }}
    />
  );
};

export default RemoteTrackPlayer; 