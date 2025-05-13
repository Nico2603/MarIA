import { NextResponse } from 'next/server';
import { AccessToken } from 'livekit-server-sdk';

const apiKey = process.env.LIVEKIT_API_KEY;
const apiSecret = process.env.LIVEKIT_API_SECRET;
const livekitHost = process.env.LIVEKIT_URL;

export async function GET(request: Request) {
  if (!apiKey || !apiSecret || !livekitHost) {
    console.error('Error: Las variables de entorno de LiveKit no están configuradas en el servidor.');
    return NextResponse.json(
      { error: 'Configuración del servidor incompleta para LiveKit.' },
      { status: 500 }
    );
  }

  const url = new URL(request.url);
  const roomName = url.searchParams.get('room');
  const participantName = url.searchParams.get('participant') || `User_${Math.random().toString(36).substring(7)}`;

  // Leer metadata adicional de los query parameters
  const userId = url.searchParams.get('userId');
  const username = url.searchParams.get('username');
  const latestSummary = url.searchParams.get('latestSummary');
  const chatSessionId = url.searchParams.get('chatSessionId');

  if (!roomName) {
    return NextResponse.json({ error: 'Falta el parámetro "room".' }, { status: 400 });
  }

  // Construir objeto de metadata para el token
  const tokenMetadata: Record<string, string> = {};
  if (userId) tokenMetadata.userId = userId;
  if (username) tokenMetadata.username = username;
  if (latestSummary) tokenMetadata.latestSummary = latestSummary;
  if (chatSessionId) tokenMetadata.chatSessionId = chatSessionId;

  const at = new AccessToken(apiKey, apiSecret, {
    identity: participantName,
    // Añadir metadata al token. El agente la recibirá en job.participant.metadata
    metadata: JSON.stringify(tokenMetadata), 
  });

  at.addGrant({ 
    roomJoin: true, 
    room: roomName,
    canPublish: true,
    canSubscribe: true,
  });

  try {
    const token = await at.toJwt();
    return NextResponse.json({ token });
  } catch (error) {
    console.error("Error generando el token JWT de LiveKit:", error);
    return NextResponse.json({ error: 'Error al generar el token de acceso.' }, { status: 500 });
  }
} 