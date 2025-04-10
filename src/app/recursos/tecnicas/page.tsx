'use client';

import React from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useTheme } from '@/components/ThemeProvider';

const TecnicasPage = () => {
  const { theme } = useTheme();
  
  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-800'}`}>
      <div className="container mx-auto px-4 py-12">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-3xl md:text-4xl font-bold mb-8 text-blue-600">Técnicas de Relajación</h1>
          
          <div className={`rounded-lg p-6 mb-8 ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} shadow-md`}>
            <h2 className="text-2xl font-semibold mb-4">Importancia de la relajación</h2>
            <p className="mb-4">
              Las técnicas de relajación son estrategias efectivas para reducir el estrés y la ansiedad, mejorar el sueño, disminuir la tensión muscular y promover una sensación general de bienestar. Practicar estas técnicas regularmente puede tener beneficios significativos para la salud física y mental.
            </p>
            <p>
              Estas técnicas funcionan activando la respuesta de relajación del cuerpo, que contrarresta la respuesta de "lucha o huida" provocada por el estrés, reduciendo la presión arterial, la frecuencia cardíaca y la tensión muscular.
            </p>
          </div>
          
          <div className={`rounded-lg p-6 mb-8 ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} shadow-md`}>
            <h2 className="text-2xl font-semibold mb-4">Respiración diafragmática</h2>
            <p className="mb-4">
              La respiración profunda o diafragmática es una de las técnicas más simples y efectivas para reducir la tensión y la ansiedad.
            </p>
            <h3 className="text-xl font-medium mb-3 text-blue-500">Cómo practicarla:</h3>
            <ol className="space-y-2 list-decimal pl-5 mb-6">
              <li>Siéntate cómodamente o acuéstate boca arriba, con las rodillas flexionadas.</li>
              <li>Coloca una mano en el pecho y otra en el abdomen, justo debajo de las costillas.</li>
              <li>Inhala lentamente por la nariz, permitiendo que el abdomen se expanda (la mano sobre el abdomen debe elevarse, mientras la del pecho debe moverse muy poco).</li>
              <li>Exhala lentamente por la boca o la nariz, sintiendo cómo el abdomen desciende.</li>
              <li>Repite durante 5-10 minutos, concentrándote en mantener una respiración lenta y profunda.</li>
            </ol>
            <p className="text-sm italic mb-4">
              Consejo: Practica inicialmente 3-4 veces al día durante 5 minutos cada vez. Con la práctica, esta forma de respirar se volverá más natural.
            </p>
          </div>
          
          <div className={`rounded-lg p-6 mb-8 ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} shadow-md`}>
            <h2 className="text-2xl font-semibold mb-4">Relajación muscular progresiva</h2>
            <p className="mb-4">
              Esta técnica consiste en tensar y luego relajar sistemáticamente diferentes grupos musculares, ayudando a reconocer la diferencia entre tensión y relajación.
            </p>
            <h3 className="text-xl font-medium mb-3 text-blue-500">Instrucciones básicas:</h3>
            <ol className="space-y-2 list-decimal pl-5 mb-6">
              <li>Siéntate o acuéstate en un lugar cómodo y sin distracciones.</li>
              <li>Comienza con respiraciones profundas para establecer un ritmo tranquilo.</li>
              <li>Tensa los músculos de los pies durante 5-10 segundos, notando la sensación de tensión.</li>
              <li>Relaja los músculos repentinamente y siente la diferencia durante 15-20 segundos.</li>
              <li>Progresa sistemáticamente por todo el cuerpo: pantorrillas, muslos, glúteos, abdomen, pecho, brazos, manos, hombros, cuello y cara.</li>
              <li>Termina con varias respiraciones profundas, notando la sensación de relajación en todo el cuerpo.</li>
            </ol>
            <p className="text-sm italic mb-4">
              Nota: Si experimentas dolor o calambres al tensar un grupo muscular, detente y pasa al siguiente grupo.
            </p>
          </div>
          
          <div className={`rounded-lg p-6 mb-8 ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} shadow-md`}>
            <h2 className="text-2xl font-semibold mb-4">Meditación mindfulness</h2>
            <p className="mb-4">
              La meditación mindfulness implica prestar atención plena al momento presente, observando los pensamientos y sensaciones sin juzgarlos.
            </p>
            <h3 className="text-xl font-medium mb-3 text-blue-500">Meditación básica de atención plena:</h3>
            <ol className="space-y-2 list-decimal pl-5 mb-6">
              <li>Encuentra un lugar tranquilo y siéntate en una posición cómoda.</li>
              <li>Establece un tiempo determinado (5-10 minutos para principiantes).</li>
              <li>Observa tu respiración, sintiendo el aire entrar y salir del cuerpo.</li>
              <li>Cuando tu mente divague (lo que es natural), observa simplemente hacia dónde ha ido tu atención y gentilmente devuélvela a la respiración.</li>
              <li>No juzgues tus pensamientos ni intentes suprimirlos; sólo observa cómo aparecen y desaparecen.</li>
              <li>Al finalizar, toma conciencia de tu cuerpo como un todo antes de moverte.</li>
            </ol>
            <p className="text-sm italic mb-4">
              Aplicaciones como Headspace, Calm o Insight Timer ofrecen meditaciones guiadas para principiantes.
            </p>
          </div>
          
          <div className={`rounded-lg p-6 mb-8 ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} shadow-md`}>
            <h2 className="text-2xl font-semibold mb-4">Visualización guiada</h2>
            <p className="mb-4">
              Esta técnica utiliza la imaginación para crear imágenes mentales detalladas que evocan calma y tranquilidad.
            </p>
            <h3 className="text-xl font-medium mb-3 text-blue-500">Ejercicio de visualización del lugar seguro:</h3>
            <ol className="space-y-2 list-decimal pl-5 mb-6">
              <li>Ponte cómodo y cierra los ojos. Realiza varias respiraciones profundas.</li>
              <li>Imagina un lugar donde te sientas completamente seguro, tranquilo y en paz. Puede ser un lugar real o imaginario.</li>
              <li>Utiliza todos tus sentidos para hacer la visualización más vívida:</li>
                <ul className="space-y-1 list-disc pl-8 mt-1">
                  <li>¿Qué ves a tu alrededor? (colores, formas, luz)</li>
                  <li>¿Qué sonidos escuchas? (agua, viento, pájaros)</li>
                  <li>¿Qué olores percibes? (flores, mar, bosque)</li>
                  <li>¿Qué texturas puedes sentir? (arena, hierba, brisa)</li>
                </ul>
              <li>Permanece en este lugar seguro durante unos minutos, absorbiendo la sensación de calma.</li>
              <li>Cuando estés listo, cuenta lentamente del 1 al 5 y abre los ojos, llevándote la sensación de paz contigo.</li>
            </ol>
          </div>
          
          <div className={`rounded-lg p-6 mb-8 ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} shadow-md`}>
            <h2 className="text-2xl font-semibold mb-4">Técnicas de relajación rápida</h2>
            <p className="mb-4">
              Estas son técnicas breves que puedes utilizar en cualquier momento del día para reducir rápidamente la tensión:
            </p>
            
            <h3 className="text-xl font-medium mb-3 text-blue-500">Respiración 4-7-8</h3>
            <ol className="space-y-1 list-decimal pl-5 mb-4">
              <li>Inhala contando hasta 4</li>
              <li>Mantén la respiración contando hasta 7</li>
              <li>Exhala lentamente contando hasta 8</li>
              <li>Repite 3-4 veces</li>
            </ol>
            
            <h3 className="text-xl font-medium mb-3 text-blue-500">Escaneo corporal rápido</h3>
            <ol className="space-y-1 list-decimal pl-5 mb-4">
              <li>Cierra los ojos por un momento</li>
              <li>Revisa rápidamente tu cuerpo de pies a cabeza</li>
              <li>Identifica áreas de tensión y conscientemente relájalas</li>
              <li>Termina con una respiración profunda</li>
            </ol>
            
            <h3 className="text-xl font-medium mb-3 text-blue-500">Anclaje sensorial (5-4-3-2-1)</h3>
            <p className="mb-2">Identifica:</p>
            <ul className="space-y-1 list-disc pl-5 mb-4">
              <li>5 cosas que puedes ver</li>
              <li>4 cosas que puedes tocar/sentir</li>
              <li>3 cosas que puedes oír</li>
              <li>2 cosas que puedes oler</li>
              <li>1 cosa que puedes saborear</li>
            </ul>
          </div>
          
          <div className={`rounded-lg p-6 mb-8 ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} shadow-md`}>
            <h2 className="text-2xl font-semibold mb-4">Consejos para establecer una práctica regular</h2>
            <ul className="space-y-2 list-disc pl-5 mb-6">
              <li><strong>Comienza poco a poco:</strong> 5 minutos al día son mejor que 30 minutos una vez a la semana.</li>
              <li><strong>Sé consistente:</strong> Practica a la misma hora cada día para crear un hábito.</li>
              <li><strong>Crea un espacio:</strong> Designa un área tranquila en tu hogar para tu práctica.</li>
              <li><strong>Usa recordatorios:</strong> Configura alarmas o asocia la práctica con una actividad diaria existente.</li>
              <li><strong>Sé paciente:</strong> Los beneficios aumentan con el tiempo y la práctica regular.</li>
              <li><strong>No juzgues:</strong> No hay una forma "correcta" de sentirse; todas las experiencias son válidas.</li>
            </ul>
            <p className="text-sm italic">
              Recuerda que la relajación es una habilidad que mejora con la práctica. Si una técnica no funciona para ti, prueba otra hasta encontrar la que mejor se adapte a tus necesidades.
            </p>
          </div>
          
          <div className="flex justify-between mt-8">
            <Link 
              href="/recursos/depresion" 
              className={`inline-flex items-center px-4 py-2 rounded-md ${theme === 'dark' ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-200 hover:bg-gray-300'} transition-colors duration-200`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Sobre la Depresión
            </Link>
            
            <Link 
              href="/recursos/crisis" 
              className={`inline-flex items-center px-4 py-2 rounded-md ${theme === 'dark' ? 'bg-blue-600 hover:bg-blue-700' : 'bg-blue-500 hover:bg-blue-600'} text-white transition-colors duration-200`}
            >
              Manejo de Crisis
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

export default TecnicasPage; 