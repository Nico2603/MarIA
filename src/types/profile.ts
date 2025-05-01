import type { User, Profile } from '@prisma/client';

// Extiende el tipo Profile de Prisma para incluir opcionalmente el usuario relacionado
// Esto coincide con cómo se usa en el frontend después de hacer include: { profile: true }
export interface UserProfile extends Profile {
  user?: User; // El usuario puede o no estar incluido dependiendo de la consulta
} 