import React, { useRef, useEffect, useState, useCallback } from 'react';
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
  onError?: () => void;
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
  onError,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const videoLoadedCallbackFiredRef = useRef(false);
  const [hasError, setHasError] = useState(false);
  
  useMediaAttachment({ track: track, containerRef });

  // Reset el flag cuando cambia el track
  useEffect(() => {
    videoLoadedCallbackFiredRef.current = false;
    setHasError(false);
  }, [track.sid]);

  // Callback para manejar errores
  const handleMediaError = useCallback(() => {
    console.error('[RemoteTrackPlayer] ❌ Error en reproducción de media');
    setHasError(true);
    onError?.();
  }, [onError]);

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
        
        // Configuración específica por tipo de elemento
        if (mediaElement instanceof HTMLVideoElement) {
          mediaElement.style.width = '100%';
          mediaElement.style.height = '100%';
          mediaElement.style.objectFit = 'cover';
          mediaElement.style.objectPosition = 'center top';
          mediaElement.style.backgroundColor = '#000';
          mediaElement.preload = 'metadata';
        } else if (mediaElement instanceof HTMLAudioElement) {
          // Configuración específica para audio TTS - CRÍTICO para saludo inicial
          mediaElement.preload = 'auto'; // Cargar completamente para reproducción inmediata
          mediaElement.volume = 0.8; // Volumen por defecto
          console.log('[RemoteTrackPlayer] 🎵 Elemento audio configurado para TTS');
        }
        
        // Manejar eventos de carga
        const handleLoadedData = (event: Event) => {
          console.log('[RemoteTrackPlayer] 📡 Datos de media cargados');
          
          // Para audio, asegurar que se reproduzca automáticamente
          if (mediaElement instanceof HTMLAudioElement && autoPlay) {
            console.log('[RemoteTrackPlayer] 🔊 Iniciando reproducción automática de audio TTS');
            mediaElement.play().catch((error) => {
              console.error('[RemoteTrackPlayer] ❌ Error al reproducir audio automáticamente:', error);
              // Intentar reproducir con interacción del usuario si falla autoplay
              if (error.name === 'NotAllowedError') {
                console.log('[RemoteTrackPlayer] 🤔 Autoplay bloqueado, intentando reproducir en la siguiente interacción');
              }
            });
          }
          
          onLoadedData?.(event as any);
        };

        // Manejar onVideoLoaded específicamente para videos
        if (onVideoLoaded && mediaElement instanceof HTMLVideoElement) {
          const handleVideoLoaded = () => {
            if (mediaElement.readyState >= 3 && !videoLoadedCallbackFiredRef.current) { // HAVE_FUTURE_DATA o superior
              console.log('[RemoteTrackPlayer] 🎬 Video cargado detectado, disparando callback');
              videoLoadedCallbackFiredRef.current = true;
              setHasError(false);
              onVideoLoaded();
            }
          };
          
          // Múltiples eventos para asegurar detección
          mediaElement.addEventListener('loadeddata', handleVideoLoaded);
          mediaElement.addEventListener('canplay', handleVideoLoaded);
          mediaElement.addEventListener('canplaythrough', handleVideoLoaded);
          mediaElement.addEventListener('playing', handleVideoLoaded);
          
          // Manejar errores
          mediaElement.addEventListener('error', handleMediaError);
          mediaElement.addEventListener('abort', handleMediaError);
          mediaElement.addEventListener('stalled', () => {
            console.warn('[RemoteTrackPlayer] ⚠️ Video stalled');
          });
          
          // Verificar si el video ya está listo
          if (mediaElement.readyState >= 3) {
            handleVideoLoaded();
          }
          
          return () => {
            mediaElement.removeEventListener('loadeddata', handleVideoLoaded);
            mediaElement.removeEventListener('canplay', handleVideoLoaded);
            mediaElement.removeEventListener('canplaythrough', handleVideoLoaded);
            mediaElement.removeEventListener('playing', handleVideoLoaded);
            mediaElement.removeEventListener('error', handleMediaError);
            mediaElement.removeEventListener('abort', handleMediaError);
            mediaElement.removeEventListener('stalled', () => {});
          };
        }
        
        // Agregar listener para loadeddata sin video callback
        if (onLoadedData) {
          mediaElement.addEventListener('loadeddata', handleLoadedData);
          return () => {
            mediaElement.removeEventListener('loadeddata', handleLoadedData);
          };
        }
      }
    }
  }, [track, autoPlay, muted, playsInline, id, onLoadedData, onVideoLoaded, handleMediaError]);

  return (
    <div 
      ref={containerRef} 
      className={className}
      style={{ 
        display: hasError ? 'none' : 'block',
        width: '100%', 
        height: '100%' 
      }}
    />
  );
};

export default RemoteTrackPlayer; 