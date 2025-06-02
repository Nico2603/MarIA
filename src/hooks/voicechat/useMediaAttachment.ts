'use client';

import { useEffect, RefObject, useRef } from 'react';
import { Track } from 'livekit-client';

interface UseMediaAttachmentProps {
  track: Track | null | undefined;
  containerRef: RefObject<HTMLDivElement>;
  isEnabled?: boolean; // Para controlar si se debe adjuntar, por defecto true
}

export function useMediaAttachment({
  track,
  containerRef,
  isEnabled = true,
}: UseMediaAttachmentProps) {
  const attachedElementRef = useRef<HTMLElement | null>(null);
  const attachedTrackSidRef = useRef<string | null>(null);
  const isAttachingRef = useRef<boolean>(false);

  useEffect(() => {
    const container = containerRef.current;
    
    // Si no hay track, contenedor, o no está habilitado, limpiar attachment previo
    if (!track || !container || !isEnabled) {
      if (attachedElementRef.current && !isAttachingRef.current) {
        console.log(`[useMediaAttachment] Cleaning up previous attachment`);
        if (attachedTrackSidRef.current) {
          // Intentar detach del track anterior si aún está disponible
          try {
            if (attachedElementRef.current instanceof HTMLMediaElement) {
              // Si tenemos referencia al track anterior, usar su detach específico
              track?.detach(attachedElementRef.current);
            } else {
              track?.detach();
            }
          } catch (error) {
            console.warn(`[useMediaAttachment] Error during cleanup detach:`, error);
          }
        }
        attachedElementRef.current.remove();
        attachedElementRef.current = null;
        attachedTrackSidRef.current = null;
      }
      return;
    }

    // Si el track ya está attachado y es el mismo, no hacer nada
    if (attachedTrackSidRef.current === track.sid && attachedElementRef.current && !isAttachingRef.current) {
      return; // Remover log para reducir spam
    }

    // Si ya está en proceso de attachment, evitar duplicados
    if (isAttachingRef.current) {
      return;
    }

    // Si hay un track diferente attachado, limpiarlo primero
    if (attachedElementRef.current && attachedTrackSidRef.current !== track.sid) {
      console.log(`[useMediaAttachment] Detaching previous track ${attachedTrackSidRef.current}`);
      try {
        attachedElementRef.current.remove();
      } catch (error) {
        console.warn(`[useMediaAttachment] Error removing previous element:`, error);
      }
      attachedElementRef.current = null;
      attachedTrackSidRef.current = null;
    }

    // Attachar el nuevo track
    let element: HTMLElement | undefined;
    try {
      isAttachingRef.current = true;
      console.log(`[useMediaAttachment] Attempting to attach track ${track.sid} (Kind: ${track.kind}) to container.`);
      element = track.attach();
      
      if (element) {
        console.log(`[useMediaAttachment] Track element created:`, {
          tagName: element.tagName,
          kind: track.kind,
          sid: track.sid,
          type: element.constructor.name
        });
        
        container.appendChild(element);
        attachedElementRef.current = element;
        attachedTrackSidRef.current = track.sid || null;
        console.log(`[useMediaAttachment] Track ${track.sid} attached successfully.`);
      } else {
        console.error(`[useMediaAttachment] track.attach() returned null/undefined for ${track.sid}`);
      }
    } catch (error) {
      console.error(`[useMediaAttachment] Error attaching track ${track.sid}:`, error);
      // Si falla el attach, asegurarse de que no quede ningún elemento huérfano
      if (element && element.parentNode === container) {
        container.removeChild(element);
      }
      element?.remove();
      attachedElementRef.current = null;
      attachedTrackSidRef.current = null;
    } finally {
      isAttachingRef.current = false;
    }
    
    return () => {
      if (attachedElementRef.current && attachedTrackSidRef.current && !isAttachingRef.current) {
        console.log(`[useMediaAttachment] Cleanup: Detaching track ${attachedTrackSidRef.current} from container.`);
        try {
          if (attachedElementRef.current instanceof HTMLMediaElement) {
            track.detach(attachedElementRef.current); 
          } else {
            track.detach();
          }
          attachedElementRef.current.remove();
        } catch (error) {
          console.warn(`[useMediaAttachment] Error during cleanup:`, error);
          // Intentar remover el elemento del DOM al menos
          attachedElementRef.current?.remove();
        }
        console.log(`[useMediaAttachment] Track ${attachedTrackSidRef.current} detached and element removed.`);
        attachedElementRef.current = null;
        attachedTrackSidRef.current = null;
      }
    };
  }, [track?.sid, containerRef, isEnabled]); // Usar track.sid en lugar de track completo
} 