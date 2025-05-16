import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import jwksClient from 'jwks-rsa';
import { prisma } from '@/lib/prisma'; // Asegúrate que la ruta a tu cliente Prisma sea correcta

// IDs de Cliente OAuth 2.0 de tu aplicación para la verificación de audiencia del JWT
// Deberías obtenerlos de variables de entorno en una aplicación real y más robusta.
const GOOGLE_OAUTH_CLIENT_IDS = [
  process.env.GOOGLE_CLIENT_ID || '65633194937-eirjfi2v8j3auocmrp5niv1dqej46r32.apps.googleusercontent.com',
  // Agrega otros IDs de cliente si los tienes (ej. para Android, iOS) y los has configurado para RISC.
];

const jwksRsaClient = jwksClient({
  jwksUri: 'https://risc.googleapis.com/v1beta/jwks',
  cache: true,
  cacheMaxEntries: 5,
  cacheMaxAge: 10 * 60 * 1000, // 10 minutos
});

function getKey(header: jwt.JwtHeader, callback: (err: any, key?: jwt.Secret) => void): void {
  if (!header.kid) {
    return callback(new Error('Encabezado JWT no contiene KID'));
  }
  jwksRsaClient.getSigningKey(header.kid, (err, key) => {
    if (err) {
      console.error('RISC: Error al obtener la clave de firma JWKS:', err);
      return callback(err);
    }
    // key es de tipo SigningKey. Accedemos a publicKey o rsaPublicKey.
    // La propiedad real depende de si la clave es RSA, EC, etc.
    // jwks-rsa se encarga de devolver el formato correcto para jwt.verify.
    const signingKey = (key as any).publicKey || (key as any).rsaPublicKey;
    if (!signingKey) {
        return callback(new Error('No se pudo obtener la clave de firma desde JWKS.'));
    }
    callback(null, signingKey);
  });
}

