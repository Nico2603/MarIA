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
              Las cookies son pequeños archivos de texto que se almacenan en tu dispositivo (ordenador, tablet, teléfono móvil) cuando visitas sitios web. Son ampliamente utilizadas para hacer que los sitios web funcionen de manera más eficiente, así como para proporcionar información a los propietarios del sitio.
            </p>
            <p>
              Las cookies permiten que un sitio web reconozca tu dispositivo, recuerde tus preferencias, te ofrezca una experiencia personalizada y, en algunos casos, faciliten la presentación de publicidad relevante a tus intereses.
            </p>
          </div>
          
          <div className={`rounded-lg p-6 mb-8 ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} shadow-md`}>
            <h2 className="text-2xl font-semibold mb-4">Cómo utilizamos las cookies</h2>
            <p className="mb-4">
              En AI Mental Health utilizamos cookies y tecnologías similares para diversos fines, incluyendo:
            </p>
            
            <div className="space-y-6 mb-4">
              <div className={`p-4 rounded-md ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}>
                <h3 className="text-xl font-medium mb-2 text-blue-500">Funcionamiento esencial</h3>
                <p>
                  Algunas cookies son esenciales para el funcionamiento básico de nuestra plataforma. Te permiten navegar por el sitio, acceder a áreas seguras, y utilizar funciones como el inicio de sesión. Sin estas cookies, nuestra plataforma no funcionaría correctamente.
                </p>
              </div>
              
              <div className={`p-4 rounded-md ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}>
                <h3 className="text-xl font-medium mb-2 text-blue-500">Personalización y preferencias</h3>
                <p>
                  Estas cookies nos permiten recordar tus preferencias y opciones, como tu nombre de usuario, idioma, región, o preferencias de visualización (como el modo oscuro/claro). Esto nos ayuda a proporcionarte una experiencia más personalizada y adaptada a tus preferencias.
                </p>
              </div>
              
              <div className={`p-4 rounded-md ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}>
                <h3 className="text-xl font-medium mb-2 text-blue-500">Análisis y rendimiento</h3>
                <p>
                  Utilizamos cookies para recopilar información sobre cómo interactúas con nuestra plataforma, qué páginas visitas, y si encuentras errores. Esto nos ayuda a mejorar el rendimiento de nuestro sitio y a desarrollar mejores funcionalidades.
                </p>
              </div>
              
              <div className={`p-4 rounded-md ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}>
                <h3 className="text-xl font-medium mb-2 text-blue-500">Seguridad</h3>
                <p>
                  Utilizamos cookies de seguridad para autenticar usuarios, prevenir el uso fraudulento de cuentas de usuario, y proteger los datos de usuarios de accesos no autorizados.
                </p>
              </div>
            </div>
            
            <p className="mb-4">
              Es importante destacar que no utilizamos cookies para mostrar publicidad de terceros ni para rastrear tu actividad de navegación en otros sitios web.
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
                  </tr>
                </thead>
                <tbody>
                  <tr className={`${theme === 'dark' ? 'border-b border-gray-700' : 'border-b border-gray-300'}`}>
                    <td className="px-4 py-3 font-medium">Sesión</td>
                    <td className="px-4 py-3">
                      Estas cookies temporales se utilizan para recordar tus acciones durante una sesión de navegación. Se eliminan al cerrar el navegador.
                    </td>
                    <td className="px-4 py-3">Sesión</td>
                  </tr>
                  <tr className={`${theme === 'dark' ? 'border-b border-gray-700' : 'border-b border-gray-300'}`}>
                    <td className="px-4 py-3 font-medium">Persistentes</td>
                    <td className="px-4 py-3">
                      Estas cookies permanecen en tu dispositivo durante un período específico o hasta que las elimines manualmente. Se utilizan para recordar tus preferencias o acciones a lo largo de múltiples sesiones.
                    </td>
                    <td className="px-4 py-3">Hasta 12 meses</td>
                  </tr>
                  <tr className={`${theme === 'dark' ? 'border-b border-gray-700' : 'border-b border-gray-300'}`}>
                    <td className="px-4 py-3 font-medium">Propias</td>
                    <td className="px-4 py-3">
                      Cookies establecidas por nuestro sitio web directamente.
                    </td>
                    <td className="px-4 py-3">Variable</td>
                  </tr>
                  <tr className={`${theme === 'dark' ? 'border-b border-gray-700' : 'border-b border-gray-300'}`}>
                    <td className="px-4 py-3 font-medium">De terceros</td>
                    <td className="px-4 py-3">
                      Cookies establecidas por proveedores de servicios externos (como Google Analytics para análisis) que utilizamos para mejorar nuestros servicios.
                    </td>
                    <td className="px-4 py-3">Variable</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
          
          <div className={`rounded-lg p-6 mb-8 ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} shadow-md`}>
            <h2 className="text-2xl font-semibold mb-4">Cookies específicas utilizadas</h2>
            
            <div className="space-y-6 mb-6">
              <div>
                <h3 className="text-xl font-medium mb-3 text-blue-500">Cookies esenciales (estrictamente necesarias)</h3>
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
                        <td className="px-4 py-2">session_id</td>
                        <td className="px-4 py-2">aimentalhealth.es</td>
                        <td className="px-4 py-2">Mantiene tu sesión activa</td>
                        <td className="px-4 py-2">Sesión</td>
                      </tr>
                      <tr className={`${theme === 'dark' ? 'border-b border-gray-700' : 'border-b border-gray-300'}`}>
                        <td className="px-4 py-2">auth_token</td>
                        <td className="px-4 py-2">aimentalhealth.es</td>
                        <td className="px-4 py-2">Autenticación de usuario</td>
                        <td className="px-4 py-2">30 días</td>
                      </tr>
                      <tr className={`${theme === 'dark' ? 'border-b border-gray-700' : 'border-b border-gray-300'}`}>
                        <td className="px-4 py-2">csrf_token</td>
                        <td className="px-4 py-2">aimentalhealth.es</td>
                        <td className="px-4 py-2">Previene ataques CSRF</td>
                        <td className="px-4 py-2">Sesión</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
              
              <div>
                <h3 className="text-xl font-medium mb-3 text-blue-500">Cookies de preferencias</h3>
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
                        <td className="px-4 py-2">aimentalhealth.es</td>
                        <td className="px-4 py-2">Guarda tu preferencia de tema (claro/oscuro)</td>
                        <td className="px-4 py-2">1 año</td>
                      </tr>
                      <tr className={`${theme === 'dark' ? 'border-b border-gray-700' : 'border-b border-gray-300'}`}>
                        <td className="px-4 py-2">language</td>
                        <td className="px-4 py-2">aimentalhealth.es</td>
                        <td className="px-4 py-2">Guarda tu preferencia de idioma</td>
                        <td className="px-4 py-2">1 año</td>
                      </tr>
                      <tr className={`${theme === 'dark' ? 'border-b border-gray-700' : 'border-b border-gray-300'}`}>
                        <td className="px-4 py-2">notification_settings</td>
                        <td className="px-4 py-2">aimentalhealth.es</td>
                        <td className="px-4 py-2">Almacena tus preferencias de notificación</td>
                        <td className="px-4 py-2">1 año</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
              
              <div>
                <h3 className="text-xl font-medium mb-3 text-blue-500">Cookies de análisis y rendimiento</h3>
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
                      <tr className={`${theme === 'dark' ? 'border-b border-gray-700' : 'border-b border-gray-300'}`}>
                        <td className="px-4 py-2">amplitude_id</td>
                        <td className="px-4 py-2">Amplitude</td>
                        <td className="px-4 py-2">Análisis de comportamiento del usuario</td>
                        <td className="px-4 py-2">1 año</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
            
            <div className="p-4 border border-amber-300 rounded-md bg-amber-50 text-amber-800 dark:bg-amber-900/30 dark:border-amber-800 dark:text-amber-300">
              <p className="font-bold mb-2">NOTA</p>
              <p>
                La lista anterior no es exhaustiva y puede cambiar a medida que actualizamos nuestra plataforma. Para obtener la información más actualizada, consulta esta política periódicamente.
              </p>
            </div>
          </div>
          
          <div className={`rounded-lg p-6 mb-8 ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} shadow-md`}>
            <h2 className="text-2xl font-semibold mb-4">Control de cookies</h2>
            
            <div className="mb-6">
              <h3 className="text-xl font-medium mb-3 text-blue-500">Configuración en nuestra plataforma</h3>
              <p className="mb-4">
                La primera vez que visitas nuestra plataforma, se te mostrará un banner de cookies donde podrás elegir aceptar todas las cookies o personalizar tus preferencias. Puedes cambiar estas preferencias en cualquier momento accediendo a la configuración de cookies en el pie de página de nuestro sitio.
              </p>
              <p>
                Ten en cuenta que, si rechazas ciertas cookies, es posible que algunas funciones de nuestra plataforma no estén disponibles o no funcionen correctamente.
              </p>
            </div>
            
            <div className="mb-6">
              <h3 className="text-xl font-medium mb-3 text-blue-500">Configuración del navegador</h3>
              <p className="mb-4">
                Además del control que ofrecemos, puedes configurar tu navegador para que rechace todas las cookies o te notifique cuando se envía una cookie. A continuación, te indicamos cómo puedes gestionar las cookies en los navegadores más populares:
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
                Ten en cuenta que bloquear todas las cookies puede afectar significativamente tu experiencia de navegación en muchos sitios web, no solo en AI Mental Health.
              </p>
            </div>
            
            <div className="mb-4">
              <h3 className="text-xl font-medium mb-3 text-blue-500">Eliminación de cookies</h3>
              <p>
                Puedes eliminar las cookies que ya están almacenadas en tu dispositivo a través de la configuración de tu navegador. Las instrucciones varían según el navegador, pero generalmente puedes encontrar esta opción en la misma sección donde se gestionan las cookies.
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
                Pequeñas imágenes transparentes que nos permiten, por ejemplo, saber si has abierto un correo electrónico que te hemos enviado o has visitado una determinada página de nuestra plataforma.
              </p>
            </div>
            
            <div className="mb-6">
              <h3 className="text-xl font-medium mb-3 text-blue-500">Almacenamiento local</h3>
              <p>
                Tecnologías como localStorage y sessionStorage que permiten almacenar datos en tu navegador. A diferencia de las cookies, los datos almacenados en el almacenamiento local no se transmiten automáticamente al servidor con cada solicitud.
              </p>
            </div>
            
            <div>
              <h3 className="text-xl font-medium mb-3 text-blue-500">Huellas digitales del dispositivo (Fingerprinting)</h3>
              <p>
                Técnica que recopila información sobre tu dispositivo (como la configuración, el sistema operativo, el navegador) para crear una "huella digital" que puede usarse para identificarte sin necesidad de cookies. Utilizamos esta tecnología exclusivamente con fines de seguridad y prevención de fraude.
              </p>
            </div>
          </div>
          
          <div className={`rounded-lg p-6 mb-8 ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} shadow-md`}>
            <h2 className="text-2xl font-semibold mb-4">Cookies de terceros</h2>
            
            <p className="mb-4">
              Algunos de nuestros socios de confianza pueden colocar cookies de terceros en tu dispositivo cuando visitas nuestra plataforma. Estas cookies permiten que estos terceros recopilen información para diversos fines, incluyendo proporcionar análisis estadísticos y funcionalidades específicas.
            </p>
            
            <p className="mb-6">
              Los principales terceros que pueden establecer cookies a través de nuestra plataforma son:
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
              
              <div className={`p-4 rounded-md ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}>
                <h3 className="font-medium mb-2">Amplitude</h3>
                <p className="text-sm mb-2">
                  Utilizamos Amplitude para analizar el comportamiento del usuario y mejorar la experiencia.
                </p>
                <p className="text-xs">
                  Política de privacidad: <a href="https://amplitude.com/privacy" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">https://amplitude.com/privacy</a>
                </p>
              </div>
              
              <div className={`p-4 rounded-md ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}>
                <h3 className="font-medium mb-2">Hotjar</h3>
                <p className="text-sm mb-2">
                  Utilizamos Hotjar para entender mejor las necesidades de nuestros usuarios y optimizar la experiencia.
                </p>
                <p className="text-xs">
                  Política de privacidad: <a href="https://www.hotjar.com/legal/policies/privacy" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">https://www.hotjar.com/legal/policies/privacy</a>
                </p>
              </div>
            </div>
            
            <p>
              Te recomendamos revisar las políticas de privacidad de estos terceros para obtener más información sobre cómo utilizan tus datos.
            </p>
          </div>
          
          <div className={`rounded-lg p-6 mb-8 ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} shadow-md`}>
            <h2 className="text-2xl font-semibold mb-4">Cambios en nuestra política de cookies</h2>
            
            <p className="mb-4">
              Podemos actualizar esta Política de Cookies periódicamente para reflejar cambios en las cookies que utilizamos o por otros motivos operativos, legales o regulatorios. Te recomendamos revisar esta política regularmente para estar informado sobre nuestro uso de cookies y tecnologías relacionadas.
            </p>
            
            <p className="mb-4">
              Cuando realicemos cambios significativos en esta política, te lo notificaremos a través de un aviso en nuestra plataforma o, en algunos casos, enviándote un correo electrónico.
            </p>
            
            <p>
              La fecha en la parte superior de esta política indica cuándo se actualizó por última vez.
            </p>
          </div>
          
          <div className={`rounded-lg p-6 mb-8 ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} shadow-md`}>
            <h2 className="text-2xl font-semibold mb-4">Contacto</h2>
            
            <p className="mb-4">
              Si tienes preguntas o comentarios sobre nuestra Política de Cookies o sobre las prácticas de privacidad en nuestra plataforma, no dudes en contactarnos:
            </p>
            
            <div className="mb-4">
              <p><strong>Email:</strong> privacidad@aimentalhealth.es</p>
              <p><strong>Delegado de Protección de Datos:</strong> dpd@aimentalhealth.es</p>
              <p><strong>Dirección postal:</strong> AI Mental Health S.L., Calle Innovación 123, 28001 Madrid, España</p>
              <p><strong>Teléfono:</strong> +34 91 123 45 67</p>
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