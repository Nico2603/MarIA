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

  // Categorías de recursos
  const categories = [
    { title: 'Ansiedad', icon: '😰', link: '/recursos/ansiedad' },
    { title: 'Depresión', icon: '😔', link: '/recursos/depresion' },
    { title: 'Estrés', icon: '😫', link: '/recursos/estres' },
    { title: 'Bienestar', icon: '😌', link: '/recursos/bienestar' },
    { title: 'Crisis', icon: '🆘', link: '/recursos/crisis' },
    { title: 'Profesionales', icon: '👩‍⚕️', link: '/recursos/profesionales' },
  ];

  // Artículos recomendados
  const articles = [
    {
      title: 'Cómo manejar la ansiedad diaria',
      description: 'Estrategias prácticas para reducir la ansiedad en situaciones cotidianas',
      url: 'https://example.com/ansiedad-diaria',
    },
    {
      title: 'Signos de alerta en depresión',
      description: 'Reconoce las señales tempranas de la depresión para buscar ayuda a tiempo',
      url: 'https://example.com/signos-depresion',
    },
    {
      title: 'Técnicas de respiración para momentos de estrés',
      description: 'Ejercicios simples que puedes hacer en cualquier lugar',
      url: 'https://example.com/respiracion',
    },
  ];

  // Contactos de emergencia
  const emergencyContacts = [
    {
      name: 'Línea Nacional de Prevención del Suicidio',
      phone: '123-456-7890',
      availability: '24/7',
    },
    {
      name: 'Crisis Text Line',
      phone: 'Envía "AYUDA" al 741741',
      availability: '24/7',
    },
    {
      name: 'Emergencias',
      phone: '911',
      availability: '24/7',
    },
  ];

  return (
    <div className="min-h-screen py-12 px-4">
      <div className="container mx-auto max-w-5xl">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-3xl font-bold text-neutral-800 mb-2">Recursos de Salud Mental</h1>
          <p className="text-neutral-600 mb-10 text-lg">
            Una colección de recursos útiles para apoyar tu bienestar emocional y mental
          </p>
        </motion.div>

        {/* Recurso de emergencia destacado */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-red-50 border border-red-100 rounded-xl p-6 mb-10"
        >
          <div className="flex flex-col md:flex-row items-start md:items-center">
            <div className="bg-white rounded-full p-3 mr-4 mb-4 md:mb-0">
              {renderIcon('emergency')}
            </div>
            <div className="flex-grow">
              <h3 className="font-medium text-xl text-red-700">Línea de Ayuda en Crisis</h3>
              <p className="text-red-600 mt-1 mb-2">
                Contacto inmediato para situaciones de emergencia psicológica
              </p>
              <a
                href="tel:+123456789"
                className="inline-flex items-center mt-1 font-medium text-red-700 hover:text-red-800"
              >
                Llamar ahora
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </a>
            </div>
          </div>
        </motion.div>

        {/* Categorías de recursos */}
        <div className="mb-16">
          <h2 className="text-2xl font-display font-bold text-neutral-800 mb-6">
            Categorías de recursos
          </h2>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {categories.map((category, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.1 * index }}
              >
                <Link href={category.link}>
                  <div className="bg-white hover:bg-blue-50 border border-neutral-200 rounded-xl p-4 flex items-center transition-colors shadow-sm hover:shadow-md">
                    <div className="text-3xl mr-3">{category.icon}</div>
                    <h3 className="font-medium text-lg text-neutral-800">{category.title}</h3>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Lista de recursos */}
        <div className="mb-16">
          <h2 className="text-2xl font-display font-bold text-neutral-800 mb-6">
            Recursos útiles
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {resources.slice(1).map((resource) => (
              <motion.a
                key={resource.id}
                href={resource.url}
                target="_blank"
                rel="noopener noreferrer"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.1 * parseInt(resource.id) }}
                className="block bg-white hover:bg-neutral-50 border border-neutral-100 rounded-lg p-5 transition-colors shadow-sm hover:shadow-md"
              >
                <div className="flex items-start">
                  <div className="bg-neutral-50 rounded-full p-3 mr-4">
                    {renderIcon(resource.icon)}
                  </div>
                  <div>
                    <h3 className="font-medium text-lg text-neutral-800">{resource.title}</h3>
                    <p className="text-neutral-600 mt-1">{resource.description}</p>
                  </div>
                </div>
              </motion.a>
            ))}
          </div>
        </div>

        {/* Artículos recomendados */}
        <div className="mb-16">
          <h2 className="text-2xl font-display font-bold text-neutral-800 mb-6">
            Artículos recomendados
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {articles.map((article, index) => (
              <motion.a
                key={index}
                href={article.url}
                target="_blank"
                rel="noopener noreferrer"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.1 * index }}
                className="block bg-white hover:bg-blue-50 border border-neutral-200 rounded-xl p-5 transition-colors shadow-sm hover:shadow-md"
              >
                <h3 className="font-medium text-lg text-neutral-800 mb-2">{article.title}</h3>
                <p className="text-neutral-600 text-sm mb-3">{article.description}</p>
                <div className="text-blue-600 text-sm font-medium flex items-center">
                  Leer artículo
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
          <h2 className="text-2xl font-display font-bold text-neutral-800 mb-6">
            Contactos de emergencia
          </h2>
          
          <div className="bg-neutral-50 border border-neutral-200 rounded-xl p-6">
            <div className="divide-y divide-neutral-200">
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
                      <h3 className="font-semibold text-neutral-800">{contact.name}</h3>
                      <p className="text-neutral-600">{contact.availability}</p>
                    </div>
                    <a
                      href={contact.phone.includes('Envía') ? `sms:741741&body=AYUDA` : `tel:${contact.phone}`}
                      className="mt-2 md:mt-0 inline-flex items-center text-blue-600 hover:text-blue-700 font-medium"
                    >
                      {contact.phone}
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
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
          transition={{ duration: 0.5, delay: 0.6 }}
          className="bg-neutral-100 border border-neutral-200 rounded-lg p-4 text-center max-w-3xl mx-auto"
        >
          <p className="text-neutral-600">
            <strong>Importante:</strong> Los recursos proporcionados son orientativos. Consulta con un profesional de la salud mental para obtener asesoramiento específico para tu situación.
          </p>
        </motion.div>
      </div>
    </div>
  );
} 