export async function POST(req: NextRequest) {
  try {
    const eventToken = await req.text();

    if (!eventToken) {
      console.warn('RISC: No se recibió token de evento.');
      return NextResponse.json({ error: 'Bad Request: No event token received.' }, { status: 400 });
    }

    // Promisify jwt.verify para usar con async/await
    const decodedToken = await new Promise<jwt.JwtPayload | undefined>((resolve, reject) => {
      jwt.verify(eventToken, getKey, {
        algorithms: ['RS256'],
        issuer: ['https://accounts.google.com', 'accounts.google.com'],
        audience: GOOGLE_OAUTH_CLIENT_IDS,
      }, (err, decoded) => {
        if (err) {
          console.error('RISC: Error al verificar el token JWT:', err.message, err.name);
          return reject(err);
        }
        resolve(decoded as jwt.JwtPayload | undefined);
      });
    });

    if (!decodedToken || !decodedToken.events) {
      console.warn('RISC: Token decodificado inválido o no contiene eventos.');
      return NextResponse.json({ error: 'Unauthorized: Invalid token structure.' }, { status: 401 });
    }

    console.log('RISC: Token JWT verificado exitosamente. Eventos:', JSON.stringify(decodedToken.events, null, 2));

    for (const eventType in decodedToken.events) {
      const eventDetails = decodedToken.events[eventType] as any; // 'any' para flexibilidad con la estructura del evento
      const googleUserId = eventDetails.subject?.sub;

      if (!googleUserId) {
        console.warn(`RISC: Evento ${eventType} no contiene googleUserId (subject.sub). Detalles:`, eventDetails);
        continue;
      }

      console.log(`RISC: Procesando evento ${eventType} para el usuario de Google ID: ${googleUserId}`);

      // Encontrar el usuario interno basado en el googleUserId
      const account = await prisma.account.findUnique({
        where: {
          provider_providerAccountId: {
            provider: 'google', // Asegúrate que el nombre del provider coincida con lo que guardas
            providerAccountId: googleUserId,
          },
        },
        include: {
          user: true, // Incluir el usuario para obtener su ID interno
        },
      });

      if (!account || !account.user) {
        console.warn(`RISC: No se encontró una cuenta o usuario interno para googleUserId: ${googleUserId}. Evento: ${eventType}`);
        continue;
      }

      const internalUserId = account.userId;
      console.log(`RISC: Usuario interno ID: ${internalUserId} encontrado para googleUserId: ${googleUserId}`);

      switch (eventType) {
        case 'https://schemas.openid.net/secevent/oauth/event-type/tokens-revoked':
        case 'https://schemas.openid.net/secevent/risc/event-type/sessions-revoked':
          console.log(`RISC: Evento de revocación de tokens/sesiones para usuario interno ${internalUserId}.`);
          try {
            // Invalidar todas las sesiones de NextAuth para este usuario en la base de datos
            const { count } = await prisma.session.deleteMany({
              where: { userId: internalUserId },
            });
            console.log(`RISC: ${count} sesiones de NextAuth eliminadas para el usuario interno ${internalUserId}.`);
          } catch (dbError) {
            console.error(`RISC: Error al eliminar sesiones de la DB para el usuario ${internalUserId}:`, dbError);
            // Considera cómo manejar este error. ¿Reintentar? ¿Alertar?
          }
          break;

        case 'https://schemas.openid.net/secevent/risc/event-type/account-disabled':
          console.warn(`RISC: Evento de cuenta de Google deshabilitada para usuario interno ${internalUserId}. ¡ACCIÓN REQUERIDA!`);
          // Acción: Además de invalidar sesiones (que podría ocurrir por otros eventos simultáneos como tokens-revoked),
          // deberías considerar marcar esta cuenta internamente para prevenir futuros logins vía Google hasta que se resuelva,
          // y/o notificar al usuario.
          try {
            // Ejemplo de cómo podrías marcar al usuario si tienes un campo apropiado:
            // await prisma.user.update({
            //   where: { id: internalUserId },
            //   data: { 
            //     userStatus: 'GOOGLE_ACCOUNT_DISABLED', // Suponiendo que tienes un campo userStatus
            //     googleSignInAllowed: false // Suponiendo que tienes un campo para controlar esto
            //   },
            // });
            // console.log(`RISC: Usuario interno ${internalUserId} marcado debido a cuenta de Google deshabilitada.`);
            
            // Por ahora, nos aseguraremos de que las sesiones estén eliminadas, similar a tokens-revoked.
            const { count } = await prisma.session.deleteMany({
              where: { userId: internalUserId },
            });
            console.log(`RISC: ${count} sesiones de NextAuth eliminadas para el usuario interno ${internalUserId} debido a account-disabled.`);

          } catch (dbError) {
            console.error(`RISC: Error al actualizar/eliminar sesiones para el usuario ${internalUserId} (account-disabled):`, dbError);
          }
          break;

        case 'https://schemas.openid.net/secevent/risc/event-type/account-credential-change-required':
             console.log(`RISC: Evento de cambio de credenciales requerido para usuario interno ${internalUserId}.`);
             // Podrías forzar un cierre de sesión (ya cubierto por la eliminación de sesiones si también se envía tokens-revoked)
             // o requerir una nueva autenticación o revisión.
             break;

        // Considera manejar otros eventos si son relevantes para tu aplicación:
        // - "https://schemas.openid.net/secevent/risc/event-type/account-purged"
        // - "https://schemas.openid.net/secevent/risc/event-type/account-enabled"

        default:
          console.warn(`RISC: Tipo de evento no manejado explícitamente: ${eventType} para usuario interno ${internalUserId}`);
      }
    }

    return NextResponse.json({ message: 'Event received and processed.' }, { status: 200 });

  } catch (error: any) {
    console.error('RISC: Error inesperado en el webhook:', error.message, error.stack);
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError' || error.message?.includes('JWKS')) {
      return NextResponse.json({ error: `Unauthorized: ${error.message}` }, { status: 401 });
    }
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// Implementación del método OPTIONS para CORS si es necesario, aunque Google no debería necesitarlo
// export async function OPTIONS(req: NextRequest) {
//   return NextResponse.json({}, { status: 200 });
// } 