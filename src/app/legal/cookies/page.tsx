'use client';

import React from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useTheme } from '@/components/ThemeProvider';

const CookiesPage = () => {
  const { theme } = useTheme();
  
  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-800'}`}>
      <div className="container mx-auto px-4 py-12">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-3xl md:text-4xl font-bold mb-8 text-blue-600">Política de Cookies</h1>
          
          <div className={`bg-blue-100 border-l-4 border-blue-500 text-blue-700 p-4 mb-8 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-600`}>
            <p className="font-bold mb-2">ÚLTIMA ACTUALIZACIÓN</p>
            <p>Esta Política de Cookies fue actualizada por última vez el 15 de septiembre de 2023.</p>
          </div>
          
          <div className={`rounded-lg p-6 mb-8 ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} shadow-md`}>
            <h2 className="text-2xl font-semibold mb-4">¿Qué son las cookies?</h2>
            <p className="mb-4">
              Las cookies son pequeños archivos de texto que se almacenan en tu dispositivo (computador, tablet, teléfono móvil) cuando visitas sitios web. Son ampliamente utilizadas para hacer que los sitios web funcionen de manera más eficiente, así como para proporcionar información a los propietarios del sitio.
            </p>
            <p>
              Las cookies permiten que un sitio web reconozca tu dispositivo, recuerde tus preferencias, te ofrezca una experiencia personalizada y, en algunos casos, faciliten la presentación de información relevante a tus intereses.
            </p>
          </div>
          
          <div className={`rounded-lg p-6 mb-8 ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} shadow-md`}>
            <h2 className="text-2xl font-semibold mb-4">Cómo utilizamos las cookies</h2>
            <p className="mb-4">
              En AI Mental Health Colombia utilizamos cookies y tecnologías similares para diversos fines, de acuerdo con la normativa colombiana sobre protección de datos y comercio electrónico:
            </p>
            
            <div className="space-y-6 mb-4">
              <div className={`p-4 rounded-md ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}>
                <h3 className="text-xl font-medium mb-2 text-blue-500">Funcionamiento esencial (Técnicas)</h3>
                <p>
                  Algunas cookies son estrictamente necesarias para el funcionamiento básico de nuestra plataforma. Te permiten navegar por el sitio, acceder a áreas seguras (si aplica), y utilizar funciones como el inicio de sesión. Sin estas cookies, nuestra plataforma no funcionaría correctamente.
                </p>
              </div>
              
              <div className={`p-4 rounded-md ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}>
                <h3 className="text-xl font-medium mb-2 text-blue-500">Personalización y preferencias (Funcionales)</h3>
                <p>
                  Estas cookies nos permiten recordar tus preferencias y opciones, como tu nombre de usuario (si aplica), idioma, región, o preferencias de visualización (como el modo oscuro/claro). Esto nos ayuda a proporcionarte una experiencia más personalizada y adaptada a tus preferencias.
                </p>
              </div>
              
              <div className={`p-4 rounded-md ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}>
                <h3 className="text-xl font-medium mb-2 text-blue-500">Análisis y rendimiento (Analíticas)</h3>
                <p>
                  Utilizamos cookies (propias o de terceros como Google Analytics) para recopilar información sobre cómo interactúas con nuestra plataforma, qué páginas visitas, y si encuentras errores. Esto nos ayuda a mejorar el rendimiento de nuestro sitio y a desarrollar mejores funcionalidades, siempre buscando tu autorización previa para cookies no esenciales.
                </p>
              </div>
              
              <div className={`p-4 rounded-md ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}>
                <h3 className="text-xl font-medium mb-2 text-blue-500">Seguridad</h3>
                <p>
                  Utilizamos cookies de seguridad para autenticar usuarios (si aplica), prevenir el uso fraudulento de cuentas de usuario, y proteger los datos de usuarios de accesos no autorizados.
                </p>
              </div>
            </div>
            
            <p className="mb-4">
              Es importante destacar que no utilizamos cookies con fines de publicidad comportamental de terceros ni para rastrear tu actividad de navegación en otros sitios web.
            </p>
          </div>
          
          <div className={`rounded-lg p-6 mb-8 ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} shadow-md`}>
            <h2 className="text-2xl font-semibold mb-4">Tipos de cookies que utilizamos</h2>
            
            <div className="overflow-x-auto mb-6">
              <table className={`w-full border-collapse ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}`}>
                <thead>
                  <tr className={`${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'}`}>
                    <th className="px-4 py-3 text-left">Tipo de Cookie</th>
                    <th className="px-4 py-3 text-left">Finalidad</th>
                    <th className="px-4 py-3 text-left">Duración</th>
                    <th className="px-4 py-3 text-left">Origen</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className={`${theme === 'dark' ? 'border-b border-gray-700' : 'border-b border-gray-300'}`}>
                    <td className="px-4 py-3 font-medium">Técnicas</td>
                    <td className="px-4 py-3">
                      Esenciales para la navegación y el funcionamiento básico.
                    </td>
                    <td className="px-4 py-3">Generalmente de sesión</td>
                    <td className="px-4 py-3">Propias</td>
                  </tr>
                  <tr className={`${theme === 'dark' ? 'border-b border-gray-700' : 'border-b border-gray-300'}`}>
                    <td className="px-4 py-3 font-medium">Funcionales</td>
                    <td className="px-4 py-3">
                      Recuerdan preferencias para personalizar la experiencia.
                    </td>
                    <td className="px-4 py-3">Persistentes (variable)</td>
                     <td className="px-4 py-3">Propias</td>
                  </tr>
                  <tr className={`${theme === 'dark' ? 'border-b border-gray-700' : 'border-b border-gray-300'}`}>
                    <td className="px-4 py-3 font-medium">Analíticas</td>
                    <td className="px-4 py-3">
                      Recopilan información sobre el uso del sitio para análisis y mejora.
                    </td>
                    <td className="px-4 py-3">Persistentes (variable)</td>
                     <td className="px-4 py-3">Propias y/o Terceros (ej. Google Analytics)</td>
                  </tr>
                  <tr className={`${theme === 'dark' ? 'border-b border-gray-700' : 'border-b border-gray-300'}`}>
                    <td className="px-4 py-3 font-medium">De Seguridad</td>
                    <td className="px-4 py-3">
                      Ayudan a proteger la cuenta y detectar actividades maliciosas.
                    </td>
                    <td className="px-4 py-3">Variable (Sesión/Persistente)</td>
                     <td className="px-4 py-3">Propias</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
          
          <div className={`rounded-lg p-6 mb-8 ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} shadow-md`}>
            <h2 className="text-2xl font-semibold mb-4">Cookies específicas utilizadas (Ejemplos)</h2>
            
            <div className="space-y-6 mb-6">
              <div>
                <h3 className="text-xl font-medium mb-3 text-blue-500">Cookies esenciales (estrictamente necesarias)</h3>
                <p className="text-sm mb-2 italic">Estas cookies no requieren consentimiento previo.</p>
                <div className="overflow-x-auto">
                  <table className={`w-full border-collapse ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}`}>
                    <thead>
                      <tr className={`${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'}`}>
                        <th className="px-4 py-2 text-left">Nombre</th>
                        <th className="px-4 py-2 text-left">Proveedor</th>
                        <th className="px-4 py-2 text-left">Finalidad</th>
                        <th className="px-4 py-2 text-left">Duración</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className={`${theme === 'dark' ? 'border-b border-gray-700' : 'border-b border-gray-300'}`}>
                        <td className="px-4 py-2">session_id (ejemplo)</td>
                        <td className="px-4 py-2">aimentalhealth.co</td>
                        <td className="px-4 py-2">Mantiene tu sesión activa (si aplica)</td>
                        <td className="px-4 py-2">Sesión</td>
                      </tr>
                      <tr className={`${theme === 'dark' ? 'border-b border-gray-700' : 'border-b border-gray-300'}`}>
                        <td className="px-4 py-2">csrf_token (ejemplo)</td>
                        <td className="px-4 py-2">aimentalhealth.co</td>
                        <td className="px-4 py-2">Previene ataques CSRF</td>
                        <td className="px-4 py-2">Sesión</td>
                      </tr>
                       <tr className={`${theme === 'dark' ? 'border-b border-gray-700' : 'border-b border-gray-300'}`}>
                        <td className="px-4 py-2">cookie_consent</td>
                        <td className="px-4 py-2">aimentalhealth.co</td>
                        <td className="px-4 py-2">Almacena tus preferencias de consentimiento de cookies</td>
                        <td className="px-4 py-2">1 año</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
              
              <div>
                <h3 className="text-xl font-medium mb-3 text-blue-500">Cookies de preferencias (Funcionales)</h3>
                 <p className="text-sm mb-2 italic">Estas cookies requieren tu consentimiento.</p>
                <div className="overflow-x-auto">
                  <table className={`w-full border-collapse ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}`}>
                    <thead>
                      <tr className={`${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'}`}>
                        <th className="px-4 py-2 text-left">Nombre</th>
                        <th className="px-4 py-2 text-left">Proveedor</th>
                        <th className="px-4 py-2 text-left">Finalidad</th>
                        <th className="px-4 py-2 text-left">Duración</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className={`${theme === 'dark' ? 'border-b border-gray-700' : 'border-b border-gray-300'}`}>
                        <td className="px-4 py-2">theme_preference</td>
                        <td className="px-4 py-2">aimentalhealth.co</td>
                        <td className="px-4 py-2">Guarda tu preferencia de tema (claro/oscuro)</td>
                        <td className="px-4 py-2">1 año</td>
                      </tr>
                      <tr className={`${theme === 'dark' ? 'border-b border-gray-700' : 'border-b border-gray-300'}`}>
                        <td className="px-4 py-2">language</td>
                        <td className="px-4 py-2">aimentalhealth.co</td>
                        <td className="px-4 py-2">Guarda tu preferencia de idioma</td>
                        <td className="px-4 py-2">1 año</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
              
              <div>
                <h3 className="text-xl font-medium mb-3 text-blue-500">Cookies de análisis y rendimiento (Analíticas)</h3>
                 <p className="text-sm mb-2 italic">Estas cookies requieren tu consentimiento.</p>
                <div className="overflow-x-auto">
                  <table className={`w-full border-collapse ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}`}>
                    <thead>
                      <tr className={`${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'}`}>
                        <th className="px-4 py-2 text-left">Nombre</th>
                        <th className="px-4 py-2 text-left">Proveedor</th>
                        <th className="px-4 py-2 text-left">Finalidad</th>
                        <th className="px-4 py-2 text-left">Duración</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className={`${theme === 'dark' ? 'border-b border-gray-700' : 'border-b border-gray-300'}`}>
                        <td className="px-4 py-2">_ga</td>
                        <td className="px-4 py-2">Google Analytics</td>
                        <td className="px-4 py-2">Registra un ID único para generar datos estadísticos sobre cómo utilizas el sitio</td>
                        <td className="px-4 py-2">2 años</td>
                      </tr>
                      <tr className={`${theme === 'dark' ? 'border-b border-gray-700' : 'border-b border-gray-300'}`}>
                        <td className="px-4 py-2">_gid</td>
                        <td className="px-4 py-2">Google Analytics</td>
                        <td className="px-4 py-2">Registra un ID único para generar datos estadísticos sobre cómo utilizas el sitio</td>
                        <td className="px-4 py-2">24 horas</td>
                      </tr>
                      <tr className={`${theme === 'dark' ? 'border-b border-gray-700' : 'border-b border-gray-300'}`}>
                        <td className="px-4 py-2">_gat</td>
                        <td className="px-4 py-2">Google Analytics</td>
                        <td className="px-4 py-2">Se usa para limitar el porcentaje de solicitudes</td>
                        <td className="px-4 py-2">1 minuto</td>
                      </tr>
                      {/* Añadir otras cookies analíticas si se usan (ej. Amplitude, Hotjar) */}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
            
            <div className="p-4 border border-amber-300 rounded-md bg-amber-50 text-amber-800 dark:bg-amber-900/30 dark:border-amber-800 dark:text-amber-300">
              <p className="font-bold mb-2">NOTA</p>
              <p>
                La lista anterior es ilustrativa y puede cambiar. Para obtener la información más actualizada, consulta esta política periódicamente o revisa la configuración de cookies en la plataforma.
              </p>
            </div>
          </div>
          
          <div className={`rounded-lg p-6 mb-8 ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} shadow-md`}>
            <h2 className="text-2xl font-semibold mb-4">Consentimiento y control de cookies</h2>
            
            <div className="mb-6">
              <h3 className="text-xl font-medium mb-3 text-blue-500">Tu autorización</h3>
              <p className="mb-4">
                De acuerdo con la normativa colombiana, las cookies que no son estrictamente necesarias para el funcionamiento del sitio (como las funcionales y analíticas) requieren tu autorización previa. La primera vez que visitas nuestra plataforma, te presentaremos un banner o mecanismo claro para que gestiones tus preferencias.
              </p>
              <p>
                Puedes retirar tu consentimiento o modificar tus preferencias en cualquier momento a través del gestor de cookies disponible en nuestra plataforma (generalmente en el pie de página).
              </p>
            </div>
            
            <div className="mb-6">
              <h3 className="text-xl font-medium mb-3 text-blue-500">Configuración del navegador</h3>
              <p className="mb-4">
                Puedes configurar tu navegador para que rechace todas o algunas cookies, o para que te notifique cuando se envía una cookie. A continuación, te indicamos cómo puedes gestionar las cookies en los navegadores más populares (los enlaces pueden variar):
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div className={`p-4 rounded-md ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}>
                  <h4 className="font-medium mb-2">Google Chrome</h4>
                  <p className="text-sm">Configuración → Privacidad y seguridad → Cookies y otros datos del sitio</p>
                </div>
                
                <div className={`p-4 rounded-md ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}>
                  <h4 className="font-medium mb-2">Mozilla Firefox</h4>
                  <p className="text-sm">Opciones → Privacidad y Seguridad → Cookies y datos del sitio</p>
                </div>
                
                <div className={`p-4 rounded-md ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}>
                  <h4 className="font-medium mb-2">Safari</h4>
                  <p className="text-sm">Preferencias → Privacidad → Cookies y datos del sitio web</p>
                </div>
                
                <div className={`p-4 rounded-md ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}>
                  <h4 className="font-medium mb-2">Microsoft Edge</h4>
                  <p className="text-sm">Configuración → Privacidad, búsqueda y servicios → Cookies</p>
                </div>
              </div>
              
              <p className="text-sm italic">
                Ten en cuenta que bloquear las cookies técnicas o esenciales puede afectar el funcionamiento de nuestra plataforma.
              </p>
            </div>
            
            <div className="mb-4">
              <h3 className="text-xl font-medium mb-3 text-blue-500">Eliminación de cookies</h3>
              <p>
                Puedes eliminar las cookies que ya están almacenadas en tu dispositivo a través de la configuración de tu navegador.
              </p>
            </div>
          </div>
          
          <div className={`rounded-lg p-6 mb-8 ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} shadow-md`}>
            <h2 className="text-2xl font-semibold mb-4">Otras tecnologías de seguimiento</h2>
            
            <p className="mb-4">
              Además de las cookies, en ocasiones podemos utilizar otras tecnologías similares:
            </p>
            
            <div className="mb-6">
              <h3 className="text-xl font-medium mb-3 text-blue-500">Web Beacons (Píxeles de seguimiento)</h3>
              <p>
                Pequeñas imágenes transparentes que nos permiten, por ejemplo, saber si has abierto un correo electrónico (con tu autorización previa) o has visitado una determinada página.
              </p>
            </div>
            
            <div className="mb-6">
              <h3 className="text-xl font-medium mb-3 text-blue-500">Almacenamiento local</h3>
              <p>
                Tecnologías como localStorage y sessionStorage que permiten almacenar datos en tu navegador para mejorar el rendimiento o guardar preferencias, sin transmitirlos automáticamente al servidor.
              </p>
            </div>
            
          </div>
          
          <div className={`rounded-lg p-6 mb-8 ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} shadow-md`}>
            <h2 className="text-2xl font-semibold mb-4">Cookies de terceros</h2>
            
            <p className="mb-4">
              Algunos de nuestros socios (como proveedores de análisis) pueden colocar cookies de terceros en tu dispositivo, siempre con tu autorización previa si no son esenciales. Estas cookies permiten que recopilen información anónima o seudónima para análisis estadísticos.
            </p>
            
            <p className="mb-6">
              Los principales terceros que pueden establecer cookies analíticas (si las autorizas) son:
            </p>
            
            <div className="space-y-4 mb-6">
              <div className={`p-4 rounded-md ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}>
                <h3 className="font-medium mb-2">Google Analytics</h3>
                <p className="text-sm mb-2">
                  Utilizamos Google Analytics para entender cómo interactúan los usuarios con nuestra plataforma.
                </p>
                <p className="text-xs">
                  Política de privacidad: <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">https://policies.google.com/privacy</a>
                </p>
              </div>
              
              {/* Añadir otros si aplican, ej: Amplitude, Hotjar */}
              
            </div>
            
            <p>
              Te recomendamos revisar las políticas de privacidad de estos terceros. No controlamos las cookies establecidas por ellos.
            </p>
          </div>
          
          <div className={`rounded-lg p-6 mb-8 ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} shadow-md`}>
            <h2 className="text-2xl font-semibold mb-4">Cambios en nuestra política de cookies</h2>
            
            <p className="mb-4">
              Podemos actualizar esta Política de Cookies periódicamente para reflejar cambios en las cookies que utilizamos o por otros motivos operativos, legales o regulatorios en Colombia. Te recomendamos revisar esta política regularmente.
            </p>
            
            <p className="mb-4">
              Cuando realicemos cambios significativos, te lo notificaremos de manera efectiva.
            </p>
            
            <p>
              La fecha en la parte superior de esta política indica cuándo se actualizó por última vez.
            </p>
          </div>
          
          <div className={`rounded-lg p-6 mb-8 ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} shadow-md`}>
            <h2 className="text-2xl font-semibold mb-4">Contacto</h2>
            
            <p className="mb-4">
              Si tienes preguntas o comentarios sobre nuestra Política de Cookies, puedes contactarnos a través de los canales indicados en nuestra <Link href="/legal/privacidad" className="text-blue-500 hover:underline">Política de Privacidad</Link>.
            </p>
            
            <div className="mb-4">
              <p><strong>Email:</strong> privacidad.co@aimentalhealth.com (Email inventado)</p>
            </div>
          </div>
          
          <div className="flex flex-wrap justify-between gap-4 mt-8">
            <Link 
              href="/legal/privacidad" 
              className={`inline-flex items-center px-4 py-2 rounded-md ${theme === 'dark' ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-200 hover:bg-gray-300'} transition-colors duration-200`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Política de Privacidad
            </Link>
            
            <Link 
              href="/legal/aviso-legal" 
              className={`inline-flex items-center px-4 py-2 rounded-md ${theme === 'dark' ? 'bg-blue-600 hover:bg-blue-700' : 'bg-blue-500 hover:bg-blue-600'} text-white transition-colors duration-200`}
            >
              Aviso Legal
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

export default CookiesPage; 