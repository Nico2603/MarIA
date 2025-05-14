'use client';

import React from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useTheme } from '@/components/ThemeProvider';

// Placeholder para iconos (se podrían usar librerías como Heroicons o react-icons)
const IconRespiracion = () => <svg className="h-6 w-6 mr-2 inline-block text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>; // Ejemplo: Rayo (energía/flujo)
const IconRelajacionMuscular = () => <svg className="h-6 w-6 mr-2 inline-block text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" /></svg>; // Ejemplo: Expansión/Contracción
const IconMindfulness = () => <svg className="h-6 w-6 mr-2 inline-block text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>; // Ejemplo: Ojo (atención)
const IconVisualizacion = () => <svg className="h-6 w-6 mr-2 inline-block text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>; // Ejemplo: Imagen
const IconGrounding = () => <svg className="h-6 w-6 mr-2 inline-block text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-7 0H5m2 0v-5a2 2 0 012-2h3a2 2 0 012 2v5m-7 0h7" /></svg>; // Ejemplo: Ancla
const IconEstiramiento = () => <svg className="h-6 w-6 mr-2 inline-block text-teal-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" /></svg>; // Ejemplo: Movimiento/Flexibilidad
const IconAfirmaciones = () => <svg className="h-6 w-6 mr-2 inline-block text-pink-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" /></svg>; // Ejemplo: Burbuja de diálogo

interface CardProps {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  theme: string | undefined;
}

const TechniqueCard: React.FC<CardProps> = ({ title, icon, children, theme }) => (
  <div className={`rounded-lg p-6 mb-8 ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} shadow-md`}>
    <h2 className="text-2xl font-semibold mb-4 flex items-center">
      {icon}
      {title}
    </h2>
    {children}
  </div>
);

