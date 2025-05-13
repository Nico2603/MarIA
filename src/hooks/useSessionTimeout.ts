import { useEffect, useState } from 'react';

interface UseSessionTimeoutProps {
  conversationActive: boolean;
  sessionStartTime: number | null;
  isSessionClosed: boolean;
  onTimeout: () => void; // Función a llamar cuando el tiempo finaliza
  onWarning?: () => void; // Función opcional para la advertencia
  sessionDurationMs?: number;
  warningThresholdMs?: number;
}

const DEFAULT_SESSION_DURATION_MS = 20 * 60 * 1000; // 20 minutos
const DEFAULT_WARNING_THRESHOLD_MS = 18 * 60 * 1000; // 18 minutos (2 minutos antes del final)

export function useSessionTimeout({
  conversationActive,
  sessionStartTime,
  isSessionClosed,
  onTimeout,
  onWarning,
  sessionDurationMs = DEFAULT_SESSION_DURATION_MS,
  warningThresholdMs = DEFAULT_WARNING_THRESHOLD_MS,
}: UseSessionTimeoutProps) {
  const [isTimeRunningOut, setIsTimeRunningOut] = useState(false);

  useEffect(() => {
    let warningTimeoutId: NodeJS.Timeout | null = null;
    let finalTimeoutId: NodeJS.Timeout | null = null;

    if (conversationActive && sessionStartTime && !isSessionClosed) {
      const now = Date.now();
      const elapsedTime = now - sessionStartTime;
      
      const remainingWarningTime = warningThresholdMs - elapsedTime;
      const remainingFinalTime = sessionDurationMs - elapsedTime;

      if (remainingWarningTime > 0) {
        warningTimeoutId = setTimeout(() => {
          setIsTimeRunningOut(true);
          if (onWarning) {
            onWarning();
          }
        }, remainingWarningTime);
      } else if (!isTimeRunningOut && elapsedTime >= warningThresholdMs) {
        // Si ya pasó el tiempo de advertencia al iniciar el efecto y no se ha mostrado la advertencia
        setIsTimeRunningOut(true);
        if (onWarning) {
          onWarning();
        }
      }

      if (remainingFinalTime > 0) {
        finalTimeoutId = setTimeout(() => {
          onTimeout();
        }, remainingFinalTime);
      } else {
        // Si ya pasó el tiempo final al iniciar el efecto
        if (!isSessionClosed) { // Evitar llamar onTimeout si la sesión ya se cerró por otro medio
          onTimeout();
        }
      }
    }

    return () => {
      if (warningTimeoutId) {
        clearTimeout(warningTimeoutId);
      }
      if (finalTimeoutId) {
        clearTimeout(finalTimeoutId);
      }
    };
  }, [conversationActive, sessionStartTime, isSessionClosed, onTimeout, onWarning, sessionDurationMs, warningThresholdMs]);

  // Retornamos isTimeRunningOut para que el componente pueda usarlo si necesita mostrar algo en la UI
  return { isTimeRunningOut, setIsTimeRunningOut }; 
} 