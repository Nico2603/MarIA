'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Phone, QrCode, Heart, Users, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Image from 'next/image';

interface FeedbackPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: (phoneNumber?: string) => void;
  userName?: string;
}

export function FeedbackPaymentModal({ 
  isOpen, 
  onClose, 
  onComplete, 
  userName 
}: FeedbackPaymentModalProps) {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isValid, setIsValid] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const validatePhoneNumber = (phone: string) => {
    // Remover espacios y caracteres especiales
    const cleanPhone = phone.replace(/\D/g, '');
    
    // Validar: 10 dígitos y empezar con 3
    const isValidFormat = cleanPhone.length === 10 && cleanPhone.startsWith('3');
    setIsValid(isValidFormat);
    
    if (phone && !isValidFormat) {
      setError('El número debe tener 10 dígitos y empezar con 3 (ej: 3001234567)');
    } else {
      setError('');
    }
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setPhoneNumber(value);
    validatePhoneNumber(value);
  };

  const handleSubmit = async () => {
    if (!isValid) return;
    
    setIsSubmitting(true);
    try {
      // Guardar número telefónico en la base de datos
      const response = await fetch('/api/profile', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          phoneNumber: phoneNumber.replace(/\D/g, ''), // Solo números
        }),
      });

      if (!response.ok) {
        throw new Error('Error al guardar el número telefónico');
      }

      onComplete(phoneNumber);
    } catch (err) {
      console.error('Error guardando número:', err);
      setError('Error al guardar el número. Inténtalo de nuevo.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSkip = () => {
    onComplete(); // Sin número telefónico
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative w-full max-w-4xl mx-4 bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 rounded-2xl shadow-2xl overflow-hidden"
          >
            {/* Header */}
            <div className="relative p-6 text-center border-b border-white/10">
              <button
                onClick={onClose}
                className="absolute top-4 right-4 p-2 rounded-full hover:bg-white/10 transition-colors"
              >
                <X className="w-6 h-6 text-white" />
              </button>
              
              <div className="flex items-center justify-center gap-3 mb-2">
                <Heart className="w-8 h-8 text-pink-400" />
                <h2 className="text-2xl font-bold text-white">¡Gracias por usar MarIA!</h2>
                <Heart className="w-8 h-8 text-pink-400" />
              </div>
              
              <p className="text-blue-200">
                {userName ? `${userName}, tu ` : 'Tu '}experiencia es importante para nosotros
              </p>
            </div>

            {/* Content */}
            <div className="grid md:grid-cols-2 gap-8 p-8">
              {/* Left Side - Phone Number Form */}
              <div className="space-y-6">
                <div className="text-center">
                  <Phone className="w-12 h-12 text-blue-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-white mb-2">
                    Comparte tu contacto
                  </h3>
                  <p className="text-blue-200 text-sm leading-relaxed">
                    Por favor, introduce tu número telefónico. Lo utilizaremos únicamente para 
                    contactarte en los próximos días y conocer tu feedback sobre MarIA.
                  </p>
                </div>

                <div className="space-y-4">
                  <div>
                    <Label htmlFor="phone" className="text-white font-medium">
                      Número de teléfono (Colombia)
                    </Label>
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="3001234567"
                      value={phoneNumber}
                      onChange={handlePhoneChange}
                      className="mt-2 bg-white/10 border-white/20 text-white placeholder:text-white/60 focus:border-blue-400"
                      maxLength={10}
                    />
                    {error && (
                      <p className="text-red-400 text-sm mt-2">{error}</p>
                    )}
                  </div>

                  <div className="flex items-start gap-3 p-4 bg-white/5 rounded-lg">
                    <Users className="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0" />
                    <div className="text-sm text-blue-200">
                      <p className="font-medium text-white mb-1">¿Para qué usamos tu número?</p>
                      <ul className="space-y-1">
                        <li>• Conocer tu experiencia con MarIA</li>
                        <li>• Recoger sugerencias de mejora</li>
                        <li>• Entender qué aspectos te gustaron más</li>
                        <li>• Mejorar nuestro servicio para ayudar a más personas</li>
                      </ul>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <Button
                      onClick={handleSubmit}
                      disabled={!isValid || isSubmitting}
                      className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
                    >
                      {isSubmitting ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                          Guardando...
                        </>
                      ) : (
                        <>
                          <CheckCircle className="w-4 h-4 mr-2" />
                          Continuar
                        </>
                      )}
                    </Button>
                    
                    <Button
                      onClick={handleSkip}
                      variant="outline"
                      className="px-6 border-white/30 text-white hover:bg-white/10"
                    >
                      Omitir
                    </Button>
                  </div>
                </div>
              </div>

              {/* Right Side - QR Code */}
              <div className="space-y-6">
                <div className="text-center">
                  <QrCode className="w-12 h-12 text-green-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-white mb-2">
                    ¿Te ayudó MarIA?
                  </h3>
                  <p className="text-blue-200 text-sm leading-relaxed">
                    Como usuario de prueba, tienes acceso exclusivo por solo <span className="font-bold text-green-400">$10,000 pesos</span> esta semana.
                  </p>
                </div>

                <div className="bg-white/10 rounded-xl p-6 text-center">
                  <div className="bg-white rounded-lg p-4 mb-4 inline-block">
                    <Image
                      src="/img/QR.jpg"
                      alt="QR Bancolombia"
                      width={200}
                      height={200}
                      className="rounded-lg"
                    />
                  </div>
                  
                  <div className="space-y-3">
                    <h4 className="font-semibold text-white">Transferencia Bancolombia</h4>
                    <p className="text-sm text-blue-200">
                      Escanea el código QR con tu app de Bancolombia
                    </p>
                    <div className="text-2xl font-bold text-green-400">
                      $10,000 COP
                    </div>
                  </div>
                </div>

                <div className="bg-purple-900/30 rounded-lg p-4">
                  <p className="text-sm text-purple-200 text-center leading-relaxed">
                    <strong className="text-white">Solo si realmente te sirvió</strong> y sientes que MarIA puede 
                    impactar la vida de personas que lo necesiten. En unos días te contactaremos 
                    para conocer tu experiencia y opiniones.
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
} 