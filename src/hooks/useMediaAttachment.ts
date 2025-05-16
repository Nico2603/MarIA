import { useEffect, useRef } from 'react';
import { Track } from 'livekit-client';

interface UseMediaAttachmentProps {
  track: Track | null | undefined;
  containerId?: string; // Opcional, si no se provee, se adjunta al body o a un ref
  videoRef?: React.RefObject<HTMLVideoElement>; // Para video específico
  audioRef?: React.RefObject<HTMLAudioElement>; // Para audio específico
  idSuffix?: string; // Para crear IDs únicos si es necesario
}

export function useMediaAttachment({
  track,
  containerId,
  videoRef,
  audioRef,
  idSuffix = ''
}: UseMediaAttachmentProps) {
  const elementRef = useRef<HTMLMediaElement | null>(null);

  useEffect(() => {
    // Limpieza previa si el track cambia o se vuelve nulo
    if (elementRef.current) {
        // Si elementRef.current existe, pertenece al track anterior o al mismo track si no ha cambiado.
        // La función de limpieza del useEffect anterior (si el track cambió) ya debería haberlo manejado.
        // Este bloque es más para el caso en que el track se vuelve nulo.
        if (!track) { // Si el nuevo track es nulo, y había un elemento, solo lo removemos.
            elementRef.current.remove();
            elementRef.current = null;
        }
    }

    if (!track) {
      return; // No hay nuevo track para adjuntar
    }

    // Si ya tenemos un elemento y es del mismo track (y mismo ID), no hacer nada
    // Esto previene re-adjuntar si otras dependencias del useEffect cambian pero el track no.
    if (elementRef.current && elementRef.current.id === `media-${track.sid}${idSuffix}`) {
      return;
    }
    
    // Si elementRef.current existe de un track anterior (diferente sid), la limpieza del return lo manejará.
    // Pero para ser explícitos, si llegamos aquí y hay un elementRef, es de un track diferente o no se limpió.
    if (elementRef.current) {
        elementRef.current.remove(); // Remover el elemento antiguo del DOM
        elementRef.current = null;
    }

    const element = track.attach();
    element.id = `media-${track.sid}${idSuffix}`;
    if (element instanceof HTMLVideoElement && videoRef?.current) {
        // Si se proporciona un videoRef específico, usarlo y no el containerId
        videoRef.current.srcObject = element.srcObject;
        videoRef.current.muted = track.isMuted;
        videoRef.current.autoplay = true;
        videoRef.current.playsInline = true;
        elementRef.current = videoRef.current; // Referenciar el elemento gestionado
        // No añadimos `element` directamente al DOM si usamos un ref existente.
        // El elemento original `element` de `track.attach()` podría necesitar ser desechado si no es el mismo que videoRef.current
    } else if (element instanceof HTMLAudioElement && audioRef?.current) {
        audioRef.current.srcObject = element.srcObject;
        audioRef.current.muted = track.isMuted;
        audioRef.current.autoplay = true;
        elementRef.current = audioRef.current;
    } else if (containerId) {
      const container = document.getElementById(containerId);
      if (container) {
        container.innerHTML = ''; // Limpiar contenedor antes de añadir (o gestionar de forma más granular)
        container.appendChild(element);
        elementRef.current = element;
      } else {
        console.warn(`[useMediaAttachment] Contenedor con id '${containerId}' no encontrado.`);
        document.body.appendChild(element); // Fallback al body
        elementRef.current = element;
      }
    } else {
      // Si no hay containerId ni ref específico, adjuntar al body (para audio usualmente)
      document.body.appendChild(element);
      elementRef.current = element;
    }
    
    // Sincronizar mute state
    const handleMuted = () => { if (elementRef.current) elementRef.current.muted = true; };
    const handleUnmuted = () => { if (elementRef.current) elementRef.current.muted = false; };
    track.on('muted', handleMuted);
    track.on('unmuted', handleUnmuted);
    if (elementRef.current) elementRef.current.muted = track.isMuted; // Estado inicial


    return () => {
      track.off('muted', handleMuted);
      track.off('unmuted', handleUnmuted);
      if (elementRef.current && (containerId || (!videoRef && !audioRef)) ) {
        // Solo desadjuntar y remover el elemento que este efecto creó y adjuntó.
        // No el elemento de videoRef/audioRef que es gestionado externamente.
        if (elementRef.current !== videoRef?.current && elementRef.current !== audioRef?.current) {
            track.detach(elementRef.current);
            elementRef.current.remove();
        }
      }
      // Resetear elementRef solo si no es un ref externo que todavía podría ser usado.
      if (elementRef.current !== videoRef?.current && elementRef.current !== audioRef?.current) {
        elementRef.current = null;
      }
    };
  }, [track, containerId, videoRef, audioRef, idSuffix]);
} 