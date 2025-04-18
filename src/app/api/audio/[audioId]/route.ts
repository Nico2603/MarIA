import { NextResponse } from 'next/server';
import path from 'path';
import fs from 'fs/promises';
import { stat } from 'fs/promises'; // Para obtener tamaño de archivo

// << NUEVO: Definir directorio donde se buscan los audios >>
const audioDir = path.join(process.cwd(), '.next', 'cache', 'audio');

// << ELIMINAR: Comentarios sobre caché >>

export async function GET(
  request: Request, 
  { params }: { params: { audioId: string } }
) {
  const audioId = params.audioId;

  if (!audioId) {
    return new NextResponse('Audio ID faltante', { status: 400 });
  }

  // << NUEVO: Construir la ruta completa al archivo esperado >>
  // Validar que audioId no contenga caracteres maliciosos (ej: "..")
  if (!/^[a-f0-9-]+$/.test(audioId)) {
    console.warn(`Intento de acceso con Audio ID inválido: ${audioId}`);
    return new NextResponse('Audio ID inválido', { status: 400 });
  }
  const filename = `${audioId}.mp3`;
  const filePath = path.join(audioDir, filename);

  console.log(`Solicitud de audio (FS) para archivo: ${filePath}`);
  
  try {
    // << NUEVO: Leer el archivo del sistema de archivos >>
    const fileStat = await stat(filePath);
    const buffer = await fs.readFile(filePath);

    console.log(`Sirviendo audio desde archivo: ${filename} (${buffer.length} bytes)`);

    // Devolver el buffer directamente con los headers correctos
    const headers = new Headers();
    headers.set('Content-Type', 'audio/mpeg'); // Asumimos MP3 porque lo guardamos así
    headers.set('Content-Length', fileStat.size.toString());
    // Opcional: Permitir almacenamiento en caché del navegador
    // headers.set('Cache-Control', 'public, max-age=3600'); 

    return new NextResponse(buffer, { status: 200, headers });

  } catch (error: any) {
    // Manejar específicamente el error "ENOENT" (File Not Found)
    if (error.code === 'ENOENT') {
      console.log(`Archivo de audio no encontrado: ${filePath}`);
      return new NextResponse('Audio no encontrado', { status: 404 });
    } else {
      // Otros errores de lectura de archivo
      console.error(`Error al leer archivo de audio ${filePath}:`, error);
      return new NextResponse('Error interno al servir el audio', { status: 500 });
    }
  }
}

// Necesitamos definir un tipo para la caché si queremos exportarla/importarla
// export type AudioCache = Map<string, Buffer>; 