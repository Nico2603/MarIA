'use client';

import React from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useTheme } from '@/components/ThemeProvider';
import { MapPin, Phone, Search, Users, CheckCircle, Globe, BookOpen, ArrowRight, ExternalLink } from 'lucide-react';

const ProfesionalesPage = () => {
  const { theme } = useTheme();

  // Fictional data for demonstration
  const professionalCategories = [
    { name: 'Psicólogos', icon: Users, description: 'Terapia conversacional, evaluación y tratamiento de trastornos mentales.' },
    { name: 'Psiquiatras', icon: Users, description: 'Médicos especializados en salud mental, pueden recetar medicamentos.' },
    { name: 'Trabajadores Sociales Clínicos', icon: Users, description: 'Apoyo en aspectos sociales y emocionales, terapia y gestión de casos.' },
    { name: 'Consejeros', icon: Users, description: 'Orientación y apoyo para problemas específicos (pareja, familia, adicciones).' },
  ];

  const searchResources = [
    {
      name: 'Colegio Colombiano de Psicólogos (COLPSIC)',
      description: 'Directorio oficial. Busca por especialidad y ubicación.',
      icon: BookOpen,
      link: 'https://www.colpsic.org.co/',
      cta: 'Buscar en COLPSIC'
    },
    {
      name: 'Tu Entidad Promotora de Salud (EPS)',
      description: 'Consulta el directorio de profesionales de tu EPS.',
      icon: CheckCircle,
      link: '#',
      cta: 'Consulta tu EPS (Requiere acceso propio)'
    },
    {
      name: 'Directorios Online Especializados',
      description: 'Plataformas como Doctoralia, Terapify, etc., conectan pacientes y psicólogos.',
      icon: Search,
      link: '#',
      cta: 'Buscar Directorios Online'
    },
    {
      name: 'Secretarías de Salud Locales',
      description: 'Infórmate sobre servicios públicos o de bajo costo en tu municipio/departamento.',
      icon: MapPin,
      link: '#',
      cta: 'Consultar Secretaría Local (Varía)'
    },
    {
        name: 'Universidades (Centros de Práctica)',
        description: 'Algunas facultades de psicología ofrecen atención comunitaria.',
        icon: Globe,
        link: '#',
        cta: 'Investigar Universidades Locales'
    },
    {
        name: 'Líneas de Atención (Orientación)',
        description: 'Líneas como la 106 pueden orientar y referir a servicios.',
        icon: Phone,
        link: '#',
        cta: 'Llamar a Líneas de Orientación'
    }
  ];

  const tipsForChoosing = [
    'Verifica las credenciales y registro profesional (tarjeta profesional para psicólogos, registro médico para psiquiatras).',
    'Considera la especialidad del profesional (ansiedad, depresión, terapia de pareja, etc.).',
    'Pregunta sobre su enfoque terapéutico (cognitivo-conductual, psicodinámico, humanista, etc.).',
    'Asegúrate de sentirte cómodo/a y en confianza durante la consulta inicial.',
    'Consulta las tarifas y si trabajan con tu EPS o seguro privado.',
    'No dudes en hacer preguntas sobre el proceso terapéutico.',
    'Recuerda que encontrar al profesional adecuado puede llevar tiempo.'
  ];
  
  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-800'}`}>
      <div className="container mx-auto px-4 py-12">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-3xl md:text-4xl font-bold mb-4 text-blue-600">Encontrar Ayuda Profesional para la Ansiedad</h1>
          
          <p className={`mb-10 ${theme === 'dark' ? 'text-gray-300' : 'text-neutral-600'} text-lg max-w-3xl`}>
            Buscar apoyo profesional es un paso importante. Aquí encontrarás recursos y consejos para encontrar psicólogos, psiquiatras u otros profesionales de salud mental en Colombia enfocados en ansiedad.
          </p>

          {/* Dónde Buscar - Rediseñado con Tarjetas */}
          <div className={`rounded-lg p-6 md:p-8 mb-10 ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} shadow-md border ${theme === 'dark' ? 'border-gray-700' : 'border-gray-100'}`}>
            <h2 className="text-2xl font-semibold mb-6 flex items-center">
              <Search className="w-6 h-6 mr-3 text-blue-500"/>
              Recursos para Encontrar Profesionales
            </h2>
            <p className={`mb-8 ${theme === 'dark' ? 'text-gray-300' : 'text-neutral-600'}`}>
              Utiliza estas herramientas y directorios para iniciar tu búsqueda. Recuerda filtrar por **ubicación (ciudad/departamento)** y **especialidad (ansiedad)** siempre que sea posible:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {searchResources.map((resource, index) => (
                <motion.div 
                  key={index}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  className={`flex flex-col justify-between p-5 rounded-lg ${theme === 'dark' ? 'bg-gray-700/50 hover:bg-gray-700' : 'bg-gray-100 hover:bg-gray-200/70'} transition-all border ${theme === 'dark' ? 'border-gray-600' : 'border-gray-200'}`}
                  >
                  <div>
                    <div className="flex items-center mb-3">
                        <resource.icon className="w-5 h-5 mr-3 text-blue-500 flex-shrink-0" />
                        <h3 className="text-lg font-medium">{resource.name}</h3>
                    </div>
                    <p className={`text-sm mb-4 ${theme === 'dark' ? 'text-gray-300' : 'text-neutral-600'}`}>{resource.description}</p>
                  </div>
                  <div>
                    {resource.link && resource.link !== '#' ? (
                      <a 
                        href={resource.link} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="inline-flex items-center text-sm font-medium text-blue-600 dark:text-blue-400 hover:underline"
                      >
                        {resource.cta}
                        <ExternalLink className="w-3 h-3 ml-1.5"/>
                      </a>
                    ) : (
                       <span className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-400' : 'text-neutral-500'} flex items-center`}>
                        {resource.cta}
                        {/* Podríamos añadir un icono de info si es un placeholder */}
                      </span>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
          
          {/* Tipos de Profesionales - Estilo más compacto */}
          <div className={`rounded-lg p-6 md:p-8 mb-10 ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} shadow-md border ${theme === 'dark' ? 'border-gray-700' : 'border-gray-100'}`}>
            <h2 className="text-2xl font-semibold mb-6 flex items-center">
                <Users className="w-6 h-6 mr-3 text-blue-500"/>
                Tipos de Profesionales
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
              {professionalCategories.map((category, index) => (
                <div key={index} className="flex items-start">
                  <div>
                    <h3 className="text-md font-medium mb-0.5">{category.name}</h3>
                    <p className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-neutral-600'}`}>{category.description}</p>
                  </div>
                </div>
              ))}
            </div>
            <p className={`text-sm italic mt-5 ${theme === 'dark' ? 'text-gray-400' : 'text-neutral-500'}`}>Verifica siempre que el profesional esté registrado y habilitado en Colombia.</p>
          </div>
          
          {/* Consideraciones al Elegir */}
          <div className={`rounded-lg p-6 md:p-8 mb-10 ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} shadow-md border ${theme === 'dark' ? 'border-gray-700' : 'border-gray-100'}`}>
            <h2 className="text-2xl font-semibold mb-6">Consejos para Elegir</h2>
            <ul className="space-y-3 list-disc pl-5">
              {tipsForChoosing.map((tip, index) => (
                <li key={index} className={`${theme === 'dark' ? 'text-gray-300' : 'text-neutral-700'}`}>{tip}</li>
              ))}
            </ul>
          </div>
          
          {/* Aviso Importante */}
          <div className={`rounded-lg p-6 mb-8 ${theme === 'dark' ? 'bg-yellow-900/70' : 'bg-yellow-50'} border-l-4 ${theme === 'dark' ? 'border-yellow-500' : 'border-yellow-400'} text-${theme === 'dark' ? 'yellow-200' : 'yellow-800'}`}>
            <h2 className="text-xl font-semibold mb-3 flex items-center">
              <Phone className="w-5 h-5 mr-2"/>
              En Caso de Crisis
            </h2>
            <p>
              Si tú o alguien que conoces está experimentando una crisis de salud mental o tiene pensamientos de hacerse daño, busca ayuda inmediata. Llama a la línea de emergencia nacional <strong>123</strong> o a la línea de salud mental <strong>106</strong>.
            </p>
            <div className="mt-4">
              <Link
                href="/recursos/crisis"
                className={`inline-flex items-center px-3 py-1 rounded-md text-sm ${theme === 'dark' ? 'bg-yellow-700 hover:bg-yellow-600' : 'bg-yellow-500 hover:bg-yellow-600'} text-white transition-colors duration-200`}
              >
                Información sobre Manejo de Crisis
                <ArrowRight className="w-4 h-4 ml-1.5"/>
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

export default ProfesionalesPage; 