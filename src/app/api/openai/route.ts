import { NextResponse } from 'next/server';
import OpenAI from 'openai';
// Importar tipos específicos de OpenAI para un tipado más riguroso (Aborda Evaluación Punto 8)
import { ChatCompletionMessageParam } from 'openai/resources/chat/completions';
// Importar Zod para validación de esquemas (Aplica Sugerencia 3)
// Asegúrate de tener 'zod' instalado: npm install zod / yarn add zod
import { z } from 'zod';

// --- Configuración e Inicialización (Fuera de POST para optimizar cold starts - Aborda Evaluación Punto 7) ---

// Inicializar el cliente de OpenAI (Aborda Evaluación Punto 1)
// Asegúrate de que OPENAI_API_KEY esté en tu .env.local y NO tenga prefijo NEXT_PUBLIC_
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Prompt del sistema (Extraído para mantenibilidad - Aborda Evaluación Punto 8)
// Nota: Se mantiene la versión concisa optimizada previamente (Aborda parcialmente Punto 2)
// Una mayor modularización/reducción requeriría lógica externa o sacrificaría detalle.
const systemPromptContent = `
**Rol Principal:** Eres María, una asistente virtual psicóloga **especializada únicamente en manejo de ansiedad**. Tu tono es empático, cálido, sereno y profesional (español colombiano, trato de "tú"). **NO** diagnosticas, **NO** recetas medicación, **NO** eres terapeuta licenciada. Tu foco es **escucha activa y herramientas prácticas para la ansiedad**.

**Estilo Conversacional:**
* Natural y humano, evita respuestas robóticas.
* **Feedback/Reflejo Emocional:** Cada 2-3 turnos, valida o resume brevemente lo dicho por el usuario (Ej: "Entiendo que sientes X cuando Y. Debe ser difícil."). *Usa variaciones como: 'Comprendo...', 'Tiene sentido que...', 'Valido lo que sientes...'* 
* **Sin Repetición y Preguntas Claras:** 
    * **NUNCA** repitas saludos, frases de cortesía o preguntas idénticas. Varía tu lenguaje.
    * **Haz solo UNA pregunta clara y directa por turno.** Evita preguntas dobles o compuestas.
    * **REGLA ANTI-REPETICIÓN (INQUEBRANTABLE):** Antes de formular **cualquier** pregunta al usuario, **LEE LOS ÚLTIMOS 4 MENSAJES** (2 tuyos + 2 suyos). Si el usuario ya ha respondido a lo que ibas a preguntar, **no vuelvas a preguntar**. En su lugar, **profundiza** en un detalle nuevo o pasa a técnica/recomendación según corresponda.
* **Adaptable:** Ajusta lenguaje y ritmo al usuario. Sé paciente.
* **Auto-Revisión Rápida:** Antes de responder, revisa: ¿Mi pregunta es única y clara? ¿Estoy repitiendo algo reciente? Si es así, reformula.

**Enfoque Estricto en Ansiedad:**
* **ÚNICO TEMA:** Ansiedad y su manejo. **NUNCA** desvíes.
* **Redirección Inmediata:** Si usuario se desvía, reconoce brevemente (1 vez) y redirige **INMEDIATAMENTE** a ansiedad.

**Tipos de Ansiedad (Referencia Interna - NO Diagnosticar):**
* Generalizada, Social, Ataques Pánico, Fobia Específica, Ansiedad por Salud. *Guía interna.*

**Técnicas Prácticas (Explicación y Videos Opcionales):**
*   **Respiración 4-7-8:** 
    *   *Explicación Breve (para opción 'explicar'):* "Es una técnica simple para calmar tu sistema nervioso. Inhalas por la nariz (4s), sostienes (7s) y exhalas lentamente por la boca (8s)."
    *   *Guía Completa (para opción 'explicar' y luego 'practicar'):* "¡Claro! Aquí tienes los pasos para la respiración 4-7-8: 1. Siéntate o acuéstate cómodamente. 2. Pon una mano sobre tu pecho y la otra sobre tu abdomen. 3. Inhala suave y lentamente por la nariz contando mentalmente hasta 4, sintiendo cómo se eleva tu abdomen. 4. Sostén la respiración contando hasta 7. 5. Exhala todo el aire lentamente por la boca, haciendo un sonido suave, mientras cuentas hasta 8, sintiendo cómo tu abdomen baja. Eso es un ciclo completo. Intenta hacer 3 o 4 ciclos seguidos."
    *   *Video Opcional:* [Guía de Respiración 4-7-8](https://www.youtube.com/watch?v=EGO5m_DBzF8)
*   **Grounding 5-4-3-2-1:** 
    *   *Explicación Breve:* "Es un ejercicio para anclarte en el presente usando tus sentidos cuando te sientes abrumado/a."
    *   *Guía Completa:* "Este ejercicio te ayuda a conectar con tu entorno: 1. **Observa:** Nombra 5 cosas que puedas ver a tu alrededor. Fíjate en detalles. 2. **Toca:** Identifica 4 cosas que puedas tocar ahora mismo. Siente sus texturas. 3. **Escucha:** Presta atención y nombra 3 sonidos que puedas oír. 4. **Olfatea:** Identifica 2 olores distintos en tu entorno. 5. **Saborea/Piensa Positivo:** Nota 1 cosa que puedas saborear (o piensa en 1 cosa positiva sobre ti). Tómate tu tiempo con cada sentido."
    *   *Video Opcional:* [Técnica de Grounding 5-4-3-2-1](https://www.youtube.com/watch?v=ZKPAORd6PcM)
*   **Visualización Guiada:** 
    *   *Explicación Breve:* "Usaremos tu imaginación para crear mentalmente un lugar seguro y tranquilo, enfocándonos en los sentidos para inducir calma."
    *   *Guía Completa:* (Requiere guía interactiva, MANTENER enfoque anterior si se elige esta técnica, adaptando lenguaje sin "sistema") "Bien, cierra los ojos suavemente si te sientes cómodo/a. Imagina un lugar, real o inventado, donde te sientas completamente seguro/a y en paz... [Continuar guiando sensorialmente, un paso a la vez]"
    *   *Video Opcional (ejemplo práctico):* [Meditación Guiada con Luz Suave](https://www.youtube.com/watch?v=9svic7ldL2w)
*   **Cuenta Regresiva:** 
    *   *Explicación Breve:* "Es una forma simple de enfocar tu mente contando lentamente hacia atrás para distraerte de la ansiedad."
    *   *Guía Completa:* "Es muy sencillo: Elige un número, como 10 o 20. Cierra los ojos si quieres y empieza a contar lentamente hacia atrás, número por número, hasta llegar a 1. Concéntrate en cada número al decirlo mentalmente o en voz baja. Si te distraes, simplemente retoma la cuenta donde la dejaste."
    *   *Video Opcional:* (No se proporcionó)
*   **Diálogo Cognitivo Breve:** 
    *   *Explicación Breve:* "Consiste en cuestionar activamente los pensamientos ansiosos para verlos desde una perspectiva más equilibrada."
    *   *Guía Completa:* "Cuando notes un pensamiento ansioso, detente un momento y pregúntate: 1. ¿Qué evidencia real tengo de que esto es cierto? 2. ¿Hay alguna otra explicación posible para esta situación? 3. ¿Qué es lo peor que *realmente* podría pasar? ¿Y cómo lo afrontaría? 4. ¿Qué le diría a un amigo/a si tuviera este mismo pensamiento? El objetivo es examinar el pensamiento, no necesariamente eliminarlo, sino reducir su poder."
    *   *Video Opcional (contexto):* [Ejercicios para Calmar la Ansiedad](https://m.youtube.com/watch?v=XIoKLoCyHho)

**Aplicación de Técnicas (Flujo Actualizado):**
* **Proactivo y Temprano:** Introduce técnicas pronto al detectar necesidad/contexto.
* **Ansiedad Alta:** Interviene INMEDIATAMENTE con estabilización (Respiración/Grounding, sigue flujo abajo pero prioriza).
* **Contextualiza:** CONECTA siempre la técnica a lo dicho por el usuario.
* **Protocolo Introducción Técnica (Nuevo Flujo):**
    1.  **Identifica Técnica Relevante:** Menciona brevemente la técnica y su propósito general conectándolo al problema del usuario (ej: "Para eso que sientes, la respiración 4-7-8 podría ayudarte a calmarte.")
    2.  **Ofrece Opción (Explicación vs Video):** Si hay video disponible, pregunta: "Puedo explicarte cómo funciona paso a paso, o si prefieres, puedo proporcionarte un video corto que te guía visualmente. ¿Qué opción te gustaría más ahora?". (Si no hay video, omite la opción y pasa al paso 3a).
    3.  **Según Elección del Usuario:**
        *   **a) Si elige Explicación:** Proporciona la *Guía Completa* de la técnica en **un solo mensaje**. Finaliza preguntando si pudo intentarlo o cómo se sintió (ej: "Esos son los pasos. ¿Pudiste intentar seguir el ciclo completo? ¿Cómo te sentiste?").
        *   **b) Si elige Video:** Responde confirmando (ej: "Entendido, aquí tienes el video guía."). **NO incluyas tú misma el enlace**. (El backend añadirá 'suggestedVideo' a la respuesta). Finaliza preguntando si le gustaría intentar la técnica después de ver el video (ej: "Puedes verlo cuando quieras. ¿Te gustaría que intentemos practicarla juntos después?").
        *   **c) Si pide ambas o no está seguro:** Puedes empezar con la *Explicación Breve* y luego ofrecer el video como complemento ("Esa es la idea general. Si quieres la guía visual detallada, aquí te la puedo proporcionar.") y luego proceder según su respuesta.
* **REGLA CRÍTICA: Guía en UN SOLO MENSAJE:** Para técnicas que no sean inherentemente interactivas (como Respiración, Grounding, Cuenta Regresiva, Diálogo Cognitivo), **explica TODOS los pasos en UN SOLO mensaje.** NO guíes paso a paso esperando respuesta entre instrucciones.
* **REGLA CRÍTICA: Visualización Guiada (Excepción):** Esta técnica SÍ requiere guía interactiva paso a paso. Si el usuario la elige, guíala sensorialmente esperando respuesta entre pasos clave, adaptando el lenguaje para evitar mencionar "el sistema".
* **REGLA CRÍTICA POST-INTENTO (Tras Guía Completa):** Después de que el usuario responda a tu pregunta sobre cómo le fue al intentar la técnica (tras tu explicación completa), tu siguiente mensaje debe ser una pregunta única enfocada en su estado actual o la experiencia (ej: "¿Cómo te sientes ahora?", "¿Notaste algún cambio?", "¿Qué tal fue eso para ti?").
* **REGLA CRÍTICA MANEJO DE SOLICITUD DE VIDEO (Flexible):** Si el usuario pide el video en cualquier momento (y está disponible): Confirma que se lo proporcionarás (ej: "Claro, te proporciono el video sobre [técnica]."). **NO menciones al sistema.** Pregunta cómo prefiere continuar si estaban en medio de algo (ej: "Puedes verlo cuando quieras. ¿Continuamos con lo que hablábamos o prefieres tomarte un momento para el video?").

**Manejo de Crisis (Protocolo Seguridad Colombia):**
* **Señales:** Pánico extremo, ideas daño/suicidio, desesperación.
* **Pasos INMEDIATOS:** 1. Calma. 2. Estabilización Breve. 3. Derivación Urgente (**Línea 106 / 123 / Urgencias**). 4. Contención y Límites (NO seguir sesión normal).

**Estructura Sesión General (~15-20 min) - [Instrucción Externa controlará la introducción inicial]:**
1.  **(Inicio + Introducción Flujo):** Controlado externamente. La primera interacción real incluirá una instrucción para presentar el plan (entender -> técnicas -> resumen) y pedir acuerdo.
2.  **Evaluación Inicial (Min 1-3):** Tras la introducción, 2-3 preguntas abiertas generales para entender la situación.
3.  **Desarrollo (Min 3-15):** Profundiza. Feedback c/2-3 turnos. Aplica REGLA ANTI-REPETICIÓN. Introduce técnicas contextualizadas. Aplica REGLA POST-ACEPTACIÓN.
4.  **Cierre (Min 15-20):**
    * **Aviso Tiempo (~15 min):** Integra aviso sutil.
    * **Inicio Cierre (~20 min):** INICIA cierre firmemente al llegar/superar 20 min.
    * **Contenido:** Recapitulación, reconocimiento, chequeo emocional, 3 recomendaciones prácticas, despedida.
    * **Respeta Límite Tiempo.**

**Reglas Inquebrantables:**
1. FOCO ÚNICO: ANSIEDAD. Redirige INMEDIATAMENTE.
2. NO ALUCINAR/INVENTAR. Base: prompt + info usuario (ansiedad).
3. SEGUIR FLUJO GENERAL Y GESTIONAR TIEMPO.
4. **REGLA ANTI-REPETICIÓN (INQUEBRANTABLE):** Leer historial ANTES de preguntar.
5. **REGLA POST-ACEPTACIÓN:** Iniciar SOLO con paso 1 de la técnica.
6. **REGLA CIERRE TÉCNICA:** Tras último paso, preguntar "¿cómo te sientes ahora?".
7. LÍMITES CLAROS: NO diagnosticar, NO medicación, NO reemplazo terapia.
8. **REGLA DE FINALIZACIÓN (INQUEBRANTABLE):** Cuando detectes que el usuario quiere cerrar ("finalizar", "cerrar sesión", "ya basta", "terminar", "acabar", etc.) o si recibes el mensaje de sistema "USER_WANTS_TO_CLOSE", activa la regla de finalización inmediatamente: resumen de 1-2 frases + despedida única + **terminar**. **NO HAGAS MÁS PREGUNTAS.**

**Gestión del Tiempo (Instrucción para IA):**
* Recibirás: "[Contexto de Sesión: Han transcurrido X minutos...]".
* ~15 min (14-16): Integra aviso sutil tiempo restante.
* ~20 min (19+): INICIA fase Cierre FIRMEMENTE.
* Uso puntual: Menciona tiempo solo en esos momentos clave.

**Objetivo Final:** Asistente empática, segura, confiable, **enfocada en ansiedad**. Ofrecer escucha, alivio momentáneo y herramientas básicas, respetando límites/estructura y reglas conversacionales (especialmente anti-repetición, flujo de técnicas **y finalización clara**). Empoderar.
`;

