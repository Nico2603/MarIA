'use client';

import React from 'react';
import { motion } from 'framer-motion';

// Tipo para los consejos
type Tip = {
  id: number;
  title: string;
  description: string;
  icon: string;
  category: 'diario' | 'crisis' | 'autoestima' | 'habitos' | 'relaciones' | 'ejercicios';
};

export default function ConsejosPage() {
  // Lista de consejos - ACTUALIZADA Y ENFOCADA EN ANSIEDAD
  const tips: Tip[] = [
    {
      id: 1,
      title: 'Respiración Diafragmática para Calmar',
      description: 'Dedica 5 min/día a respirar lento y profundo desde el abdomen. Ayuda a activar la respuesta de relajación del cuerpo ante la ansiedad. Inhala (4s), Sostén (2s), Exhala (6s).',
      icon: '🧘',
      category: 'ejercicios', // Más que diario, es un ejercicio específico
    },
    {
      id: 5, // Mantengo ID original para animaciones
      title: 'Técnica 5-4-3-2-1 (Anclaje Sensorial)',
      description: 'Cuando la ansiedad abrume, nombra 5 cosas que ves, 4 que tocas, 3 que oyes, 2 que hueles, 1 que saboreas. Te trae al presente y reduce la intensidad.',
      icon: '👀', // Ícono más descriptivo
      category: 'crisis',
    },
     {
      id: 10,
      title: 'Enraizamiento (Grounding)',
      description: 'Concéntrate en la sensación de tus pies en el suelo. Siente la conexión con la tierra. Ayuda a estabilizarte durante picos de ansiedad.',
      icon: '🌱',
      category: 'ejercicios',
    },
     {
      id: 13, // Nuevo ID
      title: 'Identifica y Cuestiona Pensamientos Ansiosos',
      description: 'Pregúntate: ¿Este pensamiento es realista? ¿Hay otra forma de verlo? ¿Qué es lo peor que REALMENTE podría pasar? Desafiar pensamientos reduce su poder.',
      icon: '🤔',
      category: 'ejercicios',
    },
    {
      id: 8,
      title: 'Ejercicio Físico Regular',
      description: 'El movimiento (caminata, baile, etc.) libera tensión y mejora el ánimo, actuando como un ansiolítico natural. Busca actividades que disfrutes.',
      icon: '🚶‍♀️', // Más específico
      category: 'habitos',
    },
    {
      id: 6,
      title: 'Prioriza el Sueño Reparador',
      description: 'La falta de sueño dispara la ansiedad. Mantén horarios regulares y crea una rutina relajante antes de dormir (sin pantallas).',
      icon: '😴',
      category: 'habitos',
    },
    {
      id: 12,
      title: 'Escáner Corporal para Liberar Tensión',
      description: 'Recorre mentalmente tu cuerpo notando dónde acumulas tensión por la ansiedad (mandíbula, hombros, estómago) y relaja conscientemente esa zona.',
      icon: '👣',
      category: 'ejercicios',
    },
    {
      id: 3,
      title: 'Enfócate en la Gratitud',
      description: 'Anota diariamente 1-3 cosas por las que te sientes agradecido/a. Ayuda a contrarrestar el enfoque en preocupaciones y miedos ansiosos.',
      icon: '📔',
      category: 'diario',
    },
     {
      id: 14, // Nuevo ID
      title: 'Aceptación Radical (Cuando Aplique)',
      description: 'A veces, luchar contra la ansiedad la intensifica. Practica aceptar la sensación sin juzgarla, permitiendo que fluya y disminuya naturalmente.',
      icon: '🌊', // Ícono que sugiere fluir
      category: 'ejercicios',
    },
    {
      id: 2,
      title: 'Modera Noticias y Redes Sociales',
      description: 'Limita la exposición a noticias negativas o comparaciones en redes que pueden aumentar la ansiedad. Establece horarios definidos.',
      icon: '📵', // Ícono más directo
      category: 'habitos',
    },
    {
      id: 4,
      title: 'Comunica tus Límites',
      description: 'Decir "no" a compromisos excesivos protege tu energía y reduce la ansiedad por sobrecarga. Comunica tus necesidades asertivamente.',
      icon: '🗣️', // Ícono comunicación
      category: 'relaciones',
    },
    {
      id: 9,
      title: 'Autocompasión vs. Autocrítica',
      description: 'Sé amable contigo mismo/a cuando sientas ansiedad. Reemplaza la autocrítica ("soy débil") por frases compasivas ("estoy pasando un mal momento, es normal").',
      icon: '💖',
      category: 'autoestima',
    },
    // Se mantienen hidratación y desconexión, pero con menor énfasis
    {
      id: 7,
      title: 'Mantén una Hidratación Óptima',
      description: 'La deshidratación puede empeorar síntomas físicos asociados a la ansiedad. Asegúrate de beber suficiente agua durante el día.',
      icon: '💧',
      category: 'habitos',
    },
    {
      id: 11,
      title: 'Programa Pausas Digitales',
      description: 'Reduce la sobreestimulación que puede aumentar la ansiedad. Desconéctate de pantallas (móvil, PC) por periodos cortos durante el día y antes de dormir.',
      icon: '🔌',
      category: 'habitos',
    },
  ];

  // Categorías de consejos (sin cambios, siguen siendo relevantes)
  const categories = [
    { id: 'todos', name: 'Todos los consejos', icon: '✨' },
    { id: 'ejercicios', name: 'Ejercicios prácticos', icon: '🧠' }, // Reordenada para destacar
    { id: 'habitos', name: 'Hábitos saludables', icon: '🏆' },
    { id: 'diario', name: 'Prácticas diarias', icon: '📆' },
    { id: 'crisis', name: 'Manejo de crisis', icon: '🆘' },
    { id: 'autoestima', name: 'Autocompasión', icon: '💖' }, // Renombrada ligeramente
    { id: 'relaciones', name: 'Límites y Apoyo', icon: '👥' }, // Renombrada ligeramente
  ];

  // Estado para filtrar por categoría
  const [selectedCategory, setSelectedCategory] = React.useState('todos');

  // Filtrar consejos por categoría seleccionada
  const filteredTips = selectedCategory === 'todos' 
    ? tips 
    : tips.filter(tip => tip.category === selectedCategory);

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-gray-900 py-12 px-4">
      <div className="container mx-auto max-w-5xl">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-10"
        >
          {/* TÍTULO ACTUALIZADO */}
          <h1 className="text-3xl md:text-4xl font-bold text-neutral-800 dark:text-white mb-3">Consejos para Manejar la Ansiedad</h1>
          <p className="text-neutral-600 dark:text-neutral-300 max-w-3xl mx-auto text-lg">
            Pequeñas acciones y ejercicios prácticos que puedes incorporar para reducir la ansiedad y mejorar tu bienestar.
          </p>
        </motion.div>

        {/* Filtro de categorías */}
        <div className="mb-12">
          <div className="flex flex-wrap justify-center gap-2 md:gap-3">
            {categories.map((category) => (
              <motion.button
                key={category.id}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setSelectedCategory(category.id)}
                className={`px-4 py-2 rounded-full font-medium text-sm md:text-base flex items-center 
                  ${selectedCategory === category.id 
                    ? 'bg-blue-600 text-white shadow-md' 
                    : 'bg-white dark:bg-gray-800 dark:text-neutral-300 text-neutral-700 border border-neutral-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600 hover:bg-blue-50 dark:hover:bg-gray-700'
                  } transition-all duration-200`}
              >
                <span className="mr-2">{category.icon}</span>
                {category.name}
              </motion.button>
            ))}
          </div>
        </div>

        {/* Lista de consejos */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTips.map((tip) => (
            <motion.div
              key={tip.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.1 * (tip.id % 10) }}
              className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow border border-neutral-100 dark:border-gray-700 flex flex-col"
            >
              <div className="text-4xl mb-4">{tip.icon}</div>
              <h3 className="text-xl font-medium text-neutral-800 dark:text-neutral-100 mb-3">{tip.title}</h3>
              <p className="text-neutral-600 dark:text-neutral-300 flex-grow">{tip.description}</p>
            </motion.div>
          ))}
        </div>

        {/* Si no hay consejos para mostrar */}
        {filteredTips.length === 0 && (
          <div className="text-center py-12">
            <p className="text-neutral-500 dark:text-neutral-400 text-lg">No hay consejos disponibles en esta categoría aún.</p>
          </div>
        )}

        {/* Disclaimer */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mt-16 bg-neutral-100 dark:bg-gray-800 border border-neutral-200 dark:border-gray-700 rounded-lg p-5 text-center max-w-3xl mx-auto"
        >
          <p className="text-neutral-600 dark:text-neutral-300">
            <strong>Importante:</strong> Estos consejos son sugerencias generales para el manejo de la <strong>ansiedad</strong>. Cada persona es única. Si experimentas ansiedad significativa, considera consultar con un profesional.
          </p>
        </motion.div>

        {/* Sección para alentar la contribución */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="mt-10 bg-blue-50 dark:bg-blue-900/30 border border-blue-100 dark:border-blue-800 rounded-xl p-6 text-center max-w-3xl mx-auto"
        >
          <h2 className="text-xl font-semibold text-blue-800 dark:text-blue-300 mb-2">¿Tienes un consejo para la ansiedad que te ha ayudado?</h2>
          <p className="text-blue-700 dark:text-blue-400 mb-4">
            Nos encantaría conocerlo y posiblemente incluirlo para ayudar a otros.
          </p>
          <a 
            href="/contacto" 
            className="inline-flex items-center px-5 py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
          >
            Comparte tu consejo
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </a>
        </motion.div>
      </div>
    </div>
  );
} 