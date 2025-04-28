'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';

// Definición de tipos
type Resource = {
  id: string;
  title: string;
  description: string;
  url: string;
  icon: 'emergency' | 'guide' | 'contact' | 'article';
};

// Función para renderizar iconos
const renderIcon = (icon: string) => {
  switch (icon) {
    case 'emergency':
      return (
        <svg className="w-5 h-5 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      );
    case 'guide':
      return (
        <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
        </svg>
      );
    case 'contact':
      return (
        <svg className="w-5 h-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      );
    case 'article':
      return (
        <svg className="w-5 h-5 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
        </svg>
      );
    default:
      return (
        <svg className="w-5 h-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      );
  }
};

export default function RecursosPage() {
  // Lista de recursos
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
      title: 'Técnicas de Manejo de Ansiedad',
      description: 'Prácticas para afrontar y reducir la ansiedad en el momento.',
      url: '/recursos/tecnicas',
      icon: 'guide',
    },
    {
      id: '3',
      title: 'Buscar Ayuda Profesional',
      description: 'Guía para encontrar psicólogos y psiquiatras en Colombia.',
      url: '/recursos/profesionales',
      icon: 'contact',
    },
    {
      id: '4',
      title: 'Entendiendo la Ansiedad',
      description: 'Información sobre qué es la ansiedad y sus tipos comunes.',
      url: '/recursos/ansiedad',
      icon: 'article',
    },
    {
      id: '5',
      title: 'Mindfulness y Atención Plena',
      description: 'Ejercicios para conectar con el presente y calmar la mente.',
      url: '/recursos/tecnicas#atencion-plena',
      icon: 'guide',
    },
  ];

  // Categorías de recursos
  const categories = [
    { title: 'Sobre la Ansiedad', icon: '😰', link: '/recursos/ansiedad' },
    { title: 'Técnicas de Manejo', icon: '🧘', link: '/recursos/tecnicas' },
    { title: 'Ayuda Profesional', icon: '👩‍⚕️', link: '/recursos/profesionales' },
    { title: 'Manejo de Crisis', icon: '🆘', link: '/recursos/crisis' },
  ];

  // Artículos recomendados
  const articles = [
    {
      title: 'Cómo manejar la ansiedad diaria',
      description: 'Estrategias prácticas para reducir la ansiedad en situaciones cotidianas.',
      url: '/recursos/ansiedad',
    },
    {
      title: 'Técnicas de respiración para calmar la ansiedad',
      description: 'Ejercicios simples y efectivos que puedes hacer en cualquier lugar.',
      url: '/recursos/tecnicas#respiracion',
    },
    {
      title: 'Identificando desencadenantes de ansiedad',
      description: 'Aprende a reconocer qué situaciones o pensamientos disparan tu ansiedad.',
      url: '/consejos',
    },
  ];

  // Contactos de emergencia
  const emergencyContacts = [
    {
      name: 'Línea Nacional de Emergencias',
      phone: '123',
      availability: '24/7',
      isPhone: true,
    },
    {
      name: 'Línea de Salud Mental (Nacional/Bogotá)',
      phone: '106',
      availability: 'Verificar disponibilidad local',
      isPhone: true,
    },
  ];

  return (
    <div className="min-h-screen py-12 px-4 bg-neutral-50 dark:bg-gray-900">
      <div className="container mx-auto max-w-5xl">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-3xl font-bold text-neutral-800 dark:text-white mb-2">Centro de Recursos para la Ansiedad</h1>
          <p className="text-neutral-600 dark:text-neutral-300 mb-10 text-lg">
            Encuentra información, técnicas y contactos para manejar la ansiedad.
          </p>
        </motion.div>

        {/* Recurso de emergencia destacado */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-xl p-6 mb-10 shadow-sm"
        >
          <div className="flex flex-col md:flex-row items-start md:items-center">
            <div className="bg-white dark:bg-red-800/50 rounded-full p-3 mr-4 mb-4 md:mb-0">
              {renderIcon('emergency')}
            </div>
            <div className="flex-grow">
              <h3 className="font-medium text-xl text-red-700 dark:text-red-300">¿Necesitas Ayuda Urgente?</h3>
              <p className="text-red-600 dark:text-red-400 mt-1 mb-3">
                Si estás en crisis o necesitas apoyo inmediato, contacta estas líneas:
              </p>
              <div className="flex flex-wrap gap-3">
                <a
                  href="tel:123"
                  className="inline-flex items-center px-3 py-1.5 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 transition-colors text-sm"
                >
                  Emergencias: 123
                </a>
                <a
                  href="tel:106"
                  className="inline-flex items-center px-3 py-1.5 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 transition-colors text-sm"
                >
                  Salud Mental: 106
                </a>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Categorías de recursos */}
        <div className="mb-16">
          <h2 className="text-2xl font-display font-bold text-neutral-800 dark:text-white mb-6">
            Explora por Categoría
          </h2>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            {categories.map((category, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.1 * index }}
              >
                <Link href={category.link}>
                  <div className="bg-white dark:bg-gray-800 hover:bg-blue-50 dark:hover:bg-gray-700 border border-neutral-200 dark:border-gray-700 rounded-xl p-4 flex items-center transition-colors shadow-sm hover:shadow-md h-full">
                    <div className="text-3xl mr-3 flex-shrink-0">{category.icon}</div>
                    <h3 className="font-medium text-lg text-neutral-800 dark:text-neutral-100">{category.title}</h3>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Lista de recursos */}
        <div className="mb-16">
          <h2 className="text-2xl font-display font-bold text-neutral-800 dark:text-white mb-6">
            Recursos Destacados
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {resources.map((resource) => (
              <motion.a
                key={resource.id}
                href={resource.url}
                target={resource.url.startsWith('/') ? '_self' : '_blank'}
                rel={resource.url.startsWith('/') ? '' : 'noopener noreferrer'}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.1 * parseInt(resource.id) }}
                className="block bg-white dark:bg-gray-800 hover:bg-neutral-50 dark:hover:bg-gray-700 border border-neutral-100 dark:border-gray-700 rounded-lg p-5 transition-colors shadow-sm hover:shadow-md"
              >
                <div className="flex items-start">
                  <div className="bg-neutral-50 dark:bg-gray-700 rounded-full p-3 mr-4">
                    {renderIcon(resource.icon)}
                  </div>
                  <div>
                    <h3 className="font-medium text-lg text-neutral-800 dark:text-neutral-100">{resource.title}</h3>
                    <p className="text-neutral-600 dark:text-neutral-300 mt-1">{resource.description}</p>
                  </div>
                </div>
              </motion.a>
            ))}
          </div>
        </div>

        {/* Artículos recomendados */}
        <div className="mb-16">
          <h2 className="text-2xl font-display font-bold text-neutral-800 dark:text-white mb-6">
            Artículos Recomendados sobre Ansiedad
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {articles.map((article, index) => (
              <motion.a
                key={index}
                href={article.url}
                target={article.url.startsWith('/') ? '_self' : '_blank'}
                rel={article.url.startsWith('/') ? '' : 'noopener noreferrer'}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.1 * index }}
                className="block bg-white dark:bg-gray-800 hover:bg-blue-50 dark:hover:bg-gray-700 border border-neutral-200 dark:border-gray-700 rounded-xl p-5 transition-colors shadow-sm hover:shadow-md h-full flex flex-col"
              >
                <h3 className="font-medium text-lg text-neutral-800 dark:text-neutral-100 mb-2 flex-grow">{article.title}</h3>
                <p className="text-neutral-600 dark:text-neutral-300 text-sm mb-3 flex-grow">{article.description}</p>
                <div className="text-blue-600 dark:text-blue-400 text-sm font-medium flex items-center mt-auto pt-2">
                  Leer más
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </div>
              </motion.a>
            ))}
          </div>
        </div>

        {/* Contactos de emergencia */}
        <div className="mb-10">
          <h2 className="text-2xl font-display font-bold text-neutral-800 dark:text-white mb-6">
            Líneas de Ayuda y Emergencia (Colombia)
          </h2>
          
          <div className="bg-neutral-100 dark:bg-gray-800 border border-neutral-200 dark:border-gray-700 rounded-xl p-6">
            <div className="divide-y divide-neutral-200 dark:divide-gray-700">
              {emergencyContacts.map((contact, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.1 * index }}
                  className="py-4 first:pt-0 last:pb-0"
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between">
                    <div>
                      <h3 className="font-semibold text-neutral-800 dark:text-neutral-100">{contact.name}</h3>
                      <p className="text-neutral-600 dark:text-neutral-300 text-sm">{contact.availability}</p>
                    </div>
                    <a
                      href={contact.isPhone ? `tel:${contact.phone}` : '#'}
                      className={`mt-2 md:mt-0 inline-flex items-center ${contact.isPhone ? 'text-blue-600 dark:text-blue-400 hover:underline' : 'text-neutral-600 dark:text-neutral-300'} font-medium`}
                    >
                      {contact.phone}
                      {contact.isPhone && (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                        </svg>
                      )}
                    </a>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        {/* Disclaimer */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="bg-neutral-100 dark:bg-gray-800 border border-neutral-200 dark:border-gray-700 rounded-lg p-4 text-center max-w-3xl mx-auto"
        >
          <p className="text-neutral-600 dark:text-neutral-300 text-sm">
            <strong>Importante:</strong> Este es un centro de recursos informativos. No reemplaza la consulta profesional. Si tienes dudas sobre tu salud mental, consulta con un experto. En caso de emergencia, usa las líneas indicadas.
          </p>
        </motion.div>
      </div>
    </div>
  );
} 