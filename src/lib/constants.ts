/**
 * Constantes de agentes para la aplicación MarIA
 */
export const AGENT_IDENTITY = "Maria-TTS-Bot";

export const isValidAgent = (identity: string): boolean => {
  return identity === AGENT_IDENTITY || 
         identity.startsWith('agent-') || 
         identity === 'tavus-avatar-agent';
};

export default {
  AGENT_IDENTITY,
  isValidAgent
};