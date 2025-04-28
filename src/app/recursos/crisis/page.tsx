'use client';

import React from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useTheme } from '@/components/ThemeProvider';
import { AlertTriangle, PhoneCall, ShieldCheck, Users, Heart, MessageSquare, LifeBuoy, FileText } from 'lucide-react';

const CrisisPage = () => {
  const { theme } = useTheme();

  const immediateActions = [
    { text: 'Llama a la Línea Nacional de Emergencia.', number: '123', icon: PhoneCall, important: true },
    { text: 'Llama a la Línea de Salud Mental (Bogotá y algunas otras ciudades - verifica disponibilidad local). ', number: '106', icon: PhoneCall, important: true },
    { text: 'Dirígete al servicio de urgencias del hospital o clínica más cercana.', icon: AlertTriangle },
    { text: 'Contacta a un familiar, amigo o persona de confianza para que te acompañe o ayude.', icon: Users },
    { text: 'Si estás con alguien en crisis, no lo dejes solo.', icon: ShieldCheck },
  ];

  const copingStrategies = [
    { text: 'Concéntrate en tu respiración: Inhala lento por 4 segundos, sostén por 4, exhala lento por 6.', icon: Heart },
    { text: 'Busca un lugar tranquilo y seguro si es posible.', icon: ShieldCheck },
    { text: 'Usa la técnica 5-4-3-2-1: Identifica 5 cosas que ves, 4 que tocas, 3 que oyes, 2 que hueles, 1 que saboreas.', icon: MessageSquare },
    { text: 'Si tienes un plan de seguridad, síguelo.', icon: FileText },
    { text: 'Evita el consumo de alcohol o drogas, pueden empeorar la situación.', icon: AlertTriangle },
    { text: 'Recuerda que esta sensación intensa es temporal y pasará.', icon: Heart },
  ];

  const helpingOthers = [
    'Mantén la calma y escucha activamente, sin juzgar.',
    'Valida sus sentimientos ("Entiendo que te sientas así", "Debe ser muy difícil").',
    'Pregúntale directamente si está pensando en hacerse daño o quitarse la vida. Hablar de ello no incita a hacerlo, al contrario, puede aliviar.',
    'No prometas guardar el secreto si existe un riesgo para su vida.',
    'Anímalo/a a buscar o aceptar ayuda profesional y ofrécete a acompañarlo/a si es posible.',
    'Si es seguro hacerlo, retira medios potencialmente peligrosos (medicamentos, objetos cortantes).',
    'No lo/a dejes solo/a hasta que llegue ayuda profesional o un familiar informado.',
    'Llama a las líneas de emergencia (123 o 106) si la situación es grave o sientes que no puedes manejarla solo/a.'
  ];

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-800'}`}>
      <div className="container mx-auto px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-3xl md:text-4xl font-bold mb-8 text-red-600 dark:text-red-500 flex items-center justify-center">
            <AlertTriangle className="w-8 h-8 mr-3"/> 
            Manejo de Crisis de Salud Mental
          </h1>
          
          <div className={`rounded-lg p-6 mb-8 ${theme === 'dark' ? 'bg-red-900/30' : 'bg-red-50'} border-l-4 border-red-600 dark:border-red-500`}>
            <h2 className="text-2xl font-semibold mb-4 text-red-700 dark:text-red-400 flex items-center">
              <AlertTriangle className="w-6 h-6 mr-2"/>
              ¿Qué es una Crisis de Salud Mental?
            </h2>
            <p className="mb-4">
              Es una situación donde la angustia emocional o psicológica es tan intensa que interfiere gravemente con la vida diaria. Puede incluir pensamientos de autolesión o suicidio, ansiedad extrema, pánico severo o pérdida de contacto con la realidad.
            </p>
            <p className="font-semibold">
              Una crisis de salud mental es una emergencia y requiere atención inmediata.
            </p>
          </div>

          {/* Acciones Inmediatas */}
          <div className={`rounded-lg p-6 mb-8 ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} shadow-md border-l-4 border-red-500`}>
            <h2 className="text-2xl font-semibold mb-4 flex items-center text-red-600 dark:text-red-400">
               <PhoneCall className="w-6 h-6 mr-2"/>
               Acciones Inmediatas si Estás en Crisis
            </h2>
            <p className="mb-6">
              Si sientes que estás en una crisis o piensas en hacerte daño, busca ayuda <strong>AHORA</strong>. No estás solo/a. Prioriza estas acciones:
            </p>
            <ul className="space-y-4">
              {immediateActions.map((action, index) => (
                <li key={index} className={`flex items-start p-3 rounded-md ${action.important ? (theme === 'dark' ? 'bg-red-900/50' : 'bg-red-100') : ''}`}>
                  <action.icon className={`w-6 h-6 mr-3 ${action.important ? 'text-red-500' : 'text-blue-500 dark:text-blue-400'} flex-shrink-0 mt-1`} />
                  <span>
                    {action.text}
                    {action.number && (
                      <strong className="ml-2 text-lg font-bold text-red-600 dark:text-red-400">{action.number}</strong>
                    )}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          {/* Estrategias de Afrontamiento Inmediatas */}
          <div className={`rounded-lg p-6 mb-8 ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} shadow-md`}>
            <h2 className="text-2xl font-semibold mb-4 flex items-center text-blue-600 dark:text-blue-400">
                <LifeBuoy className="w-6 h-6 mr-2" />
                Estrategias para Afrontar el Momento
            </h2>
            <p className="mb-6">
              Mientras buscas o esperas ayuda, estas estrategias pueden ayudarte a sobrellevar la intensidad del momento:
            </p>
            <ul className="space-y-4">
              {copingStrategies.map((strategy, index) => (
                <li key={index} className="flex items-start">
                  <strategy.icon className="w-6 h-6 mr-3 text-blue-500 dark:text-blue-400 flex-shrink-0 mt-1" />
                  <span>{strategy.text}</span>
                </li>
              ))}
            </ul>
          </div>
          
          {/* Qué es un Plan de Seguridad */}
          <div className={`rounded-lg p-6 mb-8 ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} shadow-md`}>
            <h2 className="text-2xl font-semibold mb-4 flex items-center text-green-600 dark:text-green-400">
               <FileText className="w-6 h-6 mr-2"/>
               ¿Qué es un Plan de Seguridad Personal?
            </h2>
            <p className="mb-4">
                Es una herramienta personalizada que puedes crear (idealmente con ayuda de un profesional) para saber qué hacer cuando empiezas a sentirte en crisis o tienes pensamientos difíciles. Ayuda a mantenerte seguro/a.
            </p>
             <p className="mb-2">Generalmente incluye:</p>
            <ul className="space-y-1 list-disc pl-5 text-sm">
                <li>Señales de advertencia de que una crisis podría empezar.</li>
                <li>Estrategias de afrontamiento internas (cosas que puedes hacer tú mismo/a).</li>
                <li>Personas y lugares que te distraen o ayudan a sentirte mejor.</li>
                <li>Contactos de apoyo (amigos, familiares).</li>
                <li>Contactos profesionales (terapeuta, líneas de ayuda).</li>
                <li>Pasos para hacer tu entorno más seguro.</li>
            </ul>
             <p className="text-sm italic mt-4">Habla con un profesional para crear o revisar tu propio plan de seguridad.</p>
          </div>

          {/* Ayudando a Otros */}
          <div className={`rounded-lg p-6 mb-8 ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} shadow-md`}>
            <h2 className="text-2xl font-semibold mb-4 flex items-center text-blue-600 dark:text-blue-400">
                <Users className="w-6 h-6 mr-2"/>
                Cómo Ayudar a Alguien en Crisis
            </h2>
            <p className="mb-6">
              Si alguien cercano está en crisis, tu apoyo calmado y sin juicios es crucial. Aquí algunas pautas:
            </p>
            <ul className="space-y-3 list-disc pl-5 mb-6">
              {helpingOthers.map((tip, index) => (
                <li key={index}>{tip}</li>
              ))}
            </ul>
             <div className={`p-4 rounded-md ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}>
                <h3 className="font-semibold mb-2 text-yellow-600 dark:text-yellow-400">Cuídate También:</h3>
                <p className="text-sm">
                    Apoyar a alguien en crisis puede ser emocionalmente agotador. Busca tu propio apoyo si lo necesitas (hablar con alguien de confianza, un profesional), establece límites saludables y reconoce tus propias emociones. No tienes que llevar esta carga solo/a.
                </p>
             </div>
          </div>

          {/* Después de la Crisis */}
          <div className={`rounded-lg p-6 mb-8 ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'} border-l-4 ${theme === 'dark' ? 'border-blue-400' : 'border-blue-500'}`}>
            <h2 className="text-xl font-semibold mb-3">Después de la Crisis: Buscar Apoyo Continuo</h2>
            <p className="mb-4">
              Superada la crisis inmediata, es vital buscar apoyo profesional para entender las causas y crear estrategias a largo plazo. Considera:
            </p>
            <ul className="space-y-2 list-disc pl-5 mb-4">
                <li>Contactar a un psicólogo, psiquiatra o profesional de salud mental.</li>
                <li>Hablar con tu médico de cabecera o tu EPS para orientación.</li>
                <li>Desarrollar o actualizar tu <span className="font-semibold">Plan de Seguridad Personal</span> con ayuda profesional.</li>
                <li>Identificar desencadenantes y señales de advertencia tempranas de futuras crisis.</li>
                <li>Fortalecer tu red de apoyo (familia, amigos, grupos de apoyo).</li>
            </ul>
            <Link 
              href="/recursos/profesionales" 
              className={`inline-flex items-center px-3 py-1 rounded-md text-sm font-medium ${theme === 'dark' ? 'bg-blue-600 hover:bg-blue-700 text-white' : 'bg-blue-500 hover:bg-blue-600 text-white'} transition-colors duration-200`}
            >
              Encontrar Profesionales en Colombia
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </Link>
          </div>

          {/* Botón Volver */} 
          <div className="flex justify-start mt-8">
            <Link 
              href="/recursos" 
              className={`inline-flex items-center px-4 py-2 rounded-md ${theme === 'dark' ? 'bg-gray-700 hover:bg-gray-600 text-white' : 'bg-gray-200 hover:bg-gray-300 text-gray-700'} transition-colors duration-200`}
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
