import { NextResponse } from 'next/server';
import { AccessToken } from 'livekit-server-sdk';

const apiKey = process.env.LIVEKIT_API_KEY;
const apiSecret = process.env.LIVEKIT_API_SECRET;
const livekitHost = process.env.LIVEKIT_URL;

// Cache simple en memoria para tokens
interface TokenCacheEntry {
  token: string;
  timestamp: number;
  participantName: string;
}

const tokenCache = new Map<string, TokenCacheEntry>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutos
const RATE_LIMIT_WINDOW = 10 * 1000; // 10 segundos
const MAX_REQUESTS_PER_WINDOW = 5;

// Rate limiting por participante
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

function isRateLimited(participantName: string): boolean {
  const now = Date.now();
  const participantData = rateLimitMap.get(participantName);
  
  if (!participantData || now > participantData.resetTime) {
    rateLimitMap.set(participantName, { count: 1, resetTime: now + RATE_LIMIT_WINDOW });
    return false;
  }
  
  if (participantData.count >= MAX_REQUESTS_PER_WINDOW) {
    return true;
  }
  
  participantData.count++;
  return false;
}

function getCachedToken(participantName: string, roomName: string): string | null {
  const cacheKey = `${participantName}-${roomName}`;
  const cached = tokenCache.get(cacheKey);
  
  if (cached && (Date.now() - cached.timestamp) < CACHE_DURATION) {
    console.log(`[Token API] Devolviendo token del caché para ${participantName}`);
    return cached.token;
  }
  
  if (cached) {
    tokenCache.delete(cacheKey);
  }
  
  return null;
}

function setCachedToken(participantName: string, roomName: string, token: string): void {
  const cacheKey = `${participantName}-${roomName}`;
  tokenCache.set(cacheKey, {
    token,
    timestamp: Date.now(),
    participantName
  });
  
  // Limpiar caché viejo periódicamente
  if (tokenCache.size > 100) {
    const now = Date.now();
    const entries = Array.from(tokenCache.entries());
    for (const [key, entry] of entries) {
      if (now - entry.timestamp > CACHE_DURATION) {
        tokenCache.delete(key);
      }
    }
  }
}

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

  // Rate limiting
  if (isRateLimited(participantName)) {
    console.warn(`[Token API] Rate limit excedido para ${participantName}`);
    return NextResponse.json(
      { error: 'Demasiadas solicitudes. Intenta de nuevo en unos segundos.' },
      { status: 429 }
    );
  }

  // Verificar caché
  const cachedToken = getCachedToken(participantName, roomName);
  if (cachedToken) {
    return NextResponse.json({ token: cachedToken });
  }

  console.log(`[Token API] Generando nuevo token para ${participantName} en sala ${roomName}`);

  // Construir objeto de metadata para el token
  const tokenMetadata: Record<string, string> = {};
  if (userId) tokenMetadata.userId = userId;
  if (username) tokenMetadata.username = username;
  if (latestSummary) tokenMetadata.latestSummary = latestSummary;
  
  // Manejar chatSessionId con mejor logging
  if (chatSessionId) {
    tokenMetadata.chatSessionId = chatSessionId;
    
    // Detectar si es una sesión temporal
    const isTempSession = chatSessionId.startsWith('temp_session_');
    console.log(`[Token API] ${isTempSession ? 'Sesión temporal' : 'Sesión activa'} - chatSessionId: ${chatSessionId}`);
    
    if (isTempSession) {
      console.log(`[Token API] Usando sesión temporal para participante ${participantName}. Una sesión real se asignará cuando inicie la conversación.`);
    }
  } else {
    console.warn(`[Token API] No se proporcionó chatSessionId para ${participantName}`);
  }

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
    
    // Guardar en caché
    setCachedToken(participantName, roomName, token);
    
    return NextResponse.json({ token });
  } catch (error) {
    console.error("Error generando el token JWT de LiveKit:", error);
    return NextResponse.json({ error: 'Error al generar el token de acceso.' }, { status: 500 });
  }
} 