// Constante para definir cuántos mensajes del historial mantener (Aborda Evaluación Punto 3 - Truncamiento Simple)
// Nota: El truncamiento avanzado o summarization requiere lógica más compleja/costosa.
const HISTORY_LENGTH = 12; // 6 intercambios user/assistant. Ajustable.

// Esquema de validación con Zod (Aplica Sugerencia 3)
const requestBodySchema = z.object({
  message: z.string().trim().min(1, { message: "El mensaje no puede estar vacío." }),
  history: z.array(z.object({ // Estructura básica del historial
    role: z.enum(["user", "assistant", "system"]),
    content: z.string(),
    // Podrías añadir aquí el 'elapsedMinutesReported' si lo envías desde el cliente
  })).optional().default([]),
  sessionStartTime: z.number().positive().optional(),
  // Flag para controlar la introducción del flujo desde el backend (Aplica Sugerencia 1 robusta)
  introduceFlow: z.boolean().optional().default(false),
  // Podrías añadir un clientRequestId aquí para trazabilidad E2E
  // clientRequestId: z.string().uuid().optional(),
});

// --- Lista de Keywords para detectar cierre ---
const CLOSE_KEYWORDS = [/finalizar/i, /cerrar sesión/i, /terminar/i, /acabar/i, /ya con esto/i, /suficiente por hoy/i, /vamos a cerrar/i, /dejémoslo aquí/i, /ya basta/i];

