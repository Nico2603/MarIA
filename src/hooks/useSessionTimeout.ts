import { useEffect, useState, useRef } from 'react';

interface UseSessionTimeoutProps {
  conversationActive: boolean;
  sessionStartTime: number | null;
  isSessionClosed: boolean;
  onTimeout: () => void; // Función a llamar cuando el tiempo finaliza
  onWarning?: () => void; // Función opcional para la advertencia
  sessionDurationMs?: number;
  warningThresholdMs?: number;
}

const DEFAULT_SESSION_DURATION_MS = 30 * 60 * 1000; // 30 minutos (reglamentario)
const DEFAULT_WARNING_THRESHOLD_MS = 28 * 60 * 1000; // 28 minutos (2 minutos antes del final)

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
  
  // Use refs to store the latest callback functions to avoid dependency issues
  const onTimeoutRef = useRef(onTimeout);
  const onWarningRef = useRef(onWarning);
  
  useEffect(() => {
    onTimeoutRef.current = onTimeout;
  }, [onTimeout]);
  
  useEffect(() => {
    onWarningRef.current = onWarning;
  }, [onWarning]);

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
          if (onWarningRef.current) {
            onWarningRef.current();
          }
        }, remainingWarningTime);
      } else if (!isTimeRunningOut && elapsedTime >= warningThresholdMs) {
        // Si ya pasó el tiempo de advertencia al iniciar el efecto y no se ha mostrado la advertencia
        setIsTimeRunningOut(true);
        if (onWarningRef.current) {
          onWarningRef.current();
        }
      }

      if (remainingFinalTime > 0) {
        finalTimeoutId = setTimeout(() => {
          onTimeoutRef.current();
        }, remainingFinalTime);
      } else {
        // Si ya pasó el tiempo final al iniciar el efecto
        if (!isSessionClosed) { // Evitar llamar onTimeout si la sesión ya se cerró por otro medio
          onTimeoutRef.current();
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
  }, [conversationActive, sessionStartTime, isSessionClosed, sessionDurationMs, warningThresholdMs, isTimeRunningOut]);

  // Retornamos isTimeRunningOut para que el componente pueda usarlo si necesita mostrar algo en la UI
  return { isTimeRunningOut, setIsTimeRunningOut }; 
} 