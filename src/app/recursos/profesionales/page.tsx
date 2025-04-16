'use client';

import React from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useTheme } from '@/components/ThemeProvider';
import { MapPin, Phone, Mail, Search, Users, CheckCircle, Globe, BookOpen } from 'lucide-react';

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
      description: 'Directorio oficial de psicólogos registrados en Colombia. Puedes buscar por especialidad y ubicación.',
      icon: BookOpen,
      link: 'https://www.colpsic.org.co/' // Example link, update with actual if known
  },
  {
      name: 'Tu Entidad Promotora de Salud (EPS)',
      description: 'Consulta el directorio de profesionales y centros de atención en salud mental afiliados a tu EPS.',
      icon: CheckCircle,
      link: '#' // Placeholder - Users need to check their specific EPS
  },
  {
        name: 'Secretarías de Salud Departamentales/Municipales',
        description: 'Pueden ofrecer información sobre servicios de salud mental públicos o de bajo costo en tu área.',
        icon: MapPin,
        link: '#' // Placeholder - Varies by location
    },
    {
        name: 'Directorios Online Especializados',
        description: 'Existen plataformas online que conectan pacientes con psicólogos en Colombia (investiga opciones como Doctoralia, Terapify, etc.).',
        icon: Search,
        link: '#' // Placeholder - Users should search for specific directories
    },
    {
        name: 'Universidades con Facultades de Psicología',
        description: 'Algunas universidades ofrecen servicios de atención psicológica a la comunidad a través de sus centros de práctica.',
        icon: Globe,
        link: '#' // Placeholder - Varies by university
    },
     {
        name: 'Líneas de Atención Telefónica',
        description: 'Líneas como la 106 pueden ofrecer orientación inicial y referir a servicios profesionales si es necesario.',
        icon: Phone,
        link: '#' // Placeholder - Mentioned elsewhere but relevant
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
          <h1 className="text-3xl md:text-4xl font-bold mb-8 text-blue-600">Encontrar Ayuda Profesional en Colombia</h1>
          
          <p className={`mb-8 p-4 rounded-md ${theme === 'dark' ? 'bg-gray-800' : 'bg-blue-50'} text-base`}>
            Buscar ayuda profesional es un paso valiente y fundamental hacia el bienestar mental. En Colombia, existen diversos recursos y profesionales capacitados para apoyarte. Esta guía te ofrece información general para iniciar tu búsqueda.
          </p>

          {/* Tipos de Profesionales */}
          <div className={`rounded-lg p-6 mb-8 ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} shadow-md`}>
            <h2 className="text-2xl font-semibold mb-4">Tipos de Profesionales de Salud Mental</h2>
            <p className="mb-6">
              Existen diferentes tipos de profesionales que pueden ayudarte, cada uno con su formación y enfoque:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {professionalCategories.map((category, index) => (
                <div key={index} className={`flex items-start p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}>
                  <category.icon className="w-8 h-8 mr-4 text-blue-500 flex-shrink-0 mt-1" />
              <div>
                    <h3 className="text-lg font-medium mb-1">{category.name}</h3>
                    <p className="text-sm">{category.description}</p>
              </div>
            </div>
              ))}
            </div>
             <p className="text-sm italic mt-4">Es importante verificar que el profesional esté debidamente registrado y habilitado para ejercer en Colombia.</p>
                          </div>
                          
          {/* Dónde Buscar */}
          <div className={`rounded-lg p-6 mb-8 ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} shadow-md`}>
            <h2 className="text-2xl font-semibold mb-4">Recursos para Encontrar Profesionales</h2>
            <p className="mb-6">
              Aquí te presentamos algunas opciones para buscar profesionales de salud mental en Colombia:
            </p>
            <div className="space-y-4">
              {searchResources.map((resource, index) => (
                <div key={index} className={`flex items-start p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}>
                  <resource.icon className="w-6 h-6 mr-4 text-blue-500 flex-shrink-0 mt-1" />
                        <div>
                    <h3 className="text-lg font-medium mb-1">
                      {resource.link && resource.link !== '#' ? (
                        <a href={resource.link} target="_blank" rel="noopener noreferrer" className="hover:underline hover:text-blue-400">
                          {resource.name}
                        </a>
                      ) : (
                        resource.name
                      )}
                    </h3>
                    <p className="text-sm">{resource.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {/* Consideraciones al Elegir */}
          <div className={`rounded-lg p-6 mb-8 ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} shadow-md`}>
            <h2 className="text-2xl font-semibold mb-4">Consejos para Elegir un Profesional</h2>
            <p className="mb-4">
                Elegir al profesional adecuado es una decisión personal. Aquí algunos puntos a considerar:
            </p>
            <ul className="space-y-3 list-disc pl-5">
              {tipsForChoosing.map((tip, index) => (
                <li key={index}>{tip}</li>
              ))}
            </ul>
          </div>
          
          {/* Aviso Importante */}
          <div className={`rounded-lg p-6 mb-8 ${theme === 'dark' ? 'bg-yellow-900' : 'bg-yellow-100'} border-l-4 ${theme === 'dark' ? 'border-yellow-500' : 'border-yellow-400'} text-${theme === 'dark' ? 'yellow-200' : 'yellow-800'}`}>
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

export default ProfesionalesPage; 