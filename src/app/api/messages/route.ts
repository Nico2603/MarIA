import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { z } from 'zod';

const messageSchema = z.object({
    chatSessionId: z.string().cuid(), // <<< CAMBIADO de sessionId
    sender: z.enum(['user', 'ai']),
    content: z.string().trim().min(1),
});

// POST /api/messages - Guarda un nuevo mensaje en una ChatSession
export async function POST(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user?.id) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const validation = messageSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({ error: "Datos de mensaje inválidos", details: validation.error.format() }, { status: 400 });
    }

    const { chatSessionId, sender, content } = validation.data; // <<< CAMBIADO de sessionId

    // Verificar que la ChatSession pertenezca al usuario actual
    const chatSessionOwner = await prisma.chatSession.findUnique({ // <<< CAMBIADO a chatSession
        where: { id: chatSessionId },
        select: { userId: true }
    });

    if (!chatSessionOwner) {
        return NextResponse.json({ error: "Sesión de chat no encontrada" }, { status: 404 });
    }

    if (chatSessionOwner.userId !== session.user.id) {
        return NextResponse.json({ error: "No autorizado para esta sesión de chat" }, { status: 403 });
    }

    // Crear el mensaje
    const newMessage = await prisma.message.create({
      data: {
        chatSessionId: chatSessionId, // <<< CAMBIADO de sessionId
        sender: sender,
        content: content,
      },
      select: { id: true }, // Devolver solo el ID para confirmación
    });

    return NextResponse.json({ messageId: newMessage.id }, { status: 201 }); // 201 Created

  } catch (error) {
    // Simplificar el log de errores, ya que no podemos acceder a `validation` o `body` aquí de forma segura.
    console.error(`Error al guardar mensaje para usuario ${session?.user?.id}:`, error);
    if (error instanceof SyntaxError) {
        // Este error ocurre si request.json() falla
        return NextResponse.json({ error: "Cuerpo de solicitud inválido (JSON mal formado)" }, { status: 400 });
    } else if (error instanceof z.ZodError) {
        // Este error debería ser capturado por la comprobación de validation.success, 
        // pero lo manejamos aquí por si acaso.
        return NextResponse.json({ error: "Datos de mensaje inválidos (Zod)", details: error.format() }, { status: 400 });
    }
    // Otros errores
    return NextResponse.json({ error: "Error interno al guardar el mensaje" }, { status: 500 });
  }
} 