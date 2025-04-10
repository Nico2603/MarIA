'use client';

import React from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useTheme } from '@/components/ThemeProvider';

const AvisoLegalPage = () => {
  const { theme } = useTheme();
  
  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-800'}`}>
      <div className="container mx-auto px-4 py-12">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-3xl md:text-4xl font-bold mb-8 text-blue-600">Aviso Legal</h1>
          
          <div className={`bg-blue-100 border-l-4 border-blue-500 text-blue-700 p-4 mb-8 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-600`}>
            <p className="font-bold mb-2">ÚLTIMA ACTUALIZACIÓN</p>
            <p>Este Aviso Legal fue actualizado por última vez el 15 de septiembre de 2023.</p>
          </div>
          
          <div className={`rounded-lg p-6 mb-8 ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} shadow-md`}>
            <h2 className="text-2xl font-semibold mb-4">Información general</h2>
            <p className="mb-4">
              En cumplimiento con el deber de información establecido en la Ley 34/2002, de 11 de julio, de Servicios de la Sociedad de la Información y del Comercio Electrónico, le proporcionamos los siguientes datos identificativos del titular de este sitio web y aplicación:
            </p>
            
            <div className="space-y-2 mb-6">
              <p><strong>Denominación social:</strong> AI Mental Health, S.L.</p>
              <p><strong>CIF/NIF:</strong> B12345678</p>
              <p><strong>Domicilio social:</strong> Calle Innovación 123, 28001, Madrid, España</p>
              <p><strong>Teléfono:</strong> +34 91 123 45 67</p>
              <p><strong>Email:</strong> info@aimentalhealth.es</p>
              <p><strong>Registro Mercantil:</strong> Inscrita en el Registro Mercantil de Madrid, Tomo 12345, Folio 67, Hoja M-123456, Inscripción 1ª</p>
            </div>
            
            <p>
              Este Aviso Legal regula el uso del sitio web y aplicación AI Mental Health (en adelante, "la plataforma"), a la que se accede a través del dominio aimentalhealth.es y a través de nuestras aplicaciones móviles disponibles para iOS y Android.
            </p>
          </div>
          
          <div className={`rounded-lg p-6 mb-8 ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} shadow-md`}>
            <h2 className="text-2xl font-semibold mb-4">Objeto y ámbito de aplicación</h2>
            <p className="mb-4">
              El presente Aviso Legal tiene por objeto establecer y regular las normas de uso de la plataforma AI Mental Health, entendiendo por ésta todas las páginas y contenidos propiedad de AI Mental Health, S.L. a los que se accede a través del dominio aimentalhealth.es y sus subdominios, así como mediante nuestras aplicaciones móviles.
            </p>
            <p className="mb-4">
              La navegación por la plataforma atribuye la condición de usuario de la misma e implica la aceptación plena y sin reservas de todas y cada una de las disposiciones incluidas en este Aviso Legal, que pueden sufrir modificaciones.
            </p>
            <p>
              El usuario se obliga a hacer un uso correcto de la plataforma de conformidad con las leyes, la buena fe, el orden público, los usos del tráfico y el presente Aviso Legal. El usuario responderá frente a AI Mental Health, S.L. o frente a terceros, de cualesquiera daños y perjuicios que pudieran causarse como consecuencia del incumplimiento de dicha obligación.
            </p>
          </div>
          
          <div className={`rounded-lg p-6 mb-8 ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} shadow-md`}>
            <h2 className="text-2xl font-semibold mb-4">Condiciones de acceso y utilización</h2>
            
            <h3 className="text-xl font-medium mb-3 text-blue-500">Acceso y uso</h3>
            <p className="mb-4">
              El acceso a la plataforma por parte de los usuarios es de carácter libre y gratuito. No obstante, algunos de los servicios y contenidos ofrecidos pueden estar sujetos a contratación previa y al pago de una cantidad económica, tal y como se indica en las correspondientes Condiciones Particulares.
            </p>
            <p className="mb-6">
              Cuando sea necesario que el usuario se registre o aporte datos personales para acceder a alguno de los servicios, la recogida, el tratamiento y, en su caso, la cesión o el acceso de los datos personales de los usuarios se regirán por lo dispuesto en la Política de Privacidad.
            </p>
            
            <h3 className="text-xl font-medium mb-3 text-blue-500">Contenidos</h3>
            <p className="mb-4">
              Los contenidos referidos a servicios de salud mental, consejos psicológicos y recursos terapéuticos se ofrecen con fines informativos y de apoyo, y no sustituyen en ningún caso el consejo, diagnóstico, tratamiento o recomendaciones de un profesional de la salud mental.
            </p>
            <p className="mb-4">
              AI Mental Health no se hace responsable de las decisiones que pueda tomar el usuario basándose en esta información. Le recomendamos que consulte siempre con un profesional cualificado de la salud mental para obtener consejos específicos sobre su situación individual.
            </p>
            <p className="mb-6">
              En caso de emergencia o crisis de salud mental, por favor contacte inmediatamente con los servicios de emergencia locales o acuda al centro médico más cercano.
            </p>
            
            <h3 className="text-xl font-medium mb-3 text-blue-500">Obligaciones del usuario</h3>
            <p className="mb-4">
              El usuario se compromete a:
            </p>
            <ul className="list-disc pl-6 mb-6 space-y-2">
              <li>Hacer un uso adecuado y lícito de la plataforma así como de los contenidos y servicios.</li>
              <li>No utilizar la plataforma para realizar actividades ilícitas o constitutivas de delito, que atenten contra los derechos de terceros o que infrinjan la regulación sobre propiedad intelectual e industrial, o cualquier otra norma del ordenamiento jurídico aplicable.</li>
              <li>No transmitir, difundir o poner a disposición de terceros informaciones, datos, contenidos, mensajes, que puedan ser considerados difamatorios, obscenos, amenazantes, xenófobos, inciten a la violencia, al suicidio, o que de cualquier forma atenten contra la dignidad humana.</li>
              <li>No introducir virus informáticos, archivos defectuosos, o cualquier otro software o programa informático que pueda provocar daños o alteraciones en los contenidos o sistemas de AI Mental Health, S.L. o terceras personas.</li>
              <li>Respetar la privacidad y confidencialidad tanto de los servicios prestados como de los datos e información de otros usuarios.</li>
            </ul>
            
            <h3 className="text-xl font-medium mb-3 text-blue-500">Uso de credenciales</h3>
            <p className="mb-4">
              Para acceder a algunos de nuestros servicios, el usuario deberá proporcionar datos de registro. Las credenciales de acceso (email, contraseña) son personales e intransferibles. El usuario se compromete a hacer un uso diligente de sus credenciales y a mantenerlas en secreto.
            </p>
            <p className="mb-4">
              El usuario será responsable de la custodia de sus credenciales y deberá comunicar a AI Mental Health, S.L. a la mayor brevedad posible, la pérdida, robo o cualquier riesgo de acceso a sus credenciales por un tercero.
            </p>
          </div>
          
          <div className={`rounded-lg p-6 mb-8 ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} shadow-md`}>
            <h2 className="text-2xl font-semibold mb-4">Propiedad intelectual e industrial</h2>
            <p className="mb-4">
              Todos los contenidos de la plataforma, incluyendo a título enunciativo pero no limitativo, las imágenes, sonidos, audios, vídeos, diseños, textos, marcas, logotipos, combinaciones de colores, estructura, manuales, código fuente, software y demás elementos, son propiedad de AI Mental Health, S.L. o de terceros que han autorizado su uso, y están protegidos por las leyes de propiedad intelectual e industrial.
            </p>
            <p className="mb-4">
              El usuario se compromete a respetar estos derechos. Podrá visualizar los elementos de la plataforma e incluso imprimirlos, copiarlos y almacenarlos en el disco duro de su ordenador o en cualquier otro soporte físico siempre y cuando sea, única y exclusivamente, para su uso personal y privado, quedando, por tanto, terminantemente prohibida la transformación, distribución, comunicación pública, puesta a disposición o cualquier otra forma de explotación.
            </p>
            <p>
              Las marcas, nombres comerciales o signos distintivos son titularidad de AI Mental Health, S.L. o de terceros, sin que pueda entenderse que el acceso a la plataforma atribuya ningún derecho sobre las citadas marcas, nombres comerciales y/o signos distintivos.
            </p>
          </div>
          
          <div className={`rounded-lg p-6 mb-8 ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} shadow-md`}>
            <h2 className="text-2xl font-semibold mb-4">Enlaces a terceros</h2>
            <p className="mb-4">
              La plataforma puede incluir enlaces o hipervínculos a sitios web de terceros. Estos enlaces tienen una finalidad meramente informativa y no implican la existencia de ninguna relación entre AI Mental Health, S.L. y los titulares de dichos sitios web, ni la aceptación o aprobación por parte de AI Mental Health, S.L. de sus contenidos o servicios.
            </p>
            <p className="mb-4">
              AI Mental Health, S.L. no se responsabiliza de la información contenida en dichos sitios web ni del uso que el usuario pueda hacer de ellos. El acceso a estas páginas a través de nuestra plataforma no implica que AI Mental Health, S.L. asuma responsabilidad alguna sobre su contenido, funcionamiento o seguridad.
            </p>
            <p>
              El usuario accederá a estas páginas web bajo su exclusiva responsabilidad, debiendo cumplir con los términos, condiciones y políticas establecidas por los titulares de dichas páginas web.
            </p>
          </div>
          
          <div className={`rounded-lg p-6 mb-8 ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} shadow-md`}>
            <h2 className="text-2xl font-semibold mb-4">Exclusiones de responsabilidad</h2>
            
            <h3 className="text-xl font-medium mb-3 text-blue-500">Funcionamiento de la plataforma</h3>
            <p className="mb-6">
              AI Mental Health, S.L. no garantiza que la plataforma funcione de manera ininterrumpida, que esté libre de errores o que se puedan corregir todos aquellos que pudieran producirse. AI Mental Health, S.L. se reserva el derecho a suspender temporalmente el acceso a la plataforma por razones técnicas, de seguridad, de control, de mantenimiento, por fallos de suministro eléctrico o por cualquier otra causa fundada.
            </p>
            
            <h3 className="text-xl font-medium mb-3 text-blue-500">Virus y otros elementos dañinos</h3>
            <p className="mb-6">
              AI Mental Health, S.L. no se hace responsable de los posibles errores de seguridad que se puedan producir por el hecho de utilizar versiones de navegadores no actualizadas, o de las consecuencias que se puedan derivar del mal funcionamiento del navegador o del uso de versiones no actualizadas del mismo, ni de posibles daños, errores o inexactitudes que pudieran producirse por el uso inadecuado de la plataforma.
            </p>
            
            <h3 className="text-xl font-medium mb-3 text-blue-500">Contenidos de terceros</h3>
            <p className="mb-6">
              AI Mental Health, S.L. no se responsabiliza en ningún caso de los contenidos, datos o información aportados por terceros en la plataforma, ni de las opiniones o consejos publicados por los usuarios.
            </p>
            
            <h3 className="text-xl font-medium mb-3 text-blue-500">Orientación médica y psicológica</h3>
            <p className="mb-4">
              AI Mental Health, S.L. no proporciona asesoramiento médico, psicológico o profesional a través de la plataforma. Los contenidos, chats con IA, recursos y herramientas disponibles tienen carácter informativo y educativo, y en ningún caso constituyen un servicio de diagnóstico, tratamiento o asesoramiento médico o psicológico directo.
            </p>
            <p className="mb-4">
              El usuario reconoce que, aunque la plataforma utiliza tecnología de inteligencia artificial desarrollada con la colaboración de especialistas en salud mental, no está diseñada para sustituir la atención médica o psicológica profesional.
            </p>
            <p className="mb-4">
              AI Mental Health, S.L. recomienda encarecidamente a los usuarios que consulten con un profesional de la salud mental adecuadamente cualificado para obtener un diagnóstico y tratamiento personalizado.
            </p>
            <p>
              En caso de emergencia o crisis, el usuario debe contactar inmediatamente con los servicios de emergencia locales (112 en España), dirigirse al servicio de urgencias más cercano o llamar a líneas de ayuda específicas como el Teléfono de la Esperanza (717 003 717).
            </p>
          </div>
          
          <div className={`rounded-lg p-6 mb-8 ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} shadow-md`}>
            <h2 className="text-2xl font-semibold mb-4">Legislación aplicable y jurisdicción</h2>
            <p className="mb-4">
              El presente Aviso Legal se rige por la legislación española. Para cualquier controversia que pudiera derivarse del acceso o uso de la plataforma, AI Mental Health, S.L. y el usuario, con renuncia expresa a cualquier otro fuero que pudiera corresponderles, se someten a la jurisdicción de los Juzgados y Tribunales de Madrid capital (España), salvo que la normativa aplicable en materia de consumidores y usuarios establezca otro fuero.
            </p>
            <p className="mb-4">
              En el caso de que el usuario tenga su domicilio fuera de España, AI Mental Health, S.L. y el usuario se someten, con renuncia expresa a cualquier otro fuero, a los juzgados y tribunales de Madrid capital (España).
            </p>
            <p>
              Para presentar reclamaciones en el uso de nuestros servicios, puede dirigirse por correo electrónico a legal@aimentalhealth.es, comprometiéndonos a buscar en todo momento una solución amistosa a la controversia.
            </p>
          </div>
          
          <div className={`rounded-lg p-6 mb-8 ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} shadow-md`}>
            <h2 className="text-2xl font-semibold mb-4">Modificaciones</h2>
            <p className="mb-4">
              AI Mental Health, S.L. se reserva el derecho a realizar las modificaciones que considere oportunas, sin aviso previo, en el contenido de la plataforma. Tanto en lo referente a los contenidos de la plataforma, como en las condiciones de uso de la misma o en las condiciones generales de contratación. Dichas modificaciones podrán realizarse a través de la plataforma por cualquier forma admisible en derecho y serán de obligado cumplimiento durante el tiempo en que se encuentren publicadas en la web y hasta que no sean modificadas válidamente por otras posteriores.
            </p>
            <p>
              AI Mental Health, S.L. se reserva el derecho a actualizar, modificar o eliminar la información contenida en su web, así como su configuración o presentación, en cualquier momento, sin asumir responsabilidad alguna por ello.
            </p>
          </div>
          
          <div className={`rounded-lg p-6 mb-8 ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} shadow-md`}>
            <h2 className="text-2xl font-semibold mb-4">Contacto</h2>
            <p className="mb-4">
              Para cualquier consulta, duda o aclaración relacionada con este Aviso Legal, puede contactar con nosotros a través de:
            </p>
            <div>
              <p><strong>Email:</strong> legal@aimentalhealth.es</p>
              <p><strong>Dirección postal:</strong> AI Mental Health S.L., Calle Innovación 123, 28001 Madrid, España</p>
              <p><strong>Teléfono:</strong> +34 91 123 45 67</p>
            </div>
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

export default AvisoLegalPage; 