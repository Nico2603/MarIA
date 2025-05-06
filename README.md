# MarIA - Asistente de Salud Mental basado en IA

<p align="center">
  <img src="https://user-images.githubusercontent.com/128390201/242078407-46ba9b82-a9b7-499d-9eec-1de7b7261c3c.png" alt="MarIA - Asistente de Salud Mental" width="600">
</p>

## Descripción General

MarIA es un innovador chatbot de salud mental desarrollado por [Teilur AI](https://www.teilur.ai/), el primer Venture Studio de IA Generativa en Latinoamérica. El nombre "MarIA" combina la serenidad y calma que proporciona el mar con el poder de la Inteligencia Artificial (IA), creando una experiencia terapéutica única.

Esta plataforma utiliza tecnologías avanzadas como OpenAI, Livekit y Deepgram para ofrecer una experiencia conversacional empática y personalizada. MarIA está diseñada para:

- Proporcionar apoyo emocional en momentos de ansiedad o estrés
- Ofrecer técnicas de relajación y mindfulness adaptadas al usuario
- Escuchar activamente y responder con empatía a las preocupaciones del usuario
- Sugerir recursos de salud mental y bienestar según las necesidades identificadas

## Tecnologías Utilizadas

*   **Framework Frontend:** [Next.js](https://nextjs.org/) (App Router) - Framework de React para construir aplicaciones web renderizadas en servidor.
*   **Lenguaje:** [TypeScript](https://www.typescriptlang.org/) - Superset tipado de JavaScript.
*   **Estilos:** [Tailwind CSS](https://tailwindcss.com/) - Framework CSS utility-first.
    *   **Componentes UI:** [shadcn/ui](https://ui.shadcn.com/) - Componentes reutilizables basados en Radix UI.
*   **ORM:** [Prisma](https://www.prisma.io/) - ORM para TypeScript y Node.js.
*   **Base de Datos:** PostgreSQL - Base de datos relacional robusta.
*   **IA / GPTs / APIs:**
    *   **OpenAI API** - Integración con modelos avanzados de lenguaje para generar respuestas empáticas.
    *   **Livekit** - Para comunicación en tiempo real.
    *   **Deepgram** - Para procesamiento y análisis de voz.
*   **Despliegue:** [Render](https://render.com/) - Plataforma cloud para hosting de aplicaciones web.

## Estructura del Proyecto

```
.
├── public/
│   └── assets/
│       └── MarIA.png            # Banner del proyecto
├── src/
│   ├── app/                     # Rutas y componentes (Next.js App Router)
│   ├── components/              # Componentes reutilizables
│   └── lib/                     # Utilidades, configuración de API, etc.
├── prisma/                      # Esquema de base de datos
├── types/                       # Definiciones de tipos TypeScript
└── [Archivos de configuración]  # next.config.js, tailwind.config.js, etc.
```

## Uso

El chatbot MarIA está disponible en línea como un servicio SaaS (Software as a Service) en:

🔗 [https://ai-mental-health-zyb6.onrender.com](https://ai-mental-health-zyb6.onrender.com)

### Características principales:

1. **Chat terapéutico**: Conversa con MarIA sobre tus preocupaciones y emociones.
2. **Técnicas de relajación**: Recibe guías de respiración y mindfulness.
3. **Análisis de emociones**: MarIA identifica patrones emocionales y ofrece perspectivas útiles.
4. **Disponibilidad 24/7**: Acceso a apoyo emocional en cualquier momento.
5. **Interfaz intuitiva**: Diseñada para proporcionar una experiencia calmante y reconfortante.

## Licencia

Este proyecto está desarrollado y licenciado bajo los términos y condiciones de © [Teilur, Inc.](https://www.teilur.ai/)

---

© [Teilur, Inc.](https://www.teilur.ai/)