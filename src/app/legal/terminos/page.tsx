'use client';

import React from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useTheme } from '@/components/ThemeProvider';

const TerminosPage = () => {
  const { theme } = useTheme();
  
  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-800'}`}>
      <div className="container mx-auto px-4 py-12">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-3xl md:text-4xl font-bold mb-8 text-blue-600">Términos y Condiciones</h1>
          
          <div className={`rounded-lg p-6 mb-8 ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} shadow-md`}>
            <h2 className="text-2xl font-semibold mb-4">Introducción</h2>
            <p className="mb-4">
              Bienvenido a AI Mental Health. Al acceder a nuestra plataforma, aceptas cumplir con estos términos y condiciones de uso, todas las leyes y regulaciones aplicables, y reconoces que eres responsable de cumplir con las leyes locales aplicables.
            </p>
            <p>
              Si no estás de acuerdo con alguno de estos términos, tienes prohibido utilizar o acceder a esta plataforma. Los materiales contenidos en este sitio web están protegidos por las leyes de derechos de autor y marcas comerciales aplicables.
            </p>
          </div>
          
          <div className={`rounded-lg p-6 mb-8 ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} shadow-md`}>
            <h2 className="text-2xl font-semibold mb-4">Uso del Servicio</h2>
            <p className="mb-4">
              AI Mental Health proporciona herramientas y recursos para el bienestar mental. Sin embargo:
            </p>
            <ul className="space-y-3 list-disc pl-5">
              <li>Esta plataforma no sustituye la atención profesional de salud mental.</li>
              <li>Los contenidos proporcionados son meramente informativos y educativos.</li>
              <li>En caso de emergencia, debes contactar inmediatamente con los servicios de emergencia locales o acudir al centro médico más cercano.</li>
              <li>No nos hacemos responsables de las decisiones tomadas basadas únicamente en la información proporcionada en esta plataforma.</li>
            </ul>
          </div>
          
          <div className={`rounded-lg p-6 mb-8 ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} shadow-md`}>
            <h2 className="text-2xl font-semibold mb-4">Cuentas de Usuario</h2>
            <p className="mb-4">
              Al crear una cuenta en nuestra plataforma, debes proporcionarnos información precisa y completa. Eres el único responsable de:
            </p>
            <ul className="space-y-2 list-disc pl-5 mb-4">
              <li>Mantener la confidencialidad de tu cuenta y contraseña.</li>
              <li>Restringir el acceso a tu computadora o dispositivo.</li>
              <li>Todas las actividades que ocurran bajo tu cuenta o contraseña.</li>
            </ul>
            <p>
              Nos reservamos el derecho de suspender o terminar cuentas, rechazar servicio, eliminar o editar contenido, a nuestra discreción.
            </p>
          </div>
          
          <div className={`rounded-lg p-6 mb-8 ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} shadow-md`}>
            <h2 className="text-2xl font-semibold mb-4">Limitación de Responsabilidad</h2>
            <p className="mb-4">
              Los materiales en el sitio web de AI Mental Health se proporcionan "tal cual". No ofrecemos garantías, expresas o implícitas, y por este medio rechazamos y negamos todas las demás garantías, incluyendo, sin limitación, garantías implícitas o condiciones de comerciabilidad, idoneidad para un propósito particular, o no infracción de propiedad intelectual u otra violación de derechos.
            </p>
            <p className="mb-4">
              Además, AI Mental Health no garantiza ni hace ninguna representación con respecto a la precisión, los resultados probables, o la confiabilidad del uso de los materiales en su sitio web o de otra manera relacionados con dichos materiales o en cualquier sitio vinculado a este sitio.
            </p>
          </div>
          
          <div className={`rounded-lg p-6 mb-8 ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} shadow-md`}>
            <h2 className="text-2xl font-semibold mb-4">Modificaciones</h2>
            <p className="mb-4">
              AI Mental Health puede revisar estos términos de servicio para su sitio web en cualquier momento sin previo aviso. Al usar este sitio web, aceptas estar sujeto a la versión actual de estos términos y condiciones de servicio.
            </p>
          </div>
          
          <div className={`rounded-lg p-6 mb-8 ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} shadow-md`}>
            <h2 className="text-2xl font-semibold mb-4">Ley Aplicable</h2>
            <p className="mb-4">
              Estos términos y condiciones se rigen e interpretan de acuerdo con las leyes aplicables, y te sometes irrevocablemente a la jurisdicción exclusiva de los tribunales de esa jurisdicción.
            </p>
          </div>
          
          <div className="flex flex-wrap justify-between gap-4 mt-8">
            <Link 
              href="/" 
              className={`inline-flex items-center px-4 py-2 rounded-md ${theme === 'dark' ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-200 hover:bg-gray-300'} transition-colors duration-200`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Volver al Inicio
            </Link>
            
            <div className="flex gap-4">
              <Link 
                href="/legal/privacidad" 
                className={`inline-flex items-center px-4 py-2 rounded-md ${theme === 'dark' ? 'bg-blue-600 hover:bg-blue-700' : 'bg-blue-500 hover:bg-blue-600'} text-white transition-colors duration-200`}
              >
                Política de Privacidad
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default TerminosPage; 