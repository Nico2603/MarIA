'use client';

import React from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useTheme } from '@/components/ThemeProvider';

const AnsiedadPage = () => {
  const { theme } = useTheme();
  
  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-800'}`}>
      <div className="container mx-auto px-4 py-12">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-3xl md:text-4xl font-bold mb-8 text-blue-600">Manejo de la Ansiedad</h1>
          
          <div className={`rounded-lg p-6 mb-8 ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} shadow-md`}>
            <h2 className="text-2xl font-semibold mb-4">¿Qué es la ansiedad?</h2>
            <p className="mb-4">
              La ansiedad es una respuesta natural del cuerpo ante situaciones de estrés o peligro. Sin embargo, cuando esta respuesta se vuelve excesiva o persiste sin una amenaza real, puede convertirse en un trastorno que afecta significativamente la calidad de vida.
            </p>
            <p>
              Los trastornos de ansiedad se caracterizan por preocupación persistente, miedo intenso, sensación de peligro inminente y/o síntomas físicos como taquicardia, sudoración, tensión muscular y dificultad para respirar.
            </p>
          </div>
          
          <div className={`rounded-lg p-6 mb-8 ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} shadow-md`}>
            <h2 className="text-2xl font-semibold mb-4">Tipos comunes de trastornos de ansiedad</h2>
            <ul className="space-y-3 list-disc pl-5">
              <li><strong>Trastorno de ansiedad generalizada (TAG):</strong> Preocupación excesiva por diversas actividades o eventos cotidianos.</li>
              <li><strong>Trastorno de pánico:</strong> Episodios repentinos de miedo intenso que provocan reacciones físicas graves.</li>
              <li><strong>Fobias específicas:</strong> Miedo irracional a objetos o situaciones particulares.</li>
              <li><strong>Trastorno de ansiedad social:</strong> Miedo intenso a ser juzgado negativamente en situaciones sociales.</li>
              <li><strong>Agorafobia:</strong> Miedo a lugares o situaciones donde escapar podría ser difícil o donde no habría ayuda disponible.</li>
              <li><strong>Trastorno obsesivo-compulsivo (TOC):</strong> Pensamientos obsesivos y comportamientos compulsivos repetitivos.</li>
            </ul>
          </div>
          
          <div className={`rounded-lg p-6 mb-8 ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} shadow-md`}>
            <h2 className="text-2xl font-semibold mb-4">Estrategias para manejar la ansiedad</h2>
            
            <h3 className="text-xl font-medium mb-3 text-blue-500">Técnicas de respiración</h3>
            <p className="mb-4">
              La respiración profunda activa el sistema nervioso parasimpático, ayudando a reducir los síntomas físicos de la ansiedad:
            </p>
            <ol className="space-y-2 list-decimal pl-5 mb-6">
              <li>Inhala lentamente por la nariz contando hasta 4</li>
              <li>Mantén la respiración contando hasta 2</li>
              <li>Exhala lentamente por la boca contando hasta 6</li>
              <li>Repite este ciclo durante 5-10 minutos</li>
            </ol>
            
            <h3 className="text-xl font-medium mb-3 text-blue-500">Atención plena (Mindfulness)</h3>
            <p className="mb-4">
              Practicar la atención plena te ayuda a mantenerte en el momento presente y observar tus pensamientos sin juzgarlos:
            </p>
            <ul className="space-y-2 list-disc pl-5 mb-6">
              <li>Dedica unos minutos cada día a observar tus pensamientos sin reaccionar</li>
              <li>Enfócate en tus sentidos: ¿qué ves, oyes, hueles, saboreas y sientes?</li>
              <li>Realiza actividades cotidianas con plena conciencia (comer, caminar, etc.)</li>
            </ul>
            
            <h3 className="text-xl font-medium mb-3 text-blue-500">Reestructuración cognitiva</h3>
            <p className="mb-4">
              Identificar y desafiar los pensamientos negativos que alimentan tu ansiedad:
            </p>
            <ul className="space-y-2 list-disc pl-5 mb-6">
              <li>Identifica los pensamientos automáticos negativos</li>
              <li>Cuestiona la evidencia que respalda esos pensamientos</li>
              <li>Busca interpretaciones alternativas más realistas</li>
              <li>Practica la autocompasión en lugar de la autocrítica</li>
            </ul>
          </div>
          
          <div className={`rounded-lg p-6 mb-8 ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} shadow-md`}>
            <h2 className="text-2xl font-semibold mb-4">Cuándo buscar ayuda profesional</h2>
            <p className="mb-4">
              Es importante buscar apoyo profesional cuando la ansiedad:
            </p>
            <ul className="space-y-2 list-disc pl-5 mb-6">
              <li>Interfiere con tus actividades diarias o relaciones</li>
              <li>Causa un malestar significativo</li>
              <li>Te lleva a evitar situaciones importantes</li>
              <li>Persiste a pesar de tus intentos por manejarla</li>
              <li>Se acompaña de pensamientos suicidas o de autolesión</li>
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
              href="/recursos" 
              className={`inline-flex items-center px-4 py-2 rounded-md ${theme === 'dark' ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-200 hover:bg-gray-300'} transition-colors duration-200`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Volver a Recursos
            </Link>
            
            <Link 
              href="/recursos/depresion" 
              className={`inline-flex items-center px-4 py-2 rounded-md ${theme === 'dark' ? 'bg-blue-600 hover:bg-blue-700' : 'bg-blue-500 hover:bg-blue-600'} text-white transition-colors duration-200`}
            >
              Sobre la Depresión
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

export default AnsiedadPage; 