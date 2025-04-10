'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useSessionContext } from '@/contexts/SessionContext';
import { PlanType } from '@/types/session';

interface PaymentFormProps {
  planType: PlanType;
  onSuccess: () => void;
  onCancel: () => void;
}

export default function PaymentForm({ planType, onSuccess, onCancel }: PaymentFormProps) {
  const { buySession, buySubscription } = useSessionContext();
  const [paymentMethod, setPaymentMethod] = useState('credit_card');
  const [cardNumber, setCardNumber] = useState('');
  const [cardName, setCardName] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [cvv, setCvv] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    // Validar campos
    if (!cardNumber || !cardName || !expiryDate || !cvv) {
      setError('Por favor completa todos los campos');
      return;
    }
    
    setIsProcessing(true);
    
    try {
      // Procesar el pago según el tipo de plan
      let success = false;
      
      if (planType === 'individual') {
        success = await buySession(paymentMethod);
      } else if (planType === 'monthly') {
        success = await buySubscription(paymentMethod);
      }
      
      if (success) {
        onSuccess();
      } else {
        setError('Hubo un problema al procesar el pago. Por favor intenta nuevamente.');
      }
    } catch (error) {
      console.error('Error en el pago:', error);
      setError('Error al procesar el pago. Por favor verifica tus datos e intenta nuevamente.');
    } finally {
      setIsProcessing(false);
    }
  };

  const getPlanDetails = () => {
    if (planType === 'individual') {
      return {
        name: 'Sesión Individual',
        price: '40.000 COP',
        description: '1 sesión de 30 minutos'
      };
    } else {
      return {
        name: 'Suscripción Mensual',
        price: '120.000 COP',
        description: '4 sesiones por mes'
      };
    }
  };

  const plan = getPlanDetails();

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-white rounded-xl shadow-lg max-w-2xl mx-auto p-6"
    >
      <div className="flex justify-between items-start mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">{plan.name}</h2>
          <p className="text-gray-600 mt-1">{plan.description}</p>
        </div>
        <div className="text-right">
          <p className="text-3xl font-bold text-primary-600">{plan.price}</p>
          <p className="text-gray-500 text-sm">
            {planType === 'monthly' ? 'Cobro mensual' : 'Pago único'}
          </p>
        </div>
      </div>

      {error && (
        <div className="mb-6 p-3 bg-red-50 border border-red-200 text-red-700 rounded-md">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Método de pago
          </label>
          <div className="grid grid-cols-3 gap-3">
            <div
              className={`border rounded-md p-3 flex items-center justify-center cursor-pointer ${
                paymentMethod === 'credit_card' ? 'border-primary-500 bg-primary-50' : 'border-gray-200'
              }`}
              onClick={() => setPaymentMethod('credit_card')}
            >
              <span className="text-sm font-medium">Tarjeta de Crédito</span>
            </div>
            <div
              className={`border rounded-md p-3 flex items-center justify-center cursor-pointer ${
                paymentMethod === 'debit_card' ? 'border-primary-500 bg-primary-50' : 'border-gray-200'
              }`}
              onClick={() => setPaymentMethod('debit_card')}
            >
              <span className="text-sm font-medium">Tarjeta Débito</span>
            </div>
            <div
              className={`border rounded-md p-3 flex items-center justify-center cursor-pointer ${
                paymentMethod === 'pse' ? 'border-primary-500 bg-primary-50' : 'border-gray-200'
              }`}
              onClick={() => setPaymentMethod('pse')}
            >
              <span className="text-sm font-medium">PSE</span>
            </div>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Número de tarjeta
          </label>
          <input
            type="text"
            placeholder="1234 5678 9012 3456"
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
            value={cardNumber}
            onChange={(e) => setCardNumber(e.target.value)}
            maxLength={19}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Nombre en la tarjeta
          </label>
          <input
            type="text"
            placeholder="NOMBRE APELLIDO"
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
            value={cardName}
            onChange={(e) => setCardName(e.target.value)}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Fecha de expiración
            </label>
            <input
              type="text"
              placeholder="MM/AA"
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
              value={expiryDate}
              onChange={(e) => setExpiryDate(e.target.value)}
              maxLength={5}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              CVV
            </label>
            <input
              type="text"
              placeholder="123"
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
              value={cvv}
              onChange={(e) => setCvv(e.target.value)}
              maxLength={4}
            />
          </div>
        </div>

        <div className="pt-4 flex justify-end space-x-3">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md"
            disabled={isProcessing}
          >
            Cancelar
          </button>
          <button
            type="submit"
            className={`px-4 py-2 bg-primary-600 text-white rounded-md ${
              isProcessing ? 'opacity-70 cursor-not-allowed' : 'hover:bg-primary-700'
            }`}
            disabled={isProcessing}
          >
            {isProcessing ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Procesando...
              </span>
            ) : (
              `Pagar ${plan.price}`
            )}
          </button>
        </div>
      </form>
    </motion.div>
  );
} 