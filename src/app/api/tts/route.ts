import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid'; // Para nombres de archivo únicos

// Inicializar el cliente de OpenAI
// Asegúrate de que OPENAI_API_KEY esté en tu .env.local
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Directorio donde se guardarán los archivos de audio (dentro de la carpeta public)
const audioDir = path.join(process.cwd(), 'public', 'audio');

// Asegurarse de que el directorio exista
if (!fs.existsSync(audioDir)) {
  fs.mkdirSync(audioDir, { recursive: true });
}

export async function POST(request: Request) {
  try {
    const { text, model = 'gpt-4o-mini-tts', voice = 'nova' } = await request.json();

    if (!text || typeof text !== 'string') {
      return NextResponse.json({ error: 'El texto es requerido y debe ser una cadena.' }, { status: 400 });
    }
    
    if (!process.env.OPENAI_API_KEY) {
       return NextResponse.json({ error: 'La clave API de OpenAI no está configurada.' }, { status: 500 });
    }

    console.log(`TTS Request - Modelo: ${model}, Voz: ${voice}, Texto: "${text.substring(0, 50)}..."`);

    // Generar el audio usando OpenAI SDK
    const mp3 = await openai.audio.speech.create({
      model: model,
      voice: voice,
      input: text,
      response_format: 'mp3',
    });

    // Crear un buffer del stream de respuesta
    const buffer = Buffer.from(await mp3.arrayBuffer());

    // Generar un nombre de archivo único
    const filename = `${uuidv4()}.mp3`;
    const filePath = path.join(audioDir, filename);

    // Guardar el buffer en un archivo
    await fs.promises.writeFile(filePath, buffer);
    console.log(`Audio guardado en: ${filePath}`);

    // Devolver la URL pública del archivo
    const audioUrl = `/audio/${filename}`; 
    
    return NextResponse.json({ audioUrl });

  } catch (error: unknown) {
    console.error('Error en API de TTS:', error);
    if (error instanceof OpenAI.APIError) {
      return NextResponse.json({ error: `Error de OpenAI TTS: ${error.message}` }, { status: error.status || 500 });
    } else if (error instanceof Error) {
      return NextResponse.json({ error: `Error en TTS: ${error.message}` }, { status: 500 });
    } else {
      return NextResponse.json({ error: 'Ocurrió un error desconocido al generar el audio TTS.' }, { status: 500 });
    }
  }
} 