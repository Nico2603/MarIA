import React from 'react';
import Link from 'next/link'; // Importar Link para el botón
import { BrainCircuit, MessageSquareHeart, Sparkles } from 'lucide-react'; // Iconos para características

// Componente principal de la Landing Page
export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-neutral-50 to-white dark:from-neutral-900 dark:to-neutral-800">
      {/* Sección Hero - Diseño mejorado */}
      <section className="relative flex flex-col items-center justify-center text-center px-4 py-24 md:py-32 lg:py-48 overflow-hidden">
        {/* Efecto de fondo animado */}
        <div className="absolute inset-0 animate-gradient dark:dark:animate-gradient opacity-50 dark:opacity-30 z-0"></div>
        
        {/* Contenido con animación */}
        <div className="relative z-10 transition-opacity duration-1000 ease-in-out opacity-100 animate-fadeIn">
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold font-display text-neutral-900 dark:text-white mb-6 leading-tight text-shadow-subtle dark:dark:text-shadow-subtle">
            Tu Compañera de <span className="text-primary-600">Bienestar Mental</span> con IA
          </h1>
          <p className="text-lg md:text-xl text-neutral-600 dark:text-neutral-300 mb-10 max-w-3xl mx-auto text-shadow-subtle dark:dark:text-shadow-subtle">
            María te escucha, te comprende y te guía en tu camino hacia una mejor salud mental, utilizando inteligencia artificial avanzada para ofrecerte apoyo personalizado y empático.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/chat" 
              className="btn btn-primary px-8 py-3 text-lg font-semibold shadow-soft hover:shadow-soft-lg transition duration-300 ease-in-out transform hover:-translate-y-1"
            >
              Hablar con María
            </Link>
            <a
              href="#features"
              className="btn btn-outline px-8 py-3 text-lg font-semibold shadow-soft hover:shadow-soft-lg transition duration-300 ease-in-out transform hover:-translate-y-1"
            >
              Descubre Más
            </a>
          </div>
        </div>
      </section>

      {/* Sección de Características - Diseño mejorado con iconos */}
      <section id="features" className="py-20 md:py-28 bg-white dark:bg-neutral-800">
        <div className="container mx-auto px-4 transition-opacity duration-1000 ease-in-out opacity-100 animate-fadeInUp delay-300">
          <h2 className="text-3xl md:text-4xl font-bold font-display text-center text-neutral-900 dark:text-white mb-16">
            ¿Cómo puede ayudarte María?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-10">
            {/* Característica 1 */}
            <div className="group bg-neutral-100 dark:bg-neutral-700 p-6 rounded-xl shadow-soft transition-all duration-300 ease-in-out hover:shadow-soft-lg hover:scale-[1.03] transform">
              <div className="mb-4 inline-flex items-center justify-center p-3 bg-primary-100 dark:bg-primary-900/50 rounded-lg">
                <MessageSquareHeart className="w-6 h-6 text-primary-600 dark:text-primary-400" />
              </div>
              <h3 className="text-xl font-semibold font-display text-neutral-800 dark:text-white mb-3">Apoyo Conversacional</h3>
              <p className="text-neutral-600 dark:text-neutral-300">
                Conversa de forma natural sobre tus preocupaciones. María está entrenada para entender y responder con empatía y sin juicios.
              </p>
            </div>
            {/* Característica 2 */}
            <div className="group bg-neutral-100 dark:bg-neutral-700 p-6 rounded-xl shadow-soft transition-all duration-300 ease-in-out hover:shadow-soft-lg hover:scale-[1.03] transform">
              <div className="mb-4 inline-flex items-center justify-center p-3 bg-secondary-100 dark:bg-secondary-900/50 rounded-lg">
                 <BrainCircuit className="w-6 h-6 text-secondary-600 dark:text-secondary-400" />
              </div>
              <h3 className="text-xl font-semibold font-display text-neutral-800 dark:text-white mb-3">Análisis Personalizado</h3>
              <p className="text-neutral-600 dark:text-neutral-300">
                Recibe insights basados en IA sobre tus patrones de pensamiento y emociones, ayudándote a comprenderte mejor a ti mismo.
              </p>
            </div>
            {/* Característica 3 */}
            <div className="group bg-neutral-100 dark:bg-neutral-700 p-6 rounded-xl shadow-soft transition-all duration-300 ease-in-out hover:shadow-soft-lg hover:scale-[1.03] transform">
              <div className="mb-4 inline-flex items-center justify-center p-3 bg-accent-100 dark:bg-accent-900/50 rounded-lg">
                 <Sparkles className="w-6 h-6 text-accent-600 dark:text-accent-400" />
              </div>
              <h3 className="text-xl font-semibold font-display text-neutral-800 dark:text-white mb-3">Recursos y Estrategias</h3>
              <p className="text-neutral-600 dark:text-neutral-300">
                Accede a técnicas de manejo de la ansiedad y depresión, ejercicios de mindfulness y recursos validados por profesionales.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Sección de Llamada a la Acción (CTA) - Diseño mejorado */}
      <section className="py-20 md:py-28 bg-gradient-to-r from-primary-600 to-secondary-500 text-white">
        <div className="container mx-auto px-4 text-center transition-opacity duration-1000 ease-in-out opacity-100 animate-fadeInUp delay-500">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold font-display mb-6">
            Empieza tu camino hacia el bienestar hoy
          </h2>
          <p className="text-lg md:text-xl mb-10 max-w-2xl mx-auto text-primary-100/90">
            Da el primer paso hacia una mente más tranquila y resiliente. María está aquí para acompañarte en cada paso, ofreciéndote un espacio seguro y de apoyo.
          </p>
          <Link
            href="/chat" 
            className="inline-block px-10 py-4 bg-white text-primary-600 font-semibold rounded-lg shadow-md hover:bg-neutral-50 transition duration-300 ease-in-out transform hover:scale-105 text-lg"
          >
            Comenzar Ahora
          </Link>
        </div>
      </section>
    </div>
  );
}
