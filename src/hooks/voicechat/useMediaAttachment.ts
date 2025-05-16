'use client';

import { useEffect, RefObject } from 'react';
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
  useEffect(() => {
    const container = containerRef.current;
    if (!track || !container || !isEnabled) {
      // Si no hay track, contenedor, o no está habilitado, no hacer nada.
      // Si hay un track adjunto previamente pero ahora isEnabled es false o el track es null,
      // se necesita una lógica para despegarlo si el useEffect no se vuelve a ejecutar con el track anterior.
      // Sin embargo, el flujo normal es que el track se vuelva null/undefined o el componente se desmonte.
      return;
    }

    let element: HTMLElement | undefined;
    try {
      console.log(`[useMediaAttachment] Attempting to attach track ${track.sid} to container.`);
      element = track.attach();
      container.appendChild(element);
      console.log(`[useMediaAttachment] Track ${track.sid} attached successfully.`);
    } catch (error) {
      console.error(`[useMediaAttachment] Error attaching track ${track.sid}:`, error);
      // Si falla el attach, asegurarse de que no quede ningún elemento huérfano.
      if (element && element.parentNode === container) {
        container.removeChild(element);
      }
      element?.remove(); // Por si acaso se creó pero no se añadió.
      return; // No configurar el detach si el attach falló
    }
    
    return () => {
      if (element) {
        console.log(`[useMediaAttachment] Detaching track ${track.sid} from container.`);
        if (element instanceof HTMLMediaElement) {
          track.detach(element); 
        } else {
          // Si el elemento no es un HTMLMediaElement, o para estar seguros,
          // llamamos a detach() para todos los elementos de este track.
          track.detach();
        }
        element.remove(); // Elimina el elemento del DOM completamente
        console.log(`[useMediaAttachment] Track ${track.sid} detached and element removed.`);
      } else if (track && isEnabled) { // Solo si el track existía y estaba habilitado cuando el efecto corrió
        // Si `element` no se definió (ej. attach falló), intentar detach de todos modos
        console.log(`[useMediaAttachment] Element for track ${track.sid} not found, calling track.detach() to clean up.`);
        track.detach();
      }
    };
  }, [track, containerRef, isEnabled]); // Depender de track, containerRef e isEnabled
} 