import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

// POST /api/sessions - Crea una nueva ChatSession para el usuario autenticado
export async function POST(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user?.id) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  try {
    const userId = session.user.id;

    // Crear la nueva sesión de chat
    const newChatSession = await prisma.chatSession.create({
      data: {
        userId: userId,
        // endedAt y summary son opcionales y se rellenarán después
      },
      select: { // Devolver solo el ID para confirmar la creación
        id: true,
        createdAt: true, // Devolver createdAt también puede ser útil
      },
    });

    console.log(`Nueva ChatSession creada con ID: ${newChatSession.id} para usuario ${userId}`);

    return NextResponse.json(newChatSession);

  } catch (error) {
    console.error(`Error al crear nueva ChatSession para usuario ${session.user.id}:`, error);
    return NextResponse.json({ error: "Error interno al crear la sesión de chat" }, { status: 500 });
  }
} 