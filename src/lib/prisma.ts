import { PrismaClient } from '@prisma/client';

declare global {
  // Permite que prisma sea una propiedad global en desarrollo
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined;
}

// Previene múltiples instancias de PrismaClient en desarrollo debido al hot-reloading
export const prisma = global.prisma || new PrismaClient();

if (process.env.NODE_ENV !== 'production') {
  global.prisma = prisma;
} 