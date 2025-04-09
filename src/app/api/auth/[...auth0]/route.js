import { handleAuth, handleCallback } from '@auth0/nextjs-auth0';

// Configuración personalizada para el callback
const authOptions = {
  callback: {
    async afterCallback(req, res, session) {
      // Guardar el returnTo correcto
      if (!session.returnTo && session.returnTo !== '/chat') {
        session.returnTo = '/chat';
      }
      return session;
    }
  },
  // Opciones adicionales aquí
};

export const GET = handleAuth(authOptions);
export const POST = handleAuth(authOptions); 