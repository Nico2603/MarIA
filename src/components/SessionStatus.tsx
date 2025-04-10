'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { useSessionContext } from '@/contexts/SessionContext';

export default function SessionStatus() {
  const { sessionStatus, loading } = useSessionContext();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-12 bg-gray-100 rounded-md px-4">
        <div className="w-4 h-4 border-t-2 border-blue-500 border-r-2 rounded-full animate-spin"></div>
        <span className="ml-2 text-sm text-gray-600">Cargando...</span>
      </div>
    );
  }

  if (!sessionStatus) {
    return null;
  }

  const getBadgeColor = () => {
    if (sessionStatus.currentPlan === 'free') {
      return 'bg-green-100 text-green-800 border-green-200';
    } else if (sessionStatus.currentPlan === 'individual') {
      return 'bg-blue-100 text-blue-800 border-blue-200';
    } else {
      return 'bg-purple-100 text-purple-800 border-purple-200';
    }
  };

  const getPlanName = () => {
    switch (sessionStatus.currentPlan) {
      case 'free':
        return 'Prueba gratuita';
      case 'individual':
        return 'Sesión individual';
      case 'monthly':
        return 'Suscripción mensual';
      default:
        return 'Desconocido';
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`rounded-lg border px-4 py-3 ${getBadgeColor()}`}
    >
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-medium">Tu plan: {getPlanName()}</h3>
          <p className="text-sm mt-1">
            {sessionStatus.remainingSessions > 0 
              ? `Tienes ${sessionStatus.remainingSessions} ${sessionStatus.remainingSessions === 1 ? 'sesión' : 'sesiones'} disponible${sessionStatus.remainingSessions === 1 ? '' : 's'}`
              : 'No tienes sesiones disponibles'}
          </p>
          
          {sessionStatus.subscription && (
            <p className="text-sm mt-1">
              Tu suscripción vence el {new Date(sessionStatus.subscription.endDate).toLocaleDateString()}
            </p>
          )}
        </div>
        
        <div className={`px-3 py-1.5 rounded-full text-xs font-medium ${getBadgeColor()}`}>
          {sessionStatus.remainingSessions > 0 ? 'Activo' : 'Inactivo'}
        </div>
      </div>
    </motion.div>
  );
} 