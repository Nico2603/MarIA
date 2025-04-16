'use client';

import React from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';

export default function Dashboard() {
  return (
    <div className="container mx-auto max-w-6xl px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-8"
      >
        <h1 className="text-3xl font-bold text-gray-800 dark:text-neutral-200 mb-2">Mi Cuenta (Placeholder)</h1>
        <p className="text-gray-600 dark:text-neutral-400">
          Esta sección está en desarrollo. Aquí podrás administrar tu cuenta en el futuro.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Panel izquierdo - Acciones */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="md:col-span-1"
        >
          <div className="bg-white dark:bg-neutral-800 rounded-xl shadow-sm p-6 mb-6">
            <h3 className="text-sm font-medium text-gray-500 dark:text-neutral-400 uppercase tracking-wider mb-3">
              Acciones rápidas
            </h3>
            <div className="space-y-2">
              <Link
                href="/chat"
                className="block w-full py-2 px-4 bg-primary-600 hover:bg-primary-700 text-white text-center font-medium rounded-md transition"
              >
                Ir al chat
              </Link>
            </div>
          </div>
        </motion.div>

        {/* Panel central y derecho - Contenido Futuro */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="md:col-span-2"
        >
          <div className="bg-white dark:bg-neutral-800 rounded-xl shadow-sm p-6 mb-6">
            <h2 className="text-xl font-semibold text-gray-800 dark:text-neutral-200 mb-5">Próximamente</h2>
            <p className="text-gray-600 dark:text-neutral-400">
              Más funcionalidades estarán disponibles aquí pronto.
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
} 