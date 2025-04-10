'use client';

import React from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useTheme } from '@/components/ThemeProvider';

const CrisisPage = () => {
  const { theme } = useTheme();
  
  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-800'}`}>
      <div className="container mx-auto px-4 py-12">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-3xl md:text-4xl font-bold mb-8 text-blue-600">Manejo de Crisis</h1>
          
          <div className={`rounded-lg p-6 mb-8 ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} shadow-md`}>
            <h2 className="text-2xl font-semibold mb-4">¿Qué es una crisis de salud mental?</h2>
            <p className="mb-4">
              Una crisis de salud mental es una situación en la que una persona experimenta un episodio agudo de síntomas psicológicos o emocionales intensos que deterioran significativamente su funcionamiento normal y/o representan un riesgo para su seguridad o la de otros.
            </p>
            <p>
              Las crisis pueden manifestarse de diferentes formas, incluyendo ataques de pánico, pensamientos suicidas, episodios psicóticos, estados disociativos graves, o reacciones intensas a eventos traumáticos.
            </p>
          </div>
          
          <div className={`rounded-lg p-6 mb-8 ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} shadow-md bg-red-50 dark:bg-red-900/30 border-l-4 border-red-500 dark:border-red-600`}>
            <h2 className="text-2xl font-semibold mb-4 text-red-700 dark:text-red-400">Emergencias: Cuándo buscar ayuda inmediata</h2>
            <p className="mb-4 font-medium">
              Busca ayuda profesional inmediata o contacta servicios de emergencia (911/112) si tú o alguien cerca de ti experimenta:
            </p>
            <ul className="space-y-2 list-disc pl-5 mb-4">
              <li>Pensamientos o planes suicidas concretos</li>
              <li>Comportamiento que representa un peligro inmediato para sí mismo o para otros</li>
              <li>Alucinaciones o delirios severos que conducen a comportamientos peligrosos</li>
              <li>Incapacidad para cuidar de necesidades básicas (comer, beber, mantenerse a salvo)</li>
              <li>Intoxicación severa por sustancias combinada con cualquiera de los anteriores</li>
            </ul>
            <div className="bg-white dark:bg-gray-800 p-4 rounded-md mt-4">
              <p className="font-bold text-center mb-2">Números de emergencia y líneas de crisis</p>
              <ul className="space-y-2">
                <li className="flex items-center justify-between">
                  <span>Emergencias generales:</span>
                  <span className="font-bold">911 / 112</span>
                </li>
                <li className="flex items-center justify-between">
                  <span>Línea Nacional de Prevención del Suicidio:</span>
                  <span className="font-bold">988</span>
                </li>
                <li className="flex items-center justify-between">
                  <span>Teléfono de la Esperanza:</span>
                  <span className="font-bold">717 003 717</span>
                </li>
              </ul>
            </div>
          </div>
          
          <div className={`rounded-lg p-6 mb-8 ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} shadow-md`}>
            <h2 className="text-2xl font-semibold mb-4">Reconociendo señales de alerta</h2>
            <p className="mb-4">
              Las crisis de salud mental a menudo están precedidas por señales de alerta. Reconocerlas temprano puede permitir una intervención más efectiva:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
              <div>
                <h3 className="text-xl font-medium mb-3 text-blue-500">Señales emocionales/psicológicas</h3>
                <ul className="space-y-1 list-disc pl-5">
                  <li>Cambios drásticos de humor</li>
                  <li>Ansiedad o miedo intensos</li>
                  <li>Ira o irritabilidad extrema</li>
                  <li>Sentimientos abrumadores de desesperanza</li>
                  <li>Aislamiento social repentino</li>
                  <li>Paranoia o suspicacia inusual</li>
                  <li>Confusión o desorientación marcada</li>
                </ul>
              </div>
              <div>
                <h3 className="text-xl font-medium mb-3 text-blue-500">Señales comportamentales</h3>
                <ul className="space-y-1 list-disc pl-5">
                  <li>Hablar sobre hacerse daño o suicidarse</li>
                  <li>Desprenderse de posesiones valiosas</li>
                  <li>Aumento en el consumo de alcohol o drogas</li>
                  <li>Comportamiento errático o impredecible</li>
                  <li>Descuido significativo del autocuidado</li>
                  <li>Dificultad para realizar tareas cotidianas</li>
                  <li>Comportamiento agresivo inusual</li>
                </ul>
              </div>
            </div>
          </div>
          
          <div className={`rounded-lg p-6 mb-8 ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} shadow-md`}>
            <h2 className="text-2xl font-semibold mb-4">Protocolo TRIAGE para crisis mentales</h2>
            <p className="mb-4">
              El siguiente protocolo puede ayudarte a responder de manera efectiva durante una crisis, ya sea propia o de alguien más:
            </p>
            
            <div className="space-y-6">
              <div className={`p-4 rounded-md ${theme === 'dark' ? 'bg-gray-700' : 'bg-blue-50'}`}>
                <h3 className="text-xl font-medium mb-2 text-blue-500">T - Tranquilidad y seguridad</h3>
                <ul className="space-y-1 list-disc pl-5">
                  <li>Asegura que el entorno sea seguro para todos los involucrados</li>
                  <li>Habla en tono calmado, claro y firme</li>
                  <li>Reduce estímulos (ruido, luz intensa, muchas personas)</li>
                  <li>Mantén una distancia respetuosa y no amenazante</li>
                </ul>
              </div>
              
              <div className={`p-4 rounded-md ${theme === 'dark' ? 'bg-gray-700' : 'bg-blue-50'}`}>
                <h3 className="text-xl font-medium mb-2 text-blue-500">R - Respuesta empática</h3>
                <ul className="space-y-1 list-disc pl-5">
                  <li>Escucha activamente sin juzgar</li>
                  <li>Valida los sentimientos ("Entiendo que esto es muy difícil")</li>
                  <li>Evita minimizar la experiencia o usar frases como "cálmate" o "no es para tanto"</li>
                  <li>Usa lenguaje sencillo y directo</li>
                </ul>
              </div>
              
              <div className={`p-4 rounded-md ${theme === 'dark' ? 'bg-gray-700' : 'bg-blue-50'}`}>
                <h3 className="text-xl font-medium mb-2 text-blue-500">I - Identificar necesidades</h3>
                <ul className="space-y-1 list-disc pl-5">
                  <li>Pregunta directamente: "¿Qué necesitas ahora mismo?"</li>
                  <li>Evalúa si hay riesgo inmediato de daño</li>
                  <li>Determina si la persona ha tomado medicamentos o sustancias</li>
                  <li>Identifica si hay necesidades básicas no cubiertas (agua, comida, descanso)</li>
                </ul>
              </div>
              
              <div className={`p-4 rounded-md ${theme === 'dark' ? 'bg-gray-700' : 'bg-blue-50'}`}>
                <h3 className="text-xl font-medium mb-2 text-blue-500">A - Apoyo y acción</h3>
                <ul className="space-y-1 list-disc pl-5">
                  <li>Ofrece opciones simples y claras (no abrumes con decisiones)</li>
                  <li>Sugiere técnicas de regulación (respiración profunda, anclaje sensorial)</li>
                  <li>Contacta a profesionales o servicios de emergencia si es necesario</li>
                  <li>Ayuda a establecer contacto con personas de confianza</li>
                </ul>
              </div>
              
              <div className={`p-4 rounded-md ${theme === 'dark' ? 'bg-gray-700' : 'bg-blue-50'}`}>
                <h3 className="text-xl font-medium mb-2 text-blue-500">G - Gestionar el seguimiento</h3>
                <ul className="space-y-1 list-disc pl-5">
                  <li>Asegúrate de que la persona tenga un plan para las próximas horas</li>
                  <li>Facilita la conexión con recursos profesionales</li>
                  <li>Ofrece acompañamiento si es apropiado</li>
                  <li>Realiza un seguimiento posterior</li>
                </ul>
              </div>
              
              <div className={`p-4 rounded-md ${theme === 'dark' ? 'bg-gray-700' : 'bg-blue-50'}`}>
                <h3 className="text-xl font-medium mb-2 text-blue-500">E - Equilibrio personal</h3>
                <ul className="space-y-1 list-disc pl-5">
                  <li>Cuida de tu propio bienestar durante y después de la crisis</li>
                  <li>Reconoce tus límites y busca apoyo si lo necesitas</li>
                  <li>Procesa tus propias emociones después del evento</li>
                  <li>Recuerda que no eres responsable de "arreglar" todo</li>
                </ul>
              </div>
            </div>
          </div>
          
          <div className={`rounded-lg p-6 mb-8 ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} shadow-md`}>
            <h2 className="text-2xl font-semibold mb-4">Técnicas de estabilización rápida</h2>
            
            <h3 className="text-xl font-medium mb-3 text-blue-500">Técnica de anclaje 5-4-3-2-1</h3>
            <p className="mb-2">
              Útil para momentos de ansiedad aguda, pánico o disociación. Nombra:
            </p>
            <ul className="space-y-1 list-disc pl-5 mb-6">
              <li><strong>5 cosas que puedes VER</strong> a tu alrededor</li>
              <li><strong>4 cosas que puedes TOCAR/SENTIR</strong> (textura de tu ropa, el aire en tu piel)</li>
              <li><strong>3 cosas que puedes OÍR</strong> (sonidos cercanos o distantes)</li>
              <li><strong>2 cosas que puedes OLER</strong> (o imaginar oler)</li>
              <li><strong>1 cosa que puedes SABOREAR</strong> (o imaginar saborear)</li>
            </ul>
            
            <h3 className="text-xl font-medium mb-3 text-blue-500">Respiración cuadrada</h3>
            <p className="mb-2">
              Ayuda a regular el sistema nervioso durante momentos de estrés intenso:
            </p>
            <ol className="space-y-1 list-decimal pl-5 mb-6">
              <li>Inhala contando hasta 4</li>
              <li>Mantén el aire contando hasta 4</li>
              <li>Exhala contando hasta 4</li>
              <li>Mantén los pulmones vacíos contando hasta 4</li>
              <li>Repite el ciclo varias veces</li>
            </ol>
            
            <h3 className="text-xl font-medium mb-3 text-blue-500">Técnica de contacto físico</h3>
            <p className="mb-2">
              Útil para reconectar con el cuerpo durante estados disociativos:
            </p>
            <ul className="space-y-1 list-disc pl-5 mb-6">
              <li>Presiona los pies firmemente contra el suelo</li>
              <li>Frota tus manos entre sí, notando la temperatura y sensación</li>
              <li>Sostén un objeto (preferiblemente con textura) y concentra tu atención en cómo se siente</li>
              <li>Aplica presión moderada en diferentes puntos del cuerpo (brazos, piernas)</li>
            </ul>
          </div>
          
          <div className={`rounded-lg p-6 mb-8 ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} shadow-md`}>
            <h2 className="text-2xl font-semibold mb-4">Plan de prevención de crisis</h2>
            <p className="mb-4">
              Desarrollar un plan personalizado cuando estás estable puede ser invaluable durante una crisis futura:
            </p>
            
            <div className={`p-5 rounded-md ${theme === 'dark' ? 'bg-gray-700' : 'bg-green-50'} mb-4`}>
              <h3 className="text-xl font-medium mb-3 text-green-600 dark:text-green-400">Elementos de un plan de crisis efectivo:</h3>
              <ul className="space-y-2 list-disc pl-5">
                <li><strong>Señales de alerta personales:</strong> Identifica tus propias señales tempranas de crisis</li>
                <li><strong>Estrategias de afrontamiento:</strong> Lista de técnicas que funcionan para ti</li>
                <li><strong>Contactos de emergencia:</strong> Profesionales, amigos y familiares de confianza</li>
                <li><strong>Medicamentos:</strong> Nombres, dosis, efectos secundarios, médico que los recetó</li>
                <li><strong>Preferencias de tratamiento:</strong> Lo que ha funcionado o no en el pasado</li>
                <li><strong>Responsabilidades diarias:</strong> Plan para quien se hará cargo de obligaciones (mascotas, niños, trabajo)</li>
                <li><strong>Palabras de esperanza:</strong> Recordatorios de que las crisis son temporales</li>
              </ul>
            </div>
            
            <p className="italic text-sm">
              Comparte este plan con personas de confianza y profesionales de salud mental, y revísalo periódicamente para mantenerlo actualizado.
            </p>
          </div>
          
          <div className={`rounded-lg p-6 mb-8 ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} shadow-md`}>
            <h2 className="text-2xl font-semibold mb-4">Después de una crisis: Recuperación</h2>
            <p className="mb-4">
              El período posterior a una crisis es crucial para la recuperación a largo plazo:
            </p>
            <ul className="space-y-2 list-disc pl-5 mb-6">
              <li><strong>Busca seguimiento profesional:</strong> Programa una cita con un profesional de salud mental, incluso si te sientes mejor</li>
              <li><strong>Revisa lo sucedido:</strong> Analiza qué desencadenó la crisis y qué podría haber ayudado</li>
              <li><strong>Actualiza tu plan de crisis:</strong> Incorpora lo aprendido para mejorar tu preparación</li>
              <li><strong>Recupérate gradualmente:</strong> Vuelve a tus rutinas de forma progresiva, sin abrumarte</li>
              <li><strong>Prioriza el autocuidado:</strong> Asegura descanso adecuado, alimentación, actividad física y conexión social</li>
              <li><strong>Practica la autocompasión:</strong> Evita culpabilizarte por haber experimentado una crisis</li>
            </ul>
            <div className="mt-6">
              <Link 
                href="/recursos/profesionales" 
                className={`inline-flex items-center px-4 py-2 rounded-md ${theme === 'dark' ? 'bg-blue-600 hover:bg-blue-700' : 'bg-blue-500 hover:bg-blue-600'} text-white transition-colors duration-200`}
              >
                Directorio de profesionales
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </Link>
            </div>
          </div>
          
          <div className="flex justify-between mt-8">
            <Link 
              href="/recursos/tecnicas" 
              className={`inline-flex items-center px-4 py-2 rounded-md ${theme === 'dark' ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-200 hover:bg-gray-300'} transition-colors duration-200`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Técnicas de Relajación
            </Link>
            
            <Link 
              href="/recursos/profesionales" 
              className={`inline-flex items-center px-4 py-2 rounded-md ${theme === 'dark' ? 'bg-blue-600 hover:bg-blue-700' : 'bg-blue-500 hover:bg-blue-600'} text-white transition-colors duration-200`}
            >
              Directorio de Profesionales
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default CrisisPage; 