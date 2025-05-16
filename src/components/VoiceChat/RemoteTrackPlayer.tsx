import React, { useRef, useEffect } from 'react';
import { Track } from 'livekit-client';
import { useMediaAttachment } from '@/hooks/voicechat/useMediaAttachment';

interface RemoteTrackPlayerProps {
  track: Track; // Cambiado de trackRef a track
  id?: string;
  className?: string;
  autoPlay?: boolean;
  muted?: boolean;
  // Añade aquí otras props que quieras pasar al elemento multimedia, como 'playsInline'
  playsInline?: boolean;
  onLoadedData?: (event: React.SyntheticEvent<HTMLMediaElement, Event>) => void;
  // etc.
}

const RemoteTrackPlayer: React.FC<RemoteTrackPlayerProps> = ({
  track, // Usar track directamente
  id,
  className,
  autoPlay = true,
  muted = false,
  playsInline = true,
  onLoadedData,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Usar el nuevo hook. El track puede ser null si la prop track lo es (aunque aquí es requerida).
  useMediaAttachment({ track: track, containerRef });

  // Si necesitamos aplicar props directamente al elemento <audio>/<video>,
  // podríamos necesitar una forma de acceder a él desde useMediaAttachment,
  // o pasar estas props a useMediaAttachment para que las aplique.
  // Por ahora, la mayoría de los atributos se manejarán a través del contenedor
  // o mediante configuración directa si es necesario (requeriría modificar useMediaAttachment).

  useEffect(() => {
    const currentContainer = containerRef.current;
    if (currentContainer) {
      // El elemento multimedia ahora es el único hijo del containerRef gracias a useMediaAttachment
      const mediaElement = currentContainer.firstChild as HTMLMediaElement | null;
      if (mediaElement) {
        mediaElement.autoplay = autoPlay;
        mediaElement.muted = muted;
        if (id) mediaElement.id = id;
        if (playsInline && mediaElement instanceof HTMLVideoElement) {
          mediaElement.playsInline = playsInline;
        }
        if (onLoadedData) {
            mediaElement.onloadeddata = (event) => onLoadedData(event as unknown as React.SyntheticEvent<HTMLMediaElement, Event>);
        } else {
            mediaElement.onloadeddata = null; // Asegurar que se limpia si onLoadedData se quita
        }
      }
    }
    // Limpieza de onloadeddata
    return () => {
        if (currentContainer) {
            const mediaElement = currentContainer.firstChild as HTMLMediaElement | null;
            if (mediaElement && onLoadedData) { // Solo limpiar si onLoadedData estaba presente
                mediaElement.onloadeddata = null;
            }
        }
    }
  }, [track, autoPlay, muted, id, playsInline, onLoadedData]); // track como dependencia para re-aplicar si la pista cambia

  return <div ref={containerRef} className={className} />;
};

export default RemoteTrackPlayer; 