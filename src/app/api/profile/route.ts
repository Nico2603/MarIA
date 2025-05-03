import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

// GET /api/profile - Obtener perfil del usuario actual
export async function GET(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user?.email) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  try {
    // Busca el usuario por email (más fiable que depender solo del ID de sesión)
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { profile: true }, // Incluye el perfil asociado
    });

    if (!user) {
      // Esto no debería pasar si la sesión es válida, pero por si acaso
      return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 });
    }

    // Si el usuario existe pero no tiene perfil, créalo
    let profile = user.profile;
    if (!profile) {
      profile = await prisma.profile.create({
        data: { 
          userId: user.id, 
          // Usar el nombre de la sesión de Google como username inicial
          username: session.user.name 
        }, 
      });
    }

    // Devuelve solo los datos del perfil
    return NextResponse.json(profile);
  } catch (error) {
    console.error("Error al obtener perfil:", error);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}

// PUT /api/profile - Actualizar perfil del usuario actual
export async function PUT(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user?.email) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { username, avatarUrl } = body;

    // Validación simple (puedes añadir Zod para validación más robusta)
    if (typeof username !== 'string' || username.trim() === '') {
        return NextResponse.json({ error: "Nombre de usuario inválido" }, { status: 400 });
    }
    // Podrías añadir validación para avatarUrl si es necesario (ej: ¿es una URL válida?)

    // Busca el usuario para obtener su ID
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true }, // Solo necesitamos el ID del usuario
    });

    if (!user) {
      return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 });
    }

    // Actualiza el perfil usando el userId
    // Usamos upsert para asegurarnos de que se cree si no existe (aunque GET debería haberlo creado)
    const updatedProfile = await prisma.profile.upsert({
      where: { userId: user.id },
      update: {
        username: username.trim(),
        avatarUrl: avatarUrl || null, // Guarda null si avatarUrl es vacío o undefined
      },
      create: {
        userId: user.id,
        username: username.trim(),
        avatarUrl: avatarUrl || null,
      },
    });

    return NextResponse.json(updatedProfile);
  } catch (error) {
    console.error("Error al actualizar perfil:", error);
     if (error instanceof SyntaxError) { // Error si el JSON del body es inválido
       return NextResponse.json({ error: "Formato de solicitud inválido" }, { status: 400 });
     }
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
} 