'use client'; // << AÑADIDO: Necesario para hooks como useSession y useRouter

import React from 'react';
import Link from 'next/link'; // Importar Link para el botón
import { useSession, signIn } from 'next-auth/react'; // << AÑADIDO
import { useRouter } from 'next/navigation'; // << AÑADIDO
import { toast } from 'sonner'; // << AÑADIDO (Asegúrate que esté instalado y configurado)
import { BrainCircuit, MessageSquareHeart, Sparkles } from 'lucide-react'; // Iconos para características
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"; // Asume que has copiado Avatar a tu UI
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel"; // Asume que has copiado Carousel a tu UI
import { Card, CardContent, CardHeader } from "@/components/ui/card"; // Asume que has copiado Card a tu UI
import { 
  Accordion, 
  AccordionContent, 
  AccordionItem, 
  AccordionTrigger 
} from "@/components/ui/accordion"; // Importar Accordion
import { 
  Tooltip, 
  TooltipContent, 
  TooltipProvider, 
  TooltipTrigger 
} from "@/components/ui/tooltip"; // Importar Tooltip

// Datos de ejemplo para testimonios
const testimonials = [
  {
    name: "Ana García",
    // image: "/images/ana-garcia.jpg", // Opcional: ruta a imagen
    initials: "AG",
    text: "María realmente me ha ayudado a entender mis patrones de ansiedad. La IA es sorprendentemente empática.",
    title: "Usuaria Verificada"
  },
  {
    name: "Carlos Pérez",
    initials: "CP",
    text: "Al principio era escéptico, pero las conversaciones con María se sienten naturales y me han dado herramientas útiles.",
    title: "Usuario Verificado"
  },
  {
    name: "Sofía López",
    // image: "/images/sofia-lopez.jpg",
    initials: "SL",
    text: "Tener un espacio seguro para hablar sin juicios ha marcado una gran diferencia en mi día a día. ¡Gracias!",
    title: "Usuaria Verificada"
  },
  {
    name: "David Martínez",
    initials: "DM",
    text: "Las técnicas de mindfulness que sugiere son fáciles de seguir y me han ayudado a reducir el estrés diario.",
    title: "Usuario Verificado"
  },
  {
    name: "Elena Ruiz",
    initials: "ER",
    text: "Me gusta cómo resume los puntos clave de nuestra conversación. Me ayuda a reflexionar después.",
    title: "Usuaria Verificada"
  },
];

// Datos para FAQ (Textos mejorados y una pregunta adicional)
const faqItems = [
  {
    question: "¿Son mis conversaciones realmente privadas y confidenciales?",
    answer: "Tu privacidad es nuestra máxima prioridad. Todas las conversaciones están encriptadas de extremo a extremo y completamente anonimizadas. Nadie más tiene acceso a ellas, ni siquiera nuestro equipo.",
    value: "item-1"
  },
  {
    question: "¿María puede sustituir a un terapeuta humano?",
    answer: "María es una herramienta de apoyo increíblemente útil, pero no reemplaza la terapia profesional. Si sientes que necesitas ayuda especializada, te animamos a contactar con un psicólogo o psiquiatra cualificado.",
    value: "item-2"
  },
  {
    question: "¿Cómo me ayuda la IA a entenderme mejor?",
    answer: "María utiliza inteligencia artificial para identificar patrones en tus conversaciones (siempre de forma anónima). Esto te ayuda a reconocer desencadenantes, entender mejor tus emociones y descubrir nuevas perspectivas sobre tus preocupaciones.",
    value: "item-3"
  },
  {
    question: "¿Qué tipo de ejercicios o recursos prácticos ofrece?",
    answer: "Encontrarás una variedad de técnicas validadas científicamente, como ejercicios guiados de respiración profunda, técnicas de mindfulness para el manejo del estrés, estrategias de reestructuración cognitiva y enlaces a recursos externos de confianza.",
    value: "item-4"
  },
  {
    question: "¿Cómo puedo empezar a hablar con María?",
    answer: "¡Es muy fácil! Simplemente haz clic en el botón 'Hablar con María' o 'Comenzar Ahora' en esta página. No necesitas registrarte ni crear una cuenta para iniciar tu primera conversación.",
    value: "item-5"
  }
];

