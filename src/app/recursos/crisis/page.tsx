'use client';

import React from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useTheme } from '@/components/ThemeProvider';
import { AlertTriangle, PhoneCall, ShieldCheck, Users, Heart, MessageSquare, LifeBuoy } from 'lucide-react';

const CrisisPage = () => {
  const { theme } = useTheme();

  const immediateActions = [
    { text: 'Llama a la Línea Nacional de Emergencia 123.', icon: PhoneCall },
    { text: 'Llama a la Línea de Salud Mental 106 (disponible en Bogotá y algunas otras ciudades, verifica disponibilidad local). ', icon: PhoneCall },
    { text: 'Dirígete al servicio de urgencias del hospital o clínica más cercana.', icon: AlertTriangle },
    { text: 'Contacta a un familiar, amigo o persona de confianza para que te acompañe o ayude.', icon: Users },
    { text: 'Si estás con alguien en crisis, no lo dejes solo.', icon: ShieldCheck },
  ];

  const copingStrategies = [
    { text: 'Concéntrate en tu respiración: Inhala lento por 4 segundos, sostén por 4, exhala lento por 6.', icon: Heart },
    { text: 'Busca un lugar tranquilo y seguro si es posible.', icon: ShieldCheck },
    { text: 'Usa la técnica 5-4-3-2-1: Identifica 5 cosas que ves, 4 que tocas, 3 que oyes, 2 que hueles, 1 que saboreas.', icon: MessageSquare },
    { text: 'Si tienes un plan de seguridad, síguelo.', icon: LifeBuoy },
    { text: 'Evita el consumo de alcohol o drogas.', icon: AlertTriangle },
    { text: 'Recuerda que la sensación intensa pasará.', icon: Heart },
  ];

  const helpingOthers = [
    'Mantén la calma y escucha sin juzgar.',
    'Valida sus sentimientos y muestra empatía.',
    'Pregúntale directamente si está pensando en hacerse daño.',
    'No prometas guardar el secreto si hay riesgo.',
    'Anímalo a buscar ayuda profesional y ofrécete a acompañarlo.',
    'Retira cualquier medio peligroso (medicamentos, objetos cortantes) si es seguro hacerlo.',
    'No lo dejes solo hasta que llegue ayuda profesional o un familiar.',
    'Llama a las líneas de emergencia (123 o 106) si la situación es grave.'
  ];

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-800'}`}>
      <div className="container mx-auto px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-3xl md:text-4xl font-bold mb-8 text-red-600 flex items-center">
            <AlertTriangle className="w-8 h-8 mr-3"/> 
            Manejo de Crisis de Salud Mental
          </h1>
          
          <div className={`rounded-lg p-6 mb-8 ${theme === 'dark' ? 'bg-red-900/30' : 'bg-red-50'} border-l-4 border-red-600`}>
            <h2 className="text-2xl font-semibold mb-4 text-red-700 dark:text-red-400">¿Qué es una Crisis de Salud Mental?</h2>
            <p className="mb-4">
              Una crisis de salud mental es una situación en la que una persona experimenta una angustia emocional o psicológica tan intensa que le resulta difícil funcionar en su vida diaria. Puede incluir pensamientos de autolesión o suicidio, comportamiento errático, ansiedad extrema, ataques de pánico severos, o pérdida de contacto con la realidad (psicosis).
            </p>
            <p className="font-semibold">
              Es una emergencia médica y requiere atención inmediata.
            </p>
          </div>

          {/* Acciones Inmediatas */}
          <div className={`rounded-lg p-6 mb-8 ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} shadow-md`}>
            <h2 className="text-2xl font-semibold mb-4 flex items-center">
               <PhoneCall className="w-6 h-6 mr-2 text-red-500"/>
               Acciones Inmediatas si Estás en Crisis
            </h2>
            <p className="mb-6">
              Si sientes que estás en una crisis o tienes pensamientos de hacerte daño, busca ayuda AHORA MISMO. No estás solo/a. Estas son las acciones prioritarias:
            </p>
            <ul className="space-y-4">
              {immediateActions.map((action, index) => (
                <li key={index} className="flex items-start">
                  <action.icon className={`w-6 h-6 mr-3 ${index < 2 ? 'text-red-500' : 'text-blue-500'} flex-shrink-0 mt-1`} />
                  <span>{action.text}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Estrategias de Afrontamiento Inmediatas */}
          <div className={`rounded-lg p-6 mb-8 ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} shadow-md`}>
            <h2 className="text-2xl font-semibold mb-4 flex items-center">
                <LifeBuoy className="w-6 h-6 mr-2 text-blue-500" />
                Estrategias para Afrontar el Momento
            </h2>
            <p className="mb-6">
              Mientras buscas o esperas ayuda, estas estrategias pueden ayudarte a sobrellevar la intensidad del momento:
            </p>
            <ul className="space-y-4">
              {copingStrategies.map((strategy, index) => (
                <li key={index} className="flex items-start">
                  <strategy.icon className="w-6 h-6 mr-3 text-blue-500 flex-shrink-0 mt-1" />
                  <span>{strategy.text}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Ayudando a Otros */}
          <div className={`rounded-lg p-6 mb-8 ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} shadow-md`}>
            <h2 className="text-2xl font-semibold mb-4 flex items-center">
                <Users className="w-6 h-6 mr-2 text-blue-500"/>
                Cómo Ayudar a Alguien en Crisis
            </h2>
            <p className="mb-6">
              Si alguien cercano a ti está en crisis, tu apoyo puede ser crucial. Aquí algunas pautas:
            </p>
            <ul className="space-y-3 list-disc pl-5">
              {helpingOthers.map((tip, index) => (
                <li key={index}>{tip}</li>
              ))}
            </ul>
             <p className="text-sm italic mt-4">Recuerda cuidar también de tu propio bienestar emocional al apoyar a alguien en crisis.</p>
          </div>

          {/* Después de la Crisis */}
          <div className={`rounded-lg p-6 mb-8 ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'} border-l-4 ${theme === 'dark' ? 'border-blue-400' : 'border-blue-500'}`}>
            <h2 className="text-xl font-semibold mb-3">Después de la Crisis: Buscar Apoyo Continuo</h2>
            <p className="mb-4">
              Una vez que la crisis inmediata haya pasado, es fundamental buscar apoyo profesional para abordar las causas subyacentes y desarrollar un plan de manejo a largo plazo. Considera:
            </p>
            <ul className="space-y-2 list-disc pl-5 mb-4">
                <li>Contactar a un psicólogo o psiquiatra.</li>
                <li>Hablar con tu médico de cabecera o EPS.</li>
                <li>Crear un plan de seguridad personal con ayuda de un profesional.</li>
                <li>Identificar desencadenantes y señales de advertencia tempranas.</li>
                <li>Fortalecer tu red de apoyo social.</li>
            </ul>
            <Link 
              href="/recursos/profesionales" 
              className={`inline-flex items-center px-3 py-1 rounded-md text-sm ${theme === 'dark' ? 'bg-blue-600 hover:bg-blue-700' : 'bg-blue-500 hover:bg-blue-600'} text-white transition-colors duration-200`}
            >
              Encontrar Profesionales en Colombia
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </Link>
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

export default CrisisPage;
