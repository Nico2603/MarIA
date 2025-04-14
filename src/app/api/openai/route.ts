import { NextResponse } from 'next/server';
import OpenAI from 'openai';
// Importar tipos específicos si es necesario, aunque 'openai' debería incluirlos
// Ejemplo: import { ChatCompletionRequestMessage } from 'openai';

// Inicializar el cliente de OpenAI
// Asegúrate de que OPENAI_API_KEY esté en tu .env.local
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: Request) {
  try {
    const { message } = await request.json();

    if (!message || typeof message !== 'string') {
      return NextResponse.json({ error: 'El mensaje debe ser una cadena de texto.' }, { status: 400 });
    }

    if (!process.env.OPENAI_API_KEY) {
       return NextResponse.json({ error: 'La clave API de OpenAI no está configurada.' }, { status: 500 });
    }

    // Crear la conversación con OpenAI
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo", // Puedes cambiar al modelo que prefieras (ej. "gpt-4")
      messages: [
        {
          role: "system",
          content: `Eres un asistente virtual de salud mental llamado AI Mental Health, especializado en ansiedad y depresión para usuarios en Colombia. 
          Tu tono debe ser empático, comprensivo y profesional. 
          Proporciona orientación inicial, información validada y estrategias de afrontamiento prácticas. 
          Recuerda siempre que no eres un reemplazo para un profesional de la salud mental. 
          Si detectas señales de crisis severa o pensamientos suicidas, prioriza la recomendación de buscar ayuda profesional inmediata o contactar líneas de emergencia colombianas (como la Línea 106).
          Adapta tu lenguaje para que sea claro y cercano al público colombiano. 
          Evita dar diagnósticos. Céntrate en psicoeducación y apoyo emocional inicial.
          Responde siempre en español colombiano.`
        },
        { role: "user", content: message },
      ],
      temperature: 0.7, // Ajusta la creatividad de la respuesta
      max_tokens: 250, // Limita la longitud de la respuesta
    });

    const aiResponse = completion.choices[0]?.message?.content;

    if (!aiResponse) {
      return NextResponse.json({ error: 'No se pudo obtener respuesta de OpenAI.' }, { status: 500 });
    }

    return NextResponse.json({ response: aiResponse });

  } catch (error: unknown) {
    console.error('Error en API de OpenAI:', error);
    if (error instanceof OpenAI.APIError) {
      return NextResponse.json({ error: `Error de OpenAI: ${error.message}` }, { status: error.status || 500 });
    } else if (error instanceof Error) {
      return NextResponse.json({ error: `Error: ${error.message}` }, { status: 500 });
    } else {
      return NextResponse.json({ error: 'Ocurrió un error desconocido al procesar la solicitud.' }, { status: 500 });
    }
  }
} 