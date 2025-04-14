'use client';

import React from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useTheme } from '@/components/ThemeProvider';

const TecnicasRelajacionPage = () => {
  const { theme } = useTheme();

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-800'}`}>
      <div className="container mx-auto px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-3xl md:text-4xl font-bold mb-8 text-blue-600">Técnicas de Relajación y Mindfulness</h1>
          
          <p className={`mb-8 p-4 rounded-md ${theme === 'dark' ? 'bg-gray-800' : 'bg-blue-50'} text-base`}>
            Estas técnicas pueden ayudarte a manejar el estrés, la ansiedad y mejorar tu bienestar general. Son herramientas que puedes practicar en cualquier lugar. Recuerda que la práctica regular es clave para obtener beneficios.
          </p>

          {/* Respiración Diafragmática */}
          <div className={`rounded-lg p-6 mb-8 ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} shadow-md`}>
            <h2 className="text-2xl font-semibold mb-4">1. Respiración Diafragmática (Respiración Profunda)</h2>
            <p className="mb-4">
              Esta técnica ayuda a reducir la respuesta al estrés del cuerpo, disminuyendo la frecuencia cardíaca y la presión arterial. Es una base para muchas otras técnicas de relajación.
            </p>
            <h3 className="text-lg font-medium mb-2 text-blue-500">Pasos:</h3>
            <ol className="space-y-2 list-decimal pl-5 mb-4">
              <li>Siéntate o acuéstate en una posición cómoda. Coloca una mano sobre tu pecho y la otra sobre tu abdomen, justo debajo de las costillas.</li>
              <li>Inhala lenta y profundamente por la nariz, sintiendo cómo tu abdomen se expande (la mano sobre el abdomen debe subir). Intenta mantener la mano sobre el pecho lo más quieta posible.</li>
              <li>Mantén la respiración por un momento si te resulta cómodo.</li>
              <li>Exhala lentamente por la boca (o nariz), sintiendo cómo tu abdomen desciende.</li>
              <li>Continúa durante 5-10 minutos, concentrándote en el ritmo suave y calmado de tu respiración.</li>
            </ol>
            <p className="text-sm italic">Puedes probar la "Respiración Cuadrada": Inhala contando hasta 4, sostén 4, exhala 4, pausa 4.</p>
          </div>

          {/* Relajación Muscular Progresiva */}
          <div className={`rounded-lg p-6 mb-8 ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} shadow-md`}>
            <h2 className="text-2xl font-semibold mb-4">2. Relajación Muscular Progresiva (RMP)</h2>
            <p className="mb-4">
              La RMP consiste en tensar y luego relajar sistemáticamente diferentes grupos musculares del cuerpo. Ayuda a tomar conciencia de la tensión física y a liberarla.
            </p>
            <h3 className="text-lg font-medium mb-2 text-blue-500">Pasos básicos:</h3>
            <ol className="space-y-2 list-decimal pl-5 mb-4">
              <li>Ponte cómodo/a, preferiblemente acostado/a.</li>
              <li>Comienza por los pies: Tensa los músculos de los pies (apretando los dedos) durante unos 5 segundos.</li>
              <li>Relaja completamente los músculos de los pies, notando la sensación de liberación. Permanece así unos 15-20 segundos.</li>
              <li>Sube gradualmente por el cuerpo, tensando y relajando diferentes grupos musculares: pantorrillas, muslos, glúteos, abdomen, pecho, brazos, manos, cuello y cara.</li>
              <li>Concéntrate en la diferencia entre la sensación de tensión y la de relajación.</li>
            </ol>
             <p className="text-sm italic">Si tienes alguna lesión o dolor, omite o adapta el ejercicio para ese grupo muscular.</p>
          </div>

          {/* Atención Plena (Mindfulness) */}
          <div className={`rounded-lg p-6 mb-8 ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} shadow-md`}>
            <h2 className="text-2xl font-semibold mb-4">3. Atención Plena (Mindfulness)</h2>
            <p className="mb-4">
              Mindfulness significa prestar atención de manera intencional al momento presente, sin juzgar. Ayuda a reducir la rumiación y a conectar con la experiencia actual.
            </p>
            <h3 className="text-lg font-medium mb-2 text-blue-500">Prácticas sencillas:</h3>
            <ul className="space-y-2 list-disc pl-5 mb-4">
              <li><strong>Observación de la respiración:</strong> Simplemente nota las sensaciones de tu respiración entrando y saliendo de tu cuerpo, sin intentar cambiarla.</li>
              <li><strong>Escaneo corporal:</strong> Dirige tu atención a diferentes partes del cuerpo, notando cualquier sensación (calor, frío, tensión, contacto) sin juzgarla.</li>
              <li><strong>Atención a los sentidos:</strong> Elige un sentido (vista, oído, olfato, gusto, tacto) y enfócate en la información que recibes a través de él durante unos minutos. Por ejemplo, escucha atentamente los sonidos a tu alrededor.</li>
              <li><strong>Mindfulness en actividades diarias:</strong> Presta atención plena mientras realizas tareas cotidianas como caminar, comer o cepillarte los dientes. Nota las sensaciones, los movimientos, los olores.</li>
            </ul>
          </div>
          
           {/* Visualización Guiada */}
          <div className={`rounded-lg p-6 mb-8 ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} shadow-md`}>
            <h2 className="text-2xl font-semibold mb-4">4. Visualización Guiada</h2>
            <p className="mb-4">
              Consiste en usar la imaginación para crear imágenes mentales tranquilas y relajantes. Puede transportarte mentalmente a un lugar seguro y pacífico.
            </p>
            <h3 className="text-lg font-medium mb-2 text-blue-500">Cómo empezar:</h3>
            <ol className="space-y-2 list-decimal pl-5 mb-4">
              <li>Encuentra un lugar tranquilo y cierra los ojos.</li>
              <li>Imagina un lugar que te resulte profundamente relajante: una playa tranquila, un bosque sereno, una montaña con vistas amplias.</li>
              <li>Intenta involucrar todos tus sentidos en la visualización: ¿Qué ves? ¿Qué oyes (olas, pájaros)? ¿Qué hueles (mar, pino)? ¿Qué sientes (arena cálida, brisa fresca)?</li>
              <li>Permanece en este lugar imaginario durante unos minutos, absorbiendo la calma.</li>
            </ol>
            <p className="text-sm italic">Puedes encontrar muchas visualizaciones guiadas en audio en plataformas online.</p>
          </div>

          <div className={`rounded-lg p-6 mb-8 ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'} border-l-4 ${theme === 'dark' ? 'border-blue-400' : 'border-blue-500'}`}>
            <h2 className="text-xl font-semibold mb-3">Importante</h2>
            <p>
              Estas técnicas son herramientas de apoyo y autocuidado. Si experimentas ansiedad o depresión significativas, o si estas técnicas no son suficientes, es importante buscar el apoyo de un profesional de la salud mental en Colombia. Consulta a tu médico o a tu EPS para orientación.
            </p>
             <div className="mt-4">
              <Link 
                href="/recursos/profesionales" 
                className={`inline-flex items-center px-3 py-1 rounded-md text-sm ${theme === 'dark' ? 'bg-blue-600 hover:bg-blue-700' : 'bg-blue-500 hover:bg-blue-600'} text-white transition-colors duration-200`}
              >
                Buscar profesionales (Ejemplo)
                 <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </Link>
            </div>
          </div>

          <div className="flex justify-start mt-8">
            <Link 
              href="/recursos" 
              className={`inline-flex items-center px-4 py-2 rounded-md ${theme === 'dark' ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-200 hover:bg-gray-300'} transition-colors duration-200`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Volver a Recursos
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default TecnicasRelajacionPage; 