import { useEffect, useCallback, Dispatch, SetStateAction } from 'react';

interface UsePushToTalkProps {
  isListening: boolean;
  isProcessing: boolean;
  isSpeaking: boolean;
  isThinking: boolean; // << NUEVO: Añadido para evitar PTT mientras piensa
  conversationActive: boolean;
  isSessionClosed: boolean;
  onStartListening: () => void;
  onStopListening: () => void;
  setIsPushToTalkActive: (isActive: boolean) => void;
}

export function usePushToTalk({
  isListening,
  isProcessing,
  isSpeaking,
  isThinking, // << NUEVO
  conversationActive,
  isSessionClosed,
  onStartListening,
  onStopListening,
  setIsPushToTalkActive,
}: UsePushToTalkProps) {
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    const targetElement = event.target as HTMLElement;
    const isInputFocused = 
      targetElement.tagName === 'INPUT' || 
      targetElement.tagName === 'TEXTAREA' || 
      targetElement.isContentEditable ||
      targetElement.closest('input, textarea, [contenteditable="true"]') !== null;

    if (event.code === 'Space' && !isInputFocused) {
      console.log('[usePushToTalk] Space key down. Conditions:', {
        isListening,
        isProcessing,
        isSpeaking,
        isThinking,
        conversationActive,
        isSessionClosed
      });
      
      event.preventDefault(); // Prevenir scroll u otras acciones por defecto de la barra espaciadora
      if (!isListening && !isProcessing && !isSpeaking && !isThinking && conversationActive && !isSessionClosed) {
        console.log('[usePushToTalk] Activating push-to-talk');
        setIsPushToTalkActive(true);
        onStartListening();
      } else {
        console.log('[usePushToTalk] Space down: Conditions not met for push-to-talk');
      }
    }
  }, [isListening, isProcessing, isSpeaking, isThinking, conversationActive, isSessionClosed, onStartListening, setIsPushToTalkActive]);

  const handleKeyUp = useCallback((event: KeyboardEvent) => {
    const targetElement = event.target as HTMLElement;
    const isInputFocused = 
      targetElement.tagName === 'INPUT' || 
      targetElement.tagName === 'TEXTAREA' || 
      targetElement.isContentEditable ||
      targetElement.closest('input, textarea, [contenteditable="true"]') !== null;
      
    // Solo detener si se estaba escuchando (isListening es true) y PTT estaba activo
    // y la tecla liberada es Espacio, y no hay un input enfocado.
    if (event.code === 'Space' && isListening && !isInputFocused) { 
      console.log('[usePushToTalk] Space key up. Stopping listening via push-to-talk');
      event.preventDefault();
      onStopListening(); 
    }
  }, [isListening, onStopListening]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown, true); // Usar capturing phase
    window.addEventListener('keyup', handleKeyUp, true);     // Usar capturing phase

    return () => {
      window.removeEventListener('keydown', handleKeyDown, true);
      window.removeEventListener('keyup', handleKeyUp, true);
    };
  }, [handleKeyDown, handleKeyUp]);
} 