// === Configuraciones principales ===
export { authOptions } from './auth';
export { prisma } from './prisma';

// === Utilidades ===
export { cn } from './utils';

// === Constantes ===
export { AGENT_IDENTITY, isValidAgent } from './constants';

// Re-exportación explícita para compatibilidad
export * from './constants';