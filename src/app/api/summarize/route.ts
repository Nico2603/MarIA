import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import OpenAI from 'openai';

const openai = new OpenAI({ // La clave API se toma automáticamente de process.env.OPENAI_API_KEY
  apiKey: process.env.OPENAI_API_KEY,
});

// POST /api/summarize - Genera y guarda un resumen para una ChatSession
export async function POST(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user?.id) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  let chatSessionId: string;
  try {
    const body = await request.json();
    chatSessionId = body.chatSessionId;
    if (!chatSessionId || typeof chatSessionId !== 'string') {
      throw new Error("ID de sesión de chat inválido o no proporcionado.");
    }
  } catch (error) {
    return NextResponse.json({ error: "Cuerpo de solicitud inválido" }, { status: 400 });
  }

  try {
    // 1. Verificar que la ChatSession pertenece al usuario y está finalizada (opcional pero bueno)
    const chatSession = await prisma.chatSession.findUnique({
      where: { id: chatSessionId },
      select: { userId: true, endedAt: true, summary: true }
    });

    if (!chatSession) {
      return NextResponse.json({ error: "Sesión de chat no encontrada" }, { status: 404 });
    }
    if (chatSession.userId !== session.user.id) {
      return NextResponse.json({ error: "No autorizado para esta sesión de chat" }, { status: 403 });
    }
    // Considerar si se requiere que endedAt no sea null para resumir
    // if (!chatSession.endedAt) {
    //   return NextResponse.json({ error: "La sesión de chat aún no ha finalizado" }, { status: 400 });
    // }
    // No resumir si ya existe un resumen
    if (chatSession.summary) {
      console.log(`Resumen ya existe para sesión de chat ${chatSessionId}.`);
      return NextResponse.json({ summary: chatSession.summary }); // Devolver resumen existente
    }

    // 2. Obtener mensajes de la ChatSession
    const messages = await prisma.message.findMany({
      where: { chatSessionId: chatSessionId },
      orderBy: { timestamp: 'asc' }, // Ordenar cronológicamente
    });

    if (messages.length === 0) {
      return NextResponse.json({ error: "No hay mensajes en esta sesión de chat para resumir" }, { status: 400 });
    }

    // Definir tipo basado en el array messages
    type MessageType = typeof messages[number];

    // 3. Formatear para OpenAI (ejemplo simple)
    const conversationText = messages
      .map((msg: MessageType) => `${msg.sender === 'user' ? 'Usuario' : 'Maria'}: ${msg.content}`)
      .join('\n');

    // 4. Llamar a OpenAI para generar resumen
    console.log(`Solicitando resumen para sesión de chat ${chatSessionId} a OpenAI...`);
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo", // Modelo sugerido por el usuario
      messages: [
        {
          role: "system",
          content: "Eres un asistente experto en resumir conversaciones terapéuticas. Proporciona un resumen conciso (8-10 frases) de los temas clave tratados en la siguiente conversación entre un usuario y una IA llamada Maria. El resumen debe capturar los puntos emocionales o problemas principales mencionados por el usuario."
        },
        {
          role: "user",
          content: `Conversación a resumir:\n\n${conversationText}`
        }
      ],
      temperature: 0.5, // Un poco de creatividad pero manteniendo fidelidad
      max_tokens: 150, // Límite para el resumen
    });

    const summary = completion.choices[0]?.message?.content?.trim();

    if (!summary) {
      throw new Error("OpenAI no devolvió un resumen.");
    }

    console.log(`Resumen generado para sesión de chat ${chatSessionId}: ${summary}`);

    // 5. Guardar resumen en la ChatSession
    await prisma.chatSession.update({
      where: { id: chatSessionId },
      data: { summary: summary },
    });

    return NextResponse.json({ summary: summary });

  } catch (error) {
    console.error(`Error al generar/guardar resumen para sesión de chat ${chatSessionId}:`, error);
    const errorMessage = error instanceof Error ? error.message : "Error interno del servidor";
    // Diferenciar errores de OpenAI
    if (error instanceof OpenAI.APIError) {
        return NextResponse.json({ error: `Error de OpenAI: ${error.message}` }, { status: error.status || 500 });
    }
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
} 