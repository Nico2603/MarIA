import { NextResponse } from 'next/server';
import { ElevenLabsClient } from 'elevenlabs';

// Inicializar el cliente de ElevenLabs (ahora seguro en el servidor)
const elevenLabsApiKey = process.env.ELEVENLABS_API_KEY;
let elevenLabsClient: ElevenLabsClient | null = null;

if (elevenLabsApiKey) {
  elevenLabsClient = new ElevenLabsClient({ apiKey: elevenLabsApiKey });
  console.log("Cliente ElevenLabs STT inicializado en backend.");
} else {
  console.error("Error: Falta la clave API de ElevenLabs en el servidor (ELEVENLABS_API_KEY).");
}

export async function POST(request: Request) {
  if (!elevenLabsClient) {
    return NextResponse.json({ error: 'El servicio STT no está configurado en el servidor.' }, { status: 500 });
  }

  try {
    const formData = await request.formData();
    const audioFile = formData.get('audio') as File | null;

    if (!audioFile) {
      return NextResponse.json({ error: 'No se recibió archivo de audio.' }, { status: 400 });
    }

    console.log(`Backend STT: Recibido archivo de audio: ${audioFile.name}, tamaño: ${audioFile.size}, tipo: ${audioFile.type}`);

    // Llamar a ElevenLabs STT desde el backend
    const response = await elevenLabsClient.speechToText.convert({
        file: audioFile,
        model_id: "scribe_v1" // Modelo STT recomendado o disponible
    });

    console.log("Backend STT: Respuesta completa recibida:", response);
    
    // Extraer el texto de la respuesta JSON
    let transcriptionText = '';
    if (response && response.text) {
        transcriptionText = response.text;
    } else {
        // Loguear si la estructura de respuesta no es la esperada
        console.warn("Respuesta STT no contenía el campo 'text':", response);
    }
    
    console.log("Backend STT: Transcripción obtenida:", transcriptionText);

    if (!transcriptionText?.trim()) {
        // Añadir info de la respuesta al error si es posible
        const errorDetail = typeof response === 'object' ? JSON.stringify(response) : String(response);
        console.error("Fallo al extraer texto de la respuesta STT:", errorDetail);
        return NextResponse.json({ error: 'No se pudo obtener la transcripción.', details: errorDetail }, { status: 500 });
    }

    // Devolver la transcripción al frontend
    return NextResponse.json({ transcription: transcriptionText.trim() });

  } catch (error: unknown) {
    console.error('Error en API STT Backend:', error);
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido en STT.';
    // Evitar exponer detalles internos en producción si es necesario
    return NextResponse.json({ error: `Error procesando audio: ${errorMessage}` }, { status: 500 });
  }
} 