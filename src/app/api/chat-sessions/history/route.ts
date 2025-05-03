import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma"; 
import { NextRequest, NextResponse } from "next/server"; // Importar NextRequest
import { z } from 'zod';

// Esquema Zod para validar parámetros de consulta de paginación
const paginationSchema = z.object({
  page: z.coerce.number().int().positive().default(1), // coerce convierte string a número
  pageSize: z.coerce.number().int().positive().max(100).default(10), // Limitar tamaño de página
});

// GET /api/chat-sessions/history - Obtiene el historial PAGINADO de ChatSessions finalizadas
export async function GET(request: NextRequest) { // Usar NextRequest para acceder a searchParams
  const session = await getServerSession(authOptions);

  if (!session || !session.user?.id) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  // Validar parámetros de consulta
  const { searchParams } = request.nextUrl;
  const queryParams = Object.fromEntries(searchParams.entries());
  const validationResult = paginationSchema.safeParse(queryParams);

  if (!validationResult.success) {
    return NextResponse.json(
      { error: "Parámetros de paginación inválidos", details: validationResult.error.format() },
      { status: 400 }
    );
  }

  const { page, pageSize } = validationResult.data;
  const skip = (page - 1) * pageSize;

  try {
    const userId = session.user.id;
    
    // Consulta para obtener las sesiones paginadas
    const chatSessionsHistory = await prisma.chatSession.findMany({
      where: {
        userId: userId,
        endedAt: { not: null }, 
      },
      orderBy: {
        createdAt: 'desc', 
      },
      select: {
        id: true,
        createdAt: true,
        endedAt: true,
        summary: true,
      },
      skip: skip,  // Aplicar skip
      take: pageSize, // Aplicar take
    });

    // Consulta para obtener el total de items que coinciden con el filtro
    const totalItems = await prisma.chatSession.count({
        where: {
            userId: userId,
            endedAt: { not: null }, 
        },
    });

    const totalPages = Math.ceil(totalItems / pageSize);

    // Devolver datos paginados y metadata
    return NextResponse.json({
        data: chatSessionsHistory,
        pagination: {
            totalItems,
            totalPages,
            currentPage: page,
            pageSize,
        }
    });

  } catch (error) {
    console.error(`Error al obtener el historial paginado de sesiones de chat para usuario ${session.user.id}:`, error);
    return NextResponse.json({ error: "Error interno del servidor al buscar historial paginado" }, { status: 500 });
  }
} 