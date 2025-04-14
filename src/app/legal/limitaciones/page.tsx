'use client';

import React from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useTheme } from '@/components/ThemeProvider';

const LimitacionesPage = () => {
  const { theme } = useTheme();
  
  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-800'}`}>
      <div className="container mx-auto px-4 py-12">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-3xl md:text-4xl font-bold mb-8 text-blue-600">Limitaciones de Responsabilidad</h1>
          
          <div className={`bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 mb-8 dark:bg-yellow-900/30 dark:text-yellow-300 dark:border-yellow-600`}>
            <p className="font-bold mb-2">AVISO IMPORTANTE</p>
            <p>Este documento detalla las limitaciones de nuestra plataforma de asistencia en salud mental AI Mental Health Colombia. Por favor, léalo atentamente.</p>
          </div>
          
          <div className={`rounded-lg p-6 mb-8 ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} shadow-md`}>
            <h2 className="text-2xl font-semibold mb-4">Alcance del servicio</h2>
            <p className="mb-4">
              AI Mental Health Colombia es una plataforma de apoyo basada en inteligencia artificial diseñada para ofrecer recursos, información y herramientas de autoayuda en el ámbito de la salud mental en Colombia. Nuestra plataforma tiene las siguientes limitaciones fundamentales que todo usuario debe conocer y aceptar:
            </p>
            
            <div className="space-y-4 mb-6">
              <div className="bg-red-100 p-4 rounded-md dark:bg-red-900/30">
                <h3 className="text-lg font-medium mb-2 text-red-700 dark:text-red-400">No somos un servicio médico o terapéutico</h3>
                <p>
                  AI Mental Health Colombia no ofrece servicios médicos, psicológicos o terapéuticos profesionales. Nuestra plataforma no está diseñada para diagnosticar, tratar, curar o prevenir ninguna condición médica o psicológica. Todo el contenido y las interacciones con nuestra IA tienen fines informativos y de apoyo únicamente.
                </p>
              </div>
              
              <div className="bg-red-100 p-4 rounded-md dark:bg-red-900/30">
                <h3 className="text-lg font-medium mb-2 text-red-700 dark:text-red-400">No sustituimos a profesionales de la salud</h3>
                <p>
                  Ninguna información, contenido o interacción con nuestra plataforma debe interpretarse como consejo médico o psicológico profesional. AI Mental Health Colombia no sustituye la consulta, diagnóstico o tratamiento de profesionales cualificados y registrados en Colombia (psicólogos, psiquiatras, etc.).
                </p>
              </div>
              
              <div className="bg-red-100 p-4 rounded-md dark:bg-red-900/30">
                <h3 className="text-lg font-medium mb-2 text-red-700 dark:text-red-400">No somos un servicio de emergencia</h3>
                <p>
                  AI Mental Health Colombia NO es un servicio de emergencia y no está diseñado para responder a crisis de salud mental. Si experimenta una emergencia psicológica, pensamientos suicidas, o siente que puede hacerse daño a sí mismo o a otros, contacte inmediatamente con la **línea de emergencia nacional 123** o la **Línea de Salud Mental 106**, o acuda al servicio de urgencias médicas u hospital más cercano.
                </p>
              </div>
            </div>
          </div>
          
          <div className={`rounded-lg p-6 mb-8 ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} shadow-md`}>
            <h2 className="text-2xl font-semibold mb-4">Limitaciones de la IA</h2>
            <p className="mb-4">
              Nuestra plataforma utiliza tecnología de inteligencia artificial avanzada, pero tiene importantes limitaciones inherentes:
            </p>
            
            <ul className="space-y-3 list-disc pl-6 mb-6">
              <li>
                <strong>Conocimiento limitado:</strong> Aunque nuestra IA ha sido entrenada con conocimientos en salud mental, no posee el juicio clínico, la experiencia, ni la capacidad de evaluación directa que tiene un profesional humano cualificado.
              </li>
              <li>
                <strong>Sin capacidad de diagnóstico:</strong> La IA no puede diagnosticar trastornos mentales o condiciones médicas. Cualquier información que sugiera posibles condiciones debe considerarse como meramente orientativa y nunca como un diagnóstico formal.
              </li>
              <li>
                <strong>Comprensión contextual limitada:</strong> A pesar de sus capacidades, la IA puede malinterpretar el contexto de ciertas situaciones o no captar completamente la complejidad emocional y personal única de cada usuario.
              </li>
              <li>
                <strong>Posibilidad de errores:</strong> Como toda tecnología, nuestra IA puede cometer errores o proporcionar información que no sea completamente precisa o aplicable a su situación específica.
              </li>
              <li>
                <strong>Sin supervisión humana directa:</strong> Las interacciones con la IA no son revisadas en tiempo real por profesionales de la salud mental. La respuesta que recibe es generada automáticamente por el sistema.
              </li>
            </ul>
            
            <div className={`bg-blue-100 border-l-4 border-blue-500 text-blue-700 p-4 mb-6 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-600`}>
              <p>
                <strong>Nota importante:</strong> Aunque nuestros modelos de IA han sido desarrollados con orientación, la IA no es un profesional de la salud y no debe utilizarse como sustituto de la atención médica o psicológica profesional.
              </p>
            </div>
          </div>
          
          <div className={`rounded-lg p-6 mb-8 ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} shadow-md`}>
            <h2 className="text-2xl font-semibold mb-4">Situaciones críticas y emergencias</h2>
            <p className="mb-4">
              AI Mental Health Colombia NO está equipado para manejar situaciones críticas o emergencias de salud mental. Si usted o alguien que conoce está experimentando alguna de las siguientes situaciones, por favor busque ayuda profesional inmediata:
            </p>
            
            <ul className="space-y-3 list-disc pl-6 mb-6">
              <li>Pensamientos o intenciones suicidas</li>
              <li>Impulsos de hacerse daño a sí mismo o a otros</li>
              <li>Experimentar alucinaciones o delirios</li>
              <li>Crisis de pánico severas</li>
              <li>Síntomas de abstinencia de sustancias graves</li>
              <li>Cualquier situación que represente un riesgo inmediato para la salud o seguridad</li>
            </ul>
            
            <div className="bg-red-100 p-4 rounded-md mb-6 dark:bg-red-900/30">
              <h3 className="text-lg font-medium mb-2 text-red-700 dark:text-red-400">Recursos de emergencia en Colombia</h3>
              <ul className="space-y-2">
                <li><strong>Emergencias generales (Policía, Bomberos, Ambulancia):</strong> <a href="tel:123" className="font-bold hover:underline">123</a></li>
                <li><strong>Línea de Salud Mental Nacional:</strong> <a href="tel:106" className="font-bold hover:underline">106</a> (Puede variar por departamento, verificar localmente)</li>
                <li><strong>Línea Nacional de Prevención del Suicidio (Operada por MinSalud):</strong> Consultar líneas locales o <a href="tel:106" className="font-bold hover:underline">106</a></li>
                <li><strong>Urgencias hospitalarias:</strong> Acuda al hospital o centro médico más cercano</li>
              </ul>
              <p className="text-sm italic mt-3">Verifica los números y recursos específicos de tu ciudad o departamento.</p>
            </div>
          </div>
          
          <div className={`rounded-lg p-6 mb-8 ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} shadow-md`}>
            <h2 className="text-2xl font-semibold mb-4">Límites de responsabilidad</h2>
            <p className="mb-4">
              Considerando las limitaciones mencionadas anteriormente, AI Mental Health Colombia S.A.S. establece las siguientes exclusiones de responsabilidad:
            </p>
            
            <ol className="space-y-3 list-decimal pl-6 mb-6">
              <li>
                <strong>No responsabilidad médica/psicológica:</strong> AI Mental Health Colombia no asume responsabilidad por decisiones médicas, diagnósticos o tratamientos basados en la información proporcionada.
              </li>
              <li>
                <strong>Exactitud de la información:</strong> Aunque nos esforzamos por proporcionar información útil, no garantizamos la exactitud, integridad o idoneidad de la información para ningún propósito específico.
              </li>
              <li>
                <strong>Resultados individuales:</strong> No garantizamos resultados específicos del uso de nuestros recursos, ya que la salud mental varía entre individuos.
              </li>
              <li>
                <strong>Interacciones con la IA:</strong> No nos responsabilizamos por malentendidos o consejos inadecuados que puedan surgir de las limitaciones de la IA.
              </li>
              <li>
                <strong>Decisiones del usuario:</strong> El usuario es el único responsable de sus decisiones y acciones basadas en la información o recursos proporcionados.
              </li>
              <li>
                <strong>Contenido de terceros:</strong> No asumimos responsabilidad por el contenido o prácticas de sitios web de terceros vinculados.
              </li>
            </ol>
            
            <p className="font-medium">
              Al utilizar AI Mental Health Colombia, usted reconoce y acepta estas limitaciones y exclusiones de responsabilidad. Si no está de acuerdo, le recomendamos no utilizar nuestros servicios.
            </p>
          </div>
          
          <div className={`rounded-lg p-6 mb-8 ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} shadow-md`}>
            <h2 className="text-2xl font-semibold mb-4">Mejores prácticas para el uso de la plataforma</h2>
            <p className="mb-4">
              Para maximizar los beneficios mientras reconoce las limitaciones, recomendamos:
            </p>
            
            <ul className="space-y-3 list-disc pl-6 mb-6">
              <li>
                <strong>Consulte con profesionales:</strong> Use la plataforma como complemento, no sustituto, de la atención profesional en Colombia.
              </li>
              <li>
                <strong>Verifique la información:</strong> Contraste la información con fuentes acreditadas y profesionales de la salud locales.
              </li>
              <li>
                <strong>Sea consciente de las limitaciones:</strong> Recuerde que la IA no tiene juicio clínico humano.
              </li>
              <li>
                <strong>Utilice los recursos adecuados:</strong> Para situaciones agudas o diagnósticos, busque siempre ayuda profesional directa.
              </li>
              <li>
                <strong>Proporcione feedback:</strong> Ayúdenos a mejorar informando sobre contenido o respuestas incorrectas.
              </li>
            </ul>
            
            <div className={`bg-green-100 border-l-4 border-green-500 text-green-700 p-4 dark:bg-green-900/30 dark:text-green-300 dark:border-green-600`}>
              <p className="font-bold mb-2">RECORDATORIO</p>
              <p>AI Mental Health Colombia está diseñado para complementar, nunca para reemplazar, la atención profesional de salud mental. Nuestro objetivo es proporcionar recursos de apoyo y educación útiles.</p>
            </div>
          </div>
          
          <div className={`rounded-lg p-6 mb-8 ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} shadow-md`}>
            <h2 className="text-2xl font-semibold mb-4">Actualización de estas limitaciones</h2>
            <p className="mb-4">
              AI Mental Health Colombia S.A.S. se reserva el derecho de modificar estas limitaciones en cualquier momento. Se notificarán los cambios sustanciales.
            </p>
            <p>
              Estas limitaciones fueron actualizadas por última vez el 15 de septiembre de 2023.
            </p>
          </div>
          
          <div className={`rounded-lg p-6 mb-8 ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} shadow-md`}>
            <h2 className="text-2xl font-semibold mb-4">Contacto</h2>
            <p className="mb-4">
              Si tiene preguntas sobre estas limitaciones, contáctenos a través de los canales indicados en nuestro <Link href="/legal/aviso-legal" className="text-blue-500 hover:underline">Aviso Legal</Link>.
            </p>
            <div>
              <p><strong>Email:</strong> legal.co@aimentalhealth.com (Email inventado)</p>
            </div>
          </div>
          
          <div className="flex flex-wrap justify-between gap-4 mt-8">
            <Link 
              href="/legal/aviso-legal" 
              className={`inline-flex items-center px-4 py-2 rounded-md ${theme === 'dark' ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-200 hover:bg-gray-300'} transition-colors duration-200`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Aviso Legal
            </Link>
            
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
        </motion.div>
      </div>
    </div>
  );
};

export default LimitacionesPage; 