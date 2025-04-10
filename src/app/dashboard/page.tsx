'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useAuth0 } from '@auth0/auth0-react';
import SessionStatus from '@/components/SessionStatus';
import PaymentForm from '@/components/PaymentForm';
import { PlanType } from '@/types/session';
import { useSessionContext } from '@/contexts/SessionContext';
import Link from 'next/link';

export default function Dashboard() {
  const router = useRouter();
  const { isAuthenticated, isLoading, loginWithRedirect, user } = useAuth0();
  const { sessionStatus, payments, refreshSessionStatus } = useSessionContext();
  const [selectedPlan, setSelectedPlan] = useState<PlanType | null>(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  // Redireccionar a inicio si el usuario no está autenticado
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/');
    }
  }, [isAuthenticated, isLoading, router]);

  const handleStartPayment = (planType: PlanType) => {
    setSelectedPlan(planType);
    setShowPaymentModal(true);
    setPaymentSuccess(false);
  };

  const handlePaymentSuccess = () => {
    setShowPaymentModal(false);
    setPaymentSuccess(true);
    refreshSessionStatus();
  };

  const handlePaymentCancel = () => {
    setShowPaymentModal(false);
  };

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-t-blue-600 border-blue-200 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center min-h-screen">
        <p className="text-xl text-neutral-600 mb-6">
          Por favor inicia sesión para acceder a tu dashboard
        </p>
        <button 
          onClick={() => loginWithRedirect()} 
          className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-md"
        >
          Iniciar sesión
        </button>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-6xl px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-8"
      >
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Mi cuenta</h1>
        <p className="text-gray-600">
          Administra tus sesiones, suscripciones y pagos
        </p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Panel izquierdo - Información del usuario */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="md:col-span-1"
        >
          <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
            <div className="flex items-center mb-6">
              <div className="w-16 h-16 rounded-full bg-primary-100 flex items-center justify-center text-primary-600 text-xl font-bold mr-4">
                {user?.name?.charAt(0) || 'U'}
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-800">
                  {user?.name || 'Usuario'}
                </h2>
                <p className="text-gray-500 text-sm">
                  {user?.email || 'email@ejemplo.com'}
                </p>
              </div>
            </div>

            <SessionStatus />

            <div className="mt-6">
              <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-3">
                Acciones rápidas
              </h3>
              <div className="space-y-2">
                <Link
                  href="/chat"
                  className="block w-full py-2 px-4 bg-primary-600 hover:bg-primary-700 text-white text-center font-medium rounded-md transition"
                >
                  Ir al chat
                </Link>
                {(!sessionStatus?.remainingSessions || sessionStatus?.remainingSessions === 0) && (
                  <button
                    onClick={() => handleStartPayment('individual')}
                    className="block w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white text-center font-medium rounded-md transition"
                  >
                    Comprar sesión
                  </button>
                )}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Panel central y derecho - Planes y Pagos */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="md:col-span-2"
        >
          {/* Mensaje de éxito tras un pago */}
          {paymentSuccess && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6 text-green-700">
              <div className="flex">
                <svg className="h-5 w-5 text-green-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
                <div>
                  <p className="font-medium">¡Pago procesado con éxito!</p>
                  <p className="text-sm mt-1">Tu plan ha sido actualizado correctamente.</p>
                </div>
              </div>
            </div>
          )}

          {/* Planes disponibles */}
          <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-5">Planes disponibles</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Sesión individual */}
              <div className="border border-gray-200 rounded-lg p-5 hover:border-primary-300 hover:shadow-md transition-all">
                <h3 className="text-lg font-medium text-gray-800 mb-2">Sesión individual</h3>
                <p className="text-3xl font-bold text-primary-600 mb-3">40.000 COP</p>
                <ul className="space-y-2 mb-6">
                  <li className="flex items-start">
                    <svg className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                    <span>1 sesión de 30 minutos</span>
                  </li>
                  <li className="flex items-start">
                    <svg className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                    <span>Asistente especializado en ansiedad y depresión</span>
                  </li>
                  <li className="flex items-start">
                    <svg className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                    <span>Recursos personalizados</span>
                  </li>
                </ul>
                <button
                  onClick={() => handleStartPayment('individual')}
                  className="block w-full py-2 px-4 bg-primary-600 hover:bg-primary-700 text-white text-center font-medium rounded-md transition"
                >
                  Comprar ahora
                </button>
              </div>
              
              {/* Suscripción mensual */}
              <div className="border border-gray-200 rounded-lg p-5 hover:border-primary-300 hover:shadow-md transition-all relative">
                <div className="absolute -top-3 right-3 bg-blue-600 text-white text-xs px-3 py-1 rounded-full">
                  Recomendado
                </div>
                <h3 className="text-lg font-medium text-gray-800 mb-2">Suscripción mensual</h3>
                <p className="text-3xl font-bold text-primary-600 mb-3">120.000 COP</p>
                <ul className="space-y-2 mb-6">
                  <li className="flex items-start">
                    <svg className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                    <span>4 sesiones por mes</span>
                  </li>
                  <li className="flex items-start">
                    <svg className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                    <span>Ahorro del 25% vs sesiones individuales</span>
                  </li>
                  <li className="flex items-start">
                    <svg className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                    <span>Acceso a recursos premium</span>
                  </li>
                </ul>
                <button
                  onClick={() => handleStartPayment('monthly')}
                  className="block w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white text-center font-medium rounded-md transition"
                >
                  Suscribirme
                </button>
              </div>
            </div>
          </div>
          
          {/* Historial de pagos */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-5">Historial de pagos</h2>
            
            {payments.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <p>No tienes pagos registrados.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Fecha
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Plan
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Monto
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Estado
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {payments.map((payment) => (
                      <tr key={payment.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                          {new Date(payment.date).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                          {payment.planType === 'individual' ? 'Sesión individual' : 'Suscripción mensual'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                          {payment.amount.toLocaleString()} {payment.currency}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            payment.status === 'completed' ? 'bg-green-100 text-green-800' : 
                            payment.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 
                            'bg-red-100 text-red-800'
                          }`}>
                            {payment.status === 'completed' ? 'Completado' : 
                             payment.status === 'pending' ? 'Pendiente' : 'Fallido'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </motion.div>
      </div>
      
      {/* Modal de pago */}
      {showPaymentModal && selectedPlan && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <PaymentForm 
              planType={selectedPlan} 
              onSuccess={handlePaymentSuccess} 
              onCancel={handlePaymentCancel} 
            />
          </div>
        </div>
      )}
    </div>
  );
} 