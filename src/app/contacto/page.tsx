'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';

export default function ContactoPage() {
  // Estado para el formulario
  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    asunto: '',
    mensaje: '',
  });

  const [enviando, setEnviando] = useState(false);
  const [enviado, setEnviado] = useState(false);
  const [error, setError] = useState('');

  // Manejar cambios en los campos del formulario
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Manejar envío del formulario
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setEnviando(true);
    setError('');

    // Validación básica
    if (!formData.nombre || !formData.email || !formData.mensaje) {
      setError('Por favor completa todos los campos requeridos.');
      setEnviando(false);
      return;
    }

    // Simulación de envío (en una app real, aquí iría la lógica de envío al backend)
    setTimeout(() => {
      setEnviando(false);
      setEnviado(true);
      setFormData({
        nombre: '',
        email: '',
        asunto: '',
        mensaje: '',
      });
    }, 1500);
  };

  return (
    <div className="min-h-screen py-12 px-4">
      <div className="container mx-auto max-w-5xl">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          {/* Información de contacto */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-blue-50 p-8 rounded-xl"
          >
            <h1 className="text-3xl font-bold text-neutral-800 mb-4">Contacto</h1>
            <p className="text-neutral-600 mb-8">
              Estamos aquí para escucharte. Puedes contactarnos por cualquiera de estos medios o utilizando el formulario.
            </p>

            <div className="space-y-6">
              <div className="flex items-start">
                <div className="bg-white p-3 rounded-full mr-4 shadow-sm">
                  <svg className="w-6 h-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-medium text-neutral-800">Email</h3>
                  <a href="mailto:contacto@aimentalhealth.com" className="text-blue-600 hover:underline">
                    contacto@aimentalhealth.com
                  </a>
                </div>
              </div>

              <div className="flex items-start">
                <div className="bg-white p-3 rounded-full mr-4 shadow-sm">
                  <svg className="w-6 h-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-medium text-neutral-800">Consulta en línea</h3>
                  <p className="text-neutral-600">
                    Programa una consulta virtual con nuestro equipo a través de nuestra plataforma de chat.
                  </p>
                </div>
              </div>

              <div className="flex items-start">
                <div className="bg-white p-3 rounded-full mr-4 shadow-sm">
                  <svg className="w-6 h-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-medium text-neutral-800">Teléfono</h3>
                  <a href="tel:+123456789" className="text-blue-600 hover:underline">
                    +12 345 6789
                  </a>
                  <p className="text-sm text-neutral-500">Lunes a Viernes: 9am - 6pm</p>
                </div>
              </div>
            </div>

            <div className="mt-12 bg-white p-6 rounded-lg shadow-sm">
              <h3 className="font-medium text-neutral-800 mb-3">Asistencia en crisis</h3>
              <p className="text-neutral-600 mb-4">
                Si estás experimentando una emergencia de salud mental, por favor contacta a los servicios de emergencia inmediatamente.
              </p>
              <a 
                href="tel:911" 
                className="inline-flex items-center px-4 py-2 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 transition-colors"
              >
                Llamar a emergencias (911)
                <svg className="w-4 h-4 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
              </a>
            </div>
          </motion.div>

          {/* Formulario de contacto */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            {enviado ? (
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-green-50 border border-green-200 rounded-xl p-8 text-center h-full flex flex-col justify-center"
              >
                <div className="w-16 h-16 bg-green-100 rounded-full mx-auto mb-6 flex items-center justify-center">
                  <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-green-800 mb-2">¡Mensaje enviado!</h2>
                <p className="text-green-700 mb-6">
                  Gracias por contactarnos. Responderemos a tu mensaje lo antes posible.
                </p>
                <button
                  onClick={() => setEnviado(false)}
                  className="mx-auto px-5 py-2 bg-white text-green-600 border border-green-200 rounded-lg hover:bg-green-50 transition-colors font-medium"
                >
                  Enviar otro mensaje
                </button>
              </motion.div>
            ) : (
              <div className="bg-white shadow-sm rounded-xl p-8 border border-neutral-100">
                <h2 className="text-2xl font-bold text-neutral-800 mb-6">Envíanos un mensaje</h2>
                
                {error && (
                  <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700">
                    {error}
                  </div>
                )}
                
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div>
                    <label htmlFor="nombre" className="block text-neutral-700 font-medium mb-1">
                      Nombre completo <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      id="nombre"
                      name="nombre"
                      value={formData.nombre}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                      placeholder="Tu nombre"
                      required
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="email" className="block text-neutral-700 font-medium mb-1">
                      Email <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                      placeholder="tu@email.com"
                      required
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="asunto" className="block text-neutral-700 font-medium mb-1">
                      Asunto
                    </label>
                    <select
                      id="asunto"
                      name="asunto"
                      value={formData.asunto}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                    >
                      <option value="">Selecciona un asunto</option>
                      <option value="consulta">Consulta general</option>
                      <option value="tecnico">Soporte técnico</option>
                      <option value="sugerencia">Sugerencia</option>
                      <option value="colaboracion">Oportunidad de colaboración</option>
                      <option value="otro">Otro</option>
                    </select>
                  </div>
                  
                  <div>
                    <label htmlFor="mensaje" className="block text-neutral-700 font-medium mb-1">
                      Mensaje <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      id="mensaje"
                      name="mensaje"
                      value={formData.mensaje}
                      onChange={handleChange}
                      rows={6}
                      className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                      placeholder="¿En qué podemos ayudarte?"
                      required
                    ></textarea>
                  </div>
                  
                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={enviando}
                      className={`w-full py-3 px-6 rounded-lg font-medium text-white 
                        ${enviando 
                          ? 'bg-blue-400 cursor-not-allowed' 
                          : 'bg-blue-600 hover:bg-blue-700'} 
                        transition-colors flex items-center justify-center`}
                    >
                      {enviando ? (
                        <>
                          <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Enviando...
                        </>
                      ) : 'Enviar mensaje'}
                    </button>
                  </div>
                </form>
                
                <p className="mt-6 text-xs text-neutral-500 text-center">
                  Al enviar este formulario, aceptas nuestra política de privacidad y el tratamiento de tus datos para poder responder a tu consulta.
                </p>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
} 