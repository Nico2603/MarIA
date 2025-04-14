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
              La ansiedad es una respuesta natural del cuerpo ante situaciones de estrés o peligro percibido. Es una emoción normal que todos experimentamos. Sin embargo, cuando esta respuesta se vuelve excesiva, persistente y desproporcionada a la situación real, puede convertirse en un trastorno de ansiedad que afecta significativamente la calidad de vida.
            </p>
            <p>
              Los trastornos de ansiedad se caracterizan por preocupación intensa y persistente, miedo abrumador, sensación de peligro inminente y/o síntomas físicos como taquicardia, sudoración, tensión muscular, dificultad para respirar, mareos o problemas gastrointestinales.
            </p>
          </div>
          
          <div className={`rounded-lg p-6 mb-8 ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} shadow-md`}>
            <h2 className="text-2xl font-semibold mb-4">Tipos comunes de trastornos de ansiedad</h2>
            <p className="mb-4">Existen varios tipos, algunos de los más comunes son:</p>
            <ul className="space-y-3 list-disc pl-5">
              <li><strong>Trastorno de ansiedad generalizada (TAG):</strong> Preocupación excesiva y difícil de controlar sobre diversas áreas de la vida (trabajo, salud, familia).</li>
              <li><strong>Trastorno de pánico:</strong> Ataques de pánico inesperados y recurrentes (episodios súbitos de miedo intenso con síntomas físicos).</li>
              <li><strong>Fobias específicas:</strong> Miedo intenso e irracional a objetos o situaciones específicas (animales, alturas, agujas).</li>
              <li><strong>Trastorno de ansiedad social (fobia social):</strong> Miedo intenso a situaciones sociales por temor a ser juzgado o avergonzado.</li>
              <li><strong>Agorafobia:</strong> Miedo a lugares o situaciones donde escapar podría ser difícil o la ayuda no estaría disponible si se presenta pánico.</li>
             {/* Se elimina TOC de esta lista ya que ahora se clasifica aparte en DSM-5 */}
            </ul>
          </div>
          
          <div className={`rounded-lg p-6 mb-8 ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} shadow-md`}>
            <h2 className="text-2xl font-semibold mb-4">Estrategias para manejar la ansiedad en Colombia</h2>
            
            <p className="mb-4">
                Si bien estas estrategias son generales, considera adaptarlas a tu contexto y buscar recursos locales en Colombia.
            </p>
            
            <h3 className="text-xl font-medium mb-3 text-blue-500">Técnicas de respiración y relajación</h3>
            <p className="mb-4">
              La respiración profunda diafragmática o la respiración cuadrada (ver <Link href="/recursos/tecnicas" className="text-blue-500 hover:underline">Técnicas de Relajación</Link>) son herramientas poderosas y accesibles para calmar el sistema nervioso.
            </p>
            
            <h3 className="text-xl font-medium mb-3 text-blue-500">Atención plena (Mindfulness)</h3>
            <p className="mb-4">
              Practicar la atención plena te ayuda a anclarte en el presente y reducir la rumiación sobre preocupaciones futuras. Puedes encontrar grupos de mindfulness o recursos online enfocados en el contexto colombiano.
            </p>
            
            <h3 className="text-xl font-medium mb-3 text-blue-500">Ejercicio físico regular</h3>
             <p className="mb-4">
               La actividad física libera endorfinas y reduce la tensión. Busca parques, ciclovías o gimnasios comunitarios en tu localidad.
            </p>
            
            <h3 className="text-xl font-medium mb-3 text-blue-500">Higiene del sueño</h3>
             <p className="mb-4">
               Dormir bien es crucial. Intenta mantener horarios regulares, evitar pantallas antes de dormir y crear un ambiente propicio para el descanso.
            </p>
            
            <h3 className="text-xl font-medium mb-3 text-blue-500">Alimentación balanceada</h3>
             <p className="mb-4">
               Una dieta equilibrada influye en el estado de ánimo. Limita el consumo de cafeína y azúcar, que pueden exacerbar la ansiedad.
            </p>

            <h3 className="text-xl font-medium mb-3 text-blue-500">Desafiar pensamientos ansiosos (Reestructuración cognitiva)</h3>
            <p className="mb-4">
              Cuestiona la validez y la utilidad de tus pensamientos ansiosos. Pregúntate: ¿Qué evidencia tengo? ¿Hay otra forma de ver esto? ¿Qué es lo peor que podría pasar y cómo lo afrontaría?
            </p>
            
            <h3 className="text-xl font-medium mb-3 text-blue-500">Buscar apoyo social</h3>
            <p className="mb-4">
              Hablar con amigos, familiares o grupos de apoyo en Colombia puede aliviar la carga de la ansiedad. No tienes que pasar por esto solo/a.
            </p>
          </div>
          
          <div className={`rounded-lg p-6 mb-8 ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} shadow-md`}>
            <h2 className="text-2xl font-semibold mb-4">Cuándo buscar ayuda profesional en Colombia</h2>
            <p className="mb-4">
              Si la ansiedad interfiere significativamente con tu vida diaria, trabajo, estudios o relaciones, es fundamental buscar ayuda profesional. Considera contactar a:
            </p>
            <ul className="space-y-2 list-disc pl-5 mb-6">
              <li>Un psicólogo o psiquiatra registrado en Colombia.</li>
              <li>Tu Entidad Promotora de Salud (EPS) para orientación sobre rutas de atención en salud mental.</li>
              <li>Líneas de atención psicológica locales o nacionales como la Línea 106.</li>
            </ul>
            <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 mb-6 dark:bg-yellow-900 dark:text-yellow-200 dark:border-yellow-600">
              <p className="font-bold">IMPORTANTE</p>
              <p>Si tienes pensamientos de autolesión o suicidio, busca ayuda de emergencia inmediatamente llamando al 123 o al 106.</p>
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