'use client';

import React from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useTheme } from '@/components/ThemeProvider';
import { BookOpen, Activity, Moon, Brain, Users, Phone, ArrowRight, HelpCircle, ListChecks, ShieldAlert, MapPin } from 'lucide-react';

const AnsiedadPage = () => {
  const { theme } = useTheme();
  
  const anxietyTypes = [
    { name: 'Ansiedad Generalizada (TAG)', description: 'Preocupación excesiva y difícil de controlar sobre diversas áreas.', icon: Brain },
    { name: 'Trastorno de Pánico', description: 'Ataques de pánico inesperados y recurrentes.', icon: ShieldAlert },
    { name: 'Fobias Específicas', description: 'Miedo intenso e irracional a objetos o situaciones concretas.', icon: HelpCircle },
    { name: 'Ansiedad Social (Fobia Social)', description: 'Miedo intenso a situaciones sociales por temor a ser juzgado.', icon: Users },
    { name: 'Agorafobia', description: 'Miedo a lugares donde escapar puede ser difícil si surge pánico.', icon: MapPin },
  ];
  
  const managementStrategies = [
    { name: 'Técnicas de Respiración', description: 'Calman el sistema nervioso rápidamente.', icon: Activity, link: '/recursos/tecnicas#respiracion' },
    { name: 'Mindfulness / Atención Plena', description: 'Anclarse en el presente, reducir rumiación.', icon: Brain, link: '/recursos/tecnicas#atencion-plena' },
    { name: 'Ejercicio Físico', description: 'Libera tensión y mejora el ánimo.', icon: Activity, link: '/consejos#ejercicio' },
    { name: 'Higiene del Sueño', description: 'Dormir bien es crucial para regular la ansiedad.', icon: Moon, link: '/consejos#sueno' },
    { name: 'Reestructuración Cognitiva', description: 'Desafiar pensamientos ansiosos y poco realistas.', icon: Brain, link: '/consejos#pensamientos' }, 
    { name: 'Apoyo Social', description: 'Hablar con personas de confianza alivia la carga.', icon: Users, link: '/consejos#apoyo' }, 
  ];

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-gray-900 text-white' : 'bg-neutral-50 text-gray-800'} py-12`}>
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold font-display mb-6 text-center text-primary-600 dark:text-primary-400">Entendiendo y Manejando la Ansiedad</h1>
          <p className={`text-lg text-center mb-12 max-w-3xl mx-auto ${theme === 'dark' ? 'text-gray-300' : 'text-neutral-600'}`}>
            Aprende qué es la ansiedad, sus tipos comunes, síntomas y estrategias efectivas que puedes empezar a usar hoy mismo.
          </p>

          <motion.div 
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }}
            className={`rounded-xl p-6 md:p-8 mb-8 ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} shadow-soft border ${theme === 'dark' ? 'border-gray-700' : 'border-neutral-100'}`}
           >
            <h2 className="text-2xl font-semibold mb-4 flex items-center">
              <HelpCircle className="w-6 h-6 mr-3 text-primary-500"/>
              ¿Qué es la Ansiedad?
            </h2>
            <p className="mb-4">
              La ansiedad es una respuesta natural al estrés o peligro percibido. Se vuelve un problema cuando es **excesiva, persistente y desproporcionada** a la situación, afectando tu vida diaria.
            </p>
            <p className="mb-4">
              Se caracteriza por preocupación intensa, miedo abrumador, sensación de peligro y síntomas físicos (taquicardia, sudoración, tensión, etc.). No es simplemente &quot;estar nervioso&quot;.
            </p>
            <p className={`text-sm italic ${theme === 'dark' ? 'text-gray-400' : 'text-neutral-500'}`}>
               Puede influir la genética, experiencias de vida, química cerebral y factores ambientales.
            </p>
          </motion.div>
          
          <motion.div 
             initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }}
             className={`rounded-xl p-6 md:p-8 mb-8 ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} shadow-soft border ${theme === 'dark' ? 'border-gray-700' : 'border-neutral-100'}`}
          >
            <h2 className="text-2xl font-semibold mb-6 flex items-center">
              <ListChecks className="w-6 h-6 mr-3 text-primary-500"/>
              Tipos Comunes de Trastornos de Ansiedad
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {anxietyTypes.map((type) => (
                <div key={type.name} className={`flex items-start p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700/50' : 'bg-neutral-100'}`}>
                  <type.icon className="w-6 h-6 mr-4 text-primary-500 flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="text-md font-medium mb-1">{type.name}</h3>
                    <p className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-neutral-600'}`}>{type.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.3 }}
            className={`rounded-xl p-6 md:p-8 mb-8 ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} shadow-soft border ${theme === 'dark' ? 'border-gray-700' : 'border-neutral-100'}`}
            >
            <h2 className="text-2xl font-semibold mb-6 flex items-center">
               <Activity className="w-6 h-6 mr-3 text-primary-500"/>
               Estrategias Clave de Manejo
            </h2>
            <p className={`mb-8 ${theme === 'dark' ? 'text-gray-300' : 'text-neutral-600'}`}>
               Estas son algunas herramientas iniciales. Explora más en las secciones de <Link href="/recursos/tecnicas" className="text-blue-500 hover:underline">Técnicas</Link> y <Link href="/consejos" className="text-blue-500 hover:underline">Consejos</Link>.
            </p>
             <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {managementStrategies.map((strategy) => (
                  <Link href={strategy.link || '#'} key={strategy.name} className={`block p-5 rounded-lg ${theme === 'dark' ? 'bg-gray-700/50 hover:bg-gray-700' : 'bg-neutral-100 hover:bg-neutral-200/60'} transition-all`}>
                     <strategy.icon className="w-7 h-7 mb-3 text-primary-500" />
                     <h3 className="text-md font-semibold mb-1">{strategy.name}</h3>
                     <p className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-neutral-600'}`}>{strategy.description}</p>
                   </Link>
                ))}
             </div>
             <p className={`text-xs italic mt-6 ${theme === 'dark' ? 'text-gray-400' : 'text-neutral-500'}`}>
                Adapta estas estrategias a tu contexto y busca recursos locales en Colombia cuando sea posible.
             </p>
          </motion.div>
          
          <motion.div 
             initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.4 }}
             className={`rounded-xl p-6 md:p-8 mb-8 ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} shadow-soft border ${theme === 'dark' ? 'border-gray-700' : 'border-neutral-100'}`}
            >
            <h2 className="text-2xl font-semibold mb-4 flex items-center">
              <Users className="w-6 h-6 mr-3 text-primary-500"/>
              Cuándo Buscar Ayuda Profesional
            </h2>
            <p className={`mb-4 ${theme === 'dark' ? 'text-gray-300' : 'text-neutral-600'}`}>
              Si la ansiedad interfiere significativamente con tu vida diaria (trabajo, estudios, relaciones), es fundamental buscar ayuda. Considera contactar a:
            </p>
            <ul className={`space-y-2 list-disc pl-5 mb-6 ${theme === 'dark' ? 'text-gray-300' : 'text-neutral-700'}`}>
              <li>Un psicólogo o psiquiatra registrado en Colombia.</li>
              <li>Tu Entidad Promotora de Salud (EPS) para orientación.</li>
              <li>Líneas de atención psicológica locales o nacionales (ej. Línea 106).</li>
            </ul>
            <div className="mb-6">
              <Link 
                href="/recursos/profesionales" 
                 className="btn btn-primary inline-flex items-center"
              >
                Cómo encontrar profesionales
                <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
            </div>
            <div className={`bg-yellow-100 border-l-4 border-yellow-500 text-yellow-800 p-4 dark:bg-yellow-900/30 dark:text-yellow-200 dark:border-yellow-600 rounded-md`}>
              <p className="font-bold flex items-center"><ShieldAlert className="w-5 h-5 mr-2"/> IMPORTANTE</p>
              <p className="mt-1">Si tienes pensamientos de autolesión o suicidio, busca ayuda de emergencia <strong>inmediatamente</strong> llamando al <strong>123</strong> o al <strong>106</strong>.</p>
            </div>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5, delay: 0.5 }}
            className="flex justify-start mt-10">
            <Link 
              href="/recursos" 
              className={`inline-flex items-center px-4 py-2 rounded-md text-sm ${theme === 'dark' ? 'bg-gray-700 hover:bg-gray-600' : 'bg-neutral-200 hover:bg-neutral-300'} transition-colors duration-200`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Volver al Centro de Recursos
            </Link>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

export default AnsiedadPage; 