const TecnicasRelajacionPage = () => {
  const { theme } = useTheme();

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-800'}`}>
      <div className="container mx-auto px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-3xl md:text-4xl font-bold mb-8 text-center text-blue-600 dark:text-blue-400">Técnicas de Relajación y Manejo del Estrés</h1>
          
          <p className={`mb-10 p-4 rounded-md text-center ${theme === 'dark' ? 'bg-gray-800' : 'bg-blue-50'} text-base`}>
            Explora estas técnicas para manejar el estrés, la ansiedad y mejorar tu bienestar. La práctica regular es clave.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Respiración Diafragmática */}
            <TechniqueCard title="1. Respiración Diafragmática" icon={<IconRespiracion />} theme={theme}>
              <p className="mb-4">
                Ayuda a reducir la respuesta al estrés, disminuyendo la frecuencia cardíaca y la presión arterial.
              </p>
              <h3 className="text-lg font-medium mb-2 text-blue-500 dark:text-blue-400">Pasos:</h3>
              <ol className="space-y-2 list-decimal pl-5 mb-4">
                <li>Siéntate o acuéstate cómodamente. Una mano en el pecho, otra en el abdomen.</li>
                <li>Inhala lento por la nariz, siente cómo tu abdomen se expande. El pecho quieto.</li>
                <li>Mantén el aire un momento (opcional).</li>
                <li>Exhala lentamente por la boca/nariz, siente cómo tu abdomen baja.</li>
                <li>Continúa 5-10 min, enfocado/a en tu respiración.</li>
              </ol>
              <p className="text-sm italic">Prueba la &quot;Respiración Cuadrada&quot;: Inhala (4s), Sostén (4s), Exhala (4s), Pausa (4s).</p>
            </TechniqueCard>

            {/* Relajación Muscular Progresiva */}
            <TechniqueCard title="2. Relajación Muscular Progresiva (RMP)" icon={<IconRelajacionMuscular />} theme={theme}>
              <p className="mb-4">
                Tensa y relaja grupos musculares para liberar la tensión física acumulada.
              </p>
              <h3 className="text-lg font-medium mb-2 text-green-500 dark:text-green-400">Pasos básicos:</h3>
              <ol className="space-y-2 list-decimal pl-5 mb-4">
                <li>Ponte cómodo/a, preferiblemente acostado/a.</li>
                <li>Comienza por los pies: Tensa (5s), luego relaja completamente (15-20s). Nota la diferencia.</li>
                <li>Sube gradualmente por el cuerpo (pantorrillas, muslos, glúteos, abdomen, pecho, brazos, manos, cuello, cara), tensando y relajando cada grupo.</li>
              </ol>
              <p className="text-sm italic">Adapta o omite si tienes lesiones. Puedes encontrar audios guiados online.</p>
              {/* Placeholder para enlace a audio */} 
              {/* <Link href="#" className="text-blue-500 hover:underline text-sm">Escuchar guía de RMP</Link> */}
            </TechniqueCard>

            {/* Atención Plena (Mindfulness) */}
            <TechniqueCard title="3. Atención Plena (Mindfulness)" icon={<IconMindfulness />} theme={theme}>
              <p className="mb-4">
                Prestar atención intencional al momento presente, sin juzgar. Reduce la rumiación.
              </p>
              <h3 className="text-lg font-medium mb-2 text-purple-500 dark:text-purple-400">Prácticas sencillas:</h3>
              <ul className="space-y-2 list-disc pl-5 mb-4">
                <li><strong>Observación de la respiración:</strong> Nota cómo entra y sale el aire, sin cambiarla.</li>
                <li><strong>Escaneo corporal:</strong> Recorre tu cuerpo mentalmente, notando sensaciones sin juicio.</li>
                <li><strong>Atención a los sentidos:</strong> Enfócate en lo que ves, oyes, hueles, saboreas o tocas ahora mismo.</li>
                <li><strong>Mindfulness en lo cotidiano:</strong> Presta atención plena al caminar, comer, etc.</li>
              </ul>
            </TechniqueCard>

            {/* Visualización Guiada */}
            <TechniqueCard title="4. Visualización Guiada" icon={<IconVisualizacion />} theme={theme}>
              <p className="mb-4">
                Usa la imaginación para crear imágenes mentales de lugares tranquilos y seguros.
              </p>
              <h3 className="text-lg font-medium mb-2 text-yellow-500 dark:text-yellow-400">Cómo empezar:</h3>
              <ol className="space-y-2 list-decimal pl-5 mb-4">
                <li>Busca un lugar tranquilo, cierra los ojos.</li>
                <li>Imagina tu lugar seguro y relajante (playa, bosque...).</li>
                <li>Involucra tus sentidos: ¿Qué ves, oyes, hueles, sientes?</li>
                <li>Permanece ahí unos minutos, absorbiendo la calma.</li>
              </ol>
              <p className="text-sm italic">Hay muchas visualizaciones guiadas en audio disponibles online.</p>
               {/* Placeholder para enlace a audio */}
              {/* <Link href="#" className="text-blue-500 hover:underline text-sm">Encontrar audios de visualización</Link> */}
            </TechniqueCard>

            {/* Grounding (Anclaje) */}
            <TechniqueCard title="5. Técnicas de Grounding (Anclaje)" icon={<IconGrounding />} theme={theme}>
              <p className="mb-4">
                Estrategias rápidas para conectar con el presente y reducir la intensidad de la ansiedad o el pánico.
              </p>
              <h3 className="text-lg font-medium mb-2 text-red-500 dark:text-red-400">Ejemplo (Técnica 5-4-3-2-1):</h3>
              <ol className="space-y-2 list-decimal pl-5 mb-4">
                <li><strong>5 cosas que puedes VER:</strong> Nombra cinco objetos a tu alrededor.</li>
                <li><strong>4 cosas que puedes TOCAR:</strong> Siente la textura de cuatro cosas.</li>
                <li><strong>3 cosas que puedes OÍR:</strong> Identifica tres sonidos diferentes.</li>
                <li><strong>2 cosas que puedes OLER:</strong> Busca dos olores distintos.</li>
                <li><strong>1 cosa que puedes SABOREAR:</strong> Nota el sabor en tu boca o bebe algo.</li>
              </ol>
              <p className="text-sm italic">Otras opciones: Sostener hielo, pisar descalzo/a, describir un objeto en detalle.</p>
            </TechniqueCard>

            {/* Ejercicios de Estiramiento Suave */}
            <TechniqueCard title="6. Estiramiento Suave y Movimiento Consciente" icon={<IconEstiramiento />} theme={theme}>
              <p className="mb-4">
                Combina movimientos ligeros con la respiración para liberar tensión física y calmar la mente.
              </p>
              <h3 className="text-lg font-medium mb-2 text-teal-500 dark:text-teal-400">Ideas simples:</h3>
              <ul className="space-y-2 list-disc pl-5 mb-4">
                <li><strong>Estiramiento de cuello:</strong> Inclina suavemente la cabeza de lado a lado, y hacia adelante/atrás.</li>
                <li><strong>Rotación de hombros:</strong> Haz círculos lentos hacia atrás y hacia adelante.</li>
                <li><strong>Estiramiento de gato-vaca (yoga):</strong> A cuatro patas, arquea y redondea la espalda al ritmo de tu respiración.</li>
                <li><strong>Caminata consciente:</strong> Camina despacio prestando atención a las sensaciones de tus pies y cuerpo.</li>
              </ul>
               <p className="text-sm italic">Escucha a tu cuerpo, no fuerces ningún movimiento.</p>
            </TechniqueCard>

            {/* Afirmaciones Positivas */}
            <TechniqueCard title="7. Uso de Afirmaciones Positivas" icon={<IconAfirmaciones />} theme={theme}>
              <p className="mb-4">
                 Frases cortas y positivas que puedes repetirte para fomentar una mentalidad más constructiva y reducir el impacto de pensamientos negativos.
              </p>
              <h3 className="text-lg font-medium mb-2 text-pink-500 dark:text-pink-400">Cómo usarlas:</h3>
              <ul className="space-y-2 list-disc pl-5 mb-4">
                <li>Elige frases que resuenen contigo (ej. &quot;Estoy a salvo&quot;, &quot;Puedo manejar esto&quot;, &quot;Soy capaz&quot;).</li>
                <li>Repítelas mentalmente o en voz alta, especialmente en momentos de estrés o duda.</li>
                <li>Puedes escribirlas y dejarlas en lugares visibles.</li>
                <li>Combínalas con la respiración profunda.</li>
              </ul>
              <p className="text-sm italic">Sé constante y paciente; el cambio de mentalidad lleva tiempo.</p>
            </TechniqueCard>
          </div>

          {/* Consejos Prácticos */}
          <div className={`mt-12 rounded-lg p-6 ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} shadow-md`}>
             <h2 className="text-2xl font-semibold mb-4">Consejos Prácticos para Empezar</h2>
             <ul className="space-y-2 list-disc pl-5">
                <li><strong>Empieza poco a poco:</strong> No intentes dominar todas las técnicas a la vez. Elige una o dos que te atraigan y practícalas regularmente por unos minutos cada día.</li>
                <li><strong>Sé paciente y amable contigo:</strong> La relajación es una habilidad que se desarrolla con la práctica. No te frustres si no sientes resultados inmediatos.</li>
                <li><strong>Encuentra tu momento y lugar:</strong> Busca un espacio tranquilo donde no te interrumpan, aunque sea solo por 5 minutos.</li>
                <li><strong>Integra en tu rutina:</strong> Intenta incorporar momentos de pausa y respiración consciente a lo largo del día.</li>
                <li><strong>Experimenta:</strong> Lo que funciona para una persona puede no funcionar para otra. Prueba diferentes técnicas para ver cuáles te benefician más.</li>
             </ul>
          </div>

          {/* Sección de Advertencia y Enlace a Profesionales */}
          <div className={`mt-10 rounded-lg p-6 ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'} border-l-4 ${theme === 'dark' ? 'border-blue-400' : 'border-blue-500'}`}>
            <h2 className="text-xl font-semibold mb-3">Importante</h2>
            <p>
              Estas técnicas son un apoyo valioso, pero no reemplazan la ayuda profesional. Si sientes que la ansiedad o el estrés te superan, o si necesitas un diagnóstico y tratamiento, busca ayuda médica o psicológica.
            </p>
             <div className="mt-4">
              <Link 
                href="/recursos/profesionales" // Ajusta este enlace si es diferente
                className={`inline-flex items-center px-3 py-1 rounded-md text-sm font-medium ${theme === 'dark' ? 'bg-blue-600 hover:bg-blue-700 text-white' : 'bg-blue-500 hover:bg-blue-600 text-white'} transition-colors duration-200`}
              >
                Buscar Ayuda Profesional
                 <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </Link>
            </div>
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

export default TecnicasRelajacionPage; 