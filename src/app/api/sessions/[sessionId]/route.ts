import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

interface RouteParams {
    params: { sessionId: string }
}

// PUT /api/sessions/[sessionId] - Marca una ChatSession como finalizada
export async function PUT(request: Request, { params }: RouteParams) {
  const session = await getServerSession(authOptions);
  const { sessionId } = params;

  if (!session || !session.user?.id) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  if (!sessionId) {
      return NextResponse.json({ error: "ID de sesión no proporcionado en la URL" }, { status: 400 });
  }

  try {
    // Verificar que la ChatSession pertenece al usuario actual antes de actualizar
    const chatSessionToUpdate = await prisma.chatSession.findUnique({
        where: { id: sessionId },
        select: { userId: true }
    });

    if (!chatSessionToUpdate) {
        return NextResponse.json({ error: "Sesión de chat no encontrada" }, { status: 404 });
    }

    if (chatSessionToUpdate.userId !== session.user.id) {
        return NextResponse.json({ error: "No autorizado para modificar esta sesión de chat" }, { status: 403 });
    }

    // Actualizar endedAt en ChatSession
    const updatedSession = await prisma.chatSession.update({
      where: { id: sessionId },
      data: {
        endedAt: new Date(),
      },
    });

    // La llamada a /api/summarize se sigue haciendo desde el cliente en endSession.

    return NextResponse.json(updatedSession);

  } catch (error) {
    console.error(`Error al marcar sesión de chat ${sessionId} como finalizada para usuario ${session.user.id}:`, error);
    return NextResponse.json({ error: "Error interno al finalizar la sesión de chat" }, { status: 500 });
  }
} 