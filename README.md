# MarIA - Asistente de Salud Mental basado en IA

<div align="center">
  <img src="public/img/MarIA.png" alt="MarIA Logo" width="300px">
  <br>
  <strong>Un compañero de salud mental potenciado por inteligencia artificial</strong>
  <br><br>
  <a href="https://ai-mental-health-zyb6.onrender.com" target="_blank">Ver Demo en Vivo</a>
</div>

## 📖 Introducción

MarIA es un **chatbot de salud mental** impulsado por inteligencia artificial que integra **Next.js**, **TypeScript**, y las APIs más avanzadas para ofrecer soporte emocional y técnicas de relajación personalizadas en tiempo real. Diseñado para brindar empatía, guías de mindfulness y análisis de voz, MarIA acompaña a los usuarios en momentos de ansiedad, estrés o para fomentar su bienestar mental general.

[![Teilur Banner](public/img/teilur-banner.png)](https://www.teilur.ai/)

## 🔍 Características principales

- **Chat terapéutico**: Respuestas empáticas generadas por GPT-4.1-mini para sostener conversaciones profundas y seguras
- **Técnicas de relajación**: Guías de respiración y mindfulness adaptadas al usuario
- **Análisis de voz y emociones**: Procesamiento de audio con Deepgram Nova-2 para identificar tono, sentimientos y patrones emocionales
- **Comunicación en tiempo real**: Integración con LiveKit para chat de voz y texto sin latencia perceptible
- **Historial de sesiones**: Registro seguro de conversaciones y recomendaciones en PostgreSQL mediante Prisma
- **TTS y STT**: Conversión de texto a voz (GPT-4o-mini-tts) y voz a texto (Deepgram Nova-2) para una experiencia más natural
- **Autenticación segura**: Integración con Google OAuth y NextAuth para proteger los datos de los usuarios

## 📸 Capturas de pantalla

<div align="center">
  <table>
    <tr>
      <td align="center"><strong>Landing Page</strong></td>
      <td align="center"><strong>Chat Principal</strong></td>
    </tr>
    <tr>
      <td><img src="public/img/landingpage.png" alt="Landing Page" width="350px"></td>
      <td><img src="public/img/chatbot.png" alt="Chatbot Interface" width="350px"></td>
    </tr>
    <tr>
      <td align="center"><strong>Perfiles de Usuario</strong></td>
      <td align="center"><strong>Funcionalidades</strong></td>
    </tr>
    <tr>
      <td><img src="public/img/profiles.png" alt="User Profiles" width="350px"></td>
      <td><img src="public/img/chatbot.png" alt="Features" width="350px"></td>
    </tr>
  </table>
</div>

## 🚀 Tecnologías

- **Frontend**: 
  - Next.js (App Router)
  - TypeScript
  - Tailwind CSS + shadcn/ui
  - React

- **Backend**:
  - Prisma ORM
  - Supabase + PostgreSQL
  - NextAuth.js
  - Node.js

- **IA y APIs**:
  - OpenAI API
    - GPT-4.1-mini-2025-04-14 (para conversaciones principales)
    - GPT-3.5-turbo (para historial de conversaciones)
    - GPT-4o-mini-tts (para texto a voz)
  - Deepgram Nova-2 (para reconocimiento de voz y análisis emocional)
  - LiveKit (comunicación en tiempo real)
  - Google OAuth (autenticación)

- **Despliegue**:
  - Render.com

## 📂 Estructura del proyecto

```bash
AI-Mental-Health/
│
├── README.md
├── next.config.js
├── tailwind.config.js
├── package-lock.json
├── package.json
├── components.json
├── .gitignore
├── prompt.txt
├── next-env.d.ts
├── tsconfig.json
├── postcss.config.js
│
├── .git/
├── .vscode/
├── .cursor/
│
├── public/
│   ├── favicon.ico
│   ├── img/
│   │   ├── teilur-banner.png
│   │   ├── MarIA.png
│   │   ├── chatbot.png
│   │   ├── profiles.png
│   │   └── landingpage.png
│   ├── assets/
│   │   ├── main.js
│   │   └── main.css
│   ├── videos/
│   │   ├── voz.mp4
│   │   └── mute.mp4
│   ├── scripts/
│   └── styles/
│
├── prisma/
│   ├── schema.prisma
│   ├── migrations/
│   │   ├── migration_lock.toml
│   │   ├── 20250430063310_rename_session_to_chatsession/
│   │   ├── 20250430054609_add_nextauth_models/
│   │   └── 20250430040007_init/
│
├── types/
│   └── next-auth.d.ts
│
├── src/
    ├── middleware.ts
    ├── lib/
    │   ├── auth.ts
    │   ├── utils.ts
    │   └── prisma.ts
    ├── types/
    │   └── profile.ts
    ├── app/
        ├── globals.css
        ├── page.tsx
        ├── layout.tsx
        ├── api/
        │   ├── sessions/
        │   ├── chat-sessions/
        │   ├── messages/
        │   ├── summarize/
        │   ├── profile/
        │   ├── auth/
        │   ├── tts/
        │   ├── openai/
        │   ├── audio/
        │   ├── stt/
        │   └── livekit-token/
        ├── dashboard/
        ├── chat/
        ├── consejos/
        ├── contacto/
        ├── legal/
        │   ├── limitaciones/
        │   ├── aviso-legal/
        │   ├── cookies/
        │   ├── privacidad/
        │   └── terminos/
        ├── recursos/
        │   ├── page.tsx
        │   ├── profesionales/
        │   ├── crisis/
        │   ├── tecnicas/
        │   └── ansiedad/
        └── settings/
            └── profile/
```

## 🛠️ Instalación

1. **Clona el repositorio**:
   ```bash
   git clone https://github.com/Nico2603/MarIA.git
   cd MarIA
   ```

2. **Instala dependencias**:
   ```bash
   npm install
   ```

3. **Configura variables de entorno**:
   Crea un archivo `.env.local` con las siguientes variables:
   ```env
   # Servidor
   PORT=3000
   
   # Base de datos (Supabase)
   DATABASE_URL="postgresql://..."
   NEXT_PUBLIC_SUPABASE_URL=
   NEXT_PUBLIC_SUPABASE_ANON_KEY=
   
   # LiveKit
   LIVEKIT_API_KEY=
   LIVEKIT_API_SECRET=
   LIVEKIT_URL=
   NEXT_PUBLIC_LIVEKIT_URL=
   
   # OpenAI
   OPENAI_API_KEY=
   
   # Prisma (para producción)
   PRISMA_CLI_BINARY_TARGETS="rhel-openssl-1.0.x,native"
   ```

4. **Configura Prisma**:
   ```bash
   npx prisma generate
   npx prisma db push
   ```

5. **Ejecuta en desarrollo**:
   ```bash
   npm run dev
   ```

## 🚀 Despliegue en Render

### Configuración automática con render.yaml

El proyecto incluye un archivo `render.yaml` para despliegue automático:

```yaml
services:
  - type: web
    name: maria-frontend
    runtime: node
    buildCommand: |
      npm ci &&
      npx prisma generate &&
      npm run build
    startCommand: npm start
    plan: starter
    healthCheckPath: /api/health
    envVars:
      - key: NODE_ENV
        value: production
      - key: PRISMA_CLI_BINARY_TARGETS
        value: rhel-openssl-1.0.x,native
      - key: DATABASE_URL
        fromDatabase:
          name: maria-db
          property: connectionString
```

### Variables de entorno requeridas en Render

Configura estas variables en el dashboard de Render:

- `DATABASE_URL`: URL de conexión a PostgreSQL
- `NEXTAUTH_URL`: URL de tu aplicación en Render
- `NEXTAUTH_SECRET`: Clave secreta para NextAuth
- `GOOGLE_CLIENT_ID`: ID del cliente de Google OAuth
- `GOOGLE_CLIENT_SECRET`: Secreto del cliente de Google OAuth
- `OPENAI_API_KEY`: Clave de API de OpenAI
- `LIVEKIT_API_KEY`: Clave de API de LiveKit
- `LIVEKIT_API_SECRET`: Secreto de API de LiveKit
- `LIVEKIT_URL`: URL del servidor LiveKit
- `PRISMA_CLI_BINARY_TARGETS`: `rhel-openssl-1.0.x,native`

### Solución de problemas comunes

#### Error: ENOENT wasm-engine-edge.js

Este error se resuelve con las siguientes configuraciones ya incluidas en el proyecto:

1. **Schema de Prisma actualizado** con `engineType = "library"` y `binaryTargets`
2. **Scripts de build mejorados** con `prebuild` y `postbuild`
3. **Configuración de Next.js** con `serverComponentsExternalPackages`
4. **Variables de entorno** con `PRISMA_CLI_BINARY_TARGETS`

#### Pasos de troubleshooting:

1. Verifica que todas las variables de entorno estén configuradas
2. Asegúrate de que la versión de Node.js sea compatible (v20.11.0)
3. Revisa los logs de build en Render para errores específicos
4. Verifica que la base de datos esté accesible

## 📄 Licencia

Este proyecto está licenciado bajo © [Teilur, Inc.](https://www.teilur.ai/)

---

<div align="center">
  <p>Desarrollado con ❤️ por <a href="https://github.com/Nico2603">Nico2603</a></p>
  <p>© 2025 Teilur, Inc. Todos los derechos reservados</p