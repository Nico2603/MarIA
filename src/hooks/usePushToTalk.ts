import { useEffect, useCallback, Dispatch, SetStateAction } from 'react';

interface UsePushToTalkProps {
  isListening: boolean;
  isProcessing: boolean;
  isSpeaking: boolean;
  isThinking: boolean; // Añadido para evitar PTT mientras piensa
  conversationActive: boolean;
  isSessionClosed: boolean;
  onStartListening: () => void;
  onStopListening: () => void;
  setIsPushToTalkActive: (isActive: boolean) => void;
  isAvatarLoaded?: boolean; // Para verificar si el avatar está cargado
}

export function usePushToTalk({
  isListening,
  isProcessing,
  isSpeaking,
  isThinking,
  conversationActive,
  isSessionClosed,
  onStartListening,
  onStopListening,
  setIsPushToTalkActive,
  isAvatarLoaded = true, // Por defecto true para compatibilidad
}: UsePushToTalkProps) {
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    const targetElement = event.target as HTMLElement;
    const isInputFocused = 
      targetElement.tagName === 'INPUT' || 
      targetElement.tagName === 'TEXTAREA' || 
      targetElement.isContentEditable ||
      targetElement.closest('input, textarea, [contenteditable="true"]') !== null;

    if (event.code === 'Space' && !isInputFocused) {
      event.preventDefault(); // Prevenir scroll u otras acciones por defecto de la barra espaciadora
      
      // Verificar que el avatar esté completamente cargado antes de permitir PTT
      if (!isListening && !isProcessing && !isSpeaking && !isThinking && 
          conversationActive && !isSessionClosed && isAvatarLoaded) {
        setIsPushToTalkActive(true);
        onStartListening();
      }
    }
  }, [
    isListening, 
    isProcessing, 
    isSpeaking, 
    isThinking, 
    conversationActive, 
    isSessionClosed, 
    setIsPushToTalkActive, 
    onStartListening,
    isAvatarLoaded
  ]);

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
      event.preventDefault();
      setIsPushToTalkActive(false); // << CORREGIDO: Desactivar PTT al soltar
      onStopListening(); 
    }
  }, [isListening, onStopListening, setIsPushToTalkActive]); // << CORREGIDO: Agregar setIsPushToTalkActive

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown, true); // Usar capturing phase
    window.addEventListener('keyup', handleKeyUp, true);     // Usar capturing phase

    return () => {
      window.removeEventListener('keydown', handleKeyDown, true);
      window.removeEventListener('keyup', handleKeyUp, true);
    };
  }, [handleKeyDown, handleKeyUp]);
} 