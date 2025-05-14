import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import OpenAI from 'openai';

// Constantes para la llamada a la API de OpenAI
const OPENAI_MODEL_NAME = "gpt-3.5-turbo";
const OPENAI_SUMMARY_TEMPERATURE = 0.5;
const OPENAI_MAX_SUMMARY_TOKENS = 150;
const OPENAI_SYSTEM_PROMPT_SUMMARY = "Eres un asistente experto en resumir conversaciones terapéuticas. Proporciona un resumen conciso (8-10 frases) de los temas clave tratados en la siguiente conversación entre un usuario y una IA llamada Maria. El resumen debe capturar los puntos emocionales o problemas principales mencionados por el usuario.";
const OPENAI_USER_PROMPT_CONVERSATION_PREFIX = "Conversación a resumir:\n\n";

// Inicialización del cliente OpenAI.
// La API Key se toma automáticamente de la variable de entorno OPENAI_API_KEY si no se provee explícitamente.
const openai = new OpenAI();

// La variable PYTHON_SUMMARY_SERVICE_URL ya no es necesaria aquí
// const PYTHON_SUMMARY_SERVICE_URL = process.env.PYTHON_SUMMARY_SERVICE_URL || "http://localhost:8000/summarize-text";

// POST /api/summarize - Genera y guarda un resumen para una ChatSession
export async function POST(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user?.id) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  if (!process.env.OPENAI_API_KEY) {
    console.error("La variable de entorno OPENAI_API_KEY no está configurada.");
    return NextResponse.json({ error: "Servicio de resumen no configurado correctamente (falta API Key)." }, { status: 503 });
  }

  let chatSessionId: string;
  try {
    const body = await request.json();
    chatSessionId = body.chatSessionId;
    if (!chatSessionId || typeof chatSessionId !== 'string') {
      throw new Error("ID de sesión de chat inválido o no proporcionado.");
    }
  } catch (error) {
    console.error("Error al parsear el cuerpo de la solicitud POST /api/summarize:", error);
    return NextResponse.json({ error: "Cuerpo de solicitud inválido" }, { status: 400 });
  }

  try {
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
    if (chatSession.summary) {
      console.log(`Resumen ya existe para sesión de chat ${chatSessionId}, devolviendo el existente.`);
      return NextResponse.json({ summary: chatSession.summary });
    }

    const messages = await prisma.message.findMany({
      where: { chatSessionId: chatSessionId },
      orderBy: { timestamp: 'asc' },
    });

    if (messages.length === 0) {
      return NextResponse.json({ error: "No hay mensajes en esta sesión de chat para resumir" }, { status: 400 });
    }

    type MessageType = typeof messages[number];
    const conversationText = messages
      .map((msg: MessageType) => `${msg.sender === 'user' ? 'Usuario' : 'Maria'}: ${msg.content}`)
      .join('\n');

    console.log(`Solicitando resumen para sesión de chat ${chatSessionId} a OpenAI...`);
    
    // Llamada directa a OpenAI
    const openaiResponse = await openai.chat.completions.create({
        model: OPENAI_MODEL_NAME,
        messages: [
            {"role": "system", "content": OPENAI_SYSTEM_PROMPT_SUMMARY},
            {"role": "user", "content": `${OPENAI_USER_PROMPT_CONVERSATION_PREFIX}${conversationText}`}
        ],
        temperature: OPENAI_SUMMARY_TEMPERATURE,
        max_tokens: OPENAI_MAX_SUMMARY_TOKENS,
    });

    const summary = openaiResponse.choices[0]?.message?.content?.trim();

    if (!summary) {
      console.error("OpenAI no devolvió contenido en el resumen.");
      throw new Error("OpenAI no devolvió un resumen.");
    }

    console.log(`Resumen generado por OpenAI para sesión de chat ${chatSessionId}`);

    await prisma.chatSession.update({
      where: { id: chatSessionId },
      data: { summary: summary },
    });

    return NextResponse.json({ summary: summary });

  } catch (error: unknown) {
    console.error(`Error en POST /api/summarize para chatSessionId ${chatSessionId}:`, error);
    
    let errorMessage = "Error interno del servidor procesando el resumen";
    let errorStatus = 500;

    if (error instanceof OpenAI.APIError) {
        console.error('Error de la API de OpenAI:', error);
        errorMessage = `Error de OpenAI: ${error.message}`;
        errorStatus = error.status || 500;
        return NextResponse.json({ error: errorMessage, details: error.status }, { status: errorStatus });
    } else if (error instanceof Error) {
        errorMessage = error.message;
    } // Si es otro tipo de error, se usa el mensaje genérico

    return NextResponse.json({ error: errorMessage }, { status: errorStatus });
  }
} 