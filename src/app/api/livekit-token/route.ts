import { NextResponse } from 'next/server';
// import { AccessToken } from 'livekit-server-sdk'; // Comentado temporalmente

// const apiKey = process.env.LIVEKIT_API_KEY; // Comentado temporalmente
// const apiSecret = process.env.LIVEKIT_API_SECRET; // Comentado temporalmente
// const livekitHost = process.env.LIVEKIT_URL; // Comentado temporalmente

export async function GET(request: Request) {
  // Devolver siempre error 503 mientras no haya configuración
  return NextResponse.json(
    { error: 'Servicio de chat de voz no configurado. Credenciales de LiveKit pendientes.' },
    { status: 503 } // 503 Service Unavailable
  );

  /* Lógica original comentada temporalmente
  if (!apiKey || !apiSecret || !livekitHost) {
    return NextResponse.json(
      { error: 'Las variables de entorno de LiveKit no están configuradas.' },
      { status: 500 }
    );
  }

  const url = new URL(request.url);
  const roomName = url.searchParams.get('room');
  const participantName = url.searchParams.get('participant') || `Participant-${Math.random().toString(36).substring(2, 9)}`;

  if (!roomName) {
    return NextResponse.json({ error: 'Falta el parámetro "room".' }, { status: 400 });
  }

  // Crear un nuevo token de acceso
  const at = new AccessToken(apiKey, apiSecret, {
    identity: participantName,
    // TTL opcional (tiempo de vida del token en segundos)
    // ttl: '10m',
  });

  // Permitir al participante unirse a la sala especificada
  at.addGrant({ 
    roomJoin: true, 
    room: roomName,
    canPublish: true, // Permitir publicar audio/video
    canSubscribe: true, // Permitir suscribirse a otros participantes
  });

  // Generar el token
  const token = await at.toJwt();

  return NextResponse.json({ token });
  */
} 