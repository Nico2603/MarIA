import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

// GET /api/chat-sessions/latest-summary - Obtiene el resumen de la última ChatSession finalizada del usuario
export async function GET(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user?.id) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  try {
    const latestChatSession = await prisma.chatSession.findFirst({
      where: {
        userId: session.user.id,
        endedAt: { not: null }, // Solo sesiones finalizadas
        summary: { not: null }, // Solo sesiones con resumen generado
      },
      orderBy: {
        endedAt: 'desc', // La más reciente finalizada
      },
      select: {
        summary: true,
      },
    });

    if (!latestChatSession) {
      // Es normal no encontrar resumen si es la primera sesión o las anteriores fallaron
      return NextResponse.json({ summary: null });
    }

    return NextResponse.json({ summary: latestChatSession.summary });

  } catch (error) {
    console.error(`Error al obtener el último resumen para usuario ${session.user.id}:`, error);
    return NextResponse.json({ error: "Error interno del servidor al buscar resumen" }, { status: 500 });
  }
} 