import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';
import fs from 'fs/promises';

// Inicializar el cliente de OpenAI
// Asegúrate de que OPENAI_API_KEY esté en tu .env.local
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// << NUEVO: Definir directorio para audios temporales >>
const audioDir = path.join(process.cwd(), '.next', 'cache', 'audio');

// << NUEVO: Función para asegurar que el directorio exista >>
async function ensureAudioDirExists() {
  try {
    await fs.access(audioDir); // Comprobar si se puede acceder
  } catch (error) {
    // Si no existe o no se puede acceder, intentar crearlo
    try {
      await fs.mkdir(audioDir, { recursive: true });
      console.log(`Directorio de caché de audio creado: ${audioDir}`);
    } catch (mkdirError) {
      console.error(`Error crítico: No se pudo crear el directorio de caché de audio: ${audioDir}`, mkdirError);
      // Lanzar el error o manejarlo como sea apropiado para detener la ejecución si es necesario
      throw new Error("No se pudo configurar el almacenamiento de audio temporal.");
    }
  }
}

export async function POST(request: Request) {
  try {
    // Asegurar que el directorio exista antes de procesar
    await ensureAudioDirExists(); 
    
    const { text, model = 'gpt-4o-mini-tts', voice = 'nova' } = await request.json();

    if (!text || typeof text !== 'string') {
      return NextResponse.json({ error: 'El texto es requerido y debe ser una cadena.' }, { status: 400 });
    }
    
    if (!process.env.OPENAI_API_KEY) {
       return NextResponse.json({ error: 'La clave API de OpenAI no está configurada.' }, { status: 500 });
    }

    console.log(`TTS Request (FS) - Modelo: ${model}, Voz: ${voice}, Texto: "${text.substring(0, 50)}..."`);

    // Generar el audio usando OpenAI SDK
    const mp3 = await openai.audio.speech.create({
      model: model,
      voice: voice,
      input: text,
      response_format: 'mp3',
    });

    // Crear un buffer del stream de respuesta
    const buffer = Buffer.from(await mp3.arrayBuffer());

    // << NUEVO: Guardar en sistema de archivos >>
    const audioId = uuidv4();
    const filename = `${audioId}.mp3`;
    const filePath = path.join(audioDir, filename);

    await fs.writeFile(filePath, buffer);
    console.log(`Audio guardado en sistema de archivos: ${filePath}`);

    // Devolver el ID (que corresponde al nombre de archivo sin extensión)
    return NextResponse.json({ audioId });

  } catch (error: unknown) {
    console.error('Error en API de TTS (FS):', error);
    if (error instanceof OpenAI.APIError) {
      return NextResponse.json({ error: `Error de OpenAI TTS: ${error.message}` }, { status: error.status || 500 });
    } else if (error instanceof Error) {
      return NextResponse.json({ error: `Error en TTS: ${error.message}` }, { status: 500 });
    } else {
      return NextResponse.json({ error: 'Ocurrió un error desconocido al generar el audio TTS.' }, { status: 500 });
    }
  }
} 