import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

// GET /api/admin/user-stats - Obtener estadísticas de usuarios (solo admin)
export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user?.id) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 });
    }

    // TODO: Implementar verificación de rol admin
    // Por ahora, cualquier usuario autenticado puede ver estadísticas básicas
    
    const url = new URL(request.url);
    const userId = url.searchParams.get('userId');

    if (userId) {
      // Estadísticas de un usuario específico
      const userStats = await getUserStats(userId);
      return NextResponse.json(userStats);
    } else {
      // Estadísticas generales del sistema
      const systemStats = await getSystemStats();
      return NextResponse.json(systemStats);
    }

  } catch (error) {
    console.error("Error obteniendo estadísticas:", error);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}

async function getUserStats(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      chatSessions: {
        include: {
          messages: true
        }
      },
      profile: true
    }
  });

  if (!user) {
    throw new Error("Usuario no encontrado");
  }

  const totalSessions = user.chatSessions.length;
  const totalMessages = user.chatSessions.reduce((sum, session) => sum + session.messages.length, 0);
  const activeSessions = user.chatSessions.filter(session => !session.endedAt).length;

  return {
    userId: user.id,
    email: user.email,
    name: user.name,
    createdAt: user.createdAt,
    profile: user.profile,
    stats: {
      totalSessions,
      totalMessages,
      activeSessions,
      averageMessagesPerSession: totalSessions > 0 ? Math.round(totalMessages / totalSessions) : 0
    }
  };
}

async function getSystemStats() {
  const [
    totalUsers,
    totalSessions,
    totalMessages,
    activeSessions,
    usersLastWeek,
    sessionsLastWeek
  ] = await Promise.all([
    prisma.user.count(),
    prisma.chatSession.count(),
    prisma.message.count(),
    prisma.chatSession.count({ where: { endedAt: null } }),
    prisma.user.count({
      where: {
        createdAt: {
          gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
        }
      }
    }),
    prisma.chatSession.count({
      where: {
        createdAt: {
          gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
        }
      }
    })
  ]);

  return {
    system: {
      totalUsers,
      totalSessions,
      totalMessages,
      activeSessions,
      averageMessagesPerSession: totalSessions > 0 ? Math.round(totalMessages / totalSessions) : 0
    },
    weekly: {
      newUsers: usersLastWeek,
      newSessions: sessionsLastWeek
    }
  };
} 