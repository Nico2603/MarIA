import React from 'react';
import { motion } from 'framer-motion';

interface Resource {
  id: string;
  title: string;
  description: string;
  url: string;
  icon: 'article' | 'guide' | 'contact' | 'emergency';
}

const ResourcesSidebar: React.FC = () => {
  const resources: Resource[] = [
    {
      id: '1',
      title: 'Línea de Ayuda en Crisis',
      description: 'Contacto inmediato para situaciones de emergencia psicológica',
      url: 'tel:+123456789',
      icon: 'emergency',
    },
    {
      id: '2',
      title: 'Guía para el Manejo del Estrés',
      description: 'Técnicas prácticas para manejar el estrés en la vida diaria',
      url: 'https://example.com/estres',
      icon: 'guide',
    },
    {
      id: '3',
      title: 'Directorio de Profesionales',
      description: 'Encuentra psicólogos y psiquiatras cerca de ti',
      url: 'https://example.com/directorio',
      icon: 'contact',
    },
    {
      id: '4',
      title: 'Primeros Auxilios Emocionales',
      description: 'Qué hacer en situaciones de crisis emocional',
      url: 'https://example.com/auxilios',
      icon: 'article',
    },
    {
      id: '5',
      title: 'Ejercicios de Mindfulness',
      description: 'Prácticas para estar presente y reducir la ansiedad',
      url: 'https://example.com/mindfulness',
      icon: 'guide',
    },
  ];

  const renderIcon = (type: string) => {
    switch (type) {
      case 'article':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
          </svg>
        );
      case 'guide':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-secondary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
          </svg>
        );
      case 'contact':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        );
      case 'emergency':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
          </svg>
        );
      default:
        return null;
    }
  };

  return (
    <aside className="hidden lg:block w-80 border-l border-neutral-200 bg-white p-4 overflow-y-auto">
      <div className="sticky top-4">
        <h2 className="text-xl font-display font-semibold mb-6 text-neutral-800">
          Recursos útiles
        </h2>

        <div className="space-y-4">
          {/* Recurso de emergencia destacado */}
          <motion.div
            whileHover={{ scale: 1.02 }}
            className="bg-red-50 border border-red-100 rounded-xl p-4"
          >
            <div className="flex items-start">
              <div className="bg-white rounded-full p-2 mr-3">
                {renderIcon('emergency')}
              </div>
              <div>
                <h3 className="font-medium text-red-700">Línea de Ayuda en Crisis</h3>
                <p className="text-sm text-red-600 mt-1">
                  Contacto inmediato para situaciones de emergencia psicológica
                </p>
                <a
                  href="tel:+123456789"
                  className="inline-flex items-center mt-2 text-sm font-medium text-red-700 hover:text-red-800"
                >
                  Llamar ahora
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </a>
              </div>
            </div>
          </motion.div>

          {/* Lista de recursos */}
          <div className="space-y-3">
            {resources.slice(1).map((resource) => (
              <motion.a
                key={resource.id}
                href={resource.url}
                target="_blank"
                rel="noopener noreferrer"
                whileHover={{ scale: 1.02 }}
                className="block bg-neutral-50 hover:bg-neutral-100 rounded-lg p-3 transition-colors duration-200"
              >
                <div className="flex items-start">
                  <div className="bg-white rounded-full p-2 mr-3">
                    {renderIcon(resource.icon)}
                  </div>
                  <div>
                    <h3 className="font-medium text-neutral-800">{resource.title}</h3>
                    <p className="text-xs text-neutral-600 mt-1">{resource.description}</p>
                  </div>
                </div>
              </motion.a>
            ))}
          </div>

          {/* Disclaimer */}
          <div className="mt-6 p-3 bg-neutral-100 rounded-lg text-xs text-neutral-600">
            <p className="font-medium mb-1">Importante:</p>
            <p>
              Los recursos proporcionados son orientativos. Consulta con un profesional de la salud mental para obtener asesoramiento específico para tu situación.
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default ResourcesSidebar; 