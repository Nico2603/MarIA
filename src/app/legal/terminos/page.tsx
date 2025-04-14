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
          <h1 className="text-3xl md:text-4xl font-bold mb-8 text-blue-600">Términos y Condiciones de Uso</h1>
          
          <div className={`rounded-lg p-6 mb-8 ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} shadow-md`}>
            <h2 className="text-2xl font-semibold mb-4">Introducción</h2>
            <p className="mb-4">
              Bienvenido a AI Mental Health Colombia. Al acceder a nuestra plataforma y utilizar nuestros servicios, aceptas cumplir con estos términos y condiciones de uso ("Términos"), todas las leyes y regulaciones aplicables en Colombia, y reconoces que eres responsable de cumplir con las leyes locales aplicables.
            </p>
            <p>
              Si no estás de acuerdo con alguno de estos términos, tienes prohibido utilizar o acceder a esta plataforma. Los materiales y contenidos en esta plataforma están protegidos por las leyes colombianas e internacionales de derechos de autor y marcas comerciales aplicables.
            </p>
          </div>
          
          <div className={`rounded-lg p-6 mb-8 ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} shadow-md`}>
            <h2 className="text-2xl font-semibold mb-4">Uso del Servicio y Limitaciones Importantes</h2>
            <p className="mb-4">
              AI Mental Health Colombia proporciona herramientas de apoyo, información y recursos basados en IA para el bienestar mental. Sin embargo, es crucial entender y aceptar las siguientes limitaciones:
            </p>
            <ul className="space-y-3 list-disc pl-5">
              <li><strong>No es un servicio médico ni terapéutico:</strong> Esta plataforma no sustituye la atención profesional de salud mental proporcionada por psicólogos, psiquiatras u otros profesionales licenciados en Colombia.</li>
              <li><strong>No proporciona diagnósticos ni tratamientos:</strong> Los contenidos y las interacciones con la IA son informativos y de apoyo, no constituyen diagnóstico ni recomendación de tratamiento médico o psicológico.</li>
              <li><strong>No es un servicio de emergencia:</strong> En caso de emergencia o crisis de salud mental (pensamientos suicidas, riesgo de daño), debes contactar inmediatamente con la línea de emergencia nacional 123, la Línea de Salud Mental 106, o acudir al centro médico u hospital más cercano.</li>
              <li><strong>Decisiones personales:</strong> No nos hacemos responsables de las decisiones tomadas basadas únicamente en la información proporcionada en esta plataforma. Consulta siempre a un profesional cualificado.</li>
              <li><strong>Limitaciones de la IA:</strong> La IA puede cometer errores, malinterpretar contextos o no captar la complejidad de una situación individual. No posee juicio clínico humano.</li>
            </ul>
            <p className="mt-4">Para más detalles sobre las limitaciones, consulta nuestra sección de <Link href="/legal/limitaciones" className="text-blue-500 hover:underline">Limitaciones de Responsabilidad</Link>.</p>
          </div>
          
          <div className={`rounded-lg p-6 mb-8 ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} shadow-md`}>
            <h2 className="text-2xl font-semibold mb-4">Cuentas de Usuario (Si aplica)</h2>
            <p className="mb-4">
              Si la plataforma requiere la creación de una cuenta:
            </p>
            <ul className="space-y-2 list-disc pl-5 mb-4">
              <li>Debes proporcionar información precisa y completa.</li>
              <li>Eres responsable de mantener la confidencialidad de tu cuenta y contraseña.</li>
              <li>Debes restringir el acceso a tu dispositivo.</li>
              <li>Eres responsable de todas las actividades que ocurran bajo tu cuenta.</li>
            </ul>
            <p>
              Nos reservamos el derecho de suspender o terminar cuentas, rechazar servicio, eliminar o editar contenido, a nuestra discreción, en caso de incumplimiento de estos Términos o la ley.
            </p>
          </div>
          
          <div className={`rounded-lg p-6 mb-8 ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} shadow-md`}>
            <h2 className="text-2xl font-semibold mb-4">Exclusión de Garantías y Limitación de Responsabilidad</h2>
            <p className="mb-4">
              Los materiales y servicios en la plataforma de AI Mental Health Colombia se proporcionan "tal cual" y "según disponibilidad". No ofrecemos garantías, expresas o implícitas, sobre la exactitud, integridad, fiabilidad o idoneidad de la información o los servicios para un propósito particular. Rechazamos todas las demás garantías, incluyendo, sin limitación, garantías implícitas de comerciabilidad o no infracción.
            </p>
            <p className="mb-4">
              En ningún caso AI Mental Health Colombia S.A.S., sus directores, empleados o afiliados serán responsables por daños directos, indirectos, incidentales, especiales, consecuentes o punitivos (incluyendo, sin limitación, daños por pérdida de datos o beneficios, o debido a interrupción del negocio) que surjan del uso o la imposibilidad de usar los materiales o servicios en la plataforma, incluso si hemos sido notificados de la posibilidad de tales daños. Consulta nuestra sección de <Link href="/legal/limitaciones" className="text-blue-500 hover:underline">Limitaciones de Responsabilidad</Link> para más detalles.
            </p>
          </div>
          
          <div className={`rounded-lg p-6 mb-8 ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} shadow-md`}>
            <h2 className="text-2xl font-semibold mb-4">Modificaciones</h2>
            <p className="mb-4">
              AI Mental Health Colombia puede revisar estos Términos de uso para su plataforma en cualquier momento sin previo aviso. Al usar esta plataforma, aceptas estar sujeto a la versión vigente de estos Términos.
            </p>
          </div>
          
          <div className={`rounded-lg p-6 mb-8 ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} shadow-md`}>
            <h2 className="text-2xl font-semibold mb-4">Ley Aplicable y Jurisdicción</h2>
            <p className="mb-4">
              Estos Términos se rigen e interpretan de acuerdo con las leyes de la República de Colombia. Te sometes irrevocablemente a la jurisdicción exclusiva de los tribunales de Bogotá D.C., Colombia, para resolver cualquier disputa que surja en relación con estos Términos o el uso de la plataforma, renunciando a cualquier otro fuero que pudiera corresponderte.
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