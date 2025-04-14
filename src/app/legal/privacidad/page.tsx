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
              En AI Mental Health Colombia, entendemos la importancia de proteger tu privacidad, especialmente cuando se trata de información relacionada con tu salud mental y bienestar. Esta Política de Privacidad explica cómo recopilamos, utilizamos, almacenamos y protegemos tu información personal cuando utilizas nuestra plataforma, en cumplimiento con la Ley 1581 de 2012 (Ley de Protección de Datos Personales o Habeas Data) y sus decretos reglamentarios en Colombia.
            </p>
            <p className="mb-4">
              Al utilizar nuestra aplicación y servicios, aceptas las prácticas descritas en esta política. Te recomendamos que la leas detenidamente para comprender cómo manejamos tu información y los derechos que tienes respecto a tus datos.
            </p>
            <p>
              Esta política sigue los principios establecidos en la normatividad colombiana de protección de datos.
            </p>
          </div>
          
          <div className={`rounded-lg p-6 mb-8 ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} shadow-md`}>
            <h2 className="text-2xl font-semibold mb-4">Responsable del tratamiento</h2>
            <div className="mb-4">
              <p><strong>Nombre:</strong> AI Mental Health Colombia S.A.S. (Nombre inventado)</p>
              <p><strong>NIT:</strong> 900.123.456-7 (NIT inventado)</p>
              <p><strong>Dirección:</strong> Carrera 15 # 88 - 21, Oficina 501, Bogotá D.C., Colombia (Dirección inventada)</p>
              <p><strong>Email:</strong> privacidad.co@aimentalhealth.com (Email inventado)</p>
              <p><strong>Teléfono:</strong> +57 (601) 123 4567 (Teléfono inventado)</p>
            </div>
            <p>
              Puedes contactar directamente con nuestro Oficial de Protección de Datos (o la persona encargada) para cualquier consulta relacionada con el tratamiento de tus datos personales: oficial.privacidad.co@aimentalhealth.com (Email inventado)
            </p>
          </div>
          
          <div className={`rounded-lg p-6 mb-8 ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} shadow-md`}>
            <h2 className="text-2xl font-semibold mb-4">Información que recopilamos</h2>
            
            <div className="mb-6">
              <h3 className="text-xl font-medium mb-3 text-blue-500">Información que nos proporcionas (Datos Personales)</h3>
              <ul className="space-y-2 list-disc pl-5">
                <li>
                  <strong>Datos de identificación:</strong> Nombre, dirección de correo electrónico, contraseña (encriptada), fecha de nacimiento, número de identificación (opcional, para verificación si aplica), ciudad/departamento de residencia.
                </li>
                <li>
                  <strong>Información de perfil (opcional):</strong> Datos demográficos, preferencias y objetivos de bienestar mental.
                </li>
                <li>
                  <strong>Datos sensibles (Salud):</strong> Autoevaluaciones, registros de estado de ánimo, respuestas a cuestionarios, notas personales y otros datos relacionados con tu bienestar emocional y salud mental. El tratamiento de estos datos requiere tu autorización explícita y se realiza con las máximas medidas de seguridad.
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
              <h3 className="text-xl font-medium mb-3 text-blue-500">Información recopilada automáticamente (Datos de Uso)</h3>
              <ul className="space-y-2 list-disc pl-5">
                <li>
                  <strong>Datos de uso:</strong> Información sobre cómo interactúas con nuestra plataforma, incluyendo páginas visitadas, características utilizadas, tiempo de uso y frecuencia de acceso.
                </li>
                <li>
                  <strong>Información del dispositivo:</strong> Tipo de dispositivo, sistema operativo, versión de la aplicación, zona horaria y otros identificadores únicos del dispositivo (como ID de publicidad, si aplica y lo consientes).
                </li>
                <li>
                  <strong>Datos de ubicación aproximada:</strong> Basada en tu dirección IP (no recopilamos ubicación precisa por GPS sin tu consentimiento explícito).
                </li>
                <li>
                  <strong>Cookies y tecnologías similares:</strong> Utilizamos cookies y tecnologías similares para mejorar la experiencia del usuario, recordar preferencias y recopilar datos de uso. Para más información, consulta nuestra <Link href="/legal/cookies" className="text-blue-500 hover:underline">Política de Cookies</Link>.
                </li>
              </ul>
            </div>
            
            <div className="p-4 border border-amber-300 rounded-md bg-amber-50 text-amber-800 mb-6 dark:bg-amber-900/30 dark:border-amber-800 dark:text-amber-300">
              <p className="font-bold mb-2">NOTA SOBRE DATOS SENSIBLES (SALUD)</p>
              <p>
                Reconocemos que la información sobre salud mental se considera un dato sensible según la Ley 1581 de 2012. Su tratamiento requiere tu autorización previa, explícita e informada. Aplicamos medidas de protección reforzadas y solo procesamos esta información para los fines específicos detallados en esta política y con tu consentimiento.
              </p>
            </div>
          </div>
          
          <div className={`rounded-lg p-6 mb-8 ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} shadow-md`}>
            <h2 className="text-2xl font-semibold mb-4">Cómo utilizamos tu información (Finalidades)</h2>
            
            <div className="mb-4">
              <h3 className="text-xl font-medium mb-3 text-blue-500">Finalidades principales</h3>
              <p className="mb-2">Utilizamos tus datos personales y sensibles (con tu autorización) para los siguientes propósitos:</p>
              <ul className="space-y-2 list-disc pl-5">
                <li>
                  <strong>Proporcionar y mejorar nuestros servicios:</strong> Operar, mantener, personalizar y mejorar nuestra plataforma y sus características.
                </li>
                <li>
                  <strong>Personalización:</strong> Adaptar la plataforma a tus necesidades, recomendar recursos relevantes y personalizar tu experiencia.
                </li>
                <li>
                  <strong>Análisis de tendencias:</strong> Ofrecerte información sobre tus patrones emocionales (siempre bajo tu control y visualización).
                </li>
                <li>
                  <strong>Comunicaciones del servicio:</strong> Enviarte notificaciones, actualizaciones, recordatorios y mensajes relacionados con el uso de la plataforma (no publicitarios, salvo consentimiento).
                </li>
                <li>
                  <strong>Soporte al cliente:</strong> Responder a tus consultas y solicitudes de asistencia.
                </li>
                <li>
                  <strong>Seguridad y cumplimiento:</strong> Proteger nuestra plataforma, detectar y prevenir actividades fraudulentas, y cumplir con las obligaciones legales en Colombia.
                </li>
                <li>
                  <strong>Investigación y desarrollo (datos anonimizados):</strong> Utilizar datos agregados y anonimizados para mejorar nuestros algoritmos y la efectividad general del servicio, sin identificarte personalmente.
                </li>
              </ul>
            </div>
            
            <div className="mb-4">
              <h3 className="text-xl font-medium mb-3 text-blue-500">Base legal para el tratamiento (Autorización)</h3>
              <p className="mb-2">El tratamiento de tus datos personales, y en especial los sensibles (salud), se basa fundamentalmente en tu <strong>autorización previa, explícita e informada</strong>, otorgada al aceptar esta Política de Privacidad y al usar nuestros servicios. Además, el tratamiento puede basarse en:</p>
              <ul className="space-y-2 list-disc pl-5">
                <li>La ejecución de la relación contractual derivada del uso de la plataforma.</li>
                <li>El cumplimiento de obligaciones legales aplicables en Colombia.</li>
                <li>Nuestro interés legítimo en mejorar el servicio y garantizar la seguridad (siempre respetando tus derechos fundamentales).</li>
              </ul>
            </div>
            
            <div className="p-4 border border-green-300 rounded-md bg-green-50 text-green-800 mb-4 dark:bg-green-900/30 dark:border-green-800 dark:text-green-300">
              <p className="font-bold mb-2">ANONIMIZACIÓN DE DATOS</p>
              <p>
                Para fines de investigación y mejora, utilizamos datos agregados y/o anonimizados que no permiten tu identificación personal. Esto nos ayuda a desarrollar mejores herramientas para la comunidad de usuarios.
              </p>
            </div>
          </div>
          
          <div className={`rounded-lg p-6 mb-8 ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} shadow-md`}>
            <h2 className="text-2xl font-semibold mb-4">Compartición y transferencia de datos</h2>
            
            <p className="mb-4">
              Respetamos tu privacidad y limitamos la compartición de tus datos personales. Podemos compartir (transferir o transmitir) tu información en las siguientes circunstancias, siempre asegurando el cumplimiento de la Ley 1581 de 2012:
            </p>
            
            <div className="mb-6">
              <h3 className="text-xl font-medium mb-3 text-blue-500">Proveedores de servicios (Encargados del Tratamiento)</h3>
              <p className="mb-2">
                Trabajamos con terceros que nos ayudan a operar y mejorar nuestra plataforma, actuando como Encargados del Tratamiento bajo nuestras instrucciones:
              </p>
              <ul className="space-y-2 list-disc pl-5">
                <li>Proveedores de alojamiento en la nube (ej. AWS, Google Cloud, Azure)</li>
                <li>Servicios de análisis de datos (siempre que no usen datos sensibles sin anonimizar)</li>
                <li>Proveedores de servicios de correo electrónico para comunicaciones del servicio</li>
                <li>Servicios de atención al cliente</li>
                <li>Procesadores de pago (si ofrecemos servicios de pago)</li>
              </ul>
              <p className="mt-2 italic">
                Exigimos contractualmente a nuestros proveedores que protejan tus datos, los usen solo para los fines específicos contratados y cumplan con la normativa colombiana de protección de datos.
              </p>
            </div>
            
            <div className="mb-6">
              <h3 className="text-xl font-medium mb-3 text-blue-500">Cumplimiento legal y protección</h3>
              <p>
                Podemos divulgar información si creemos de buena fe que es necesario para:
              </p>
              <ul className="space-y-2 list-disc pl-5 mb-4">
                <li>Cumplir con leyes, regulaciones, procesos legales o requerimientos de autoridades colombianas competentes (Fiscalía, Jueces, Superintendencia de Industria y Comercio - SIC)</li>
                <li>Proteger los derechos, la propiedad o la seguridad de AI Mental Health Colombia, nuestros usuarios u otros</li>
                <li>Detectar, prevenir o abordar problemas de fraude, seguridad o técnicos</li>
                <li>Responder a una emergencia que requiera la divulgación de información para proteger la vida o la salud</li>
              </ul>
            </div>
            
            <div className="mb-4">
              <h3 className="text-xl font-medium mb-3 text-blue-500">Transferencias empresariales</h3>
              <p>
                Si AI Mental Health Colombia S.A.S. se involucra en una fusión, adquisición, reorganización o venta de activos, tus datos pueden ser transferidos como parte de esa transacción. Te notificaremos y solicitaremos tu autorización si la finalidad del tratamiento cambia.
              </p>
            </div>
            
            <div className="p-4 border border-red-300 rounded-md bg-red-50 text-red-800 dark:bg-red-900/30 dark:border-red-800 dark:text-red-300">
              <p className="font-bold mb-2">IMPORTANTE</p>
              <p>
                <strong>No vendemos</strong> tus datos personales a terceros. Nunca compartiremos tus datos sensibles de salud con terceros para fines distintos a los aquí descritos sin tu autorización explícita, excepto cuando sea legalmente requerido por una autoridad competente colombiana.
              </p>
            </div>
          </div>
          
          <div className={`rounded-lg p-6 mb-8 ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} shadow-md`}>
            <h2 className="text-2xl font-semibold mb-4">Transferencias internacionales de datos</h2>
            
            <p className="mb-4">
              AI Mental Health Colombia S.A.S. opera principalmente en Colombia. Sin embargo, algunos de nuestros proveedores de servicios (Encargados del Tratamiento) pueden estar ubicados o procesar datos en países fuera de Colombia.
            </p>
            
            <p className="mb-4">
              Cuando transferimos datos a países que pueden no tener un nivel de protección de datos considerado adecuado por la Superintendencia de Industria y Comercio (SIC) de Colombia, implementamos garantías apropiadas para proteger tus datos, tales como:
            </p>
            
            <ul className="space-y-2 list-disc pl-5 mb-4">
              <li>Cláusulas contractuales tipo que aseguren el cumplimiento de los principios de la Ley 1581 de 2012.</li>
              <li>Verificación de que el país receptor ofrece un nivel adecuado de protección de datos según la SIC.</li>
              <li>Obtención de tu autorización explícita e inequívoca para la transferencia, informándote sobre los riesgos.</li>
            </ul>
            
            <p>
              Puedes solicitar más información sobre las transferencias internacionales y las salvaguardias aplicadas contactando con nuestro Oficial de Protección de Datos.
            </p>
          </div>
          
          <div className={`rounded-lg p-6 mb-8 ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} shadow-md`}>
            <h2 className="text-2xl font-semibold mb-4">Seguridad de datos</h2>
            
            <p className="mb-4">
              La seguridad de tus datos personales y sensibles es nuestra prioridad. Implementamos y mantenemos medidas técnicas, humanas y administrativas razonables y apropiadas para proteger tus datos contra acceso no autorizado, pérdida, uso indebido, alteración o destrucción:
            </p>
            
            <ul className="space-y-2 list-disc pl-5 mb-6">
              <li>Encriptación de datos en tránsito (TLS/SSL) y en reposo (AES-256 o similar)</li>
              <li>Controles de acceso basados en roles y necesidad de conocer</li>
              <li>Autenticación segura (contraseñas robustas, opción de MFA si aplica)</li>
              <li>Auditorías y revisiones periódicas de seguridad</li>
              <li>Formación sobre privacidad y seguridad para nuestro personal</li>
              <li>Monitorización de seguridad y planes de respuesta a incidentes</li>
              <li>Gestión segura de datos sensibles con acceso restringido</li>
              <li>Copias de seguridad regulares y planes de recuperación</li>
            </ul>
            
            <p className="mb-4">
              Aunque nos esforzamos por proteger tu información, ningún sistema es 100% seguro. No podemos garantizar la seguridad absoluta de tus datos.
            </p>
            
            <div className="p-4 border border-blue-300 rounded-md bg-blue-50 text-blue-800 dark:bg-blue-900/30 dark:border-blue-800 dark:text-blue-300">
              <p className="font-bold mb-2">NOTIFICACIÓN DE INCIDENTES DE SEGURIDAD</p>
              <p>
                En caso de un incidente de seguridad que afecte tus datos personales, lo notificaremos a la Superintendencia de Industria y Comercio y a ti como titular, según lo establecido en la normativa colombiana.
              </p>
            </div>
          </div>
          
          <div className={`rounded-lg p-6 mb-8 ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} shadow-md`}>
            <h2 className="text-2xl font-semibold mb-4">Tus derechos como titular (Habeas Data)</h2>
            
            <p className="mb-4">
              De acuerdo con la Ley 1581 de 2012 y sus decretos reglamentarios, tienes los siguientes derechos sobre tus datos personales:
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div className={`p-4 rounded-md ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}>
                <h3 className="text-lg font-medium mb-2 text-blue-500">Conocer, actualizar y rectificar</h3>
                <p>Tienes derecho a conocer, actualizar y rectificar tus datos personales frente a nosotros.</p>
              </div>
              
              <div className={`p-4 rounded-md ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}>
                <h3 className="text-lg font-medium mb-2 text-blue-500">Solicitar prueba de la autorización</h3>
                <p>Puedes solicitar la prueba de la autorización otorgada para el tratamiento de tus datos (salvo excepciones legales).</p>
              </div>
              
              <div className={`p-4 rounded-md ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}>
                <h3 className="text-lg font-medium mb-2 text-blue-500">Ser informado sobre el uso</h3>
                <p>Puedes solicitar información sobre el uso que le hemos dado a tus datos personales.</p>
              </div>
              
              <div className={`p-4 rounded-md ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}>
                <h3 className="text-lg font-medium mb-2 text-blue-500">Presentar quejas ante la SIC</h3>
                <p>Puedes presentar quejas por infracciones a la ley de protección de datos ante la Superintendencia de Industria y Comercio.</p>
              </div>
              
              <div className={`p-4 rounded-md ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}>
                <h3 className="text-lg font-medium mb-2 text-blue-500">Revocar la autorización</h3>
                <p>Puedes revocar tu autorización para el tratamiento de datos en cualquier momento, siempre que no exista un deber legal o contractual que lo impida.</p>
              </div>
              
              <div className={`p-4 rounded-md ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}>
                <h3 className="text-lg font-medium mb-2 text-blue-500">Solicitar la supresión (eliminación)</h3>
                <p>Puedes solicitar la eliminación de tus datos cuando el tratamiento no respete los principios, derechos y garantías constitucionales y legales.</p>
              </div>
              
              <div className={`p-4 rounded-md ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}>
                <h3 className="text-lg font-medium mb-2 text-blue-500">Acceder gratuitamente</h3>
                <p>Tienes derecho a acceder de forma gratuita a tus datos personales que hayan sido objeto de tratamiento.</p>
              </div>
            </div>
            
            <h3 className="text-xl font-medium mb-3 text-blue-500">Procedimiento para ejercer tus derechos</h3>
            <p className="mb-4">
              Para ejercer tus derechos, puedes enviar una consulta o reclamo al correo electrónico privacidad.co@aimentalhealth.com, indicando claramente tu nombre, número de identificación (si aplica para verificar identidad), el derecho que deseas ejercer y los hechos que dan lugar a tu solicitud. Atenderemos tu consulta en un término máximo de diez (10) días hábiles y tu reclamo en un término máximo de quince (15) días hábiles, según lo estipulado por la ley.
            </p>
            
          </div>
          
          <div className={`rounded-lg p-6 mb-8 ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} shadow-md`}>
            <h2 className="text-2xl font-semibold mb-4">Retención de datos (Vigencia)</h2>
            
            <p className="mb-4">
              Conservamos tus datos personales solo durante el tiempo necesario para cumplir con las finalidades para las cuales fueron recolectados, así como para cumplir con requisitos legales o contractuales en Colombia. La información será conservada mientras se mantenga la relación contractual o legal con nosotros y, posteriormente, durante los plazos legales requeridos.
            </p>
            
            <p className="mb-4">
              Una vez cumplida la finalidad y los plazos legales, procederemos a la supresión segura de tus datos personales de nuestras bases de datos, o a su anonimización para fines estadísticos.
            </p>
          </div>
          
          <div className={`rounded-lg p-6 mb-8 ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} shadow-md`}>
            <h2 className="text-2xl font-semibold mb-4">Privacidad de los menores</h2>
            
            <p className="mb-4">
              Nuestros servicios no están dirigidos a menores de 14 años. No recopilamos intencionadamente información personal de niños menores de esta edad sin la autorización expresa de sus padres o representantes legales, conforme a la ley colombiana. Si eres padre o tutor y crees que tu hijo menor de 14 años nos ha proporcionado datos sin tu autorización, contáctanos inmediatamente.
            </p>
            
            <p className="mb-4">
              Para adolescentes entre 14 y 18 años, su tratamiento de datos se realizará respetando sus derechos prevalentes y con las debidas consideraciones sobre su madurez y capacidad para consentir, sin perjuicio de la posible necesidad de autorización parental según el caso.
            </p>
          </div>
          
          <div className={`rounded-lg p-6 mb-8 ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} shadow-md`}>
            <h2 className="text-2xl font-semibold mb-4">Cambios a esta política</h2>
            
            <p className="mb-4">
              Podemos actualizar esta Política de Privacidad periódicamente para reflejar cambios en nuestras prácticas, los servicios o la legislación colombiana. La fecha de la última actualización aparecerá al principio de la política.
            </p>
            
            <p className="mb-4">
              Para cambios sustanciales, te notificaremos de manera efectiva (ej. aviso en la plataforma, correo electrónico) antes de que los cambios entren en vigor. Te animamos a revisar esta política periódicamente.
            </p>
          </div>
          
          <div className={`rounded-lg p-6 mb-8 ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} shadow-md`}>
            <h2 className="text-2xl font-semibold mb-4">Contacto</h2>
            
            <p className="mb-4">
              Si tienes preguntas, consultas o reclamos relacionados con esta Política de Privacidad o el tratamiento de tus datos personales, por favor contacta con nosotros a través de los canales designados:
            </p>
            
            <div className="mb-4">
              <p><strong>Email (Consultas/Reclamos Habeas Data):</strong> privacidad.co@aimentalhealth.com (Email inventado)</p>
              <p><strong>Oficial de Protección de Datos:</strong> oficial.privacidad.co@aimentalhealth.com (Email inventado)</p>
              <p><strong>Dirección postal:</strong> AI Mental Health Colombia S.A.S., Carrera 15 # 88 - 21, Oficina 501, Bogotá D.C., Colombia (Dirección inventada)</p>
              <p><strong>Teléfono:</strong> +57 (601) 123 4567 (Teléfono inventado)</p>
            </div>
            
            <p>
              Nos comprometemos a gestionar tus solicitudes de acuerdo con los términos establecidos en la Ley 1581 de 2012.
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