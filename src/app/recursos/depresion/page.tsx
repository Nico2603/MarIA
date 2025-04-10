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
          <h1 className="text-3xl md:text-4xl font-bold mb-8 text-blue-600">Sobre la Depresión</h1>
          
          <div className={`rounded-lg p-6 mb-8 ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} shadow-md`}>
            <h2 className="text-2xl font-semibold mb-4">¿Qué es la depresión?</h2>
            <p className="mb-4">
              La depresión es un trastorno mental común caracterizado por una tristeza persistente, pérdida de interés en actividades que normalmente eran placenteras, y una incapacidad para llevar a cabo las actividades diarias durante al menos dos semanas.
            </p>
            <p>
              Además, las personas con depresión suelen experimentar varios de los siguientes síntomas: pérdida de energía, cambios en el apetito, alteraciones del sueño, ansiedad, disminución de la concentración, indecisión, inquietud, sentimientos de inutilidad, culpa o desesperanza, y pensamientos de autolesión o suicidio.
            </p>
          </div>
          
          <div className={`rounded-lg p-6 mb-8 ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} shadow-md`}>
            <h2 className="text-2xl font-semibold mb-4">Tipos de depresión</h2>
            <ul className="space-y-3 list-disc pl-5">
              <li><strong>Trastorno depresivo mayor:</strong> Síntomas depresivos severos que interfieren con la capacidad de trabajar, dormir, estudiar, comer y disfrutar de la vida.</li>
              <li><strong>Trastorno depresivo persistente (distimia):</strong> Una forma menos severa pero crónica de depresión que dura al menos dos años.</li>
              <li><strong>Depresión posparto:</strong> Ocurre después del parto y se caracteriza por sentimientos extremos de tristeza, ansiedad y fatiga.</li>
              <li><strong>Trastorno afectivo estacional:</strong> Depresión que generalmente ocurre durante los meses de invierno, cuando hay menos luz solar natural.</li>
              <li><strong>Trastorno bipolar:</strong> Incluye episodios depresivos que alternan con períodos de manía o hipomanía.</li>
              <li><strong>Depresión psicótica:</strong> Depresión severa acompañada de alguna forma de psicosis, como alucinaciones o delirios.</li>
            </ul>
          </div>
          
          <div className={`rounded-lg p-6 mb-8 ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} shadow-md`}>
            <h2 className="text-2xl font-semibold mb-4">Causas y factores de riesgo</h2>
            <p className="mb-4">
              La depresión es el resultado de una interacción compleja de factores sociales, psicológicos y biológicos. Algunos factores que pueden aumentar el riesgo incluyen:
            </p>
            <ul className="space-y-2 list-disc pl-5 mb-6">
              <li><strong>Factores biológicos:</strong> Cambios en la función cerebral, desequilibrios hormonales y genética.</li>
              <li><strong>Antecedentes familiares:</strong> El riesgo aumenta si hay familiares de primer grado con depresión.</li>
              <li><strong>Experiencias adversas:</strong> Trauma, abuso, pérdida de un ser querido o situaciones estresantes.</li>
              <li><strong>Enfermedades crónicas:</strong> Condiciones médicas como enfermedades cardíacas, cáncer o dolor crónico.</li>
              <li><strong>Consumo de sustancias:</strong> El abuso de alcohol o drogas puede contribuir a la depresión.</li>
              <li><strong>Rasgos de personalidad:</strong> Baja autoestima, tendencia a preocuparse excesivamente, o ser autocrítico.</li>
            </ul>
          </div>
          
          <div className={`rounded-lg p-6 mb-8 ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} shadow-md`}>
            <h2 className="text-2xl font-semibold mb-4">Tratamientos para la depresión</h2>
            
            <h3 className="text-xl font-medium mb-3 text-blue-500">Psicoterapia</h3>
            <p className="mb-4">
              Diferentes tipos de terapia han demostrado ser efectivas para tratar la depresión:
            </p>
            <ul className="space-y-2 list-disc pl-5 mb-6">
              <li><strong>Terapia cognitivo-conductual (TCC):</strong> Ayuda a identificar patrones de pensamiento negativo y desarrollar estrategias para cambiarlos.</li>
              <li><strong>Terapia interpersonal:</strong> Se centra en mejorar las relaciones personales y desarrollar mejores habilidades de comunicación.</li>
              <li><strong>Terapia de aceptación y compromiso:</strong> Enfoca la atención en aceptar los pensamientos y sentimientos difíciles en lugar de luchar contra ellos.</li>
              <li><strong>Terapia psicodinámica:</strong> Explora los conflictos y patrones inconscientes que pueden contribuir a la depresión.</li>
            </ul>
            
            <h3 className="text-xl font-medium mb-3 text-blue-500">Medicación</h3>
            <p className="mb-4">
              Los antidepresivos pueden ser efectivos para la depresión moderada a severa:
            </p>
            <ul className="space-y-2 list-disc pl-5 mb-6">
              <li><strong>Inhibidores selectivos de la recaptación de serotonina (ISRS)</strong></li>
              <li><strong>Inhibidores de la recaptación de serotonina y norepinefrina (IRSN)</strong></li>
              <li><strong>Antidepresivos atípicos</strong></li>
              <li><strong>Antidepresivos tricíclicos</strong></li>
              <li><strong>Inhibidores de la monoaminooxidasa (IMAO)</strong></li>
            </ul>
            <p className="text-sm italic mb-6">
              Nota: Los medicamentos deben ser prescritos y supervisados por un profesional de la salud. Nunca se deben suspender bruscamente.
            </p>
            
            <h3 className="text-xl font-medium mb-3 text-blue-500">Cambios en el estilo de vida</h3>
            <ul className="space-y-2 list-disc pl-5 mb-6">
              <li>Actividad física regular</li>
              <li>Alimentación balanceada</li>
              <li>Establecer rutinas de sueño saludables</li>
              <li>Reducir el consumo de alcohol y evitar drogas</li>
              <li>Técnicas de manejo del estrés como la meditación</li>
              <li>Mantener conexiones sociales</li>
            </ul>
          </div>
          
          <div className={`rounded-lg p-6 mb-8 ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} shadow-md`}>
            <h2 className="text-2xl font-semibold mb-4">Cuándo buscar ayuda profesional</h2>
            <p className="mb-4">
              Es fundamental buscar ayuda profesional si experimentas:
            </p>
            <ul className="space-y-2 list-disc pl-5 mb-6">
              <li>Síntomas de depresión que duran más de dos semanas</li>
              <li>Dificultad para funcionar en la vida diaria</li>
              <li>Pensamientos de muerte o suicidio</li>
              <li>Sentimientos de desesperanza intensos</li>
              <li>Síntomas que no mejoran con el automanejo</li>
            </ul>
            <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 mb-6 dark:bg-yellow-900 dark:text-yellow-200 dark:border-yellow-600">
              <p className="font-bold">IMPORTANTE</p>
              <p>Si tienes pensamientos suicidas, busca ayuda inmediatamente:</p>
              <ul className="list-disc pl-5 mt-2">
                <li>Llama a una línea de crisis de salud mental</li>
                <li>Acude a un servicio de urgencias</li>
                <li>Contacta a un profesional de salud mental</li>
                <li>Habla con alguien de confianza que pueda ayudarte a buscar tratamiento</li>
              </ul>
            </div>
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
              href="/recursos/ansiedad" 
              className={`inline-flex items-center px-4 py-2 rounded-md ${theme === 'dark' ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-200 hover:bg-gray-300'} transition-colors duration-200`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Manejo de la Ansiedad
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