// --- Función Principal de la Ruta API ---

export async function POST(request: Request) {
  // Nota sobre Seguridad (Evaluación Punto 1): Implementar Rate Limiting (ej. con middleware Vercel o librerías) es crucial en producción.
  // Nota sobre Escalabilidad (Evaluación Punto 7): Considerar Streaming para mejorar UX en producción.

  let requestId = crypto.randomUUID(); // Generar un ID único para esta solicitud (Aplica Sugerencia 6)

  try {
    // Validación de Entrada con Zod (Aplica Sugerencia 3)
    let parsedBody;
    try {
      const body = await request.json();
      parsedBody = requestBodySchema.safeParse(body);

      if (!parsedBody.success) {
        console.error(`[${requestId}] Error de validación Zod:`, parsedBody.error.errors);
        // Devuelve los errores específicos de Zod para mejor depuración en desarrollo si es necesario
        return NextResponse.json({ error: 'Datos de solicitud inválidos.', details: parsedBody.error.format(), requestId }, { status: 400 });
      }
    } catch (parseError) {
      console.error(`[${requestId}] Error al parsear JSON de la solicitud:`, parseError);
      return NextResponse.json({ error: 'Cuerpo de la solicitud inválido o mal formado.', requestId }, { status: 400 });
    }

    const { message, history, sessionStartTime, introduceFlow } = parsedBody.data;
    // const providedRequestId = parsedBody.data.requestId; // Usar si el cliente envía un ID
    // if (providedRequestId) requestId = providedRequestId; // Sobrescribir si el cliente envía uno

    // Verifica clave API (ya fuera, pero doble check)
    if (!process.env.OPENAI_API_KEY) {
      console.error(`[${requestId}] CRITICAL: La clave API de OpenAI no está configurada.`);
      return NextResponse.json({ error: 'Error interno de configuración del servidor.', requestId }, { status: 500 });
    }

    // --- Preparación del Mensaje con Contexto de Tiempo (Aplica Sugerencia 8) ---
    let userMessageForAI = message;
    let elapsedMinutes = 0;
    let lastReportedMinute = -1;

    // Buscar el último minuto reportado en el historial (si existe)
    // Esto asume que el prefijo está en los mensajes del *asistente* o se añade explícitamente
    const lastAssistantMessageWithTime = history
      .filter(m => m.role === 'assistant' && m.content.startsWith('[Contexto de Sesión:'))
      .pop();
    if (lastAssistantMessageWithTime) {
      const match = lastAssistantMessageWithTime.content.match(/transcurrido (\d+) minutos/);
      if (match && match[1]) {
        lastReportedMinute = parseInt(match[1], 10);
      }
    }

    if (sessionStartTime) {
      const elapsedTimeMs = Date.now() - sessionStartTime;
      elapsedMinutes = Math.max(0, Math.floor(elapsedTimeMs / (60 * 1000)));

      // Solo añadir el prefijo si el minuto ha cambiado desde la última vez que se reportó
      if (elapsedMinutes > lastReportedMinute) {
        userMessageForAI = `[Contexto de Sesión: Han transcurrido ${elapsedMinutes} minutos de un máximo de 20.] ${message}`;
        console.log(`[${requestId}] Contexto de tiempo añadido: ${elapsedMinutes} min.`);
      } else {
        // Mantenemos el mensaje original sin prefijo si el minuto no ha cambiado
        console.log(`[${requestId}] Contexto de tiempo omitido (minuto ${elapsedMinutes} ya reportado).`);
      }
    } else {
      console.log(`[${requestId}] No sessionStartTime, omitiendo contexto de tiempo.`);
    }
    // ---------------------------------------------------------------------------

    // --- Detección de Intención de Cierre (Aplica Sugerencia 5) ---
    const wantsToClose = CLOSE_KEYWORDS.some(rx => rx.test(message));
    if (wantsToClose) {
      console.log(`[${requestId}] Detectada intención de cierre en mensaje: "${message}"`);
    }
    // -------------------------------------------------------------

    // --- Gestión del Contexto / Historial (Aplica Sugerencia 4) ---
    // Conserva los últimos HISTORY_LENGTH mensajes (intercambios).
    // Nota sobre límite de tokens (Sugerencia 4):
    // Para control estricto, estima los tokens ANTES de enviar (librería 'gpt-3-encoder' o similar).
    // Si excede el límite, aplica truncamiento/resumen más agresivo (ej: resumir mensajes antiguos
    // o mantener solo los N últimos intercambios + mensajes clave).
    const recentHistory = history.slice(-HISTORY_LENGTH);
    // -------------------------------------------------------------

    // Prepara los mensajes para la API usando tipos específicos
    const baseMessages: ChatCompletionMessageParam[] = [
      {
        role: "system",
        content: systemPromptContent
      },
      ...recentHistory, // Historial reciente truncado
    ];

    // Array final de mensajes a enviar
    let finalMessages: ChatCompletionMessageParam[] = [...baseMessages];

    // --- Lógica para Introducción del Flujo (Controlado por Backend) ---
    if (introduceFlow) {
      console.log(`[${requestId}] Flag introduceFlow=true detectado. Añadiendo instrucción especial.`);
      // Insertar instrucción *antes* del mensaje real del usuario
      finalMessages.push({
        role: "user",
        // Esta es una instrucción para el modelo, no parte de la conversación visible directa
        content: `Instrucción Especial para María (Ignorar en la respuesta directa al usuario): Este es el primer turno significativo. Debes introducir brevemente el enfoque de nuestra conversación: primero, quiero entender mejor cómo te sientes y qué está pasando; luego, exploraremos juntos algunas técnicas prácticas para manejar la ansiedad; y finalmente, haremos un pequeño resumen para que te lleves herramientas útiles. Pregunta al usuario si está de acuerdo con este camino. DESPUÉS de hacer eso, responde al mensaje real del usuario que viene a continuación.`
      });
    }
    // -------------------------------------------------------------------

    // Añadir el mensaje real del usuario al final
    finalMessages.push({ role: "user", content: userMessageForAI });

    // Añadir mensaje de sistema si se detectó intención de cierre
    if (wantsToClose) {
      finalMessages.push({ role: 'system', content: 'USER_WANTS_TO_CLOSE' });
    }

    // --- Llamada a la API de OpenAI ---
    // Nota sobre Parámetros:
    // - Modelo: Usando 'gpt-4.1-mini-2025-04-14' según requerido.
    // - Considera ajustar 'max_tokens', 'top_p', 'frequency_penalty'.
    // Nota sobre Caching:
    // - Para respuestas comunes, cachear (Redis/Vercel KV) ahorra costes.
    // Nota sobre Reintentos (Aplica Sugerencia 3.3):
    // - Implementar retry/backoff (ej. con async-retry) para errores transitorios (5xx).
    console.log(`[${requestId}] Enviando ${finalMessages.length} mensajes a OpenAI (${process.env.OPENAI_MODEL || 'gpt-4.1-mini-2025-04-14'})...`);
    const completion = await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL || "gpt-4.1-mini-2025-04-14",
      messages: finalMessages, // Usar el array final de mensajes
      temperature: 0.6, // Reducido para respuestas más consistentes
      max_tokens: 400,
      // Nota sobre Stop Sequences (Sugerencia 4):
      // Evaluar en pruebas si estas secuencias cortan respuestas. Si es así,
      // considerar eliminarlas o ajustarlas (ej. solo "\nUsuario:").
      stop: ["\nUsuario:", "\nHuman:", "\nUser:"],
      // stream: false,
    });
    // ------------------------------------

    // Extrae y valida respuesta
    const aiResponse = completion.choices[0]?.message?.content;
    if (!aiResponse) {
      console.error(`[${requestId}] Error: No se pudo obtener respuesta de OpenAI o la respuesta estaba vacía.`);
      return NextResponse.json({ error: 'No se pudo obtener respuesta del asistente.', requestId }, { status: 502 });
    }

    console.log(`[${requestId}] Respuesta recibida de OpenAI.`);
    let finalResponse = aiResponse;
    // --- FIN Lógica Introducción Flujo ---

    // --- Detección de Mención/Solicitud de Video y Modificación de Respuesta --- 
    let suggestedVideo: { title: string; url: string } | null = null;
    let videoDetected = false;

    // Mapa de keywords de técnicas y URLs (ajustar keywords si es necesario)
    const videoKeywordsMap: { [key: string]: { title: string; url: string } } = {
      'respiración 4-7-8': { title: 'Guía de Respiración 4-7-8', url: 'https://www.youtube.com/watch?v=EGO5m_DBzF8' },
      'grounding 5-4-3-2-1': { title: 'Técnica de Grounding 5-4-3-2-1', url: 'https://www.youtube.com/watch?v=ZKPAORd6PcM' },
      'visualización guiada': { title: 'Meditación Guiada con Luz Suave', url: 'https://www.youtube.com/watch?v=9svic7ldL2w' },
      'diálogo cognitivo': { title: 'Ejercicios para Calmar la Ansiedad', url: 'https://m.youtube.com/watch?v=XIoKLoCyHho' },
      // Añadir más si es necesario
    };

    // --- Lógica de Detección Refinada --- 
    console.log(`[${requestId}] Iniciando detección de video. Mensaje Usuario: "${message}"`);

    // 1. Verificar si el USUARIO pide el video explícitamente
    const videoRequestKeywords = [/video/i, /proporciona/i, /dame/i, /muestra/i, /link/i, /enlace/i];
    const userRequestsVideo = videoRequestKeywords.some(rx => rx.test(message)); // 'message' es el input original del usuario
    console.log(`[${requestId}] ¿Usuario pide video explícitamente?: ${userRequestsVideo}`);

    if (userRequestsVideo) {
      // Buscar contexto de la técnica en el mensaje ANTERIOR de María
      const lastAiMessage = history.filter(m => m.role === 'assistant').pop();
      if (lastAiMessage?.content) {
        console.log(`[${requestId}] Revisando mensaje anterior de IA para contexto: "${lastAiMessage.content.substring(0, 100)}..."`);
        const lowerLastAiContent = lastAiMessage.content.toLowerCase(); // Convertir a minúsculas una vez
        for (const techniqueKeyword in videoKeywordsMap) {
          // Usar includes() en lugar de regex
          if (lowerLastAiContent.includes(techniqueKeyword.toLowerCase())) {
            suggestedVideo = videoKeywordsMap[techniqueKeyword];
            videoDetected = true;
            console.log(`[${requestId}] --> Video DETECTADO por SOLICITUD del usuario sobre: ${techniqueKeyword} (en mensaje anterior)`);
            break; // Encontrado, salir del bucle
          }
        }
        if (!videoDetected) {
          console.log(`[${requestId}] Solicitud de video detectada, pero no se encontró keyword de técnica relevante en mensaje anterior.`);
        }
      } else {
        console.log(`[${requestId}] Solicitud de video detectada, pero no hay mensaje anterior de IA en el historial reciente.`);
      }
    }

    // 2. Si no fue una solicitud explícita o no se encontró en el contexto anterior, verificar si MARÍA mencionó el video y técnica en SU respuesta actual (Fallback)
    if (!videoDetected && aiResponse) {
      console.log(`[${requestId}] Revisando respuesta actual de IA para fallback: "${aiResponse.substring(0,100)}..."`);
      const mariaMentionsVideoKeywords = [/video/i, /visual/i, /guía visual/i, /proporcionarte/i];
      const mariaMentionsVideo = mariaMentionsVideoKeywords.some(rx => rx.test(aiResponse));
      
      if (mariaMentionsVideo) {
        const lowerAiResponse = aiResponse.toLowerCase(); // Convertir a minúsculas una vez
        for (const techniqueKeyword in videoKeywordsMap) {
          // Usar includes() en lugar de regex
          if (lowerAiResponse.includes(techniqueKeyword.toLowerCase())) { 
            suggestedVideo = videoKeywordsMap[techniqueKeyword];
            console.log(`[${requestId}] --> Video DETECTADO por MENCIÓN de María sobre: ${techniqueKeyword} (en respuesta actual)`);
            break; // Encontrado, salir del bucle
          }
        }
        if (!suggestedVideo) {
            console.log(`[${requestId}] Respuesta IA mencionó video/visual, pero no se encontró keyword de técnica asociada.`);
        }
      }
    }
    // -----------------------------------------------------------------

    console.log(`[${requestId}] Valor final de suggestedVideo antes de respuesta:`, suggestedVideo);

    // Devolver la respuesta de texto y opcionalmente el video sugerido
    return NextResponse.json({ 
      response: aiResponse, // Respuesta textual de María
      suggestedVideo // null si no se detectó, o {title, url} si sí
    });

  } catch (error: unknown) {
    // Manejo de Errores Mejorado (Aplica Sugerencia 6)
    // Nota sobre Retry/Backoff (Sugerencia 6): Para errores transitorios de API (ej. 5xx),
    // podrías implementar lógica de reintento con backoff exponencial antes de fallar.
    console.error(`[${requestId}] Error detallado en la ruta API de OpenAI:`, error);

    if (error instanceof OpenAI.APIError) {
      // Error específico de la API de OpenAI
      // Dentro de este bloque, TypeScript ya sabe que 'error' es de tipo OpenAI.APIError
      console.error(`[${requestId}] OpenAI API Error: status=${error.status}, message=${error.message}`);
      return NextResponse.json({ error: `Error de Servicio Externo: ${error.message}`, requestId }, { status: error.status || 500 });
    } else if (error instanceof z.ZodError) {
      // Error de validación Zod
      // Dentro de este bloque, TypeScript ya sabe que 'error' es de tipo z.ZodError
      console.error(`[${requestId}] Error de validación Zod:`, error.errors);
      return NextResponse.json({ error: 'Datos de solicitud inválidos.', details: error.format(), requestId }, { status: 400 });
    } else if (error instanceof SyntaxError && error.message.includes('JSON')) {
      // Error al parsear JSON (asegurarse que es de JSON)
      // Dentro de este bloque, TypeScript ya sabe que 'error' es de tipo SyntaxError
      console.error(`[${requestId}] Error de sintaxis JSON:`, error);
      return NextResponse.json({ error: 'Solicitud mal formada (JSON inválido).', requestId }, { status: 400 });
    } else if (error instanceof Error) {
      // Otros errores internos genéricos (captura Error base)
      // Dentro de este bloque, TypeScript ya sabe que 'error' es de tipo Error
      console.error(`[${requestId}] Error interno: ${error.message}`, error.stack);
      return NextResponse.json({ error: `Error interno: ${error.message}`, requestId }, { status: 500 });
    } else {
      // Error desconocido (si no es instancia de Error)
      console.error(`[${requestId}] Error interno desconocido:`, error);
      return NextResponse.json({ error: 'Ocurrió un error interno desconocido.', requestId }, { status: 500 });
    }
  }
}