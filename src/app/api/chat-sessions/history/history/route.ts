import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

// GET /api/chat-sessions/history - Obtiene el historial de ChatSessions finalizadas del usuario
export async function GET(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user?.id) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  try {
    const chatSessionsHistory = await prisma.chatSession.findMany({
      where: {
        userId: session.user.id,
        endedAt: { not: null }, // Solo sesiones finalizadas
      },
      orderBy: {
        createdAt: 'desc', // Más recientes primero
      },
      select: {
        id: true,
        createdAt: true,
        endedAt: true,
        summary: true,
      },
      take: 50, // Limitar resultados por ahora (se añadirá paginación real después)
    });

    return NextResponse.json(chatSessionsHistory);

  } catch (error) {
    console.error(`Error al obtener el historial de sesiones de chat para usuario ${session.user.id}:`, error);
    return NextResponse.json({ error: "Error interno del servidor al buscar historial" }, { status: 500 });
  }
} 