'use client';

import React from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useTheme } from '@/components/ThemeProvider';

const PrivacidadPage = () => {
  const { theme } = useTheme();
  
  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-800'}`}>
      <div className="container mx-auto px-4 py-12">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-3xl md:text-4xl font-bold mb-8 text-blue-600">Política de Privacidad</h1>
          
          <div className={`bg-blue-100 border-l-4 border-blue-500 text-blue-700 p-4 mb-8 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-600`}>
            <p className="font-bold mb-2">ÚLTIMA ACTUALIZACIÓN</p>
            <p>Esta Política de Privacidad fue actualizada por última vez el 15 de septiembre de 2023.</p>
          </div>
          
          <div className={`rounded-lg p-6 mb-8 ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} shadow-md`}>
            <h2 className="text-2xl font-semibold mb-4">Introducción</h2>
            <p className="mb-4">
              En AI Mental Health, entendemos la importancia de proteger tu privacidad, especialmente cuando se trata de información relacionada con tu salud mental y bienestar. Esta Política de Privacidad explica cómo recopilamos, utilizamos, almacenamos y protegemos tu información personal cuando utilizas nuestra plataforma.
            </p>
            <p className="mb-4">
              Al utilizar nuestra aplicación y servicios, aceptas las prácticas descritas en esta política. Te recomendamos que la leas detenidamente para comprender cómo manejamos tu información y los derechos que tienes respecto a tus datos.
            </p>
            <p>
              Esta política cumple con el Reglamento General de Protección de Datos (RGPD) de la Unión Europea, la Ley Orgánica de Protección de Datos Personales y garantía de los derechos digitales (LOPDGDD) de España, y otras leyes de privacidad aplicables.
            </p>
          </div>
          
          <div className={`rounded-lg p-6 mb-8 ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} shadow-md`}>
            <h2 className="text-2xl font-semibold mb-4">Responsable del tratamiento</h2>
            <div className="mb-4">
              <p><strong>Nombre:</strong> AI Mental Health S.L.</p>
              <p><strong>Dirección:</strong> Calle Innovación 123, 28001 Madrid, España</p>
              <p><strong>Email:</strong> privacidad@aimentalhealth.es</p>
              <p><strong>CIF:</strong> B12345678</p>
            </div>
            <p>
              Hemos designado un Delegado de Protección de Datos (DPD) que puedes contactar directamente para cualquier consulta relacionada con el tratamiento de tus datos personales: dpd@aimentalhealth.es
            </p>
          </div>
          
          <div className={`rounded-lg p-6 mb-8 ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} shadow-md`}>
            <h2 className="text-2xl font-semibold mb-4">Información que recopilamos</h2>
            
            <div className="mb-6">
              <h3 className="text-xl font-medium mb-3 text-blue-500">Información que nos proporcionas</h3>
              <ul className="space-y-2 list-disc pl-5">
                <li>
                  <strong>Información de registro:</strong> Nombre, dirección de correo electrónico, contraseña y fecha de nacimiento cuando creas una cuenta.
                </li>
                <li>
                  <strong>Información de perfil:</strong> Datos demográficos opcionales, preferencias y objetivos de bienestar mental.
                </li>
                <li>
                  <strong>Información de salud mental:</strong> Autoevaluaciones, registros de estado de ánimo, respuestas a cuestionarios, notas personales y otros datos relacionados con tu bienestar emocional.
                </li>
                <li>
                  <strong>Comunicaciones:</strong> El contenido de mensajes que envías a nuestro equipo de soporte.
                </li>
                <li>
                  <strong>Encuestas y retroalimentación:</strong> Respuestas a encuestas y formularios de retroalimentación.
                </li>
              </ul>
            </div>
            
            <div className="mb-6">
              <h3 className="text-xl font-medium mb-3 text-blue-500">Información recopilada automáticamente</h3>
              <ul className="space-y-2 list-disc pl-5">
                <li>
                  <strong>Datos de uso:</strong> Información sobre cómo interactúas con nuestra plataforma, incluyendo páginas visitadas, características utilizadas, tiempo de uso y frecuencia de acceso.
                </li>
                <li>
                  <strong>Información del dispositivo:</strong> Tipo de dispositivo, sistema operativo, versión de la aplicación, zona horaria y otros identificadores únicos.
                </li>
                <li>
                  <strong>Datos de ubicación aproximada:</strong> Basada en tu dirección IP (no recopilamos ubicación precisa por GPS).
                </li>
                <li>
                  <strong>Cookies y tecnologías similares:</strong> Utilizamos cookies y tecnologías similares para mejorar la experiencia del usuario, recordar preferencias y recopilar datos de uso. Para más información, consulta nuestra <Link href="/legal/cookies" className="text-blue-500 hover:underline">Política de Cookies</Link>.
                </li>
              </ul>
            </div>
            
            <div className="p-4 border border-amber-300 rounded-md bg-amber-50 text-amber-800 mb-6 dark:bg-amber-900/30 dark:border-amber-800 dark:text-amber-300">
              <p className="font-bold mb-2">NOTA SOBRE DATOS SENSIBLES</p>
              <p>
                Reconocemos que la información sobre salud mental se considera una categoría especial de datos según el RGPD. Aplicamos medidas de protección adicionales y solo procesamos esta información con tu consentimiento explícito y para los fines específicos detallados en esta política.
              </p>
            </div>
          </div>
          
          <div className={`rounded-lg p-6 mb-8 ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} shadow-md`}>
            <h2 className="text-2xl font-semibold mb-4">Cómo utilizamos tu información</h2>
            
            <div className="mb-4">
              <h3 className="text-xl font-medium mb-3 text-blue-500">Propósitos principales</h3>
              <ul className="space-y-2 list-disc pl-5">
                <li>
                  <strong>Proporcionar y mejorar nuestros servicios:</strong> Utilizamos tus datos para ofrecer, personalizar y mejorar nuestra plataforma y sus características.
                </li>
                <li>
                  <strong>Personalización:</strong> Adaptamos nuestra plataforma a tus necesidades específicas, recomendamos recursos relevantes y personalizamos tu experiencia.
                </li>
                <li>
                  <strong>Análisis de tendencias:</strong> Monitorizamos tendencias en tu bienestar para ofrecerte información útil sobre tus patrones emocionales.
                </li>
                <li>
                  <strong>Comunicaciones:</strong> Te enviamos notificaciones, actualizaciones, recordatorios y mensajes relacionados con el servicio.
                </li>
                <li>
                  <strong>Soporte al cliente:</strong> Respondemos a tus consultas y solicitudes de asistencia.
                </li>
                <li>
                  <strong>Seguridad:</strong> Protegemos nuestra plataforma, detectamos y prevenimos actividades fraudulentas y no autorizadas.
                </li>
              </ul>
            </div>
            
            <div className="mb-4">
              <h3 className="text-xl font-medium mb-3 text-blue-500">Bases legales para el procesamiento</h3>
              <p className="mb-2">Procesamos tus datos personales bajo las siguientes bases legales:</p>
              <ul className="space-y-2 list-disc pl-5">
                <li>
                  <strong>Consentimiento:</strong> Para el procesamiento de datos de salud mental y para comunicaciones de marketing.
                </li>
                <li>
                  <strong>Ejecución de contrato:</strong> Para proporcionar nuestros servicios según los términos acordados.
                </li>
                <li>
                  <strong>Intereses legítimos:</strong> Para mejorar nuestros servicios, garantizar la seguridad y para fines administrativos internos.
                </li>
                <li>
                  <strong>Obligación legal:</strong> Para cumplir con las leyes y regulaciones aplicables.
                </li>
              </ul>
            </div>
            
            <div className="p-4 border border-green-300 rounded-md bg-green-50 text-green-800 mb-4 dark:bg-green-900/30 dark:border-green-800 dark:text-green-300">
              <p className="font-bold mb-2">ANONIMIZACIÓN DE DATOS</p>
              <p>
                Para mejorar nuestros algoritmos y servicios, utilizamos datos anonimizados y agregados que no pueden identificarte personalmente. Esta información nos ayuda a desarrollar mejores herramientas para la comunidad de usuarios.
              </p>
            </div>
          </div>
          
          <div className={`rounded-lg p-6 mb-8 ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} shadow-md`}>
            <h2 className="text-2xl font-semibold mb-4">Compartición de datos</h2>
            
            <p className="mb-4">
              Respetamos tu privacidad y limitamos la compartición de tus datos personales. Podemos compartir tu información en las siguientes circunstancias:
            </p>
            
            <div className="mb-6">
              <h3 className="text-xl font-medium mb-3 text-blue-500">Proveedores de servicios</h3>
              <p className="mb-2">
                Trabajamos con terceros que nos ayudan a operar, mantener y mejorar nuestra plataforma:
              </p>
              <ul className="space-y-2 list-disc pl-5">
                <li>Proveedores de alojamiento y servidores en la nube</li>
                <li>Servicios de análisis de datos</li>
                <li>Proveedores de servicios de correo electrónico</li>
                <li>Servicios de atención al cliente</li>
                <li>Procesadores de pago (si aplicable)</li>
              </ul>
              <p className="mt-2 italic">
                Todos nuestros proveedores de servicios están obligados contractualmente a proteger tus datos y solo pueden utilizarlos para los fines específicos que les indicamos.
              </p>
            </div>
            
            <div className="mb-6">
              <h3 className="text-xl font-medium mb-3 text-blue-500">Cumplimiento legal y protección</h3>
              <p>
                Podemos divulgar información si creemos de buena fe que es necesario para:
              </p>
              <ul className="space-y-2 list-disc pl-5 mb-4">
                <li>Cumplir con leyes, regulaciones, procesos legales o solicitudes gubernamentales</li>
                <li>Proteger los derechos, la propiedad o la seguridad de AI Mental Health, nuestros usuarios u otros</li>
                <li>Detectar, prevenir o abordar problemas de fraude, seguridad o técnicos</li>
                <li>Responder a una emergencia que creemos de buena fe que requiere la divulgación de información</li>
              </ul>
            </div>
            
            <div className="mb-4">
              <h3 className="text-xl font-medium mb-3 text-blue-500">Transferencias empresariales</h3>
              <p>
                Si AI Mental Health se involucra en una fusión, adquisición, reorganización o venta de activos, tus datos pueden ser transferidos como parte de esa transacción. Te notificaremos sobre cualquier cambio en la propiedad o el uso de tus datos personales.
              </p>
            </div>
            
            <div className="p-4 border border-red-300 rounded-md bg-red-50 text-red-800 dark:bg-red-900/30 dark:border-red-800 dark:text-red-300">
              <p className="font-bold mb-2">IMPORTANTE</p>
              <p>
                <strong>No vendemos</strong> tus datos personales a terceros para fines publicitarios o comerciales. Nunca compartiremos tus datos de salud mental individuales con terceros sin tu consentimiento explícito, excepto cuando sea legalmente requerido.
              </p>
            </div>
          </div>
          
          <div className={`rounded-lg p-6 mb-8 ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} shadow-md`}>
            <h2 className="text-2xl font-semibold mb-4">Transferencias internacionales de datos</h2>
            
            <p className="mb-4">
              AI Mental Health está basada en España, pero trabajamos con proveedores de servicios ubicados en diferentes partes del mundo. Como resultado, tus datos personales pueden ser transferidos, almacenados y procesados en países fuera del Espacio Económico Europeo (EEE).
            </p>
            
            <p className="mb-4">
              Cuando transferimos datos a países que pueden no tener el mismo nivel de protección que los de tu país de residencia, implementamos garantías apropiadas para proteger tus datos, como:
            </p>
            
            <ul className="space-y-2 list-disc pl-5 mb-4">
              <li>Cláusulas contractuales tipo aprobadas por la Comisión Europea</li>
              <li>Certificaciones como el Marco de Privacy Shield (cuando sea aplicable)</li>
              <li>Normas corporativas vinculantes para transferencias dentro de nuestro grupo empresarial</li>
              <li>Evaluación de impacto de transferencia de datos para garantizar protecciones adecuadas</li>
            </ul>
            
            <p>
              Puedes solicitar más información sobre las salvaguardias específicas aplicadas a la exportación de tus datos contactando con nuestro Delegado de Protección de Datos.
            </p>
          </div>
          
          <div className={`rounded-lg p-6 mb-8 ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} shadow-md`}>
            <h2 className="text-2xl font-semibold mb-4">Seguridad de datos</h2>
            
            <p className="mb-4">
              La seguridad de tus datos personales es nuestra prioridad. Implementamos y mantenemos medidas técnicas, administrativas y físicas diseñadas para proteger tus datos contra acceso no autorizado, pérdida, mal uso o alteración:
            </p>
            
            <ul className="space-y-2 list-disc pl-5 mb-6">
              <li>Encriptación de datos en tránsito y en reposo utilizando estándares de la industria</li>
              <li>Controles de acceso estrictos y autenticación multifactor para nuestros sistemas</li>
              <li>Revisiones regulares de seguridad y pruebas de penetración</li>
              <li>Formación sobre privacidad y seguridad para nuestro personal</li>
              <li>Monitorización continua para detectar y responder a incidentes de seguridad</li>
              <li>Backups regulares y planes de recuperación ante desastres</li>
            </ul>
            
            <p className="mb-4">
              Aunque nos esforzamos por proteger tu información personal, ningún método de transmisión por Internet o almacenamiento electrónico es 100% seguro. No podemos garantizar la seguridad absoluta de tus datos.
            </p>
            
            <div className="p-4 border border-blue-300 rounded-md bg-blue-50 text-blue-800 dark:bg-blue-900/30 dark:border-blue-800 dark:text-blue-300">
              <p className="font-bold mb-2">NOTIFICACIÓN DE INCIDENTES</p>
              <p>
                En caso de una violación de datos que afecte a tu información personal, te notificaremos según lo requerido por las leyes aplicables, y tomaremos medidas inmediatas para mitigar cualquier impacto potencial.
              </p>
            </div>
          </div>
          
          <div className={`rounded-lg p-6 mb-8 ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} shadow-md`}>
            <h2 className="text-2xl font-semibold mb-4">Tus derechos de privacidad</h2>
            
            <p className="mb-4">
              Según el RGPD y otras leyes de protección de datos aplicables, tienes varios derechos con respecto a tus datos personales:
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div className={`p-4 rounded-md ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}>
                <h3 className="text-lg font-medium mb-2 text-blue-500">Derecho de acceso</h3>
                <p>Puedes solicitar una copia de los datos personales que tenemos sobre ti.</p>
              </div>
              
              <div className={`p-4 rounded-md ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}>
                <h3 className="text-lg font-medium mb-2 text-blue-500">Derecho de rectificación</h3>
                <p>Puedes pedirnos que corrijamos datos inexactos o completemos datos incompletos.</p>
              </div>
              
              <div className={`p-4 rounded-md ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}>
                <h3 className="text-lg font-medium mb-2 text-blue-500">Derecho al olvido</h3>
                <p>En ciertos casos, puedes solicitar la eliminación de tus datos personales.</p>
              </div>
              
              <div className={`p-4 rounded-md ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}>
                <h3 className="text-lg font-medium mb-2 text-blue-500">Derecho a restringir el procesamiento</h3>
                <p>Puedes solicitar que limitemos el procesamiento de tus datos en ciertas circunstancias.</p>
              </div>
              
              <div className={`p-4 rounded-md ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}>
                <h3 className="text-lg font-medium mb-2 text-blue-500">Derecho a la portabilidad de datos</h3>
                <p>Puedes solicitar una copia de tus datos en un formato estructurado y legible por máquina.</p>
              </div>
              
              <div className={`p-4 rounded-md ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}>
                <h3 className="text-lg font-medium mb-2 text-blue-500">Derecho de oposición</h3>
                <p>Puedes oponerte al procesamiento de tus datos en ciertas circunstancias, incluyendo marketing directo.</p>
              </div>
            </div>
            
            <p className="mb-4">
              Para ejercer cualquiera de estos derechos, contacta con nosotros a través de privacidad@aimentalhealth.es. Responderemos a tu solicitud dentro de un mes, aunque en casos complejos podríamos necesitar ampliar este plazo a dos meses.
            </p>
            
            <p>
              Si crees que no hemos manejado tus datos personales adecuadamente, tienes derecho a presentar una reclamación ante la Agencia Española de Protección de Datos (www.aepd.es) u otra autoridad de protección de datos competente.
            </p>
          </div>
          
          <div className={`rounded-lg p-6 mb-8 ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} shadow-md`}>
            <h2 className="text-2xl font-semibold mb-4">Retención de datos</h2>
            
            <p className="mb-4">
              Conservamos tus datos personales solo durante el tiempo necesario para los fines establecidos en esta política, a menos que la ley exija o permita un período de retención más largo. Nuestros criterios para determinar los períodos de retención incluyen:
            </p>
            
            <ul className="space-y-2 list-disc pl-5 mb-4">
              <li>El tiempo necesario para proporcionar nuestros servicios</li>
              <li>Si tenemos una obligación legal, contractual o similar que requiera retener los datos</li>
              <li>Si la retención es aconsejable considerando nuestra posición legal (como en relación con estatutos de limitaciones aplicables, litigios o investigaciones regulatorias)</li>
            </ul>
            
            <p className="mb-4">
              Cuando ya no necesitamos tus datos personales, los eliminaremos o anonimizaremos de manera segura. Si no es posible eliminar o anonimizar completamente los datos (por ejemplo, porque se han archivado), los almacenaremos de forma segura y los aislaremos de cualquier procesamiento posterior hasta que sea posible su eliminación.
            </p>
            
            <div className="p-4 border border-purple-300 rounded-md bg-purple-50 text-purple-800 dark:bg-purple-900/30 dark:border-purple-800 dark:text-purple-300">
              <p className="font-bold mb-2">DATOS DE CUENTA INACTIVA</p>
              <p>
                Si no utilizas tu cuenta durante un período prolongado (generalmente 12 meses), podemos marcarla como inactiva. Te notificaremos antes de tomar cualquier acción con los datos de una cuenta inactiva.
              </p>
            </div>
          </div>
          
          <div className={`rounded-lg p-6 mb-8 ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} shadow-md`}>
            <h2 className="text-2xl font-semibold mb-4">Privacidad de los menores</h2>
            
            <p className="mb-4">
              Nuestros servicios no están dirigidos a personas menores de 14 años, y no recopilamos intencionadamente información personal de niños menores de 14 años. Si eres padre o tutor y crees que tu hijo nos ha proporcionado información personal, contacta con nosotros para que podamos tomar las medidas apropiadas.
            </p>
            
            <p className="mb-4">
              Para usuarios entre 14 y 18 años, requerimos el consentimiento de un padre o tutor legal antes de la creación de una cuenta. Ofrecemos controles parentales y opciones especiales de privacidad para estos casos.
            </p>
            
            <p>
              Si descubrimos que hemos recopilado información personal de un niño menor de 14 años sin verificación del consentimiento parental, tomaremos medidas para eliminar esa información de nuestros servidores.
            </p>
          </div>
          
          <div className={`rounded-lg p-6 mb-8 ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} shadow-md`}>
            <h2 className="text-2xl font-semibold mb-4">Cambios a esta política</h2>
            
            <p className="mb-4">
              Podemos actualizar esta Política de Privacidad periódicamente para reflejar cambios en nuestras prácticas, los servicios o las leyes aplicables. La fecha de la última actualización aparecerá al principio de la política.
            </p>
            
            <p className="mb-4">
              Para cambios significativos, te proporcionaremos un aviso prominente, como una notificación por correo electrónico o un anuncio en nuestra plataforma antes de que los cambios entren en vigor. Te animamos a revisar esta política periódicamente para estar informado sobre cómo protegemos tu información.
            </p>
            
            <p>
              Tu uso continuado de nuestros servicios después de cualquier cambio en esta Política de Privacidad constituirá tu aceptación de los términos revisados.
            </p>
          </div>
          
          <div className={`rounded-lg p-6 mb-8 ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} shadow-md`}>
            <h2 className="text-2xl font-semibold mb-4">Contacto</h2>
            
            <p className="mb-4">
              Si tienes preguntas, preocupaciones o solicitudes relacionadas con esta Política de Privacidad o el tratamiento de tus datos personales, por favor contacta con nosotros:
            </p>
            
            <div className="mb-4">
              <p><strong>Email:</strong> privacidad@aimentalhealth.es</p>
              <p><strong>Delegado de Protección de Datos:</strong> dpd@aimentalhealth.es</p>
              <p><strong>Dirección postal:</strong> AI Mental Health S.L., Calle Innovación 123, 28001 Madrid, España</p>
              <p><strong>Teléfono:</strong> +34 91 123 45 67</p>
            </div>
            
            <p>
              Nos comprometemos a resolver cualquier pregunta o preocupación que puedas tener sobre tus datos personales y esta política.
            </p>
          </div>
          
          <div className="flex flex-wrap justify-between gap-4 mt-8">
            <Link 
              href="/legal/cookies" 
              className={`inline-flex items-center px-4 py-2 rounded-md ${theme === 'dark' ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-200 hover:bg-gray-300'} transition-colors duration-200`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Política de Cookies
            </Link>
            
            <Link 
              href="/legal/limitaciones" 
              className={`inline-flex items-center px-4 py-2 rounded-md ${theme === 'dark' ? 'bg-blue-600 hover:bg-blue-700' : 'bg-blue-500 hover:bg-blue-600'} text-white transition-colors duration-200`}
            >
              Limitaciones
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

export default PrivacidadPage; 