'use client';

import React from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useTheme } from '@/components/ThemeProvider';

const DepresionPage = () => {
  const { theme } = useTheme();
  
  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-800'}`}>
      <div className="container mx-auto px-4 py-12">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-3xl md:text-4xl font-bold mb-8 text-blue-600">Entendiendo la Depresión</h1>
          
          <div className={`rounded-lg p-6 mb-8 ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} shadow-md`}>
            <h2 className="text-2xl font-semibold mb-4">¿Qué es la depresión?</h2>
            <p className="mb-4">
              La depresión (trastorno depresivo mayor) es un trastorno del estado de ánimo común pero grave que afecta cómo te sientes, piensas y manejas las actividades diarias, como dormir, comer o trabajar. Para ser diagnosticado con depresión, los síntomas deben estar presentes durante al menos dos semanas.
            </p>
            <p className="mb-4">
              Es mucho más que sentirse triste o tener un mal día. La depresión puede ser debilitante y afectar todos los aspectos de la vida de una persona. No es un signo de debilidad y no es algo de lo que uno pueda simplemente "salir".
            </p>
            <p>
                Reconocer sus síntomas es el primer paso para buscar ayuda y recuperación.
            </p>
          </div>
          
          <div className={`rounded-lg p-6 mb-8 ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} shadow-md`}>
            <h2 className="text-2xl font-semibold mb-4">Síntomas comunes de la depresión</h2>
            <p className="mb-4">Los síntomas pueden variar de leves a graves e incluir:</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <ul className="space-y-2 list-disc pl-5">
                    <li>Sentimientos persistentes de tristeza, ansiedad o "vacío".</li>
                    <li>Sentimientos de desesperanza o pesimismo.</li>
                    <li>Irritabilidad.</li>
                    <li>Sentimientos de culpa, inutilidad o impotencia.</li>
                    <li>Pérdida de interés o placer en pasatiempos y actividades (anhedonia).</li>
                    <li>Fatiga o disminución de energía.</li>
                </ul>
                <ul className="space-y-2 list-disc pl-5">
                    <li>Dificultad para concentrarse, recordar o tomar decisiones.</li>
                    <li>Dificultad para dormir (insomnio), despertarse temprano o dormir demasiado (hipersomnia).</li>
                    <li>Cambios en el apetito y/o peso (comer más o menos).</li>
                    <li>Pensamientos de muerte o suicidio, o intentos de suicidio.</li>
                    <li>Molestias físicas como dolores, dolores de cabeza, calambres o problemas digestivos sin una causa física clara.</li>
                </ul>
            </div>
             <p className="mt-4 italic text-sm">No todas las personas con depresión experimentan todos los síntomas.</p>
          </div>
          
          <div className={`rounded-lg p-6 mb-8 ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} shadow-md`}>
            <h2 className="text-2xl font-semibold mb-4">Estrategias de afrontamiento y autocuidado en Colombia</h2>
            
             <p className="mb-4">
                Estas estrategias pueden ser útiles, pero no reemplazan el tratamiento profesional si es necesario. Considera adaptarlas a tu vida y entorno en Colombia.
            </p>
            
            <h3 className="text-xl font-medium mb-3 text-blue-500">Mantenerse activo</h3>
            <p className="mb-4">
              El ejercicio físico regular, incluso caminatas cortas, puede mejorar el estado de ánimo. Aprovecha los parques y espacios públicos de tu ciudad.
            </p>
            
            <h3 className="text-xl font-medium mb-3 text-blue-500">Establecer metas realistas</h3>
            <p className="mb-4">
              Divide las tareas grandes en pequeñas. Establece prioridades y haz lo que puedas. Sentir que logras algo, por pequeño que sea, puede ayudar.
            </p>
            
            <h3 className="text-xl font-medium mb-3 text-blue-500">Conectar con otros</h3>
             <p className="mb-4">
               Intenta pasar tiempo con personas de confianza (familiares, amigos). El aislamiento puede empeorar la depresión. Busca grupos de apoyo locales si te sientes cómodo.
            </p>
            
            <h3 className="text-xl font-medium mb-3 text-blue-500">Cuidar la salud física</h3>
             <p className="mb-4">
               Intenta comer de forma balanceada, dormir lo suficiente y evitar el alcohol y las drogas, ya que pueden empeorar la depresión.
            </p>
            
            <h3 className="text-xl font-medium mb-3 text-blue-500">Posponer decisiones importantes</h3>
             <p className="mb-4">
               Si es posible, evita tomar decisiones importantes (cambio de trabajo, matrimonio, etc.) hasta que te sientas mejor. Habla con personas de confianza si necesitas decidir algo.
            </p>

            <h3 className="text-xl font-medium mb-3 text-blue-500">Ser paciente y amable contigo mismo</h3>
            <p className="mb-4">
              La recuperación lleva tiempo. No esperes "salir" de la depresión de inmediato. Sé compasivo contigo mismo durante el proceso.
            </p>
            
          </div>
          
          <div className={`rounded-lg p-6 mb-8 ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} shadow-md`}>
            <h2 className="text-2xl font-semibold mb-4">Cuándo buscar ayuda profesional en Colombia</h2>
            <p className="mb-4">
              Si los síntomas de depresión persisten por más de dos semanas, son severos, o interfieren con tu vida diaria, es crucial buscar ayuda profesional. La depresión es una condición tratable.
            </p>
             <p className="mb-4">Considera contactar a:</p>
            <ul className="space-y-2 list-disc pl-5 mb-6">
              <li>Un médico general, quien puede evaluar tu estado y referirte a un especialista si es necesario.</li>
              <li>Un psicólogo o psiquiatra registrado en Colombia.</li>
              <li>Tu Entidad Promotora de Salud (EPS) para conocer las rutas de atención en salud mental disponibles.</li>
              <li>Líneas de apoyo psicológico como la Línea 106 u otras líneas locales disponibles en tu ciudad o departamento.</li>
            </ul>
            
            <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 mb-6 dark:bg-yellow-900 dark:text-yellow-200 dark:border-yellow-600">
              <p className="font-bold">¡NO ESTÁS SOLO/A! BUSCAR AYUDA ES UN SIGNO DE FORTALEZA.</p>
              <p className="mt-2">Si tienes pensamientos de muerte o suicidio, o conoces a alguien que los tenga, busca ayuda de emergencia inmediatamente. Llama al <strong>123</strong> (Emergencia Nacional) o al <strong>106</strong> (Línea de Salud Mental).</p>
            </div>

            <div className="mt-6">
              <Link 
                href="/recursos/profesionales" 
                className={`inline-flex items-center px-4 py-2 rounded-md ${theme === 'dark' ? 'bg-blue-600 hover:bg-blue-700' : 'bg-blue-500 hover:bg-blue-600'} text-white transition-colors duration-200`}
              >
                Directorio de profesionales (Ejemplo)
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </Link>
            </div>
          </div>
          
          <div className="flex justify-between mt-8">
            <Link 
              href="/recursos/ansiedad" 
              className={`inline-flex items-center px-4 py-2 rounded-md ${theme === 'dark' ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-200 hover:bg-gray-300'} transition-colors duration-200`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Sobre la Ansiedad
            </Link>
            
            <Link 
              href="/recursos/tecnicas" 
              className={`inline-flex items-center px-4 py-2 rounded-md ${theme === 'dark' ? 'bg-blue-600 hover:bg-blue-700' : 'bg-blue-500 hover:bg-blue-600'} text-white transition-colors duration-200`}
            >
              Técnicas de Relajación
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

export default DepresionPage; 