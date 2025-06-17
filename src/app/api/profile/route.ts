import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { NextResponse, NextRequest } from "next/server";
import { prisma } from "@/lib/prisma"; // Asegurar que prisma esté importado

// GET /api/profile - Obtener perfil del usuario actual simplificado para la página de perfil
// Esta ruta es usada por src/app/settings/profile/page.tsx
export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user?.email) { // session.user.email es necesario para buscar en Prisma
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { profile: true },
    });

    if (!user) {
      return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 });
    }

    let profile = user.profile;
    if (!profile) {
      // Si no existe perfil, crearlo con el nombre de usuario de la sesión
      profile = await prisma.profile.create({
        data: { 
          userId: user.id, 
          username: session.user.name, // Nombre de la sesión como predeterminado
          // avatarUrl puede ser seteado después por el usuario
        }, 
      });
    }
    // Devolver el perfil de Prisma (puede incluir username, avatarUrl, etc.)
    return NextResponse.json(profile);
  } catch (error) {
    console.error("Error al obtener perfil en /api/profile GET:", error);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}

// PUT /api/profile - Actualizar perfil del usuario actual (username, avatarUrl)
// Esta ruta es usada por src/app/settings/profile/page.tsx
export async function PUT(request: NextRequest) { // Cambiado a NextRequest
  const session = await getServerSession(authOptions);

  if (!session || !session.user?.email) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { username, avatarUrl } = body; // Datos que se pueden actualizar

    // Validación básica
    if (username !== undefined && (typeof username !== 'string' || username.trim() === '')) {
        return NextResponse.json({ error: "Nombre de usuario inválido" }, { status: 400 });
    }
    // Podrías añadir validación para avatarUrl si es una URL, etc.

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true }, 
    });

    if (!user) {
      return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 });
    }

    const dataToUpdate: { username?: string; avatarUrl?: string | null } = {};
    if (username !== undefined) dataToUpdate.username = username.trim();
    if (avatarUrl !== undefined) dataToUpdate.avatarUrl = avatarUrl || null;

    if (Object.keys(dataToUpdate).length === 0) {
      return NextResponse.json({ error: "No hay datos para actualizar" }, { status: 400 });
    }

    const updatedProfile = await prisma.profile.upsert({
      where: { userId: user.id },
      update: dataToUpdate,
      create: {
        userId: user.id,
        username: username ? username.trim() : session.user.name, // Nombre de sesión si username no se provee al crear
        avatarUrl: avatarUrl || null,
      },
    });

    return NextResponse.json(updatedProfile);
  } catch (error) {
    console.error("Error al actualizar perfil en /api/profile PUT:", error);
     if (error instanceof SyntaxError) { 
       return NextResponse.json({ error: "Formato de solicitud inválido" }, { status: 400 });
     }
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}

// PATCH /api/profile - Actualizar campos específicos del usuario (como phoneNumber para feedback)
export async function PATCH(request: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user?.email) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { phoneNumber } = body;

    // Validación del número telefónico colombiano
    if (phoneNumber !== undefined) {
      if (typeof phoneNumber !== 'string') {
        return NextResponse.json({ error: "Número telefónico debe ser una cadena" }, { status: 400 });
      }
      
      const cleanPhone = phoneNumber.replace(/\D/g, '');
      if (cleanPhone.length !== 10 || !cleanPhone.startsWith('3')) {
        return NextResponse.json({ 
          error: "Número telefónico inválido. Debe tener 10 dígitos y empezar con 3" 
        }, { status: 400 });
      }
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true },
    });

    if (!user) {
      return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 });
    }

    const dataToUpdate: { phoneNumber?: string | null } = {};
    if (phoneNumber !== undefined) {
      dataToUpdate.phoneNumber = phoneNumber ? phoneNumber.replace(/\D/g, '') : null;
    }

    if (Object.keys(dataToUpdate).length === 0) {
      return NextResponse.json({ error: "No hay datos para actualizar" }, { status: 400 });
    }

    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: dataToUpdate,
      select: { id: true, phoneNumber: true },
    });

    return NextResponse.json({ 
      success: true, 
      phoneNumber: updatedUser.phoneNumber 
    });
  } catch (error) {
    console.error("Error al actualizar usuario en /api/profile PATCH:", error);
    if (error instanceof SyntaxError) {
      return NextResponse.json({ error: "Formato de solicitud inválido" }, { status: 400 });
    }
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}