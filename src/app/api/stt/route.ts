import { NextResponse } from 'next/server';
import { createClient, DeepgramClient, DeepgramError, SyncPrerecordedResponse } from "@deepgram/sdk";

// Inicializar el cliente de Deepgram (seguro en el servidor)
const deepgramApiKey = process.env.DEEPGRAM_API_KEY;
let deepgramClient: DeepgramClient | null = null;

if (deepgramApiKey) {
  deepgramClient = createClient(deepgramApiKey);
  console.log("Cliente Deepgram STT inicializado en backend.");
} else {
  console.error("Error: Falta la clave API de Deepgram en el servidor (DEEPGRAM_API_KEY).");
}

export async function POST(request: Request) {
  if (!deepgramClient) {
    return NextResponse.json({ error: 'El servicio STT no está configurado en el servidor.' }, { status: 500 });
  }

  try {
    const formData = await request.formData();
    const audioFile = formData.get('audio') as File | null;

    if (!audioFile) {
      return NextResponse.json({ error: 'No se recibió archivo de audio.' }, { status: 400 });
    }

    console.log(`Backend STT (Deepgram): Recibido archivo: ${audioFile.name}, tamaño: ${audioFile.size}, tipo: ${audioFile.type}`);

    // Convertir File/Blob a Buffer para el SDK de Deepgram
    const audioBuffer = Buffer.from(await audioFile.arrayBuffer());

    // Llamar a Deepgram STT usando el SDK
    const { result, error } = await deepgramClient.listen.prerecorded.transcribeFile(
        audioBuffer,
        {
            model: 'nova-2', // Modelo recomendado por Deepgram
            language: 'es', // Especificar español
            smart_format: true, // Formato inteligente (puntuación, etc.)
            // Opcional: otras características como diarize: true, punctuate: true, etc.
        }
    );

    if (error) {
      console.error('Error desde Deepgram SDK:', error);
      // Intentar obtener un mensaje más específico si es un error de Deepgram
      const errorMessage = (error as DeepgramError)?.message || error.message || 'Error desconocido de Deepgram';
      throw new Error(`Error de Deepgram STT: ${errorMessage}`);
    }

    if (result) {
      // Extraer la transcripción del resultado
      const transcription = result.results?.channels?.[0]?.alternatives?.[0]?.transcript || '';
      console.log("Backend STT (Deepgram): Transcripción obtenida:", transcription);
      
      if (!transcription.trim()) {
           console.warn("Deepgram no devolvió transcripción útil.", result);
           return NextResponse.json({ error: 'No se pudo obtener la transcripción de Deepgram.' }, { status: 500 });
      }
      
      // Devolver la transcripción al frontend
      return NextResponse.json({ transcription: transcription.trim() });
    } else {
        // Caso inesperado donde no hay ni resultado ni error
        console.error('Respuesta inesperada de Deepgram: Sin resultado ni error.');
        return NextResponse.json({ error: 'Respuesta inesperada del servicio STT.' }, { status: 500 });
    }

  } catch (error: unknown) {
    console.error('Error en API STT Backend (Deepgram):', error);
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido en STT.';
    return NextResponse.json({ error: `Error procesando audio: ${errorMessage}` }, { status: 500 });
  }
} 