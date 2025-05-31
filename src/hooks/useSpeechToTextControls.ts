import { useCallback, useRef } from 'react';
import { Room, DataPacket_Kind } from 'livekit-client';
import { useAppDispatch } from '@/store/hooks'; // Asumiendo que usas Redux para errores
import { setAppError } from '@/store/slices/appErrorSlice'; // Asumiendo que usas Redux para errores

interface UseSpeechToTextControlsProps {
  roomRef: React.RefObject<Room | null>;
  // Aquí puedes añadir otras props que tu hook necesite, por ejemplo, para manejar el estado de STT
  onTranscription?: (transcription: string) => void; // Ejemplo de callback para la transcripción
  onSttError?: (error: any) => void; // Ejemplo de callback para errores de STT
}

// Define a topic for STT data, if your backend expects it
const STT_DATA_TOPIC = 'stt_control';

export const useSpeechToTextControls = ({
  roomRef,
  onTranscription, // Ejemplo
  onSttError,      // Ejemplo
}: UseSpeechToTextControlsProps) => {
  const dispatch = useAppDispatch(); // Para manejar errores globalmente si es necesario

  const startStt = useCallback(async () => {
    console.log('[STT] startStt() llamado, iniciando envío de audio...');
    if (!roomRef.current || !roomRef.current.localParticipant) {
      console.error('[STT] La sala o el participante local no están disponibles.');
      dispatch(setAppError('stt', 'Error al iniciar STT: Sala no disponible.'));
      if (onSttError) onSttError(new Error('Sala no disponible para STT'));
      return;
    }

    try {
      const startMessage = JSON.stringify({ action: 'startTranscription' });
      const encoder = new TextEncoder();
      await roomRef.current.localParticipant.publishData(encoder.encode(startMessage), {
        reliable: true,
        topic: STT_DATA_TOPIC,
      });
      
      console.log('[STT] Mensaje de inicio de STT enviado.');

    } catch (error: any) {
      console.error('[STT] Error al enviar mensaje de inicio de STT:', error);
      dispatch(setAppError('stt', `Error al iniciar STT: ${error.message || error}`));
      if (onSttError) onSttError(error);
    }
  }, [roomRef, dispatch, onTranscription, onSttError]);

  const stopStt = useCallback(async () => {
    console.log('[STT] stopStt() llamado, deteniendo envío de audio.');
    if (!roomRef.current || !roomRef.current.localParticipant) {
      console.warn('[STT] No se puede enviar mensaje de parada de STT: sala no disponible.');
      return;
    }

    try {
      const stopMessage = JSON.stringify({ action: 'stopTranscription' });
      const encoder = new TextEncoder();
      await roomRef.current.localParticipant.publishData(encoder.encode(stopMessage), {
        reliable: true,
        topic: STT_DATA_TOPIC,
      });
      
      console.log('[STT] Mensaje de parada de STT enviado.');
    } catch (error: any) {
      console.error('[STT] Error al enviar mensaje de parada de STT:', error);
      dispatch(setAppError('stt', `Error al detener STT: ${error.message || error}`));
      if (onSttError) onSttError(error);
    }
  }, [roomRef, dispatch, onSttError]);

  // Aquí podrías retornar otros estados o funciones relacionadas con STT
  return { startStt, stopStt };
}; 