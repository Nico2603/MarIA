import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { NextResponse, NextRequest } from "next/server";
import type { Profile } from '@prisma/client'; // Importar el tipo Profile de Prisma
import type { ExtendedUserProfile } from '@/reducers/voiceChatReducer'; // Importar el tipo extendido

// GET /api/profile - Obtener perfil del usuario actual simplificado
export async function GET(req: NextRequest) {
  console.log('>> /api/profile invoked');
  // Estos logs son para depuración del backend, está bien mantenerlos si son útiles para ti.
  console.log('ENV LIVEKIT_API_KEY exist:', !!process.env.LIVEKIT_API_KEY);
  console.log('ENV LIVEKIT_API_SECRET exist:', !!process.env.LIVEKIT_API_SECRET);
  console.log('ENV LIVEKIT_URL exist:', !!process.env.LIVEKIT_URL);

  const session = await getServerSession(authOptions);

  if (!session || !session.user) { // Verificar session.user también
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  // Devuelve solo los datos básicos del usuario de la sesión
  return NextResponse.json({
    user: { 
      id: session.user.id, // Incluir ID si está disponible y es útil
      name: session.user.name,
      email: session.user.email,
      image: session.user.image // Incluir imagen si está disponible y es útil
    },
    // ya no incluimos el perfil de Prisma ni claves API
  });
}