// Componente principal de la Landing Page
export default function LandingPage() {
  const { data: session, status } = useSession(); // << AÑADIDO
  const router = useRouter(); // << AÑADIDO

  // << AÑADIDO: Manejador de clic para el enlace/botón del chat >>
  const handleChatLinkClick = (event: React.MouseEvent<HTMLElement>) => {
    event.preventDefault(); // Prevenir navegación por defecto del Link (si se usa <a>)

    if (status === 'authenticated') {
      router.push('/chat'); // Navegar a la página del chat
    } else if (status === 'unauthenticated') {
      toast.info('Debes iniciar sesión para hablar con María.', {
        action: {
          label: 'Iniciar Sesión',
          onClick: () => signIn('google'),
        },
      });
      // Opcional: iniciar sesión directamente: signIn('google');
    } else { // status === 'loading'
       toast.loading('Verificando sesión...');
       // No hacer nada mientras carga, el botón debería estar deshabilitado visualmente
    }
  };

  return (
    // Envolver con TooltipProvider
    <TooltipProvider>
      <div className="flex flex-col min-h-screen bg-gradient-to-b from-neutral-50 to-white dark:from-neutral-900 dark:to-neutral-800 overflow-x-hidden">
        {/* Sección Hero - Ajustar blurs y botón oscuro */}
        <section className="relative flex flex-col items-center justify-center text-center px-4 py-24 md:py-32 lg:py-48 overflow-hidden">
          {/* Fondo animado (gradiente ajustado en globals.css) */}
          <div className="absolute inset-0 animate-gradient dark:dark:animate-gradient opacity-50 dark:opacity-30 z-0"></div>
          {/* Elementos decorativos difuminados (ajustar colores oscuros) */}
          <div className="absolute top-0 right-0 -z-10 w-72 h-72 bg-primary-300/20 dark:bg-primary-500/30 rounded-full blur-3xl"></div> {/* Azul más claro */}
          <div className="absolute bottom-0 left-0 -z-10 w-96 h-96 bg-secondary-300/20 dark:bg-secondary-400/30 rounded-full blur-3xl"></div> {/* Verde más claro */}
          
          <div className="relative z-10 transition-opacity duration-1000 ease-in-out opacity-100 animate-fadeIn">
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold font-display text-neutral-900 dark:text-white mb-6 leading-tight text-shadow-subtle dark:dark:text-shadow-subtle">
              {/* Aplicar gradient-text */}
              Tu Compañera de <span className="gradient-text">Bienestar Mental</span> con IA
            </h1>
            <p className="text-lg md:text-xl text-neutral-600 dark:text-neutral-300 mb-10 max-w-3xl mx-auto text-shadow-subtle dark:dark:text-shadow-subtle">
              María te escucha, te comprende y te guía en tu camino hacia una mejor salud mental, utilizando inteligencia artificial avanzada para ofrecerte apoyo personalizado y empático.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {/* << MODIFICADO: Usar onClick en lugar de href directo >> */}
              <button
                onClick={handleChatLinkClick} 
                disabled={status === 'loading'} // Deshabilitar mientras carga sesión
                className={`button-shine inline-flex items-center justify-center whitespace-nowrap rounded-md text-lg font-semibold ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 h-11 px-8 shadow-soft hover:shadow-soft-lg transform hover:-translate-y-1 ${
                  status === 'loading' ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                {status === 'loading' ? 'Cargando...' : 'Hablar con María'}
              </button>
              <Link 
                href="#features"
                // Ajustar fondo oscuro del botón
                className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-lg font-semibold ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-700 text-neutral-700 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-600 h-11 px-8 shadow-soft hover:shadow-soft-lg transform hover:-translate-y-1" // Cambiado dark:bg-neutral-800 a 700 y hover a 600
              >
                Descubre Más
              </Link>
            </div>
          </div>
        </section>

        {/* Sección de Características - Aplicar glass-effect, card-hover y animaciones */}
        <section id="features" className="relative py-20 md:py-28 bg-white dark:bg-neutral-800 overflow-hidden">
          {/* Elementos decorativos difuminados */}
          <div className="absolute top-20 left-0 -z-10 w-64 h-64 bg-accent-300/10 dark:bg-accent-600/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 right-0 -z-10 w-80 h-80 bg-pink-300/10 dark:bg-pink-600/10 rounded-full blur-3xl"></div>

          <div className="container mx-auto px-4 relative z-10">
            {/* Aplicar gradient-text */}
            <h2 className="text-3xl md:text-4xl font-bold font-display text-center text-neutral-900 dark:text-white mb-16 gradient-text">
              ¿Cómo puede ayudarte María?
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-10">
              {/* Característica 1 con Tooltip */}
              <div 
                className="group rounded-lg p-0 card-hover glass-effect animate-fadeInUp opacity-0" 
                style={{ animationDelay: '100ms', animationFillMode: 'forwards' }}
              >
                <div className="p-6 flex flex-col space-y-4 text-neutral-900 dark:text-neutral-100">
                  <div className="flex items-center space-x-3">
                    <Tooltip>
                      <TooltipTrigger>
                        <div className="inline-flex items-center justify-center p-3 bg-primary-100 dark:bg-primary-900/50 rounded-lg">
                          <MessageSquareHeart className="w-6 h-6 text-primary-600 dark:text-primary-400" />
                        </div>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Conversaciones empáticas y sin juicio.</p>
                      </TooltipContent>
                    </Tooltip>
                    <h3 className="text-xl font-semibold font-display">Apoyo Conversacional</h3>
                  </div>
                  <p className="text-neutral-600 dark:text-neutral-300 pt-2">
                    Conversa de forma natural sobre tus preocupaciones. María está entrenada para entender y responder con empatía y sin juicios.
                  </p>
                </div>
              </div>
              {/* Característica 2 con Tooltip */}
              <div 
                className="group rounded-lg p-0 card-hover glass-effect animate-fadeInUp opacity-0" 
                style={{ animationDelay: '300ms', animationFillMode: 'forwards' }}
              >
                 <div className="p-6 flex flex-col space-y-4 text-neutral-900 dark:text-neutral-100">
                   <div className="flex items-center space-x-3">
                     <Tooltip>
                       <TooltipTrigger>
                         <div className="inline-flex items-center justify-center p-3 bg-secondary-100 dark:bg-secondary-900/50 rounded-lg">
                           <BrainCircuit className="w-6 h-6 text-secondary-600 dark:text-secondary-400" />
                         </div>
                       </TooltipTrigger>
                       <TooltipContent>
                         <p>Descubre patrones en tus pensamientos.</p>
                       </TooltipContent>
                     </Tooltip>
                    <h3 className="text-xl font-semibold font-display">Análisis Personalizado</h3>
                   </div>
                  <p className="text-neutral-600 dark:text-neutral-300 pt-2">
                    Recibe insights basados en IA sobre tus patrones de pensamiento y emociones, ayudándote a comprenderte mejor a ti mismo.
                  </p>
                </div>
              </div>
              {/* Característica 3 con Tooltip */}
              <div 
                className="group rounded-lg p-0 card-hover glass-effect animate-fadeInUp opacity-0" 
                style={{ animationDelay: '500ms', animationFillMode: 'forwards' }}
              >
                <div className="p-6 flex flex-col space-y-4 text-neutral-900 dark:text-neutral-100">
                   <div className="flex items-center space-x-3">
                    <Tooltip>
                      <TooltipTrigger>
                        <div className="inline-flex items-center justify-center p-3 bg-accent-100 dark:bg-accent-900/50 rounded-lg">
                          <Sparkles className="w-6 h-6 text-accent-600 dark:text-accent-400" />
                        </div>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Accede a técnicas y ejercicios validados.</p>
                      </TooltipContent>
                    </Tooltip>
                     <h3 className="text-xl font-semibold font-display">Recursos y Estrategias</h3>
                   </div>
                  <p className="text-neutral-600 dark:text-neutral-300 pt-2">
                    Accede a técnicas de manejo de la ansiedad y depresión, ejercicios de mindfulness y recursos validados por profesionales.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Sección de Testimonios - Añadir animación de entrada */}
        <section className="relative py-20 md:py-28 bg-neutral-50 dark:bg-neutral-900/50 overflow-hidden animate-fadeInUp opacity-0" style={{ animationDelay: '200ms', animationFillMode: 'forwards' }}>
          {/* Elementos decorativos difuminados */}
          <div className="absolute top-32 right-10 -z-10 w-72 h-72 bg-primary-200/30 dark:bg-primary-800/30 rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 left-10 -z-10 w-60 h-60 bg-secondary-200/20 dark:bg-secondary-700/20 rounded-full blur-3xl"></div>

          <div className="container mx-auto px-4 relative z-10">
            {/* Aplicar gradient-text */}
            <h2 className="text-3xl md:text-4xl font-bold font-display text-center text-neutral-900 dark:text-white mb-16 gradient-text">
              Lo que dicen nuestros usuarios
            </h2>

            <Carousel 
              opts={{ align: "start", loop: true }}
              autoplayOptions={{
                delay: 5000, 
                stopOnInteraction: true, 
              }}
              className="w-full max-w-xs sm:max-w-lg md:max-w-2xl lg:max-w-4xl mx-auto"
            >
              <CarouselContent>
                {testimonials.map((testimonial, index) => (
                  <CarouselItem key={index} className="md:basis-1/2 lg:basis-1/3">
                    <div className="p-1 h-full">
                      <Card className="h-full flex flex-col p-0 rounded-lg card-hover glass-effect transition-shadow duration-300">
                        <CardHeader className="flex flex-row items-center gap-4 pb-4 p-6">
                          <Avatar>
                            {/* <AvatarImage src={testimonial.image} alt={testimonial.name} /> */}
                            <AvatarFallback className="bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300">
                              {testimonial.initials}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex flex-col">
                            <p className="text-sm font-semibold text-neutral-900 dark:text-white">{testimonial.name}</p>
                            <p className="text-xs text-neutral-500 dark:text-neutral-400">{testimonial.title}</p>
                          </div>
                        </CardHeader>
                        <CardContent className="flex-grow p-6 pt-0">
                          <p className="text-neutral-700 dark:text-neutral-300 italic">
                            &ldquo;{testimonial.text}&rdquo;
                          </p>
                        </CardContent>
                      </Card>
                    </div>
                  </CarouselItem>
                ))}
              </CarouselContent>
              <CarouselPrevious className="hidden sm:flex" />
              <CarouselNext className="hidden sm:flex" />
            </Carousel>
          </div>
        </section>

        {/* Sección FAQ Mejorada - Añadir animación de entrada */}
        <section id="faq" className="py-20 md:py-28 bg-neutral-100 dark:bg-neutral-900 animate-fadeInUp opacity-0" style={{ animationDelay: '400ms', animationFillMode: 'forwards' }}>
          <div className="container mx-auto px-4 max-w-3xl">
             <h2 className="text-3xl md:text-4xl font-bold font-display text-center text-neutral-900 dark:text-white mb-12 gradient-text">
              Resolvemos tus dudas
            </h2>
            <Accordion type="single" collapsible className="w-full space-y-4"> {/* Añadir espacio entre items */}
              {faqItems.map((item) => (
                // Aplicar glass-effect al item y ajustar padding/clases
                <AccordionItem 
                  value={item.value} 
                  key={item.value} 
                  className="rounded-lg p-0 overflow-hidden glass-effect" // Aplicar glass, quitar border-b
                >
                  <AccordionTrigger className="text-left hover:no-underline text-lg font-medium text-neutral-800 dark:text-neutral-100 px-6 py-4">
                    {item.question}
                  </AccordionTrigger>
                  {/* Ajustar padding interno del contenido */}
                  <AccordionContent className="text-neutral-600 dark:text-neutral-300 px-6 pb-4">
                    {item.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </section>

        {/* Sección CTA - Aplicar fondo de olas */}
        <section className="relative py-20 md:py-28 text-white overflow-hidden">
           {/* Fondo de gradiente existente (puede quedarse o quitarse) */}
           <div className="absolute inset-0 -z-20 animated-gradient-bg opacity-70 dark:opacity-50"></div>
           {/* Fondo de olas animadas (encima del gradiente, debajo del contenido) */}
           <div className="absolute inset-0 -z-10 animated-waves-bg"></div>
          
          <div className="container mx-auto px-4 text-center relative z-10 transition-opacity duration-1000 ease-in-out opacity-100 animate-fadeInUp delay-500">
            {/* Aplicar gradient-text */}
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold font-display mb-6 gradient-text">
              Empieza tu camino hacia el bienestar hoy
            </h2>
            <p className="text-lg md:text-xl mb-10 max-w-2xl mx-auto text-white/90 dark:text-neutral-200/90">
              Da el primer paso hacia una mente más tranquila y resiliente. María está aquí para acompañarte en cada paso, ofreciéndote un espacio seguro y de apoyo.
            </p>
            {/* << MODIFICADO: Usar onClick en lugar de href directo >> */}
            <button
              onClick={handleChatLinkClick} 
              disabled={status === 'loading'} // Deshabilitar mientras carga sesión
              // Aplicar button-shine, quitar clases de color conflictivas
              className={`button-shine inline-flex items-center justify-center whitespace-nowrap rounded-md text-lg font-semibold ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-primary-700 h-11 px-10 shadow-md transform hover:scale-105 ${
                status === 'loading' ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              {status === 'loading' ? 'Cargando...' : 'Comenzar Ahora'}
            </button>
          </div>
        </section>
      </div>
    </TooltipProvider>
  );
}
