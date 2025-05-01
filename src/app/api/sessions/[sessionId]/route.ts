import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

interface RouteParams {
    params: { chatSessionId: string }
}

// PUT /api/chat-sessions/[chatSessionId] - Marca una ChatSession como finalizada
export async function PUT(request: Request, { params }: RouteParams) {
  const session = await getServerSession(authOptions);
  const { chatSessionId } = params;

  if (!session || !session.user?.id) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  if (!chatSessionId) {
      return NextResponse.json({ error: "ID de sesión de chat no proporcionado en la URL" }, { status: 400 });
  }

  try {
    // Verificar que la ChatSession pertenece al usuario actual antes de actualizar
    const chatSessionToUpdate = await prisma.chatSession.findUnique({
        where: { id: chatSessionId },
        select: { userId: true }
    });

    if (!chatSessionToUpdate) {
        return NextResponse.json({ error: "Sesión de chat no encontrada" }, { status: 404 });
    }

    if (chatSessionToUpdate.userId !== session.user.id) {
        return NextResponse.json({ error: "No autorizado para modificar esta sesión de chat" }, { status: 403 });
    }

    // Actualizar endedAt en ChatSession
    await prisma.chatSession.update({
      where: { id: chatSessionId },
      data: {
        endedAt: new Date(),
      },
    });

    // La llamada a /api/summarize se sigue haciendo desde el cliente por ahora.

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error(`Error al marcar sesión de chat ${chatSessionId} como finalizada para usuario ${session.user.id}:`, error);
    return NextResponse.json({ error: "Error interno al finalizar la sesión de chat" }, { status: 500 });
  }
} 