# AI Mental Health - Chatbot de Voz

Asistente conversacional de voz especializado en salud mental (ansiedad y depresión) para **Colombia**, impulsado por IA.

## Descripción

Este proyecto implementa un chatbot de voz interactivo diseñado para ofrecer acompañamiento y orientación inicial en temas de ansiedad y depresión en el contexto colombiano. Utiliza tecnologías de IA (OpenAI) y comunicación en tiempo real (LiveKit) para crear una experiencia conversacional empática y accesible.

El enfoque principal es proporcionar un espacio seguro para que los usuarios en Colombia puedan hablar sobre sus preocupaciones y recibir información relevante, siempre recordando que **no sustituye a un profesional de la salud mental**.

### Características principales:

- **Interfaz de voz interactiva**: Conversación fluida mediante reconocimiento y síntesis de voz (API Web Speech y/o servicios externos).
- **Avatar animado**: Representación visual del asistente para mayor empatía.
- **Integración con OpenAI**: Generación de respuestas conversacionales relevantes y contextuales, adaptadas al lenguaje y recursos colombianos.
- **Tecnología LiveKit**: Gestión de la comunicación de audio en tiempo real.
- **Diseño minimalista y responsivo**: Interfaz clara y adaptable.
- **Enfoque en Colombia**: Orientado al contexto, lenguaje y recursos de emergencia colombianos (Línea 106, Línea 123).

## Tecnologías

- Next.js (React)
- TypeScript
- Tailwind CSS
- Framer Motion (animaciones)
- **OpenAI API** (procesamiento de lenguaje natural)
- **LiveKit** (WebRTC y audio en tiempo real)

## Instalación

1.  Clona este repositorio:
    ```bash
    git clone https://github.com/Nico2603/AI-Mental-Health.git
    cd AI-Mental-Health
    ```

2.  Instala las dependencias:
    ```bash
    npm install
    # O si usas yarn: yarn install
    ```

3.  Configura las variables de entorno:
    Crea un archivo `.env.local` en la raíz del proyecto y añade tus claves API:
    ```env
    # Clave API de OpenAI
    OPENAI_API_KEY=tu_clave_de_openai
    
    # Credenciales de LiveKit
    LIVEKIT_API_KEY=tu_api_key_de_livekit
    LIVEKIT_API_SECRET=tu_api_secret_de_livekit
    LIVEKIT_URL=wss://tu_url_de_livekit.livekit.cloud
    NEXT_PUBLIC_LIVEKIT_URL=wss://tu_url_de_livekit.livekit.cloud # URL pública para el cliente
    
    # Opcional: Puerto para desarrollo
    PORT=3000
    ```

4.  Inicia el servidor de desarrollo:
    ```bash
    npm run dev
    # O: yarn dev
    ```

5.  Abre [http://localhost:3000](http://localhost:3000) (o el puerto que definiste) en tu navegador.

## Planes futuros

- Expansión de la base de conocimientos y recursos
- Análisis de sentimientos y detección de situaciones críticas
- Personalización del asistente según las necesidades del usuario

## Contribuciones

Las contribuciones son bienvenidas. Por favor, abre un issue para discutir cualquier cambio importante antes de enviar un pull request.

## Aviso importante

Este asistente está diseñado para ofrecer orientación inicial y no sustituye la atención profesional. En caso de emergencia o crisis, contacta inmediatamente con la línea de emergencia nacional **123** o la Línea de Salud Mental **106** en Colombia.

## Licencia

[ISC](LICENSE)