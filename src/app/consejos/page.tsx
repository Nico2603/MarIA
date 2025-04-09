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
  // Lista de consejos de bienestar
  const tips: Tip[] = [
    {
      id: 1,
      title: 'Practica respiración consciente',
      description: 'Dedica 5 minutos al día a respirar profundamente. Inhala por la nariz contando hasta 4, mantén el aire contando hasta 2, y exhala por la boca contando hasta 6.',
      icon: '🧘',
      category: 'diario',
    },
    {
      id: 2,
      title: 'Limita el uso de redes sociales',
      description: 'Establece horarios específicos para revisar tus redes sociales. El consumo excesivo puede afectar tu autoestima y aumentar la ansiedad.',
      icon: '📱',
      category: 'habitos',
    },
    {
      id: 3,
      title: 'Mantén un diario de gratitud',
      description: 'Anota 3 cosas por las que estés agradecido/a cada día. Esto entrena tu cerebro para enfocarse en aspectos positivos de tu vida.',
      icon: '📔',
      category: 'diario',
    },
    {
      id: 4,
      title: 'Crea límites saludables',
      description: 'Aprende a decir "no" a compromisos que afecten tu bienestar. Establecer límites claros en relaciones personales y laborales es esencial para tu salud mental.',
      icon: '🛑',
      category: 'relaciones',
    },
    {
      id: 5,
      title: 'Técnica 5-4-3-2-1 para ansiedad',
      description: 'Nombra 5 cosas que puedes ver, 4 que puedes tocar, 3 que puedes oír, 2 que puedes oler y 1 que puedes saborear. Este ejercicio te ayuda a anclarte en el presente.',
      icon: '😰',
      category: 'crisis',
    },
    {
      id: 6,
      title: 'Rutina de sueño consistente',
      description: 'Intenta acostarte y levantarte a la misma hora todos los días. Un buen descanso es fundamental para regular el estado de ánimo.',
      icon: '😴',
      category: 'habitos',
    },
    {
      id: 7,
      title: 'Hidratación adecuada',
      description: 'Beber suficiente agua tiene un impacto directo en tu nivel de energía y claridad mental. Intenta consumir al menos 2 litros diarios.',
      icon: '💧',
      category: 'habitos',
    },
    {
      id: 8,
      title: 'Movimiento diario',
      description: 'Incluso 15 minutos de actividad física liberan endorfinas que mejoran tu estado de ánimo. No necesita ser intenso, un paseo es suficiente.',
      icon: '🚶',
      category: 'diario',
    },
    {
      id: 9,
      title: 'Afirmaciones positivas',
      description: 'Crea frases positivas y realistas sobre ti mismo/a y repítelas diariamente. "Estoy haciendo lo mejor que puedo" o "Soy suficiente tal como soy".',
      icon: '💚',
      category: 'autoestima',
    },
    {
      id: 10,
      title: 'Ejercicio de enraizamiento',
      description: 'Cuando te sientas abrumado/a, concéntrate en la sensación de tus pies tocando el suelo. Visualiza raíces extendiéndose desde tus pies hacia la tierra.',
      icon: '🌱',
      category: 'ejercicios',
    },
    {
      id: 11,
      title: 'Desconexión digital',
      description: 'Destina un período (al menos 1 hora) antes de dormir sin pantallas. La luz azul afecta la calidad del sueño y aumenta la actividad mental.',
      icon: '🔌',
      category: 'habitos',
    },
    {
      id: 12,
      title: 'Escáner corporal',
      description: 'Recorre mentalmente tu cuerpo desde los pies hasta la cabeza, notando tensiones y liberándolas conscientemente. Ideal antes de dormir.',
      icon: '👣',
      category: 'ejercicios',
    },
  ];

  // Categorías de consejos
  const categories = [
    { id: 'todos', name: 'Todos los consejos', icon: '✨' },
    { id: 'diario', name: 'Prácticas diarias', icon: '📆' },
    { id: 'crisis', name: 'Manejo de crisis', icon: '🆘' },
    { id: 'autoestima', name: 'Autoestima', icon: '💖' },
    { id: 'habitos', name: 'Hábitos saludables', icon: '🏆' },
    { id: 'relaciones', name: 'Relaciones', icon: '👥' },
    { id: 'ejercicios', name: 'Ejercicios prácticos', icon: '🧠' },
  ];

  // Estado para filtrar por categoría
  const [selectedCategory, setSelectedCategory] = React.useState('todos');

  // Filtrar consejos por categoría seleccionada
  const filteredTips = selectedCategory === 'todos' 
    ? tips 
    : tips.filter(tip => tip.category === selectedCategory);

  return (
    <div className="min-h-screen bg-neutral-50 py-12 px-4">
      <div className="container mx-auto max-w-5xl">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-10"
        >
          <h1 className="text-3xl md:text-4xl font-bold text-neutral-800 mb-3">Consejos de Bienestar</h1>
          <p className="text-neutral-600 max-w-3xl mx-auto text-lg">
            Pequeñas acciones que puedes incorporar en tu día a día para mejorar tu bienestar emocional y mental
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
                    : 'bg-white text-neutral-700 border border-neutral-200 hover:border-blue-300 hover:bg-blue-50'
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
              className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow border border-neutral-100"
            >
              <div className="text-4xl mb-4">{tip.icon}</div>
              <h3 className="text-xl font-medium text-neutral-800 mb-3">{tip.title}</h3>
              <p className="text-neutral-600">{tip.description}</p>
            </motion.div>
          ))}
        </div>

        {/* Si no hay consejos para mostrar */}
        {filteredTips.length === 0 && (
          <div className="text-center py-12">
            <p className="text-neutral-500 text-lg">No hay consejos disponibles en esta categoría aún.</p>
          </div>
        )}

        {/* Disclaimer */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mt-16 bg-neutral-100 border border-neutral-200 rounded-lg p-5 text-center max-w-3xl mx-auto"
        >
          <p className="text-neutral-600">
            <strong>Importante:</strong> Estos consejos son sugerencias generales. Cada persona es única y lo que funciona para algunos puede no funcionar para otros. Si estás experimentando dificultades significativas, considera consultar con un profesional de salud mental.
          </p>
        </motion.div>

        {/* Sección para alentar la contribución */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="mt-10 bg-blue-50 border border-blue-100 rounded-xl p-6 text-center max-w-3xl mx-auto"
        >
          <h2 className="text-xl font-semibold text-blue-800 mb-2">¿Tienes un consejo que te ha ayudado?</h2>
          <p className="text-blue-700 mb-4">
            Nos encantaría conocerlo y posiblemente incluirlo en nuestra colección para ayudar a otros.
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