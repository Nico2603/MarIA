import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { z } from 'zod';

const messageSchema = z.object({
    chatSessionId: z.string(), // Permitir cualquier string, no solo CUID
    sender: z.enum(['user', 'assistant']), // Cambiado de 'ai' a 'assistant' para consistencia
    content: z.string().trim().min(1),
});

// POST /api/messages - Guarda un nuevo mensaje en una ChatSession
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validation = messageSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({ error: "Datos de mensaje inválidos", details: validation.error.format() }, { status: 400 });
    }

    const { chatSessionId, sender, content } = validation.data;

    // Verificar que la ChatSession existe
    const existingChatSession = await prisma.chatSession.findUnique({
        where: { id: chatSessionId },
        select: { id: true, userId: true }
    });

    // Si la sesión no existe, intentar obtener la sesión de usuario y verificar autorización
    if (!existingChatSession) {
      const session = await getServerSession(authOptions);
      
      if (!session || !session.user?.id) {
        return NextResponse.json({ error: "Chat session no encontrada y usuario no autenticado" }, { status: 401 });
      }
      
      return NextResponse.json({ error: "Sesión de chat no encontrada" }, { status: 404 });
    }

    // Para mensajes del usuario, verificar autorización si hay sesión activa
    if (sender === 'user') {
      const session = await getServerSession(authOptions);
      
      if (!session || !session.user?.id) {
        return NextResponse.json({ error: "Usuario no autenticado" }, { status: 401 });
      }
      
      if (existingChatSession.userId !== session.user.id) {
        return NextResponse.json({ error: "No autorizado para esta sesión de chat" }, { status: 403 });
      }
    }

    // Crear el mensaje
    const newMessage = await prisma.message.create({
      data: {
        chatSessionId: chatSessionId,
        sender: sender,
        content: content,
      },
      select: { id: true }, // Devolver solo el ID para confirmación
    });

    return NextResponse.json({ messageId: newMessage.id }, { status: 201 });

  } catch (error) {
    console.error(`Error al guardar mensaje:`, error);
    if (error instanceof SyntaxError) {
        return NextResponse.json({ error: "Cuerpo de solicitud inválido (JSON mal formado)" }, { status: 400 });
    } else if (error instanceof z.ZodError) {
        return NextResponse.json({ error: "Datos de mensaje inválidos (Zod)", details: error.format() }, { status: 400 });
    }
    return NextResponse.json({ error: "Error interno al guardar el mensaje" }, { status: 500 });
  }
} 